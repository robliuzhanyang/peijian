<!--
  页面：积分明细（points-ledger.vue）
  路由：/points-ledger ｜ 分组：积分与营销
  作用：顶部展示 Vuex 中的积分余额，下方展示积分收支流水
        （收入 earn 绿色 +N，支出 exchange 金色 N，并显示变动后余额）
  数据：余额读取 Vuex state.points；流水 marketingApi.pointsLedger()
-->
<template>
  <div>
    <!-- 页头：标题 + 余额说明 -->
    <div class="page-title">
      <h1>积分明细</h1>
      <small>当前积分余额与收支流水</small>
    </div>
    <!-- 余额卡片：读取 Vuex 积分余额 -->
    <section class="card">
      <strong class="price gold">{{ $store.state.points }} 积分</strong>
    </section>
    <!-- 积分流水：接口拉取，数组已按时间倒序 -->
    <section class="card">
      <h2>积分流水</h2>
      <!-- 单行流水：左侧标题 + 时间/余额小字，右侧收支积分 -->
      <div v-for="row in ledger" :key="row.id" class="order-line">
        <span>
          {{ row.title }}<br />
          <small class="tiny">{{ row.time }} · 余额 {{ row.balance }}</small>
        </span>
        <strong :class="row.type === 'earn' ? 'green' : 'gold'">
          {{ row.type === "earn" ? "+" + row.points : row.points }}
        </strong>
      </div>
      <!-- 无流水空态 -->
      <div v-if="!ledger.length" class="empty">暂无积分流水。</div>
      <router-link class="btn" to="/points-mall">积分商城</router-link>
    </section>
  </div>
</template>
<script>
// 交易后业务线接口：积分流水
import marketingApi from "@/modules/marketing/api";

export default {
  name: "Page",
  data() {
    return {
      // 积分流水列表（created 时由接口异步拉取）
      ledger: [],
    };
  },
  created() {
    this.loadLedger();
  },
  methods: {
    // 拉取积分流水并写入 data
    async loadLedger() {
      this.ledger = await marketingApi.pointsLedger();
    },
  },
};
</script>
