<!--
  页面：购物车（cart.vue）
  路由：/cart ｜ 分组：交易与履约
  作用：展示购物车行项（含一站式选购整套方案），支持勾选、全选、数量加减与移除商品，
        方案行可展开配置明细、查看报价单或回到一站式选购修改；
        底部可按勾选行生成报价单或跳转确认订单页
  数据：读取 Vuex state.cart；勾选合计在页面内计算；变更走 updateQty / removeCart / setCheckout / setQuoteItems
-->
<template>
  <div>
    <!-- 页头：标题 + 业务说明 -->
    <div class="page-title">
      <h1>购物车</h1>
      <small>核对产品型号、SKU、数量与下单价格</small>
    </div>

    <section class="card">
      <!-- 一站式选购方案：整套作为一条记录，可展开配置与查看报价单 -->
      <div v-for="line in schemeLines" :key="line.id" class="cart-scheme">
        <div class="cs-main">
          <label class="cart-check">
            <input
              type="checkbox"
              :checked="isChecked(line)"
              @change="toggle(line)"
            />
          </label>
          <img :src="asset(line.image)" :alt="line.name" />
          <div class="cs-info">
            <div class="cs-title">
              <span class="badge blue">一站式选购</span>
              <h3>{{ line.name }}</h3>
            </div>
            <p class="tiny">
              {{ line.skuCode }} ｜ 方案型号 {{ fieldValue(line.model) }}
            </p>
            <div class="cs-links">
              <button class="link" @click="toggleScheme(line.id)">
                {{ expandedId === line.id ? "收起配置" : "查看配置" }}
              </button>
              <button class="link" @click="viewQuote(line)">查看报价单</button>
              <button class="link danger" @click="remove(line)">移除</button>
            </div>
          </div>
          <strong class="price">{{ money(line.unitPriceFen) }}</strong>
        </div>
        <!-- 方案配置明细：按方案快照只读展示 -->
        <div v-if="expandedId === line.id" class="cs-parts">
          <div
            v-for="(p, i) in line.scheme.parts"
            :key="p.id + '-' + i"
            class="cs-part"
          >
            <span class="cs-part-module">{{ p.module }}</span>
            <span class="cs-part-name">{{ productName(p.id) }}</span>
            <span class="cs-part-qty">×{{ p.qty || 1 }}</span>
            <strong>{{ money(partSubtotal(p)) }}</strong>
          </div>
          <p class="tiny cs-parts-note">
            以上为方案内配置，按整套计价；如需调整请回到一站式选购修改后重新加入。
          </p>
          <button class="btn sm" @click="editScheme(line)">去修改配置</button>
        </div>
      </div>

      <!-- 购物车行项：图片、型号/SKU、单价、数量步进器、移除入口 -->
      <div v-for="line in productLines" :key="line.id" class="line-product">
        <label class="cart-check">
          <input
            type="checkbox"
            :checked="isChecked(line)"
            @change="toggle(line)"
          />
        </label>
        <img :src="asset(line.image)" :alt="line.name" />
        <div>
          <h3>{{ line.name }}</h3>
          <p class="tiny">产品型号 {{ fieldValue(line.model) }} · 可售 SKU {{ line.skuCode }}</p>
          <strong class="price">{{ money(line.unitPriceFen) }}</strong>
        </div>
        <div>
          <div class="stepper">
            <button class="btn sm" @click="qty(line, -1)">−</button
            ><input
              :value="line.quantity"
              type="number"
              min="1"
              @change="setQty(line, $event)"
            /><button class="btn sm" @click="qty(line, 1)">+</button>
          </div>
          <button class="link" @click="remove(line)">移除</button>
        </div>
      </div>

      <!-- 空购物车态 -->
      <div v-if="!cart.length" class="empty">
        购物车暂无商品。<router-link to="/goods">去选购</router-link>
        <span class="tiny"> 或 </span>
        <router-link to="/diy">去一站式选购</router-link>
      </div>
    </section>

    <!-- 结算栏：全选 + 勾选行合计，可生成报价单或仅结算勾选行 -->
    <div v-if="cart.length" class="card action-row cart-bar">
      <label class="check-all">
        <input type="checkbox" :checked="allChecked" @change="toggleAll" />
        <span>全选</span>
      </label>
      <span class="tiny cart-bar-count">已选 {{ checkedCount }} 件</span>
      <strong class="price">{{ money(checkedTotal) }}</strong>
      <button
        class="btn"
        type="button"
        :disabled="!checkedLines.length"
        @click="makeQuote"
      >
        生成报价单
      </button>
      <button
        class="btn primary"
        type="button"
        :disabled="!checkedLines.length"
        @click="checkout"
      >
        去结算
      </button>
    </div>
  </div>
</template>

<script>
// 领域工具：金额分转元、静态资源路径、空字段占位
import { money, asset, fieldValue } from '@/domain/productFields'

