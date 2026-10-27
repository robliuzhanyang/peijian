<!--
  根组件（PC 端）
  组成：品牌头（Logo + 搜索 + 右上角购物车图标/企业工作台入口/个人信息下拉）、主导航、路由出口、页脚（含加盟热线）、全局轻提示
  登录：演示环境点击「登录」直接置登录态（种子资料已就位）；未登录仅显示登录/注册/购物车
  启动：created 时 dispatch('bootstrap') 加载商品/分类/套装目录
  标题：watch 路由变化，按 meta.title 更新浏览器标题
-->
<template>
  <div class="app pc">
    <!-- 品牌头：Logo 入口、搜索框、右上角账号区（含购物车数量角标） -->
    <header class="brand-header">
      <div class="wrap brand-row">
        <router-link to="/home" class="brand"
          ><span class="logo">鑫戩</span
          ><span
            ><strong>鑫戩配件直销商城</strong
            ><small>INDUSTRIAL PARTS MALL</small></span
          ></router-link
        >
        <form class="searchbox" @submit.prevent="search">
          <input
            v-model="keyword"
            placeholder="搜索产品名称、型号或 SKU"
          /><button class="btn primary">搜索</button>
        </form>
        <div class="header-tools">
          <!-- 客户支持：点击弹出客服微信二维码与联系电话 -->
          <div class="head-support" :class="{ open: supportOpen }">
            <button
              class="head-support-btn"
              type="button"
              title="客户支持"
              aria-label="客户支持"
              @click.stop="toggleSupport"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4 13v-1a8 8 0 0 1 16 0v1"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
                <path
                  d="M4 13h1.6a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4.8A1.8 1.8 0 0 1 3 16.2V15a2 2 0 0 1 1-2Zm16 0h-1.6a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h.8a1.8 1.8 0 0 0 1.8-1.8V15a2 2 0 0 0-1-2Z"
                  fill="currentColor"
                />
                <path
                  d="M19.4 18h-.9m-13 0h-.9"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
              </svg>
              <span>客户支持</span>
            </button>
            <div v-if="supportOpen" class="support-pop" @click.stop>
              <div class="sp-head">
                <strong>联系客服</strong>
                <button class="sp-close" type="button" aria-label="关闭" @click="supportOpen = false">×</button>
              </div>
              <div class="sp-body">
                <!-- 微信二维码 -->
                <div class="sp-qr">
                  <QrCode :seed="7" :size="128" label="服务顾问微信二维码" />
                  <p>扫码添加专属服务顾问</p>
                  <p class="sp-wx">
                    微信号：{{ wechatId }}
                    <button class="sp-copy" type="button" @click="copyWechat">复制</button>
                  </p>
                </div>
                <!-- 联系信息 -->
                <div class="sp-lines">
                  <a class="sp-line sp-phone" :href="'tel:' + supportInfo.hotline">
                    <span class="sp-line-ico">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 4h3l1.5 4-2 1.5a12 12 0 0 0 5 5l1.5-2 4 1.5V18a2 2 0 0 1-2 2A15 15 0 0 1 4 6a2 2 0 0 1 1-2Z" />
                      </svg>
                    </span>
                    <span class="sp-line-text">
                      <small>客服热线（工作日 {{ supportInfo.hours }}）</small>
                      <strong>{{ supportInfo.hotline }}</strong>
                    </span>
                  </a>
                  <a class="sp-line" :href="'mailto:' + supportInfo.email">
                    <span class="sp-line-ico">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
                        <path d="m4 7 8 6 8-6" />
                      </svg>
                    </span>
                    <span class="sp-line-text">
                      <small>服务邮箱</small>
                      <strong>{{ supportInfo.email }}</strong>
                    </span>
                  </a>
                </div>
                <router-link class="sp-more" to="/service" @click="supportOpen = false">
                  进入客户支持中心 →
                </router-link>
              </div>
            </div>
          </div>
          <!-- 消息通知：已登录展示，未读数量以角标提示 -->
          <router-link
            v-if="loggedIn"
            to="/messages"
            class="head-bell"
            title="消息通知"
            aria-label="消息通知"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 17h16l-2-4V8A6 6 0 0 0 6 8v5z" />
              <path d="M9 21h6" />
            </svg>
            <span v-if="unread" class="bell-badge">{{ unread }}</span>
          </router-link>
          <!-- 购物车图标：固定排在账号区第一位，数量以角标展示 -->
          <router-link
            to="/cart"
            class="head-cart"
            title="购物车"
            aria-label="购物车"
          >
            <svg class="cart-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M3 4h2.2l2.1 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.6 8H6"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="9.6" cy="19.2" r="1.4" fill="currentColor" />
              <circle cx="17.4" cy="19.2" r="1.4" fill="currentColor" />
            </svg>
            <span v-if="cartCount" class="cart-badge">{{ cartCount }}</span>
          </router-link>
          <!-- 未登录：登录 / 注册 -->
          <template v-if="!loggedIn">
            <router-link
              class="btn primary sm"
              :to="{ path: '/login', query: { redirect: $route.fullPath } }"
              >登录</router-link
            >
            <router-link to="/register" class="head-register"
              >免费注册</router-link
            >
          </template>
          <!-- 已登录：企业工作台直达入口 + 个人信息下拉 -->
          <template v-else>
            <router-link class="head-trigger" to="/user"
              >企业工作台</router-link
            >
            <div class="head-menu" :class="{ open: menu === 'me' }">
              <button class="head-trigger" @click.stop="toggleMenu('me')">
                <span class="head-avatar">{{ nameInitial }}</span
                >{{ profile.name || "个人中心" }}<span class="caret"></span>
              </button>
              <div v-if="menu === 'me'" class="head-dropdown align-right">
                <div class="drop-user">
                  <strong>{{ profile.name }}</strong>
                  <small>{{ profile.companyName }}</small>
                </div>
                <router-link to="/orders" @click.native="closeMenu"
                  >我的订单</router-link
                >
                <router-link to="/messages" @click.native="closeMenu"
                  >消息通知</router-link
                >
                <router-link to="/settings" @click.native="closeMenu"
                  >账号设置</router-link
                >
                <router-link to="/auth-status" @click.native="closeMenu"
                  >企业认证</router-link
                >
                <a href="#logout" @click.prevent="logout">退出登录</a>
              </div>
            </div>
          </template>
        </div>
      </div>
    </header>

    <!-- 主导航：导航项在 data.nav 中维护 -->
    <nav class="navbar">
      <div class="wrap">
        <router-link v-for="item in nav" :key="item.to" :to="item.to">{{
          item.name
        }}</router-link>
      </div>
    </nav>

    <!-- 页面路由出口 -->
    <main class="main wrap"><router-view /></main>

    <!-- 详情页悬浮快捷入口：购物车 / 工作台 / 个人信息 -->
    <FloatQuick />

    <!-- 页脚：服务承诺 + 站点导航 + 联系方式与二维码 + 版权 -->
    <footer class="site-footer">
      <div class="wrap">
        <!-- 服务承诺：快 / 全 / 优 / 助 四项 -->
        <ul class="footer-values">
          <li v-for="item in footerValues" :key="item.badge">
            <span class="fv-badge">{{ item.badge }}</span>
            <div>
              <strong>{{ item.title }}</strong>
              <p v-for="line in item.lines" :key="line">{{ line }}</p>
            </div>
          </li>
        </ul>

        <div class="footer-main">
          <!-- 站点导航：交易 / 使用 / 帮助 / 关于 -->
          <div class="footer-nav">
            <div v-for="group in footerGroups" :key="group.title">
              <h4>{{ group.title }}</h4>
              <router-link
                v-for="link in group.links"
                :key="link.label"
                :to="link.to"
                >{{ link.label }}</router-link
              >
            </div>
          </div>

          <!-- 投诉及建议：电话、服务时间、邮箱与三个二维码 -->
          <div class="footer-contact">
            <div class="fc-text">
              <h4>投诉及建议</h4>
              <a class="fc-phone" href="tel:4008266699">400-826-6699</a>
              <p class="fc-hours"
                ><span>服务时间</span>上午 8:30 - 12:00<br />下午 14:00 - 18:00</p
              >
              <p class="fc-note">【周一至周六（周六上午），节假日除外】</p>
              <a class="fc-mail" href="mailto:service@xinjian-parts.com"
                >service@xinjian-parts.com</a
              >
            </div>
            <div class="fc-qrs">
              <figure v-for="qr in footerQrs" :key="qr.label">
                <QrCode :seed="qr.seed" :size="72" :label="qr.label" />
                <figcaption>{{ qr.label }}</figcaption>
              </figure>
            </div>
          </div>
        </div>

        <!-- 底栏：版权与快捷入口 -->
        <div class="footer-bottom">
          <div class="fb-brand">
            <strong>鑫戩配件直销商城</strong>
            <span>© 2026 吉安鑫戬科技有限公司 · 工业激光打标设备与配件一站式直采</span>
          </div>
          <div class="fb-links">
            <router-link to="/home">商城官网</router-link>
            <router-link to="/diy">开放平台</router-link>
            <router-link to="/support">联系我们</router-link>
          </div>
        </div>
      </div>
    </footer>

    <!-- 全局轻提示：notice 非空时显示 -->
    <div class="toast" v-if="notice" role="status">{{ notice }}</div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { authApi } from "@/modules/account/api";
