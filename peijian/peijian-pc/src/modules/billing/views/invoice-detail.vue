<!--
  页面：发票详情（invoice-detail.vue）
  路由：/invoice-detail ｜ 分组：合同与发票
  作用：展示发票完整字段、状态与驳回原因，已开具发票提供电子发票下载入口；
        接口查不到（如从开票申请页提交进入）时展示申请占位
  数据：created 中经 invoiceApi.detail(query.id) 拉取；占位场景读取 query.title / query.orderId
-->
<template>
  <div>
    <!-- 页头：标题 + 订单号 -->
    <div class="page-title">
      <h1>发票详情</h1>
      <small
        >订单
        {{
          invoice
            ? invoice.orderId
            : $route.query.orderId || $route.query.id || "—"
        }}</small
      >
    </div>
    <!-- 查到发票：展示发票号码、类型、抬头、税号、邮箱、金额、状态与时间 -->
    <section v-if="invoice" class="card">
      <div class="spec-grid">
        <div class="field-row">
          <span>发票号码</span><strong>{{ invoice.id }}</strong>
        </div>
        <div class="field-row">
          <span>发票类型</span>
          <strong
            ><span class="badge blue">{{ invoice.type }}</span></strong
          >
        </div>
        <div class="field-row">
          <span>企业抬头</span><strong>{{ invoice.title }}</strong>
        </div>
        <div class="field-row">
          <span>税号</span><strong>{{ invoice.taxId }}</strong>
        </div>
        <div class="field-row">
          <span>接收邮箱</span><strong>{{ invoice.email }}</strong>
        </div>
        <div class="field-row">
          <span>开票状态</span>
          <strong>
            <span class="badge" :class="invoiceStatusClass">{{
              invoice.status
            }}</span>
          </strong>
        </div>
        <div class="field-row">
          <span>申请时间</span><strong>{{ invoice.appliedAt }}</strong>
        </div>
        <div class="field-row">
          <span>开具时间</span
          ><strong>{{ invoice.issuedAt || "待开具" }}</strong>
        </div>
      </div>
      <div class="field-row">
        <span>发票金额</span
        ><strong class="price">{{ money(invoice.amountFen) }}</strong>
      </div>
      <!-- 驳回状态：额外展示驳回原因 -->
      <p v-if="invoice.status === '已驳回'" class="alert">
        驳回原因：{{ invoice.rejectReason }}
      </p>
      <!-- 已开具：下载电子发票 -->
      <div class="action-row">
        <button
          v-if="invoice.status === '已开具'"
          class="btn primary"
          @click="download"
        >
          下载电子发票
        </button>
        <router-link
          v-if="invoice.status === '已驳回'"
          class="btn primary"
          :to="{ path: '/invoice-apply', query: { id: invoice.orderId } }"
          >修改并重新申请</router-link
        >
      </div>
      <router-link class="btn" to="/invoices">返回发票列表</router-link>
    </section>
    <!-- 查不到发票：展示申请占位（发票号待接口提供，抬头取路由参数） -->
    <section v-else class="card">
      <div class="field-row">
        <span>发票号码</span><strong>待接口提供</strong>
      </div>
      <div class="field-row">
        <span>企业抬头</span
        ><strong>{{ $route.query.title || "待接口提供" }}</strong>
      </div>
      <div class="field-row">
        <span>关联订单</span
        ><strong>{{ $route.query.orderId || $route.query.id || "—" }}</strong>
      </div>
      <div class="field-row">
        <span>开票状态</span><strong>申请已提交，待审核</strong>
      </div>
      <p class="alert">正式发票号码和文件由发票接口回传。</p>
      <router-link class="btn" to="/invoices">返回发票列表</router-link>
    </section>
  </div>
</template>
<script>
// 接口层：发票详情；领域工具：金额分转元
import { invoiceApi } from "@/modules/billing/api";
import { money } from "@/domain/productFields";
export default {
  data() {
    return {
      // 发票详情；查不到（含申请刚提交）时为 null
      invoice: null,
    };
  },
  computed: {
    // 发票状态 badge 配色：已开具 green，审核中 gold，已驳回 red
    invoiceStatusClass() {
      if (!this.invoice) return "gold";
      if (this.invoice.status === "已开具") return "green";
      if (this.invoice.status === "已驳回") return "red";
      return "gold";
    },
  },
  async created() {
    this.invoice = await invoiceApi.detail(this.$route.query.id);
  },
  methods: {
    money,
    // 电子发票文件由发票接口开具后提供下载
    download() {
      this.$store.commit("setNotice", "电子发票准备中，开具后可在此下载");
    },
  },
};
</script>
