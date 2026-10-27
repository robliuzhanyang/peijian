<!--
  页面：选配方案确认（diy-confirm.vue）
  路由：/diy-confirm ｜ 分组：选型与采购
  作用：核对选型结果——真实组合展示组合名 / 组合型号 / 方向 / 场景 / 要点，配置明细分两层：
        主体构成（立柱 · 光路 · 运动轴 · 底板 · 机箱）与配套附件（电脑支架 / 波纹管 / 工具包），
        每层再按模块分组（含数量、小计）；所有部品为待报价客户资料，金额统一显示待报价。
        可返回修改或查看报价单。
  数据：Vuex state.selectedScheme（组合快照）+ state.selected（商品 id 数组）；
        parts 行由 diy.vue 打上 section 标记（core / extras）；商品经 getters.product 解析
-->
<template>
  <div>
    <!-- 页头：标题 + 核对说明 -->
    <div class="page-title">
      <h1>组合配置确认</h1>
      <small>核对部品型号、数量与金额，确认后加入购物车</small>
    </div>

    <!-- ===== 成套方案：方案概览卡 ===== -->
    <section v-if="scheme" class="card" style="margin-bottom: 15px">
      <div class="between">
        <h2>
          {{ scheme.name }}
          <span class="badge" :class="tagClass" style="margin-left: 8px">{{
            scheme.tag
          }}</span>
        </h2>
        <span>
          <span v-if="scheme.customized" class="badge gold"
            >已破套 · 一站式组合价</span
          >
          <span v-else-if="scheme.oneStop" class="badge green">套餐计价</span>
          <span v-if="scheme.recommend" class="badge green">推荐组合</span>
        </span>
      </div>
      <p class="tiny" style="margin-top: 8px">
        组合型号：<template v-if="scheme.model">{{ scheme.model }}</template
        ><template v-else>待补充</template>
      </p>
      <p class="tiny">加工方向：{{ directionName || scheme.direction }}</p>
      <p class="tiny">适用场景：{{ scheme.scene }}</p>
      <p class="tiny">加工材料：{{ scheme.workpiece }}</p>
      <div class="chips" style="margin-top: 8px">
        <span v-for="f in scheme.features" :key="f" class="chip">{{ f }}</span>
      </div>
    </section>

    <div class="content-grid">
      <!-- ===== 成套方案：分两层的配置明细 ===== -->
      <section v-if="scheme" class="card">
        <h2>组合明细（共 {{ partCount }} 件）</h2>

        <!-- 第一层：主体构成 -->
        <div class="detail-section core">
          <h3>{{ coreTitle }}（{{ sectionCount(coreRows) }} 件）</h3>
          <div
            v-for="(group, name) in groupBy(coreRows)"
            :key="'c-' + name"
            class="field-section"
          >
            <h3>{{ name }}</h3>
            <div v-for="(p, i) in group" :key="i" class="order-line">
              <span class="ol-info"
                >{{ product(p.id).name }}<br /><small
                  >产品型号 {{ fieldValue(product(p.id).model) }} · SKU
                  {{ fieldValue(product(p.id).skuCode) }}</small
                ></span
              >
              <!-- 数量可改：数量 × 单价 = 总价 -->
              <span class="ol-calc">
                <span class="qty-stepper">
                  <button
                    type="button"
                    aria-label="减少数量"
                    @click="stepQty(p, -1)"
                  >
                    −</button
                  ><input
                    :value="p.qty || 1"
                    inputmode="numeric"
                    @change="setQty(p, $event.target.value)"
                  /><button
                    type="button"
                    aria-label="增加数量"
                    @click="stepQty(p, 1)"
                  >
                    ＋
                  </button>
                </span>
                <em>×</em>
                <span class="ol-unit">{{ money(product(p.id).priceFen) }}</span>
                <em>=</em>
                <strong class="price">{{ money(lineTotal(p)) }}</strong>
              </span>
            </div>
          </div>
        </div>

        <!-- 第二层：配套附件（有则展示，无则说明） -->
        <div class="detail-section extras">
          <h3>{{ extrasTitle }}（{{ sectionCount(extrasRows) }} 件）</h3>
          <template v-if="extrasRows.length">
            <div
              v-for="(group, name) in groupBy(extrasRows)"
              :key="'e-' + name"
              class="field-section"
            >
              <h3>{{ name }}</h3>
              <div v-for="(p, i) in group" :key="i" class="order-line">
                <span class="ol-info"
                  >{{ product(p.id).name }}<br /><small
                    >产品型号 {{ fieldValue(product(p.id).model) }} · SKU
                    {{ fieldValue(product(p.id).skuCode) }}</small
                  ></span
                >
                <span class="ol-calc">
                  <span class="qty-stepper">
                    <button
                      type="button"
                      aria-label="减少数量"
                      @click="stepQty(p, -1)"
                    >
                      −</button
                    ><input
                      :value="p.qty || 1"
                      inputmode="numeric"
                      @change="setQty(p, $event.target.value)"
                    /><button
                      type="button"
                      aria-label="增加数量"
                      @click="stepQty(p, 1)"
                    >
                      ＋
                    </button>
                  </span>
                  <em>×</em>
                  <span class="ol-unit">{{
                    money(product(p.id).priceFen)
                  }}</span>
                  <em>=</em>
                  <strong class="price">{{ money(lineTotal(p)) }}</strong>
                </span>
              </div>
            </div>
          </template>
          <p v-else class="tiny">该组合无单列配套附件。</p>
        </div>
      </section>

      <!-- ===== 自定义选配：逐行商品明细（原逻辑） ===== -->
      <section v-else class="card">
        <h2>方案明细</h2>
        <div v-for="id in selected" :key="id" class="order-line">
          <span
            >{{ product(id).name }}<br /><small
              >产品型号 {{ fieldValue(product(id).model) }} · SKU
              {{ fieldValue(product(id).skuCode) }}</small
            ></span
          ><strong>{{ money(product(id).priceFen) }}</strong>
        </div>
        <!-- 空方案态 -->
        <div v-if="!selected.length" class="empty">尚未选配产品</div>
      </section>

      <!-- 侧栏：报价合计、审核提示与查看报价单 / 返回修改入口 -->
      <aside class="card">
        <h2>报价预览</h2>
        <p class="tiny" v-if="scheme">
          主体构成 {{ sectionCount(coreRows) }} 件<template
            v-if="extrasRows.length"
          >
            ＋ 配套附件 {{ sectionCount(extrasRows) }} 件</template
          >，合计金额
        </p>
        <strong class="price">{{ money(total) }}</strong>
        <p class="alert">
          以下为参考报价，随配置实时计算；正式报价以业务出具确认。
        </p>
        <!-- 三个出口：加入购物车 / 生成报价单 / 立即购买 -->
        <button class="btn primary block" @click="addToCart">加入购物车</button>
        <button class="btn block dc-mt10" @click="toQuote">生成报价单</button>
        <button class="btn block dc-mt10" @click="buyNow">立即购买</button>
        <p class="tiny back-line">
          <router-link to="/diy?edit=1">返回修改配置</router-link>
        </p>
      </aside>
    </div>
  </div>