import { clearToken } from "@/config/env";
import FloatQuick from "@/components/FloatQuick.vue";
import QrCode from "@/components/QrCode.vue";
import catalog from "@/mock/catalog.json";

export default {
  components: { FloatQuick, QrCode },
  data() {
    return {
      keyword: "",
      // 客户支持弹框开关
      supportOpen: false,
      // 服务顾问微信号（正式上线可由后端下发）
      wechatId: "xinjian-service",
      // 当前展开的头部下拉菜单：'' 收合 / 'me' 个人信息
      menu: "",
      // 顶部主导航项：全部分类直达首页（首页左侧即分类导航）
      nav: [
        { name: "全部分类", to: "/home" },
        { name: "配件采购", to: "/goods" },
        { name: "一站式选购", to: "/diy" },
        { name: "积分商城", to: "/points-mall" },
        { name: "学习专区", to: "/learning" },
        { name: "客户支持", to: "/service" },
      ],
      // 页脚服务承诺：快 / 全 / 优 / 助
      footerValues: [
        {
          badge: "快",
          title: "90% 标准件 3 天内发货",
          lines: ["组装产品可按客户需求交付", "定制产品可按客户需求协商交期"],
        },
        {
          badge: "全",
          title: "配件 SKU 2000+",
          lines: ["覆盖 6 大类配件与整机选配", "按需开发行业新品"],
        },
        {
          badge: "优",
          title: "行业优选精料",
          lines: ["严格的供应商质量管理体系", "第三方检测认证，质量可靠"],
        },
        {
          badge: "助",
          title: "全系列产品均有 3D 图纸",
          lines: ["选型计算支持，提升设计效率", "售前选型，售后技术培训"],
        },
      ],
      // 页脚站点导航：与站内路由对应
      footerGroups: [
        {
          title: "交易",
          links: [
            { label: "交易流程", to: "/service" },
            { label: "如何下单", to: "/goods" },
            { label: "快速选型", to: "/diy" },
            { label: "如何快速报价", to: "/quote" },
          ],
        },
        {
          title: "使用",
          links: [
            { label: "注册须知", to: "/register" },
            { label: "网站使用规则", to: "/service" },
            { label: "关于认证企业", to: "/auth-status" },
            { label: "企业认证申请表", to: "/auth-status" },
          ],
        },
        {
          title: "帮助",
          links: [
            { label: "帮助中心", to: "/support" },
            { label: "网站地图", to: "/home" },
            { label: "常见问题", to: "/support" },
            { label: "型号敲定表", to: "/quote" },
          ],
        },
        {
          title: "关于",
          links: [
            { label: "关于我们", to: "/service" },
            { label: "联系我们", to: "/support" },
          ],
        },
      ],
      // 页脚二维码：演示环境使用点阵占位，正式上线替换真实图片
      footerQrs: [
        { seed: 7, label: "鑫戩配件公众号" },
        { seed: 23, label: "鑫戩商城小程序" },
        { seed: 51, label: "鑫戩视频号" },
      ],
    };
  },
  computed: {
    ...mapState(["notice", "loggedIn", "profile", "messages"]),
    ...mapGetters(["cartCount"]),
    // 未读消息数：头部消息入口角标
    unread() {
      return (this.messages || []).filter((item) => !item.read).length;
    },
    // 头像首字：取联系人姓名第一个字
    nameInitial() {
      return (this.profile.name || "客").slice(0, 1);
    },
    // 客服联系信息：读取 catalog.support，带兜底
    supportInfo() {
      const s = catalog.support || {};
      return {
        hotline: s.hotline || "400-880-1688",
        hours: s.hours || "8:30 - 18:00",
        email: s.email || "service@xinjian.com",
      };
    },
  },
  created() {
    // 加载目录数据（商品、分类、套装）
    this.$store.dispatch("bootstrap");
  },
  mounted() {
    // 点击头部区域外时收合下拉
    document.addEventListener("click", this.closeMenu);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.closeMenu);
  },
  watch: {
    // 提示出现后 3 秒自动清空
    notice(v) {
      if (v) setTimeout(() => this.$store.commit("setNotice", ""), 3000);
    },
    // 路由切换后收合下拉，并按路由 meta 同步浏览器标题
    $route(r) {
      this.menu = "";
      this.supportOpen = false;
      document.title = r.meta.title + " · 鑫戩配件商城";
    },
  },
  methods: {
    // 头部搜索：携带关键词跳转搜索页
    search() {
      this.$router.push({ path: "/search", query: { q: this.keyword } });
    },
    // 切换下拉展开（trigger 上 stop 修饰，避免被文档监听立刻收合）
    toggleMenu(key) {
      this.menu = this.menu === key ? "" : key;
    },
    // 切换客户支持弹框
    toggleSupport() {
      this.supportOpen = !this.supportOpen;
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
    closeMenu() {
      this.menu = "";
      this.supportOpen = false;
    },
    // 退出登录：通知后端、清除 token、收合菜单并回首页
    async logout() {
      this.menu = "";
      try {
        await authApi.logout();
      } catch (e) {
        // 后端退出失败不阻塞前端清理
      }
      clearToken();
      this.$store.commit("logout");
      this.$store.commit("setNotice", "已退出登录");
      if (this.$route.path !== "/home") this.$router.push("/home");
    },
  },
};
</script>
