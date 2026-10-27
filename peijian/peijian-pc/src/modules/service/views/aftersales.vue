<!--
  页面：售后退款（aftersales.vue）
  路由：/aftersales ｜ 分组：内容与服务
  作用：上部"我的售后工单"展示接口返回的工单（工单号、类型、关联订单、状态 badge、原因、申请时间），
        可进入工单进度页；下部"按订单发起售后"保留按 Vuex 订单逐单发起入口，无订单时展示空态
  数据：工单列表 serviceApi.aftersales()（读取 catalog.json）；可申请订单读取 Vuex state.orders
-->
<template>
  <div>
    <!-- 页头：标题 + 业务说明 -->
    <div class="page-title">
      <h1>售后退款</h1>
      <small>工单进度查询，也可按订单发起服务申请</small>
    </div>
    <!-- 我的售后工单：接口拉取的工单列表 -->
    <section class="card">
      <h2>我的售后工单</h2>
      <div v-for="a in aftersales" :key="a.id" class="order-line">
        <div class="order-info">
          <!-- 工单号 + 状态 badge：处理中 gold / 已完成 green / 待审核 blue / 已拒绝 red -->
          <div class="order-id">
            <strong>{{ a.id }}</strong>
            <span class="badge" :class="statusClass(a.status)">{{
              a.status
            }}</span>
          </div>
          <!-- 申请类型与关联订单 -->
          <p class="order-goods">{{ a.type }} · 关联订单 {{ a.orderId }}</p>
          <!-- 问题原因：一行省略 -->
          <p class="tiny ellipsis">原因：{{ a.reason }}</p>
          <!-- 申请时间 -->
          <p class="tiny">申请时间 {{ a.createdAt }}</p>
        </div>
        <div>
          <button
            v-if="a.status === '待审核'"
            class="btn sm ghost"
            @click="cancel(a.id)"
          >
            撤回
          </button>
          <router-link
            class="btn sm"
            :to="{ path: '/aftersale-detail', query: { id: a.id } }"
          >
            查看进度
          </router-link>
        </div>
      </div>
      <!-- 无工单空态 -->
      <div v-if="!aftersales.length" class="empty">暂无售后工单。</div>
    </section>
    <!-- 按订单发起售后：逐单展示订单号、状态与申请售后入口 -->
    <section class="card">
      <h2>按订单发起售后</h2>
      <div v-for="o in orders" :key="o.id" class="order-line">
        <div class="order-info">
          <div class="order-id">
            <strong>{{ o.id }}</strong>
            <span class="badge blue">{{ o.status }}</span>
          </div>
        </div>
        <div>
          <router-link
            class="btn sm"
            :to="{ path: '/aftersale-apply', query: { id: o.id } }"
            >申请售后</router-link
          >
        </div>
      </div>
      <!-- 无订单空态 -->
      <div v-if="!orders.length" class="empty">暂无关联订单。</div>
    </section>
  </div>
</template>
<script>
// 交易后业务线接口：售后工单列表
import serviceApi from "@/modules/service/api";

export default {
  data() {
    return {
      // 售后工单列表（created 时由接口异步拉取）
      aftersales: [],
    };
  },
  computed: {
    // 可申请售后的订单：发货后（待收货/已完成/售后中）才可发起
    orders() {
      const allowed = ["待收货", "已完成", "售后中"];
      return this.$store.state.orders.filter((o) => allowed.includes(o.status));
    },
  },
  created() {
    this.loadAftersales();
  },
  methods: {
    // 拉取售后工单列表并写入 data
    async loadAftersales() {
      this.aftersales = await serviceApi.aftersales();
    },
    // 工单状态映射 badge 配色
    statusClass(status) {
      return (
        {
          处理中: "gold",
          已完成: "green",
          待审核: "blue",
          已拒绝: "red",
          已撤回: "",
        }[status] || ""
      );
    },
    // 撤回待审核的售后工单
    cancel(id) {
      if (!confirm("确认撤回该售后申请？")) return;
      this.$store.commit("cancelAftersale", id);
      this.$store.commit("setNotice", "售后申请已撤回");
    },
  },
};
</script>
