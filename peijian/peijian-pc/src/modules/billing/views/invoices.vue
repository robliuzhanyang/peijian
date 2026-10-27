<!--
  页面：发票管理（invoices.vue）
  路由：/invoices ｜ 分组：合同与发票
  作用：展示发票列表（号码、类型、关联订单、抬头、金额、状态、申请/开具时间），并列出当前可开票订单的申请入口
  数据：created 中经 invoiceApi.list() 拉取发票列表；可开票订单从 Vuex state.orders 中按状态且尚无发票筛选
-->
<template>
  <div>
    <!-- 页头：标题 + 业务说明 -->
    <div class="page-title">
      <h1>发票管理</h1>
      <small>申请记录与发票详情</small>
    </div>
    <section class="card">
      <h2>发票列表</h2>
      <!-- 发票行：号码+状态为标题行，类型/订单/抬头与申请开具时间分层，右侧金额与详情入口 -->
      <div v-for="v in list" :key="v.id" class="order-line">
        <div class="order-info">
          <div class="order-id">
            <strong>{{ v.id }}</strong>
            <span class="badge blue">{{ v.type }}</span>
            <span class="badge" :class="invoiceStatusClass(v.status)">{{
              v.status
            }}</span>
          </div>
          <p class="order-goods">订单 {{ v.orderId }} · 抬头 {{ v.title }}</p>
          <p class="tiny">
            申请 {{ v.appliedAt
            }}<template v-if="v.issuedAt"> · 开具 {{ v.issuedAt }}</template>
          </p>
        </div>
        <div>
          <strong class="price">{{ money(v.amountFen) }}</strong
          ><router-link
            class="btn sm"
            :to="{ path: '/invoice-detail', query: { id: v.id } }"
            >查看发票</router-link
          >
        </div>
      </div>
      <!-- 无发票记录时的空态 -->
      <div v-if="!list.length" class="empty">暂无发票记录。</div>
    </section>
    <!-- 可开票订单：指定业务状态且该订单尚无发票 -->
    <section class="card">
      <h2>可开票订单</h2>
      <div v-for="o in invoiceableOrders" :key="o.id" class="order-line">
        <div class="order-info">
          <div class="order-id">
            <strong>{{ o.id }}</strong>
            <span class="badge blue">{{ o.status }}</span>
          </div>
          <p class="tiny">已进入履约流程，可提交开票申请</p>
        </div>
        <div>
          <router-link
            class="btn sm"
            :to="{ path: '/invoice-apply', query: { id: o.id } }"
            >申请开票</router-link
          >
        </div>
      </div>
      <!-- 没有可开票订单时显示空态 -->
      <div v-if="!invoiceableOrders.length" class="empty">暂无可开票订单。</div>
    </section>
  </div>
</template>
<script>
// 接口层：发票列表；领域工具：金额分转元
import { invoiceApi } from "@/modules/billing/api";
import { money } from "@/domain/productFields";
export default {
  data() {
    return {
      // 发票列表（接口返回）
      list: [],
    };
  },
  computed: {
    // 可开票订单：业务状态命中白名单，且该订单尚无发票记录
    invoiceableOrders() {
      const allowed = [
        "待核款",
        "待发货",
        "运输中",
        "待收货",
        "已完成",
        "售后中",
      ];
      const ids = new Set(this.list.map((v) => v.orderId));
      return this.$store.state.orders.filter(
        (o) => allowed.includes(o.status) && !ids.has(o.id),
      );
    },
  },
  async created() {
    this.list = await invoiceApi.list();
  },
  methods: {
    money,
    // 发票状态 badge 配色：已开具 green，审核中 gold，已驳回 red
    invoiceStatusClass(status) {
      if (status === "已开具") return "green";
      if (status === "已驳回") return "red";
      return "gold";
    },
  },
};
</script>
