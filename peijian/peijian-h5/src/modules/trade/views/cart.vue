<!--
  页面：购物车（H5）
  路由：/cart ｜ 分组：交易与履约
  作用：展示购物车行项（含一站式选购整套方案），方案行可展开配置、查看报价单或回到一站式选购修改，
        支持数量加减与移除，最后跳转确认订单页
  数据：读取 Vuex state.cart；金额/件数取 getters；变更走 updateQty / removeCart / setCheckout
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
          <button class="link" @click="$store.commit('removeCart', line.id)">
            移除
          </button>
        </div>
      </div>

      <!-- 空购物车态 -->
      <div v-if="!cart.length" class="empty">
        购物车暂无商品。<router-link to="/goods">去选购</router-link>
        <span class="tiny"> 或 </span>
        <router-link to="/diy">去一站式选购</router-link>
      </div>
    </section>

    <!-- 结算栏：仅在有商品时出现，点击后把购物车快照写入 checkoutItems -->
    <div v-if="cart.length" class="card action-row">
      <span>共 {{ cartCount }} 件</span><strong class="price">{{ money(cartTotal) }}</strong
      ><button class="btn primary" @click="checkout">去结算</button>
    </div>
  </div>
</template>

<script>
// 领域工具：金额分转元、静态资源路径、空字段占位
import { money, asset, fieldValue } from '@/domain/productFields'

export default {
  data() {
    // 展开查看配置的方案行 id（同一时间只展开一条）
    return { expandedId: '' }
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
    // 合计金额（分）
    cartTotal() {
      return this.$store.getters.cartTotal
    },
    // 合计件数
    cartCount() {
      return this.$store.getters.cartCount
    },
  },
  methods: {
    money,
    asset,
    fieldValue,
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
    // 去结算：复制一份行项快照到 state.checkoutItems，再进入确认订单页
    checkout() {
      this.$store.commit('setCheckout', this.cart.slice())
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
  grid-template-columns: 56px minmax(0, 1fr) auto;
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
  grid-template-columns: 58px minmax(0, 1fr) auto;
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
</style>
