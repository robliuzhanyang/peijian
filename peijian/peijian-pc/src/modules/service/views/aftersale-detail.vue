<!--
  页面：售后进度（aftersale-detail.vue）
  路由：/aftersale-detail ｜ 分组：内容与服务
  作用：展示单个售后工单详情（工单号、关联订单、申请类型、状态、问题描述、申请时间）及处理进度时间线；
        query.id 可为工单号，或从申请页进入时为订单号（query.type 为申请类型），查不到工单时保留待生成占位
  数据：serviceApi.aftersaleDetail(id)（支持按工单 id 或关联订单 id 查询，找不到返回 null）
-->
<template>
  <div>
    <!-- 页头：标题 + 工单号 / 关联订单号兜底 -->
    <div class="page-title">
      <h1>售后进度</h1>
      <small>
        {{
          aftersale
            ? "工单 " + aftersale.id
            : "关联订单 " + ($route.query.id || "未选择")
        }}
      </small>
    </div>
    <!-- 查到工单：完整工单信息 + 处理进度时间线 -->
    <section v-if="aftersale" class="card">
      <div class="order-line">
        <strong>工单号</strong><span>{{ aftersale.id }}</span>
      </div>
      <div class="order-line">
        <strong>关联订单</strong><span>{{ aftersale.orderId }}</span>
      </div>
      <div class="order-line">
        <strong>申请类型</strong><span>{{ aftersale.type }}</span>
      </div>
      <div class="order-line">
        <strong>工单状态</strong>
        <span class="badge" :class="statusClass(aftersale.status)">{{
          aftersale.status
        }}</span>
      </div>
      <div class="order-line">
        <strong>问题描述</strong><span>{{ aftersale.reason }}</span>
      </div>
      <div class="order-line">
        <strong>申请时间</strong><span>{{ aftersale.createdAt }}</span>
      </div>
      <!-- 处理进度：steps 倒序渲染，最新节点置顶并命中首节点高亮样式 -->
      <h2>处理进度</h2>
      <div class="timeline">
        <div v-for="(step, i) in reversedSteps" :key="i" class="timeline-node">
          <strong>{{ step.title }}</strong>
          <p>{{ step.desc }}</p>
          <!-- time 为空的节点用 field-pending 弱化 -->
          <small v-if="step.time">{{ step.time }}</small>
          <small v-else class="field-pending">时间待更新</small>
        </div>
      </div>
      <router-link class="btn" to="/aftersales">返回售后列表</router-link>
    </section>
    <!-- 查不到工单：保留申请占位（申请刚提交、服务端尚未生成工单） -->
    <section v-else class="card">
      <div class="order-line">
        <strong>申请类型</strong
        ><span>{{ $route.query.type || "待接口返回" }}</span>
      </div>
      <div class="order-line">
        <strong>工单状态</strong><span>申请已提交，待客服受理</span>
      </div>
      <p class="alert">售后资格、退款金额及工单流转均由服务端判定。</p>
      <router-link class="btn" to="/aftersales">返回售后列表</router-link>
    </section>
  </div>
</template>
<script>
// 交易后业务线接口：售后工单详情（支持工单号或订单号）
import serviceApi from "@/modules/service/api";

export default {
  name: "Page",
  data() {
    return {
      // 工单详情：接口返回前为 null，页面先展示待受理占位
      aftersale: null,
    };
  },
  computed: {
    // 进度节点倒序：最新节点排第一，复用 .timeline-node:first-child 高亮
    reversedSteps() {
      return this.aftersale ? this.aftersale.steps.slice().reverse() : [];
    },
  },
  created() {
    this.loadDetail();
  },
  methods: {
    // 按路由 id（工单号或订单号）拉取工单详情
    async loadDetail() {
      const id = this.$route.query.id;
      if (!id) return;
      this.aftersale = await serviceApi.aftersaleDetail(id);
    },
    // 工单状态映射 badge 配色
    statusClass(status) {
      return (
        {
          处理中: "gold",
          已完成: "green",
          待审核: "blue",
          已拒绝: "red",
        }[status] || ""
      );
    },
  },
};
</script>
