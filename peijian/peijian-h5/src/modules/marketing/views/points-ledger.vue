<!--
  页面：积分明细（H5）
  路由：/points-ledger ｜ 分组：积分与营销
  作用：顶部展示积分余额与积分商城入口，下方以流水卡片展示积分收支
        （收入绿色 +N，支出金色 -N，并显示变动后余额）
  数据：余额读取 Vuex state.points；流水 marketingApi.pointsLedger()
-->
<template>
  <div>
    <!-- 余额卡：当前积分 + 去兑换入口 -->
    <section class="card m-points-balance">
      <div>
        <small>当前积分余额</small>
        <div class="m-points-value">
          <strong class="num">{{ $store.state.points }}</strong>
          <span>积分</span>
        </div>
      </div>
      <router-link class="btn sm" to="/points-mall">去兑换</router-link>
    </section>

    <!-- 积分流水 -->
    <section class="card m-ledger">
      <div class="m-ledger-head">
        <h2>积分流水</h2>
        <span class="tiny">{{ ledger.length }} 条记录</span>
      </div>

      <div v-for="row in ledger" :key="row.id" class="m-ledger-row">
        <span class="m-ledger-ico" :class="row.type">{{
          row.type === "earn" ? "+" : "−"
        }}</span>
        <div class="m-ledger-info">
          <strong>{{ row.title }}</strong>
          <small>{{ row.time }} · 余额 {{ row.balance }}</small>
        </div>
        <em :class="row.type">{{
          row.type === "earn" ? "+" + row.points : row.points
        }}</em>
      </div>

      <!-- 无流水空态 -->
      <div v-if="!ledger.length" class="empty">暂无积分流水。</div>
    </section>
  </div>
</template>
<script>
// 交易后业务线接口：积分流水
import { marketingApi } from "@/modules/marketing/api";

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

<style>
/* 余额卡：浅金渐变，突出当前积分 */
.m-points-balance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #f2e2c2;
  background: linear-gradient(120deg, #fffdf8, #fff6e6);
}
.m-points-balance small {
  display: block;
  color: #9a7a3c;
  font-size: 10px;
}
.m-points-value {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-top: 4px;
}
.m-points-value strong {
  color: #b7791f;
  font-size: 28px;
  line-height: 1.1;
}
.m-points-value span {
  color: #a9884e;
  font-size: 11px;
}
.m-points-balance .btn {
  flex: 0 0 auto;
  border-color: #e6c98f;
  background: #fff;
  color: #a96b12;
}
/* 流水列表 */
.m-ledger {
  padding: 14px 12px 6px;
}
.m-ledger-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line);
}
.m-ledger-head h2 {
  margin: 0;
  font-size: 15px;
}
.m-ledger-head .tiny {
  color: var(--light);
  font-size: 10px;
}
.m-ledger-row {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr) auto;
  gap: 9px;
  align-items: center;
  padding: 11px 0;
  border-bottom: 1px solid #f1f4f8;
}
.m-ledger-row:last-of-type {
  border-bottom: 0;
}
.m-ledger-ico {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
}
.m-ledger-ico.earn {
  background: #eaf8f0;
  color: #1f9254;
}
.m-ledger-ico.exchange {
  background: #fff4e2;
  color: #c07a12;
}
.m-ledger-info strong {
  display: block;
  font-size: 12px;
  line-height: 1.4;
}
.m-ledger-info small {
  display: block;
  margin-top: 3px;
  color: #95a1b1;
  font-size: 9px;
}
.m-ledger-row em {
  font-style: normal;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}
.m-ledger-row em.earn {
  color: #1f9254;
}
.m-ledger-row em.exchange {
  color: #c07a12;
}
</style>
