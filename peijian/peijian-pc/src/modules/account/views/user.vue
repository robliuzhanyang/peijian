<!--
  页面：企业工作台（user.vue）
  路由：/user ｜ 分组：企业与账号
  作用：工作台外壳——左侧导航固定，右侧为企业横幅 + 子路由内容；
        总览 / 订单 / 合同 / 发票 / 地址 / 积分 / 售后 / 消息 / 推荐 / 套装 / 企业 / 认证 / 设置 / 支持
        均嵌入右侧展示，不再整页跳转
  数据：accountApi.profile() 取用户资料；企业、积分、认证状态读取 Vuex
-->
<template>
  <div>
    <!-- 未登录：登录引导卡 -->
    <section v-if="!loggedIn" class="card login-guide">
      <div class="login-guide-ico">鑫</div>
      <h2>登录后查看企业采购信息</h2>
      <p>订单、合同、发票、售后与积分等企业采购功能，登录后即可使用。</p>
      <div class="login-guide-actions">
        <router-link
          class="btn primary"
          :to="{ path: '/login', query: { redirect: $route.fullPath } }"
          >登录</router-link
        >
        <router-link class="btn ghost" to="/register">免费注册</router-link>
      </div>
    </section>

    <!-- 已登录：左侧固定导航 + 右侧业务内容 -->
    <div v-else class="account-layout">
      <!-- 侧导航：工作台各业务入口，当前子路由高亮 -->
      <aside class="card account-nav">
        <div class="navlabel">企业工作台</div>
        <router-link
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          :class="{ on: $route.path === l.to }"
        >
          <AppIcon :name="l.icon" />{{ l.name }}
        </router-link>
        <div class="divider"></div>
        <router-link
          to="/user/support"
          :class="{ on: $route.path === '/user/support' }"
        >
          <AppIcon name="service" />客户支持
        </router-link>
      </aside>

      <section class="stack">
        <!-- 企业横幅：企业信息、认证状态、切换企业与积分 -->
        <section class="card company-banner">
          <div>
            <div class="flex">
              <h2>{{ company.name || profile.companyName || "企业采购中心" }}</h2>
              <span class="badge">{{ authStatus }}</span>
            </div>
            <p>
              统一社会信用代码：{{ company.taxId || "待补充" }}<br />
              联系人：{{ company.contact || profile.name || "待补充" }}　{{
                maskPhone(company.phone)
              }}　｜　归属业务员：待分配
            </p>
            <div
              class="company-tools flex panel-line"
              style="border-color: #ffffff25"
            >
              <router-link class="btn sm" to="/user/companies">切换企业</router-link>
              <router-link class="btn sm" :to="{ path: '/register', query: { new: 1 } }"
                >注册新企业</router-link
              >
            </div>
          </div>
          <div class="score num">
            {{ points.toLocaleString() }}<small
              style="display: block; font-size: 12px; color: #bed0e7"
              >配件商城积分</small
            >
          </div>
        </section>

        <!-- 右侧业务内容：各模块在此切换，左侧导航保持不动 -->
        <router-view />
      </section>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import AppIcon from "@/components/AppIcon.vue";
import { accountApi } from "@/modules/account/api";

export default {
  components: { AppIcon },
  data() {
    return {
      // 用户资料（来自 catalog.json 的 profile）
      profile: {},
      // 侧导航入口：统一指向工作台子路由，右侧嵌入展示
      links: [
        { name: "工作台总览", to: "/user", icon: "company" },
        { name: "订单管理", to: "/user/orders", icon: "box" },
        { name: "采购合同", to: "/user/contracts", icon: "file" },
        { name: "发票管理", to: "/user/invoices", icon: "file" },
        { name: "收货地址", to: "/user/addresses", icon: "pin" },
        { name: "积分明细", to: "/user/points-ledger", icon: "coin" },
        { name: "售后 / 退款", to: "/user/aftersales", icon: "tool" },
        { name: "消息通知", to: "/user/messages", icon: "bell" },
        { name: "推荐有礼", to: "/user/referral", icon: "gift" },
        { name: "常用套装", to: "/user/favorites", icon: "grid" },
        { name: "企业切换", to: "/user/companies", icon: "company" },
        { name: "企业认证", to: "/user/auth-status", icon: "check" },
        { name: "账号设置", to: "/user/settings", icon: "settings" },
      ],
    };
  },
  computed: {
    ...mapState(["loggedIn", "points", "authStatus"]),
    ...mapGetters(["currentCompany"]),
    // 当前企业（无数据时给空对象，避免模板取值报错）
    company() {
      return this.currentCompany || {};
    },
  },
  created() {
    this.load();
  },
  methods: {
    // 拉取用户资料；接口失败不阻塞页面
    async load() {
      try {
        this.profile = await accountApi.profile();
      } catch (e) {
        this.profile = {};
      }
    },
    // 手机号脱敏：保留前三后四
    maskPhone(phone) {
      return (phone || "待补充").replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
    },
  },
};
</script>

<style>
/* 子页面已由左侧导航标明模块，隐藏页面内重复的模块标题 */
.account-layout .stack .page-title {
  display: none;
}
</style>

