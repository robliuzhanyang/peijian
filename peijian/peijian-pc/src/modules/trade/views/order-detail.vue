<!--
  页面：订单详情（order-detail.vue）
  路由：/order-detail ｜ 分组：交易与履约
  作用：展示单个订单的订单元信息（下单时间、支付方式、备注、收货全称、取消原因）、状态、商品明细与金额，
        并提供物流、合同、开票、售后、继续支付等履约入口
  数据：按 query.id 从 state.orders 查找订单；商品名称通过 getters.product 反查；收货地址按 addressId 从 state.addresses 查全称
-->
<template>
  <div>
    <!-- 页头：标题 + 订单号（未找到时提示） -->
    <div class="page-title">
      <h1>订单详情</h1>
      <small>{{ order ? order.id : "未找到订单" }}</small>
    </div>
    <!-- 订单元信息：下单时间、支付方式、收货地址、采购备注与取消原因 -->
    <section v-if="order" class="card">
      <h2>订单信息</h2>
      <div class="spec-grid">
        <div class="field-row">
          <span>下单时间</span
          ><strong>{{ fieldValue(order.createdAt) }}</strong>
        </div>
        <div class="field-row">
          <span>支付方式</span
          ><strong>{{ order.payMethod || "待支付" }}</strong>
        </div>
        <div class="field-row">
          <span>收货地址</span><strong>{{ addressText }}</strong>
        </div>
        <div v-if="order.remark" class="field-row">
          <span>采购备注</span><strong>{{ order.remark }}</strong>
        </div>
      </div>
      <!-- 已取消订单：展示取消原因 -->
      <p v-if="order.status === '已取消' && order.cancelReason" class="alert">
        取消原因：{{ order.cancelReason }}
      </p>
    </section>
    <!-- 订单存在时展示明细与履约操作 -->
    <div v-if="order" class="content-grid">
      <!-- 左栏：订单状态、商品行项与合计金额 -->
      <section class="card">
        <h2>
          订单状态
          <span
            class="badge"
            :class="orderBadgeClass(order.status)"
            style="margin-left: 8px"
            >{{ order.status }}</span
          >
        </h2>
        <div v-for="(l, i) in order.items" :key="i" class="goods-line">
          <span class="goods-meta">
            <strong>{{ l.name || productName(l.productId) }}</strong>
            <small
              >型号 {{ fieldValue(l.model) }} · SKU
              {{ fieldValue(l.skuCode) }} × {{ l.quantity }}</small
            >
          </span>
          <strong class="goods-price">{{
            money(l.unitPriceFen * l.quantity)
          }}</strong>
        </div>
        <div class="action-row total-row">
          <span class="tiny">共 {{ order.items.length }} 类商品，合计</span>
          <strong class="price">{{ money(order.totalFen) }}</strong>
        </div>
      </section>
      <!-- 右栏：按订单状态展示可用的履约操作入口 -->
      <aside class="card">
        <h2>履约操作</h2>
        <!-- 待付款：支付主操作 + 取消订单 -->
        <template v-if="order.status === '待付款'">
          <router-link
            class="btn primary block"
            :to="{ path: '/pay', query: { id: order.id } }"
            >继续支付</router-link
          >
          <button class="btn block ghost" @click="cancelOrder">取消订单</button>
        </template>
        <!-- 待核款：提示对公打款等待平台确认，可查看合同 -->
        <template v-else-if="order.status === '待核款'">
          <p class="alert">对公打款凭证已提交，等待平台财务核款确认。</p>
          <router-link
            class="btn block"
            :to="{ path: '/contract-detail', query: { id: order.id } }"
            >查看合同</router-link
          >
        </template>
        <!-- 待发货：可催发货 -->
        <template v-else-if="order.status === '待发货'">
          <button class="btn block" @click="remind">催发货</button>
          <router-link
            class="btn block"
            :to="{ path: '/contract-detail', query: { id: order.id } }"
            >查看合同</router-link
          >
          <router-link
            v-if="canInvoice"
            class="btn block"
            :to="{ path: '/invoice-apply', query: { id: order.id } }"
            >申请开票</router-link
          >
        </template>
        <!-- 待收货：确认收货 + 物流 + 售后 -->
        <template v-else-if="order.status === '待收货'">
          <button class="btn primary block" @click="confirmReceipt">确认收货</button>
          <router-link
            class="btn block"
            :to="{ path: '/logistics', query: { id: order.id } }"
            >查看物流</router-link
          >
          <router-link
            v-if="canAftersale"
            class="btn block"
            :to="{ path: '/aftersale-apply', query: { id: order.id } }"
            >申请售后</router-link
          >
        </template>
        <!-- 已取消：无履约操作 -->
        <p v-else-if="order.status === '已取消'" class="empty tiny">
          订单已取消，无可用履约操作。
        </p>
        <!-- 履约中/完成：物流、合同恒有；开票/售后按 computed 开放 -->
        <template v-else>
          <router-link
            class="btn block"
            :to="{ path: '/logistics', query: { id: order.id } }"
            >查看物流</router-link
          ><router-link
            class="btn block"
            :to="{ path: '/contract-detail', query: { id: order.id } }"
            >查看合同</router-link
          ><router-link
            v-if="canInvoice"
            class="btn block"
            :to="{ path: '/invoice-apply', query: { id: order.id } }"
            >申请开票</router-link
          ><router-link
            v-if="canAftersale"
            class="btn block"
            :to="{ path: '/aftersale-apply', query: { id: order.id } }"
            >申请售后</router-link
          >
        </template>
      </aside>
      <!-- 返回列表：详情页兜底导航 -->
      <router-link class="btn ghost block full order-back" to="/orders"
        >返回订单列表</router-link
      >
    </div>
    <!-- 订单不存在时的空态 -->
    <div v-else class="empty">
      订单不存在。<router-link to="/orders">返回订单列表</router-link>
    </div>
  </div>
