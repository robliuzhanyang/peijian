<!--
  页面：采购合同（contracts.vue）
  路由：/contracts ｜ 分组：合同与发票
  作用：展示合同列表（编号、标题、关联订单、买方、金额、状态、签署时间），并列出尚无合同的可申请订单入口
  数据：created 中经 contractApi.list() 拉取合同列表；可申请订单从 Vuex state.orders 中按状态与合同覆盖情况筛选
-->
<template>
  <div>
    <section class="card">
      <h2>合同列表</h2>
      <!-- 合同行：编号+状态为标题行，标题/订单/买方与签署时间分层展示，右侧金额与详情入口 -->
      <div v-for="c in list" :key="c.id" class="order-line">
        <div class="order-info">
          <div class="order-id">
            <strong>{{ c.id }}</strong>
            <span class="badge" :class="contractStatusClass(c.status)">{{
              c.status
            }}</span>
          </div>
          <p class="order-goods">{{ c.title }}</p>
          <p class="tiny">订单 {{ c.orderId }} · {{ c.buyer }}</p>
          <p class="tiny">签署时间 {{ c.signedAt || "待签署" }}</p>
        </div>
        <div>
          <strong class="price">{{ money(c.amountFen) }}</strong
          ><router-link
            class="btn sm"
            :to="{ path: '/contract-detail', query: { id: c.id } }"
            >查看合同</router-link
          >
        </div>
      </div>
      <!-- 无合同时的空态 -->
      <div v-if="!list.length" class="empty">暂无合同记录。</div>
    </section>
    <!-- 可申请合同的订单：状态排除待付款/已取消，且该订单尚无合同 -->
    <section v-if="availableOrders.length" class="card">
      <h2>可申请合同的订单</h2>
      <div v-for="o in availableOrders" :key="o.id" class="order-line">
        <div class="order-info">
          <div class="order-id">
            <strong>{{ o.id }}</strong>
            <span class="badge blue">{{ o.status }}</span>
          </div>
          <p class="tiny">合同待平台生成，点击"申请合同"即可生成并预览</p>
        </div>
        <div>
          <button class="btn sm primary" @click="applyContract(o)">申请合同</button>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
// 接口层：合同列表/生成；领域工具：金额分转元
import { contractApi } from "@/modules/billing/api";
import { money } from "@/domain/productFields";
export default {
  data() {
    return {
      // 合同列表（接口返回）
      list: [],
    };
  },
  computed: {
    // 可申请合同的订单：id 未出现在合同列表，且状态不为待付款/已取消
    availableOrders() {
      const ids = new Set(this.list.map((c) => c.orderId));
      return this.$store.state.orders.filter(
        (o) => !ids.has(o.id) && o.status !== "待付款" && o.status !== "已取消",
      );
    },
  },
  async created() {
    this.list = await contractApi.list();
  },
  methods: {
    money,
    // 合同状态 badge 配色：已生效 green，待买方签署 gold
    contractStatusClass(status) {
      return status === "已生效" ? "green" : "gold";
    },
    // 为订单生成合同（买方信息取当前企业），成功后跳转合同详情
    async applyContract(o) {
      const company = this.$store.getters.currentCompany || {};
      const c = await contractApi.create({
        orderId: o.id,
        title: "采购合同",
        amountFen: o.totalFen,
        buyer: company.name || "当前企业",
        buyerTaxId: company.taxId || "",
      });
      this.$store.commit("setNotice", "合同已生成，待买方签署");
      this.$router.push({ path: "/contract-detail", query: { id: c.id } });
    },
  },
};
</script>
