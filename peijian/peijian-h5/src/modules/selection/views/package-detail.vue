<!--
  页面：套装编辑（package-detail.vue）
  路由：/package-detail ｜ 分组：选型与采购
  作用：查看套装配置清单（型号/SKU/数量）与套装信息，可跳商品详情或携带套装 id 生成报价单
  数据：state.packages 按路由 query.id 查找（缺省 PK1）；清单商品通过 getters.product 解析
-->
<template>
  <div v-if="bundle">
    <!-- 页头：套装名称 + 业务说明 -->
    <div class="page-title">
      <h1>{{ bundle.name }}</h1>
      <small>套装配置清单与参考价格</small>
    </div>
    <div class="content-grid">
      <!-- 配置清单：逐行展示套装内商品图片、型号、SKU 与数量 -->
      <section class="card">
        <h2>配置清单</h2>
        <div v-for="(item, i) in bundle.items" :key="i" class="line-product">
          <img :src="asset(part(item[0]).image)" :alt="part(item[0]).name" />
          <div>
            <h3>{{ part(item[0]).name }}</h3>
            <p class="tiny">
              型号 {{ fieldValue(part(item[0]).model) }} · SKU
              {{ item[1] || fieldValue(part(item[0]).skuCode) }} · 数量
              {{ item[2] }}
            </p>
            <!-- 关键规格：选中 SKU 参数 + 实物参数，空字段不展示 -->
            <p v-if="specs(item).length" class="spec-tags">
              <span v-for="s in specs(item)" :key="s" class="spec-tag">{{
                s
              }}</span>
            </p>
            <p class="tiny">
              参考单价：{{ money(unitPrice(part(item[0]), item[1])) }}
            </p>
          </div>
          <router-link
            class="link"
            :to="{
              path: '/detail',
              query: { id: item[0], back: 'bundle:' + bundle.id },
            }"
            >查看细节</router-link
          >
        </div>
      </section>
      <!-- 侧栏：套装简介、套装价与生成报价单入口 -->
      <aside class="card">
        <h2>套装信息</h2>
        <p>{{ bundle.desc }}</p>
        <p class="price">{{ money(bundle.priceFen) }}</p>
        <p class="tiny">套装价为参考报价，最终价格以下单核价为准。</p>
        <router-link
          class="btn primary block"
          :to="{ path: '/quote', query: { bundle: bundle.id } }"
          >生成报价单</router-link
        >
      </aside>
    </div>
  </div>
  <!-- 套装不存在空态 -->
  <div v-else class="empty">套装不存在</div>
</template>
<script>
// 领域工具：金额分转元、静态资源路径、空字段占位、实物参数字段定义
import {
  money,
  asset,
  fieldValue,
  physicalFields,
} from "@/domain/productFields";
export default {
  computed: {
    // 当前套装：按路由 query.id 在 state.packages 中查找，缺省 PK1
    bundle() {
      return this.$store.state.packages.find(
        (p) => p.id === (this.$route.query.id || "PK1"),
      );
    },
  },
  methods: {
    money,
    asset,
    fieldValue,
    // 按清单中的商品 id 解析商品；未命中时返回「待加载」占位，避免模板报错
    part(id) {
      return (
        this.$store.getters.product(id) || {
          image: "machine.svg",
          name: "待加载",
          skuCode: null,
          physical: {},
        }
      );
    },
    // 清单行关键规格：选中 SKU 的功率/量程/制冷 + 实物参数，全部跳过空值
    specs(item) {
      const p = this.part(item[0]);
      const out = [];
      const sku =
        p.skus && item[1] ? p.skus.find((s) => s.id === item[1]) : null;
      if (sku) {
        if (sku.power) out.push("功率 " + sku.power);
        if (sku.range) out.push("量程 " + sku.range);
        if (sku.cool) out.push("制冷量 " + sku.cool);
      }
      if (p.physical) {
        physicalFields.forEach(([key, label, unit]) => {
          const raw = p.physical[key];
          if (raw === null || raw === undefined || raw === "") return;
          const val =
            typeof raw === "boolean" ? (raw ? "是" : "否") : raw + (unit || "");
          out.push(label + " " + val);
        });
        if (p.physical.travel && p.physical.travel.max) {
          out.push("活动范围上限 " + p.physical.travel.max);
        }
      }
      return out.slice(0, 6);
    },
    // 清单行参考单价：优先取选中 SKU 价，否则取商品默认价
    unitPrice(p, skuId) {
      const sku = p.skus && skuId ? p.skus.find((s) => s.id === skuId) : null;
      return sku ? sku.priceFen : p.priceFen;
    },
  },
};
</script>