</template>

<script>
// 领域工具：金额分转元、空字段占位
import { money, fieldValue } from "@/domain/productFields";
// 方案方向定义（用于把 direction id 转中文名）
import catalog from "@/mock/catalog.json";

// 方案标签 → 徽章配色（与 diy.vue 保持一致）
const TAG_CLASS = {
  标准: "green",
  飞行: "purple",
  PLUS: "gold",
  套餐价: "green",
  组合价: "gold",
  单品正价: "gold",
};

export default {
  computed: {
    // 当前方案对象（方案选型模式有值；自定义选配为 null）
    scheme() {
      return this.$store.state.selectedScheme;
    },
    // 已选商品 id 列表（由选配页写入）
    selected() {
      return this.$store.state.selected;
    },
    // 方案标签配色
    tagClass() {
      return TAG_CLASS[this.scheme && this.scheme.tag] || "";
    },
    // 方案方向中文名
    directionName() {
      if (!this.scheme) return "";
      const d = (catalog.directions || []).find(
        (x) => x.id === this.scheme.direction
      );
      return d ? d.name : this.scheme.direction;
    },
    // 固定配置行（兼容旧快照：缺 section 标记的统一视为 core）
    coreRows() {
      if (!this.scheme) return [];
      return this.scheme.parts.filter((p) => p.section !== "extras");
    },
    // 方向配件行
    extrasRows() {
      if (!this.scheme) return [];
      return this.scheme.parts.filter((p) => p.section === "extras");
    },
    // 方案配置总件数（含数量）
    partCount() {
      return this.scheme
        ? this.sectionCount(this.scheme.parts)
        : this.selected.length;
    },
    // 是否改过数量：改过之后按明细合计，不再使用套餐一口价
    qtyChanged() {
      return !!this.scheme && this.scheme.parts.some((p) => (p.qty || 1) !== 1);
    },
    // 合计（分）：任一部品未报价则整单 null（界面显示待报价）
    total() {
      if (this.scheme && this.scheme.oneStop && !this.qtyChanged)
        return this.scheme.packagePriceFen;
      if (this.scheme) return this.sectionTotal(this.scheme.parts);
      if (this.selected.some((id) => this.product(id).priceFen == null))
        return null;
      return this.selected.reduce(
        (n, id) => n + (this.product(id).priceFen || 0),
        0
      );
    },
    coreTitle() {
      return this.scheme && this.scheme.oneStop ? "主材与核心选配" : "主体构成";
    },
    extrasTitle() {
      return this.scheme && this.scheme.oneStop ? "扩展配件" : "配套附件";
    },
  },
  methods: {
    money,
    fieldValue,
    // 加入购物车：整套方案作为一条行项写入购物车，随后进入购物车核对与结算
    addToCart() {
      if (!this.scheme) {
        this.$store.commit("setNotice", "请先完成一站式选配");
        return;
      }
      this.$store.commit("addSchemeCart", this.scheme);
      this.$store.commit("setNotice", "方案已加入购物车");
      this.$router.push("/cart");
    },
    // 立即购买：直接写入购物车并进入结算
    buyNow() {
      if (!this.scheme) {
        this.$store.commit("setNotice", "请先完成一站式选配");
        return;
      }
      this.$store.commit("addSchemeCart", this.scheme);
      this.$router.push("/checkout");
    },
    // 生成报价单：带当前方案进入报价单页
    toQuote() {
      if (!this.scheme) {
        this.$store.commit("setNotice", "请先完成一站式选配");
        return;
      }
      this.$router.push("/quote");
    },
    // 数量加减：步进值限制在 1~99
    stepQty(p, delta) {
      this.setQty(p, (p.qty || 1) + delta);
    },
    // 改写方案快照里的数量，列表行金额与合计随之实时变化
    setQty(p, value) {
      if (!this.scheme) return;
      const qty = Math.min(99, Math.max(1, parseInt(value, 10) || 1));
      const parts = this.scheme.parts.map((row) =>
        row === p ? { ...row, qty } : row
      );
      this.$store.commit("setSelectedScheme", { ...this.scheme, parts });
    },
    // 单行小计：单价 × 数量；未报价返回 null
    lineTotal(p) {
      const price = this.product(p.id).priceFen;
      return price == null ? null : price * (p.qty || 1);
    },
    // 一段配置的总件数（含数量）
    sectionCount(rows) {
      return rows.reduce((n, p) => n + (p.qty || 1), 0);
    },
    // 一段配置的金额合计（分）；任一部品未报价返回 null
    sectionTotal(rows) {
      if (rows.some((p) => this.product(p.id).priceFen == null)) return null;
      return rows.reduce(
        (n, p) => n + this.product(p.id).priceFen * (p.qty || 1),
        0
      );
    },
    // 配置行按模块名分组（保持原始顺序，Vue 2 对对象 key 按插入顺序遍历）
    groupBy(rows) {
      const map = {};
      rows.forEach((p) => {
        if (!map[p.module]) map[p.module] = [];
        map[p.module].push(p);
      });
      return map;
    },
    // 按 id 取商品，未命中返回空对象避免模板报错
    product(id) {
      return this.$store.getters.product(id) || {};
    },
  },
};
</script>

<style>
/* 明细分层标题配色：固定配置蓝、方向配件琥珀色 */
.detail-section {
  margin-top: 12px;
}
.detail-section.core > h3 {
  color: var(--blue);
}
.detail-section.extras > h3 {
  color: #9a5b00;
}
/* 行右侧：数量步进器 × 单价 = 总价 */
.ol-info {
  min-width: 0;
  flex: 1 1 auto;
}
.ol-calc {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #5c6b80;
  font-size: 10px;
  white-space: nowrap;
}
.ol-calc em {
  color: #9aa7b9;
  font-style: normal;
}
.ol-unit {
  color: #5c6b80;
}
.qty-stepper {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: #fff;
}
.qty-stepper button {
  width: 20px;
  height: 22px;
  border: 0;
  background: #f6f8fb;
  color: #41546d;
  font-size: 11px;
  line-height: 1;
}
.qty-stepper input {
  width: 30px;
  height: 22px;
  border: 0;
  color: #1d2f4b;
  font-size: 10px;
  text-align: center;
}
/* 侧栏按钮间距与返回修改 */
.dc-mt10 {
  margin-top: 9px;
}
.back-line {
  margin: 9px 0 0;
  text-align: center;
}
</style>
