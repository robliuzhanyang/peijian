<!--
  根组件（H5 端）
  组成：吸顶头部（品牌入口 + 消息 + 搜索）、路由出口、底部 Tab 导航、全局轻提示
  启动：created 时 dispatch('bootstrap') 加载商品/分类/套装目录
  标题：watch 路由变化，按 meta.title 更新浏览器标题
-->
<template>
  <div class="app h5">
    <!-- 吸顶头部：品牌入口、右侧账号区（未登录为登录/注册，已登录为姓名/消息）、搜索框 -->
    <header
      class="m-header"
      :class="{ 'title-mode': titleMode, 'no-search': !showSearch }"
    >
      <!-- 分类 / 我的：居中标题 + 客户支持 + 消息入口 -->
      <div v-if="titleMode" class="m-header-row">
        <span class="m-head-side"></span>
        <h1 class="m-head-title">{{ $route.meta.title }}</h1>
        <span class="m-head-tools">
          <button class="m-head-icon" type="button" aria-label="客户支持" @click="supportOpen = true">
            <UiIcon name="service" />
          </button>
          <router-link to="/messages" class="m-head-bell" aria-label="消息">
            <UiIcon name="bell" />
            <em v-if="unread" class="badge red">{{ unread }}</em>
          </router-link>
        </span>
      </div>
      <div v-else class="m-header-row">
        <router-link to="/home" class="brand">
          <span class="logo">鑫戩</span><strong>鑫戩配件商城</strong>
        </router-link>
        <div class="m-head-right">
          <button class="m-head-support" type="button" @click="supportOpen = true">
            <UiIcon name="service" />客服
          </button>
          <template v-if="loggedIn">
            <router-link to="/user" class="m-head-name">{{
              profile.name || "个人中心"
            }}</router-link>
            <router-link to="/messages"
              >消息<span
                v-if="unread"
                class="badge red"
                style="margin-left: 4px"
                >{{ unread }}</span
              ></router-link
            >
          </template>
          <template v-else>
            <router-link
              class="btn primary sm"
              :to="{ path: '/login', query: { redirect: $route.fullPath } }"
              >登录</router-link
            >
            <router-link to="/register" class="m-head-register"
              >注册</router-link
            >
          </template>
        </div>
      </div>
      <form v-if="showSearch" class="m-search" @submit.prevent="search">
        <input v-model="keyword" placeholder="搜索产品名称 / 型号" /><button
          class="btn primary sm"
        >
          搜索
        </button>
      </form>
    </header>

    <!-- 页面路由出口 -->
    <main class="main wrap" :class="{ 'account-page': isAccountPage }">
      <router-view />
    </main>

    <!-- 详情页悬浮快捷入口：购物车 / 工作台 / 个人信息（浮于底部 Tab 之上） -->
    <FloatQuick />

    <!-- 底部固定 Tab 导航：图标 + 文字（购物车已改为右下角悬浮按钮） -->
    <nav class="tabbar">
      <router-link to="/home">
        <svg class="tab-ico" viewBox="0 0 24 24">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M9.5 21v-6h5v6" />
        </svg>
        <span>首页</span>
      </router-link>
      <router-link to="/categories">
        <svg class="tab-ico" viewBox="0 0 24 24">
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
        <span>分类</span>
      </router-link>
      <router-link to="/diy">
        <svg class="tab-ico" viewBox="0 0 24 24">
          <path
            d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.4-.4-2.4 2.4-2.8Z"
          />
        </svg>
        <span>选购</span>
      </router-link>
      <router-link to="/user">
        <svg class="tab-ico" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
        </svg>
        <span>我的</span>
      </router-link>
    </nav>

    <!-- 悬浮购物车：底部 Tab 不再放购物车，改为右下角悬浮按钮（带数量角标） -->
    <router-link
      v-if="showCartFab"
      to="/cart"
      class="m-cart-fab"
      :class="{ 'above-fab': liftCartFab }"
      aria-label="购物车"
    >
      <svg class="cart-fab-ico" viewBox="0 0 24 24">
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
        <path
          d="M2.5 3.5h2.2l2.1 11.2a1.5 1.5 0 0 0 1.5 1.3h8.6a1.5 1.5 0 0 0 1.5-1.2L21.5 8H6"
        />
      </svg>
      <em v-if="cartCount" class="cart-fab-badge">{{ cartCount }}</em>
    </router-link>

    <!-- 客户支持底部抽屉：微信二维码 + 电话 -->
    <transition name="m-support-fade">
      <div v-if="supportOpen" class="m-support-mask" @click="supportOpen = false">
        <transition name="m-support-slide">
          <div v-if="supportOpen" class="m-support" @click.stop>
            <div class="m-support-grip"></div>
            <h3 class="m-support-title">联系客服</h3>
            <div class="m-support-qr">
              <QrCode :seed="7" :size="120" label="服务顾问微信二维码" />
              <p>扫码添加专属服务顾问</p>
              <p class="m-support-wx">
                微信号：{{ wechatId }}
                <button type="button" @click="copyWechat">复制</button>
              </p>
            </div>
            <a class="m-support-line" :href="'tel:' + supportInfo.hotline">
              <span class="m-support-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 4h3l1.5 4-2 1.5a12 12 0 0 0 5 5l1.5-2 4 1.5V18a2 2 0 0 1-2 2A15 15 0 0 1 4 6a2 2 0 0 1 1-2Z" />
                </svg>
              </span>
              <span class="m-support-text">
                <small>客服热线（{{ supportInfo.hours }}）</small>
                <strong>{{ supportInfo.hotline }}</strong>
              </span>
            </a>
            <a class="m-support-line" :href="'mailto:' + supportInfo.email">
              <span class="m-support-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </span>
              <span class="m-support-text">
                <small>服务邮箱</small>
                <strong>{{ supportInfo.email }}</strong>
              </span>
            </a>
            <router-link class="m-support-more" to="/service" @click="supportOpen = false">
              进入客户支持中心 →
            </router-link>
          </div>
        </transition>
      </div>
    </transition>

    <!-- 全局轻提示：notice 非空时显示 -->
    <div class="toast" v-if="notice" role="status">{{ notice }}</div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import FloatQuick from "@/components/FloatQuick.vue";
