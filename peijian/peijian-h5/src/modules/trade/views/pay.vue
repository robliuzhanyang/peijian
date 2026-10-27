<!--
  页面：订单支付（pay.vue）
  路由：/pay ｜ 分组：交易与履约
  作用：订单支付页，展示应付金额与支付方式，完成付款后进入支付结果页
  数据：按 query.id 从 state.orders 查找订单，找不到时回退 state.lastOrder
-->
<template>
  <div>
    <!-- 页头：标题 + 业务说明 -->
    <div class="page-title">
      <h1>订单支付</h1>
      <small>请选择支付方式完成付款</small>
    </div>
    <!-- 订单存在时展示金额、支付方式与操作入口 -->
    <div v-if="order" class="content-grid">
      <section class="card">
        <h2>订单 {{ order.id }}</h2>
        <p class="price">{{ money(order.totalFen) }}</p>
        <!-- 支付方式切换段 -->
        <div class="segment">
          <button v-for="m in methods" :key="m" :class="{ on: method === m }" @click="method = m">
            {{ m }}
          </button>
        </div>
        <!-- 对公转账说明：付款后上传打款凭证，由财务核款 -->
        <div v-if="method === '对公转账'" class="notice">
          请按对公账户信息完成转账，付款后上传打款凭证，财务将于 1 个工作日内完成核款。
        </div>
        <!-- 支付结果入口 -->
        <div class="action-row">
          <button class="btn primary" @click="finish">确认已支付</button
          ><router-link class="btn" to="/pay-failed">支付遇到问题</router-link>
        </div>
      </section>
      <!-- 侧栏：订单说明 -->
      <aside class="card">
        <h2>订单说明</h2>
        <p>应付金额以已确认订单快照为准；完成付款后订单进入核款与发货流程。</p>
      </aside>
    </div>
    <!-- 订单不存在时的空态 -->
    <div v-else class="empty">订单不存在。<router-link to="/orders">查看订单</router-link></div>
  </div>
</template>
<script>
// 领域工具：金额分转元
import { money } from '@/domain/productFields'
export default {
  data() {
    // method 当前选中的支付方式；methods 可选支付方式列表
    return { method: '对公转账', methods: ['对公转账', '线上支付'] }
  },
  computed: {
    // 当前订单：优先按路由 query.id 匹配，未命中时用最近一次下单结果兜底
    order() {
      return (
        this.$store.state.orders.find((o) => o.id === this.$route.query.id) ||
        this.$store.state.lastOrder
      )
    },
  },
  methods: {
    money,
    // 确认已支付：对公转账进入待核款，线上支付直接置为已付款，并记录支付方式
    finish() {
      if (!this.order) return
      const transfer = this.method === '对公转账'
      this.$store.commit('setOrderStatus', {
        id: this.order.id,
        status: transfer ? '待核款' : '已付款',
        payMethod: this.method,
      })
      this.$router.push({
        path: '/pay-success',
        query: { id: this.order.id, pending: transfer ? '1' : undefined },
      })
    },
  },
}
</script>
