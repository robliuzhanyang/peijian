<!--
  页面：购物车（H5）
  路由：/cart ｜ 分组：交易与履约
  作用：展示购物车行项（含一站式选购整套方案），方案行可展开配置、查看报价单或回到一站式选购修改，
        支持勾选、全选、数量加减与移除，底部可按勾选行生成报价单或跳转确认订单页
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
      <!-- 一站式选购方案：整套作为一条记录 -->
      <div v-for="line in schemeLines" :key="line.id" class="m-cart-scheme">
        <div class="mcs-head">
          <label class="cart-check">
            <input
              type="checkbox"
              :checked="isChecked(line)"
              @change="toggle(line)"
            />
          </label>
          <img :src="asset(line.image)" :alt="line.name" />
          <div class="mcs-info">
            <span class="badge blue">一站式选购</span>
            <h3>{{ line.name }}</h3>
            <p class="tiny">{{ line.skuCode }}</p>
          </div>
          <strong class="price">{{ money(line.unitPriceFen) }}</strong>
        </div>
        <div class="mcs-links">
          <button @click="toggleScheme(line.id)">
            {{ expandedId === line.id ? "收起配置" : "查看配置" }}
          </button>
          <button @click="viewQuote(line)">查看报价单</button>
          <button class="danger" @click="remove(line)">移除</button>
        </div>
        <!-- 方案配置明细：只读 -->
        <div v-if="expandedId === line.id" class="mcs-parts">
          <div v-for="(p, i) in line.scheme.parts" :key="p.id + '-' + i" class="mcs-part">
            <span class="mcs-part-name"
              ><small>{{ p.module }}</small>{{ productName(p.id) }}</span
            >
            <span class="mcs-part-qty">×{{ p.qty || 1 }}</span>
            <strong>{{ money(partSubtotal(p)) }}</strong>
          </div>
          <p class="tiny mcs-note">按整套计价，调整请回到一站式选购修改后重新加入。</p>
          <button class="btn sm block" @click="editScheme(line)">去修改配置</button>
        </div>
      </div>

      <!-- 普通商品行：左图 + 中间信息 + 右侧数量与移除 -->
      <div v-for="line in productLines" :key="line.id" class="m-cart-item">
        <label class="cart-check">
          <input
            type="checkbox"
            :checked="isChecked(line)"
            @change="toggle(line)"
          />
        </label>
        <img :src="asset(line.image)" :alt="line.name" />
        <div class="mci-info">
          <h3>{{ line.name }}</h3>
          <p class="tiny">
            型号 {{ fieldValue(line.model) }} · SKU {{ line.skuCode }}
          </p>
          <strong class="price">{{ money(line.unitPriceFen) }}</strong>
        </div>
        <div class="mci-ops">
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
        class="btn sm"
        type="button"
        :disabled="!checkedLines.length"
        @click="makeQuote"
      >
        生成报价单
      </button>
      <button
        class="btn primary sm"
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
/* 一站式方案行：浅蓝底与普通商品行区分 */
.m-cart-scheme {
  margin-bottom: 12px;
  padding: 11px;
  border: 1px solid #d6e6fb;
  border-radius: 9px;
  background: #f7fbff;
}
.mcs-head {
  display: grid;
  grid-template-columns: 16px 56px minmax(0, 1fr) auto;
  gap: 9px;
  align-items: center;
}
.mcs-head img {
  width: 56px;
  height: 50px;
  object-fit: contain;
  border-radius: 7px;
  background: #fff;
}
.mcs-info .badge {
  font-size: 9px;
}
.mcs-info h3 {
  margin: 3px 0 2px;
  font-size: 12.5px;
  line-height: 1.4;
}
.mcs-info .tiny {
  margin: 0;
  font-size: 9px;
}
.m-cart-scheme .price {
  font-size: 14px;
  white-space: nowrap;
}
.mcs-links {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #d8e4f4;
}
.mcs-links button {
  padding: 0;
  border: 0;
  background: none;
  color: var(--blue);
  font-size: 10px;
}
.mcs-links button.danger {
  color: var(--red);
}
/* 方案配置明细：只读列表 */
.mcs-parts {
  margin-top: 9px;
  padding-top: 8px;
  border-top: 1px dashed #d8e4f4;
}
.mcs-part {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 34px 68px;
  gap: 8px;
  align-items: center;
  padding: 4px 0;
  font-size: 10.5px;
}
.mcs-part-name small {
  display: inline-block;
  min-width: 42px;
  color: var(--muted);
  font-size: 9px;
}
.mcs-part-qty {
  color: var(--muted);
}
.mcs-part strong {
  color: #df422d;
  font-size: 11px;
  text-align: right;
}
.mcs-note {
  margin: 6px 0 8px;
}
/* 普通商品行：左图 + 中间信息 + 右侧数量与移除 */
.m-cart-item {
  display: grid;
  grid-template-columns: 16px 58px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: start;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}
.m-cart-item:last-child {
  padding-bottom: 2px;
  border-bottom: 0;
}
.m-cart-item img {
  width: 58px;
  height: 56px;
  object-fit: contain;
  border-radius: 7px;
  background: #f7f9fc;
}
.mci-info h3 {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.4;
}
.mci-info .tiny {
  margin: 3px 0 0;
  color: var(--muted);
  font-size: 9px;
}
.mci-info .price {
  display: block;
  margin-top: 5px;
  font-size: 14px;
}
.mci-ops {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}
.mci-ops .stepper {
  gap: 4px;
}
.mci-ops .stepper button {
  min-height: 24px;
  padding: 2px 8px;
  font-size: 11px;
}
.mci-ops .stepper input {
  width: 36px;
  height: 26px;
  font-size: 11px;
}
.mci-ops .link {
  color: #8b98a9;
  font-size: 10px;
}
/* 勾选区：方案行与普通商品行共用 */
.cart-check {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 2px;
  cursor: pointer;
}
.cart-check input,
.check-all input {
  width: 15px;
  height: 15px;
  margin: 0;
  accent-color: var(--blue);
  cursor: pointer;
}
/* 结算栏：全选靠左，金额与按钮靠右 */
.cart-bar {
  gap: 8px;
}
.cart-bar .check-all {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: auto;
  color: #475569;
  font-size: 11px;
  cursor: pointer;
}
.cart-bar-count {
  color: var(--muted);
  font-size: 10px;
}
.cart-bar .price {
  font-size: 15px;
}
.cart-bar .btn {
  padding: 6px 10px;
  font-size: 11px;
  white-space: nowrap;
}
</style>
