<!--
  页面：支付失败（pay-failed.vue）
  路由：/pay-failed ｜ 分组：交易与履约
  作用：支付未完成结果页，引导用户返回订单列表重新选择支付方式
  数据：无数据读取，纯结果占位页
-->
<template>
  <section class="card result">
    <!-- 结果标题与提示文案 -->
    <h1 class="red">支付未完成</h1>
    <p>可返回订单重新选择支付方式。</p>
    <!-- 后续操作：查看订单列表或返回首页 -->
    <div class="action-row">
      <router-link class="btn primary" to="/orders">查看订单</router-link
      ><router-link class="btn" to="/home">返回首页</router-link>
    </div>
  </section>
</template>
<script>
export default { name: 'Page' }
</script>
