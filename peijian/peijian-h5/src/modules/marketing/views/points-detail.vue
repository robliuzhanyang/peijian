<!--
  页面：积分商品详情（points-detail.vue）
  路由：/points-detail ｜ 分组：积分与营销
  作用：以「积分好物」独立视觉呈现兑换商品：主图 + 积分价比对 + 我的积分进度、
        兑换流程、商品亮点、规格参数、富文本介绍、兑换须知与更多积分好物
  数据：getters.product 按 route.query.id（缺省 'kit'）取商品；product.exchangeInfo 为积分商城扩展信息
  对齐后端：exchangeInfo 对应「积分商品详情」接口的兑换扩展字段（市场价/月限购/亮点/富文本介绍/兑换须知）
-->
<template>
  <!-- 商品存在时展示详情 -->
  <div v-if="product" class="pd-page">
    <!-- 面包屑：返回积分商城 -->
    <div class="breadcrumb">
      <router-link to="/points-mall">积分商城</router-link> / {{ product.name }}
    </div>

    <!-- 主信息：上方兑换主图，下方积分价、余额进度与兑换操作 -->
    <section class="pd-hero">
      <div class="pd-media">
        <div class="pd-media-frame">
          <span class="pd-ribbon">积分兑换</span>
          <img :src="asset(product.image)" :alt="product.name" />
        </div>
        <div class="pd-media-foot">
          <span
            >库存
            {{ product.stock === null ? "待确认" : product.stock + " 件" }}</span
          >
          <span
            >月限兑
            {{ info.monthLimit ? info.monthLimit + " 件" : "不限" }}</span
          >
        </div>
      </div>

      <div class="pd-summary">
        <span class="pd-eyebrow">POINTS REWARDS · 积分好物</span>
        <h1>{{ product.name }}</h1>
        <p class="pd-sub">{{ product.sub || subFallback }}</p>
        <p v-if="identityText" class="pd-ident">{{ identityText }}</p>

        <!-- 积分价与账户余额对比：进度条按「我的积分 / 所需积分」计算 -->
        <div class="pd-points">
          <div>
            <small class="pd-point-label">兑换所需积分</small>
            <strong class="pd-point-value"
              >{{ product.exchange }}<em>积分</em></strong
            >
            <span class="pd-market"
              >参考售价 <s>{{ money(info.marketPriceFen) }}</s></span
            >
          </div>
          <div class="pd-balance">
            <div class="pd-balance-row">
              <span>我的积分</span>
              <strong>{{ $store.state.points }}</strong>
            </div>
            <div class="pd-bar">
              <i :style="{ width: progressPercent + '%' }"></i>
            </div>
            <span class="pd-gap" :class="{ ok: pointsGap === 0 }">
              {{
                pointsGap > 0
                  ? "还差 " + pointsGap + " 积分"
                  : "积分充足，可直接兑换"
              }}
            </span>
          </div>
        </div>

        <!-- 积分不足提示 -->
        <div v-if="pointsGap > 0" class="pd-alert">
          当前积分不足，还差 {{ pointsGap }} 积分；下单采购后积分入账，可稍后再来兑换。
        </div>

        <div class="pd-actions">
          <router-link
            class="btn gold"
            :class="{ disabled: pointsGap > 0 }"
            :to="{ path: '/points-confirm', query: { id: product.id } }"
            >去兑换</router-link
          >
          <router-link class="btn" to="/points-mall">返回积分商城</router-link>
        </div>
        <p class="pd-note">
          兑换申请提交后立即扣减积分，可在
          <router-link to="/points-ledger">积分明细</router-link> 查询记录。
        </p>
      </div>
    </section>

    <!-- 兑换流程：与实物采购的区别所在，先提交兑换再审核发货 -->
    <section class="pd-block card">
      <h2>兑换流程</h2>
      <div class="pd-steps">
        <div v-for="(step, i) in flowSteps" :key="step.title" class="pd-step">
          <b>{{ i + 1 }}</b>
          <div>
            <strong>{{ step.title }}</strong>
            <p>{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 商品内容：亮点 / 规格参数 / 富文本介绍 / 兑换须知，与配件采购详情同一结构 -->
    <ProductContent
      tone="gold"
      :highlights="content.highlights"
      :specs="content.specs"
      :intro-html="content.introHtml"
      :notes="content.notes"
      :notes-title="content.notesTitle"
    />

    <!-- 更多积分好物：其余可兑换商品，继续浏览 -->
    <template v-if="related.length">
      <div class="section-title"><h2>更多积分好物</h2></div>
      <div class="pd-more">
        <router-link
          v-for="item in related"
          :key="item.id"
          class="pd-more-card"
          :to="{ path: '/points-detail', query: { id: item.id } }"
        >
          <img :src="asset(item.image)" :alt="item.name" />
          <strong>{{ item.name }}</strong>
          <small>SKU：{{ fieldValue(item.skuCode) }}</small>
          <span class="pd-more-points">{{ item.exchange }} 积分</span>
        </router-link>
      </div>
    </template>
  </div>
  <!-- 找不到商品时的空态 -->
  <div v-else class="empty">积分商品不存在</div>
</template>
<script>
// 商品内容板块组件：亮点 / 规格参数 / 富文本介绍 / 兑换须知
import ProductContent from "@/components/ProductContent.vue";
// 领域工具：静态资源路径、金额、空字段占位
import { asset, fieldValue, money } from "@/domain/productFields";
// 商品详情内容：统一四段结构，后台录入 product.content 后自动生效
import { resolveProductContent } from "@/modules/product/domain/productContent";
export default {
  components: { ProductContent },
  data() {
    return {
      // 兑换流程说明：展示于详情页「兑换流程」板块
      flowSteps: [
        { title: "提交兑换", desc: "选择商品提交兑换申请，系统校验积分余额与月限购。" },
        { title: "审核发货", desc: "客服核对账号与库存，通过后随仓发出。" },
        { title: "提交扣分", desc: "提交兑换即扣减积分，可在积分明细查看本次记录。" },
      ],
    };
  },
  computed: {
    // 当前积分商品：按路由 query.id 查找，未传 id 时默认 'kit'
    product() {
      return this.$store.getters.product(this.$route.query.id || "kit");
    },
    // 兑换扩展信息：缺失时回退空对象，页面各板块按字段存在性渲染
    info() {
      return (this.product && this.product.exchangeInfo) || {};
    },
    // 积分缺口：大于 0 表示余额不足，0 表示可兑换
    pointsGap() {
      if (!this.product) return 0;
      return Math.max(0, this.product.exchange - this.$store.state.points);
    },
    // 余额进度：用于进度条宽度，超过 100% 时按满格显示
    progressPercent() {
      if (!this.product || !this.product.exchange) return 0;
      return Math.min(
        100,
        Math.round((this.$store.state.points / this.product.exchange) * 100),
      );
    },
    // 商品副标题兜底文案
    subFallback() {
      return "积分商城兑换专区商品，兑换后由仓配统一发出。";
    },
    // 更多积分好物：其余带积分的商品，最多 4 件
    related() {
      if (!this.product) return [];
      return this.$store.state.products
        .filter((p) => p.exchange && p.id !== this.product.id)
        .slice(0, 4);
    },
    // 商品内容：亮点 / 规格参数 / 富文本介绍 / 兑换须知
    content() {
      return resolveProductContent(this.product, { kind: "exchange" });
    },
    // 型号与 SKU：仅展示已录入项，避免出现「待补充」
    identityText() {
      const p = this.product || {};
      return [p.model && "产品型号：" + p.model, p.skuCode && "可售 SKU：" + p.skuCode]
        .filter(Boolean)
        .join(" · ");
    },
  },
  methods: { asset, fieldValue, money },
};
</script>
<style scoped>
/* 积分详情（移动端）：金色积分主题，单列自上而下阅读 */
.pd-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pd-page > .breadcrumb {
  padding-bottom: 0;
  font-size: 12px;
}
.pd-hero {
  padding: 14px;
  border: 1px solid #efe3cd;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 22px #b7791f12;
}
.pd-media {
  display: flex;
  flex-direction: column;
}
.pd-media-frame {
  position: relative;
  height: 210px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 10px;
  background: radial-gradient(circle at 50% 42%, #fffdf7, #fdf2dd 68%, #f7e6c8);
}
.pd-media-frame::after {
  content: "";
  position: absolute;
  inset: 10px;
  border: 1px dashed #e7cf9f;
  border-radius: 8px;
  pointer-events: none;
}
.pd-media-frame img {
  max-width: 84%;
  max-height: 84%;
  object-fit: contain;
}
.pd-ribbon {
  position: absolute;
  left: 12px;
  top: 12px;
  z-index: 2;
  padding: 3px 10px;
  border-radius: 999px;
  background: linear-gradient(120deg, #d69b32, #b7791f);
  color: #fff;
  font-size: 11px;
  letter-spacing: 0.5px;
}
.pd-media-foot {
  display: flex;
  justify-content: space-between;
  margin-top: 9px;
  padding: 0 2px;
  color: #8a7452;
  font-size: 11px;
}
.pd-summary {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-top: 13px;
}
.pd-eyebrow {
  color: #b7791f;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.4px;
}
.pd-summary h1 {
  margin: 6px 0 5px;
  font-size: 19px;
  line-height: 1.35;
}
.pd-sub {
  margin: 0;
  color: #6b7789;
  font-size: 12px;
  line-height: 1.55;
}
.pd-ident {
  margin: 8px 0 0;
  color: #8b98a9;
  font-size: 11px;
}
.pd-points {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 13px;
  padding: 13px 14px;
  border: 1px solid #f2e0bd;
  border-radius: 10px;
  background: linear-gradient(135deg, #fff9ee, #fff3dc);
}
.pd-point-label {
  display: block;
  color: #9a835f;
  font-size: 11px;
}
.pd-point-value {
  display: block;
  margin: 4px 0 2px;
  color: #b7791f;
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}
.pd-point-value em {
  margin-left: 5px;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
}
.pd-market {
  color: #8d7c60;
  font-size: 11px;
}
.pd-market s {
  color: #b3a48d;
}
.pd-balance {
  padding-top: 11px;
  border-top: 1px dashed #e7d3ac;
}
.pd-balance-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  color: #8a7452;
  font-size: 12px;
}
.pd-balance-row strong {
  color: #243c5a;
  font-size: 16px;
}
.pd-bar {
  height: 7px;
  margin: 8px 0 6px;
  border-radius: 4px;
  background: #f0e6d3;
  overflow: hidden;
}
.pd-bar i {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #e2ac47, #b7791f);
  transition: width 0.3s;
}
.pd-gap {
  color: #b4451f;
  font-size: 11px;
}
.pd-gap.ok {
  color: #2f8a55;
}
.pd-alert {
  margin-top: 11px;
  padding: 9px 11px;
  border: 1px solid #f3cdbe;
  border-radius: 8px;
  background: #fff4ef;
  color: #a43e23;
  font-size: 12px;
  line-height: 1.55;
}
.pd-actions {
  display: flex;
  gap: 9px;
  margin-top: 13px;
}
.pd-actions .btn {
  flex: 1;
  justify-content: center;
  padding: 11px 0;
  font-size: 14px;
}
.pd-note {
  margin: 9px 0 0;
  color: #98a5b5;
  font-size: 11px;
  line-height: 1.5;
}
.pd-note a {
  color: #b7791f;
}
.pd-block {
  padding: 15px 16px;
}
.pd-block h2 {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 11px;
  font-size: 15px;
}
.pd-block h2::before {
  content: "";
  width: 4px;
  height: 15px;
  border-radius: 2px;
  background: linear-gradient(#e0a63f, #b7791f);
}
.pd-steps {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.pd-step {
  display: flex;
  gap: 10px;
  padding: 12px;
  border: 1px solid #f0e2c9;
  border-radius: 8px;
  background: #fffaf0;
}
.pd-step b {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #b7791f;
  color: #fff;
  font-size: 11px;
}
.pd-step strong {
  font-size: 13px;
}
.pd-step p {
  margin: 4px 0 0;
  color: #8b7c66;
  font-size: 11px;
  line-height: 1.55;
}
.pd-more {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.pd-more-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  border: 1px solid #efe3cd;
  border-radius: 10px;
  background: #fff;
}
.pd-more-card img {
  width: 100%;
  height: 96px;
  object-fit: contain;
  border-radius: 8px;
  background: #fdf8ee;
}
.pd-more-card strong {
  color: #1d2c40;
  font-size: 12px;
  line-height: 1.4;
}
.pd-more-card small {
  color: #94a1b2;
  font-size: 10px;
}
.pd-more-points {
  color: #b7791f;
  font-size: 14px;
  font-weight: 700;
}
</style>
