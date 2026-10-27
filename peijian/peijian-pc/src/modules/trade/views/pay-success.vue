<!--
  页面：支付成功（pay-success.vue）
  路由：/pay-success ｜ 分组：交易与履约
  作用：支付成功结果页，提示订单进入后续履约流程，并提供查看订单/返回首页入口
  数据：仅读取路由 query.id 展示订单号，无 Vuex 数据
-->
<template>
  <section class="card result">
    <!-- 结果标题与订单号：对公转账为待核款，线上支付为支付成功 -->
    <h1 :class="pending ? 'gold' : 'green'">
      {{ pending ? "已提交打款凭证" : "支付成功" }}
    </h1>
    <p v-if="pending">
      订单 {{ $route.query.id || "—" }} 等待财务核款，核款通过后进入发货流程。
    </p>
    <p v-else>订单 {{ $route.query.id || "—" }} 已进入后续履约流程。</p>
    <!-- 后续操作：查看订单详情或返回首页 -->
    <div class="action-row">
      <router-link
        class="btn primary"
        :to="{ path: '/order-detail', query: { id: $route.query.id } }"
        >查看订单</router-link
      ><router-link class="btn" to="/home">返回首页</router-link>
    </div>
  </section>
</template>
<script>
export default {
  name: "Page",
  computed: {
    // 对公转账：支付页带 pending=1，展示待核款文案
    pending() {
      return this.$route.query.pending === "1";
    },
  },
};
</script>