</template>
<script>
// 领域工具：金额分转元、空字段占位
import { money, fieldValue } from "@/domain/productFields";
export default {
  computed: {
    // 当前订单，按路由 query.id 精确匹配
    order() {
      return this.$store.state.orders.find(
        (o) => o.id === this.$route.query.id,
      );
    },
    // 收货地址全称：按 order.addressId 从地址簿匹配 full，查不到时回显地址 id
    addressText() {
      if (!this.order) return "";
      const addr = this.$store.state.addresses.find(
        (a) => a.id === this.order.addressId,
      );
      return addr ? addr.full : this.order.addressId;
    },
    // 可申请开票：订单进入备货后（与发票页可开票范围保持一致）
    canInvoice() {
      return ["待发货", "运输中", "待收货", "已完成", "售后中"].includes(
        this.order?.status,
      );
    },
    // 可申请售后：发货后可发起
    canAftersale() {
      return ["待收货", "已完成", "售后中"].includes(this.order?.status);
    },
  },
  methods: {
    money,
    fieldValue,
    cancelOrder() {
      if (!confirm('确认取消该订单？')) return
      this.$store.commit('cancelOrder', { id: this.order.id })
      this.$store.commit('setNotice', '订单已取消')
    },
    remind() {
      this.$store.commit('remindShip', this.order.id)
      this.$store.commit('setNotice', '已提醒商家尽快发货')
    },
    confirmReceipt() {
      if (!confirm('确认已收到货物？')) return
      this.$store.commit('confirmReceipt', this.order.id)
      this.$store.commit('setNotice', '已确认收货')
    },
    // 按商品 id 反查商品名称；目录中找不到时直接回显 id
    productName(id) {
      const p = this.$store.getters.product(id);
      return p ? p.name : id;
    },
    // 订单状态 badge 配色：完成绿 / 售后金 / 取消红 / 待办橙 / 其余蓝
    orderBadgeClass(status) {
      if (status === "已完成") return "green";
      if (status === "售后中") return "gold";
      if (status === "已取消") return "red";
      if (status === "待付款" || status === "待核款") return "orange";
      return "blue";
    },
  },
};
</script>