import UiIcon from "@/components/UiIcon.vue";
import QrCode from "@/components/QrCode.vue";
import catalog from "@/mock/catalog.json";

export default {
  components: { FloatQuick, UiIcon, QrCode },
  data() {
    return {
      keyword: "",
      // 客户支持底部抽屉开关
      supportOpen: false,
      // 服务顾问微信号（正式上线可由后端下发）
      wechatId: "xinjian-service",
    };
  },
  computed: {
    ...mapState(["notice", "loggedIn", "profile", "messages"]),
    ...mapGetters(["cartCount"]),
    // 未读消息数：直接取自 Vuex，阅读后角标即时更新
    unread() {
      return (this.messages || []).filter((m) => !m.read).length;
    },
    // 居中标题模式：分类 / 我的 页不显示品牌行与搜索行，改为「标题 + 消息」
    titleMode() {
      return ["/categories", "/user"].includes(this.$route.path);
    },
    // 搜索行：合同 / 发票 / 积分明细等列表页使用精简头部，不显示搜索
    showSearch() {
      return !this.titleMode && !this.isAccountPage;
    },
    // 「我的」模块子页面：精简头部并隐藏重复的页面标题
    isAccountPage() {
      return [
        "/orders",
        "/contracts",
        "/invoices",
        "/addresses",
        "/points-ledger",
        "/aftersales",
        "/messages",
        "/referral",
        "/favorites",
        "/companies",
        "/auth-status",
        "/settings",
      ].includes(this.$route.path);
    },
    // 悬浮购物车：购物车页自身不显示；详情页已由 FloatQuick 提供购物车入口
    showCartFab() {
      return !["/cart", "/detail", "/package-detail", "/points-detail"].includes(
        this.$route.path
      );
    },
    // 一站式选购页自带「套装价 / 清单」悬浮条，购物车按钮上移避让
    liftCartFab() {
      return this.$route.path === "/diy";
    },
    // 客服联系信息：读取 catalog.support，带兜底
    supportInfo() {
      const s = catalog.support || {};
      return {
        hotline: s.hotline || "400-880-1688",
        hours: s.hours || "工作日 8:30 - 18:00",
        email: s.email || "service@xinjian.com",
      };
    },
  },
  created() {
    // 加载目录数据（商品、分类、套装）
    this.$store.dispatch("bootstrap");
  },
  watch: {
    // 提示出现后 3 秒自动清空
    notice(v) {
      if (v) setTimeout(() => this.$store.commit("setNotice", ""), 3000);
    },
    // 按路由 meta 同步浏览器标题
    $route(r) {
      document.title = r.meta.title + " · 鑫戩配件商城";
    },
  },
  methods: {
    // 头部搜索：携带关键词跳转搜索页
    search() {
      this.$router.push({ path: "/search", query: { q: this.keyword } });
    },
    // 复制微信号到剪贴板（不支持时提示手动复制）
    copyWechat() {
      const done = () =>
        this.$store.commit("setNotice", "微信号已复制：" + this.wechatId);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(this.wechatId).then(done, () =>
          this.$store.commit("setNotice", "请手动复制微信号：" + this.wechatId)
        );
        return;
      }
      this.$store.commit("setNotice", "请手动复制微信号：" + this.wechatId);
    },
  },
};
</script>