export default {
  data() {
    // expandedId：展开查看配置的方案行 id；unchecked：未勾选的行 id（默认全选）
    return { expandedId: '', unchecked: [] }
  },
  computed: {
    // 购物车行项列表（含数量与成交单价快照）
    cart() {
      return this.$store.state.cart
    },
    // 一站式选购方案行
    schemeLines() {
      return this.cart.filter((l) => l.kind === 'scheme')
    },
    // 普通商品行
    productLines() {
      return this.cart.filter((l) => l.kind !== 'scheme')
    },
    // 已勾选行：结算与报价都只针对这些行
    checkedLines() {
      return this.cart.filter((l) => !this.unchecked.includes(l.id))
    },
    // 是否全选（购物车为空时不算全选）
    allChecked() {
      return this.cart.length > 0 && this.unchecked.length === 0
    },
    // 勾选行合计金额（分）
    checkedTotal() {
      return this.checkedLines.reduce(
        (n, l) => n + l.unitPriceFen * l.quantity,
        0
      )
    },
    // 勾选行合计件数
    checkedCount() {
      return this.checkedLines.reduce((n, l) => n + l.quantity, 0)
    },
  },
  methods: {
    money,
    asset,
    fieldValue,
    // 行是否勾选
    isChecked(line) {
      return !this.unchecked.includes(line.id)
    },
    // 切换单行勾选
    toggle(line) {
      const i = this.unchecked.indexOf(line.id)
      if (i >= 0) this.unchecked.splice(i, 1)
      else this.unchecked.push(line.id)
    },
    // 全选 / 取消全选
    toggleAll() {
      this.unchecked = this.allChecked ? this.cart.map((l) => l.id) : []
    },
    // 数量步进：加/减一个单位，mutation 内部保证最小为 1
    qty(l, d) {
      this.$store.commit('updateQty', { id: l.id, quantity: l.quantity + d })
    },
    // 手动输入数量（输入非法时 mutation 回退为 1）
    setQty(l, e) {
      this.$store.commit('updateQty', { id: l.id, quantity: e.target.value })
    },
    // 展开 / 收起方案配置
    toggleScheme(id) {
      this.expandedId = this.expandedId === id ? '' : id
    },
    // 移除方案行
    remove(line) {
      if (this.expandedId === line.id) this.expandedId = ''
      this.unchecked = this.unchecked.filter((id) => id !== line.id)
      this.$store.commit('removeCart', line.id)
    },
    // 按商品 id 取名称（方案快照里只存 id）
    productName(id) {
      const p = this.$store.getters.product(id)
      return p ? p.name : '—'
    },
    // 方案内单行小计：商品正价 × 数量
    partSubtotal(p) {
      const item = this.$store.getters.product(p.id)
      return item ? (item.priceFen || 0) * (p.qty || 1) : 0
    },
    // 查看报价单：把该方案写回当前方案上下文后进入报价页
    viewQuote(line) {
      this.$store.commit('setSelectedScheme', line.scheme)
      this.$store.commit(
        'setSelected',
        (line.scheme.parts || []).map((p) => p.id)
      )
      this.$router.push('/quote')
    },
    // 去修改配置：带上方案上下文进入一站式选购，由 diy 页恢复原选配
    editScheme(line) {
      this.$store.commit('setSelectedScheme', line.scheme)
      this.$store.commit(
        'setSelected',
        (line.scheme.parts || []).map((p) => p.id)
      )
      this.$router.push({ path: '/diy', query: { edit: '1' } })
    },
    // 生成报价单：把勾选行写入报价快照后进入报价页（数量按购物车口径）
    makeQuote() {
      if (!this.checkedLines.length) return
      this.$store.commit(
        'setQuoteItems',
        this.checkedLines.map((l) => ({
          key: l.id,
          id: l.productId || l.id,
          name: l.name,
          model: l.model,
          qty: l.quantity,
          unitPriceFen: l.unitPriceFen,
          unit: l.kind === 'scheme' ? '套' : '台',
          module: l.kind === 'scheme' ? '一站式方案' : '',
        }))
      )
      this.$store.commit('setSelectedScheme', null)
      this.$router.push({ path: '/quote', query: { from: 'cart' } })
    },
    // 去结算：只把勾选行快照写入 checkoutItems，再进入确认订单页
    checkout() {
      if (!this.checkedLines.length) return
      this.$store.commit('setCheckout', this.checkedLines.slice())
      this.$router.push('/checkout')
    },
  },
}
</script>

<style>
/* 一站式方案行：与普通商品行同处一张卡片，单独浅蓝底区分 */
.cart-scheme {
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid #d6e6fb;
  border-radius: 10px;
  background: #f7fbff;
}
.cs-main {
  display: grid;
  grid-template-columns: 20px 76px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}
.cs-main img {
  width: 76px;
  height: 64px;
  object-fit: contain;
  border-radius: 8px;
  background: #fff;
}
.cs-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cs-title h3 {
  margin: 0;
  font-size: 15px;
}
.cs-info .tiny {
  margin: 5px 0 0;
}
.cs-links {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 7px;
}
.cs-links .link {
  font-size: 12px;
  color: var(--blue);
}
.cs-links .link.danger {
  color: var(--red);
}
.cart-scheme .price {
  font-size: 19px;
}
/* 方案配置明细：只读列表 */
.cs-parts {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed #cfdff2;
}
.cs-part {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr) 48px 110px;
  gap: 10px;
  align-items: center;
  padding: 5px 0;
  font-size: 12.5px;
}
.cs-part-module {
  color: var(--muted);
}
.cs-part-qty {
  color: var(--muted);
}
.cs-part strong {
  text-align: right;
  color: #df422d;
}
.cs-parts-note {
  margin: 8px 0 10px;
}
/* 勾选区：方案行与普通商品行共用 */
.cart-check {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.cart-check input,
.check-all input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--blue);
  cursor: pointer;
}
/* 普通商品行多一列勾选框 */
.line-product {
  grid-template-columns: 20px 70px minmax(0, 1fr) auto;
}
/* 结算栏：全选靠左，其余靠右 */
.cart-bar .check-all {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: auto;
  color: #475569;
  font-size: 13px;
  cursor: pointer;
}
.cart-bar-count {
  color: var(--muted);
}
</style>
