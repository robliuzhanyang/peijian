<!--
  页面：认证进度（auth-status.vue）
  路由：/auth-status ｜ 分组：企业与账号
  作用：展示企业认证状态与审核节点时间线
  数据：accountApi.authFlow() 取认证节点 [{title,desc,time,state}]；当前状态读 Vuex state.authStatus
-->
<template>
  <div>
    <!-- 页头：页面标题 -->
    <div class="page-title">
      <h1>认证进度</h1>
      <small>企业实名认证与采购权限开通</small>
    </div>

    <!-- 当前认证状态 -->
    <section class="card auth-card">
      <!-- 状态行：左侧当前状态徽标，右侧切换企业 -->
      <div class="auth-head">
        <h2>
          当前状态<span class="badge" :class="statusBadge">{{
            $store.state.authStatus
          }}</span>
        </h2>
        <router-link class="btn sm" to="/companies">切换企业</router-link>
      </div>

      <!-- 认证节点时间线：state 为 done 已完成，active 进行中，todo 未开始 -->
      <div class="timeline auth-timeline">
        <div
          v-for="(node, i) in timeline"
          :key="i"
          class="timeline-node"
          :class="['is-' + node.state, node.state === 'todo' ? 'field-pending' : '']"
        >
          <strong>{{ node.title }}</strong>
          <small>{{ node.time || "时间待更新" }} ｜ {{ node.desc }}</small>
        </div>
      </div>

      <p class="tiny auth-note">审核节点、材料退回原因以认证接口返回为准。</p>

      <!-- 底部操作：申请表与工作台 -->
      <div class="auth-actions">
        <router-link class="btn" to="/register">填写认证申请表</router-link>
        <router-link class="btn primary" to="/user">企业工作台</router-link>
      </div>
    </section>
  </div>
</template>

<script>
import { accountApi } from "@/modules/account/api";

export default {
  name: "Page",
  data() {
    return {
      // 认证进度节点（来自 catalog.json 的 authFlow）
      nodes: [],
    };
  },
  created() {
    this.load();
  },
  computed: {
    // 状态徽标：已认证绿色，审核中/待认证金色
    statusBadge() {
      return this.$store.state.authStatus === "已认证" ? "green" : "gold";
    },
    // 审核中时把时间线重置为「已提交 → 初审中 → 待开始」，避免沿用已认证节点
    timeline() {
      if (this.$store.state.authStatus === "已认证") return this.nodes;
      return this.nodes.map((node, i) => ({
        ...node,
        time: i === 0 ? "刚刚提交" : null,
        state: i === 0 ? "done" : i === 1 ? "active" : "todo",
      }));
    },
  },
  methods: {
    async load() {
      try {
        this.nodes = await accountApi.authFlow();
      } catch (e) {
        this.nodes = [];
      }
    },
  },
};
</script>
