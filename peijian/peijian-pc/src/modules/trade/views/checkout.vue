<!--
  页面：确认订单（checkout.vue）
  路由：/checkout ｜ 分组：交易与履约
  作用：核对收货地址与购买明细，填写采购备注后提交订单并进入支付页
  数据：读取 Vuex state.addresses / state.checkoutItems（为空时回退 state.cart）；下单走 dispatch('submitOrder')
-->
<template>
  <div>
    <!-- 页头：标题 + 业务说明 -->
    <div class="page-title">
      <h1>确认订单</h1>
      <small>核对收货地址和购买明细</small>
    </div>
    <div class="content-grid">
      <div>
        <!-- 收货地址：列表点选，右上角为新增地址入口 -->
        <section class="card">
          <div class="between">
            <h2>收货地址</h2>
            <router-link :to="{ path: '/address-edit', query: { from: 'checkout' } }"
              >新增地址</router-link
            >
          </div>
          <div class="segment">
            <button
              v-for="a in addresses"
              :key="a.id"
              :class="{ on: addressId === a.id }"
              @click="addressId = a.id"
            >
              {{ a.name }} {{ a.phone }}<br />{{ a.full }}
            </button>
          </div>
        </section>
        <!-- 商品清单：行项名称、型号/SKU、数量与小计金额 -->
        <section class="card field-section">
          <h2>商品清单</h2>
          <div v-for="l in items" :key="l.id" class="order-line">
            <span v-if="l.kind === 'scheme'">
              <span class="badge blue">一站式选购</span> {{ l.name }}<br />
              <small>{{ l.skuCode }} · 方案型号 {{ fieldValue(l.model) }}</small>
            </span>
            <span v-else
              >{{ l.name }}<br /><small
                >型号 {{ fieldValue(l.model) }} · SKU {{ l.skuCode }} ×
                {{ l.quantity }}</small
              ></span
            ><strong>{{ money(l.unitPriceFen * l.quantity) }}</strong>
          </div>
          <!-- 无可结算商品时的空态 -->
          <div v-if="!items.length" class="empty">没有可结算商品</div>
        </section>
      </div>
      <!-- 订单金额侧栏：合计金额、采购备注与提交按钮 -->
      <aside class="card">
        <h2>订单金额</h2>
        <p class="price">{{ money(total) }}</p>
        <label class="review-field"
          >采购备注<textarea
            v-model="remark"
            placeholder="选填"
          ></textarea></label
        ><button
          class="btn primary block"
          :disabled="!items.length || !addressId || busy"
          @click="submit"
        >
          提交订单
        </button>
        <p class="tiny">提交订单后请在支付页完成付款。</p>
      </aside>
    </div>
  </div>
</template>
<script>
// 领域工具：金额分转元、空字段占位
import { money, fieldValue } from "@/domain/productFields";
export default {
  data() {
    // addressId 选中的收货地址 id；remark 采购备注（选填）；busy 提交中标记，防止重复点击
    return { addressId: null, remark: "", busy: false };
  },
  computed: {
    // 收货地址列表
    addresses() {
      return this.$store.state.addresses;
    },
    // 待结算行项：优先使用"去结算"时写入的快照，快照为空则直接取购物车
    items() {
      return this.$store.state.checkoutItems.length
        ? this.$store.state.checkoutItems
        : this.$store.state.cart;
    },
    // 订单合计金额（分），按行项单价 × 数量累加
    total() {
      return this.items.reduce((n, l) => n + l.unitPriceFen * l.quantity, 0);
    },
  },
  created() {
    // 优先选中路由指定的地址（新增地址返回），其次默认地址，最后第一条
    const picked = this.addresses.find(
      (a) => a.id === this.$route.query.addressId
    );
    const primary =
      this.addresses.find((a) => a.primary) || this.addresses[0];
    const target = picked || primary;
    this.addressId = target && target.id;
  },
  methods: {
    money,
    fieldValue,
    // 提交订单：成功后携带新订单 id 跳转支付页；失败时写全局轻提示
    async submit() {
      this.busy = true;
      try {
        const o = await this.$store.dispatch("submitOrder", {
          addressId: this.addressId,
          remark: this.remark,
        });
        this.$router.push({ path: "/pay", query: { id: o.id } });
      } catch (e) {
        this.$store.commit("setNotice", e.message);
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>
