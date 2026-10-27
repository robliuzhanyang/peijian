<!--
  页面：商城首页（home.vue）
  路由：/home ｜ 分组：采购入口
  作用：按原型 V1.2 的 H5 首页组织：品牌横幅 → 十宫格 → 企业积分卡 → 常备配件 → 选型指南 → 联系我们
  数据：products 取 Vuex（hot 优先），企业信息取 currentCompany 与 points，学习内容取 catalog.contents
-->
<template>
  <div class="home-page">
    <!-- 品牌横幅：标语、一站式采购入口、设备图与三项服务承诺 -->
    <div class="hero">
      <section class="hero-banner">
        <div class="eyebrow">ENGINEERED FOR YOUR PRODUCTION</div>
        <h1>从一颗配件，<br />到一套方案。</h1>
        <p>激光器 / 光路 / 立柱 / 电源<br />让选型更准确，让采购更简单。</p>
        <router-link class="btn" to="/diy">一站式采购　→</router-link>
        <img :src="asset('machine.svg')" alt="激光打标设备示意" />
        <div class="dots"><i class="on"></i><i></i><i></i></div>
        <div class="hero-stat">
          <span>工厂直供</span><span>适配选型</span><span>技术支持</span>
        </div>
      </section>
    </div>

    <!-- 十宫格：六大配件分类 + 一站式采购 / 积分商城 / 学习专区 / 全部分类 -->
    <div class="m-kingkong">
      <router-link
        v-for="k in kingkong"
        :key="k.name"
        :to="k.to"
        class="kk-item"
      >
        <span class="kk-ic"><UiIcon :name="k.icon" /></span>
        <strong>{{ k.name }}</strong>
      </router-link>
    </div>

    <!-- 企业积分卡：已登录展示企业简称、认证、业务员与积分；未登录引导认证 -->
    <section v-if="loggedIn && company" class="card enterprise-card">
      <div class="company-avatar"><UiIcon name="company" /></div>
      <div class="grow">
        <h3>
          {{ companyShort }} <span class="badge green">已认证</span>
        </h3>
        <p>归属业务员：{{ company.salesman || "待分配" }}</p>
      </div>
      <router-link class="score num" to="/points-ledger"
        >{{ pointsText }}<small>分</small></router-link
      >
    </section>
    <section v-else class="card enterprise-card">
      <div class="company-avatar"><UiIcon name="company" /></div>
      <div class="grow">
        <h3>欢迎来到鑫戩配件商城</h3>
        <p>认证企业，开启批发采购</p>
        <router-link class="btn primary sm" to="/register"
          >立即注册 / 认证</router-link
        >
      </div>
    </section>

    <!-- 常备配件：热销优先，两列商品卡 -->
    <div class="section-title">
      <h2>常备配件，快速直采</h2>
      <router-link class="link" to="/goods">全部配件 →</router-link>
    </div>
    <div class="product-grid">
      <article v-for="p in picks" :key="p.id" class="product-card">
        <router-link
          :to="{ path: '/detail', query: { id: p.id } }"
          class="image-box"
        >
          <img :src="asset(p.image)" :alt="p.name" />
          <span v-if="p.hot" class="badge blue top">热销配件</span>
        </router-link>
        <div class="prod-info">
          <h3>
            <router-link :to="{ path: '/detail', query: { id: p.id } }">{{
              p.name
            }}</router-link>
          </h3>
          <p class="catalog-model">
            系列：{{ p.series || "待提供" }}　型号：<b>{{
              p.model || p.power || p.skuCode
            }}</b>
          </p>
          <p class="tiny">{{ p.sub }}</p>
          <span class="price">{{ money(p.priceFen) }}</span>
          <div class="stockline">
            <span class="green"
              >现货 {{ p.stock }}{{ p.cat === "laser" ? " 台" : " 件" }}</span
            ><span class="muted">得 {{ p.points }} 积分</span>
          </div>
          <button
            v-if="p.buyable"
            class="btn primary sm block"
            @click="$store.commit('addCart', { product: p })"
          >
            加入购物车
          </button>
          <router-link
            v-else
            class="btn soft sm block"
            :to="{ path: '/detail', query: { id: p.id } }"
            >查看资料 / 咨询报价</router-link
          >
        </div>
      </article>
    </div>

    <!-- 选型与装配指南：取学习专区的两条内容 -->
    <div class="section-title">
      <h2>选型与装配指南</h2>
      <router-link class="link" to="/learning">进入学习专区 →</router-link>
    </div>
    <div class="learning-grid">
      <router-link
        v-for="a in guides"
        :key="a.id"
        class="card learning-card"
        :to="{ path: '/article', query: { id: a.id } }"
      >
        <div class="learning-cover">
          <img :src="asset(a.image)" :alt="a.title" />
          <span class="cover-tag">{{ a.tag }}</span>
        </div>
        <div class="learning-body">
          <span class="badge blue">{{ a.cat }}</span>
          <h3 style="margin-top: 8px">{{ a.title }}</h3>
          <p class="tiny">{{ a.desc }}</p>
          <div class="between panel-line">
            <span class="tiny">{{ a.date }}</span>
            <span class="tiny">{{ a.read }} 次阅读</span>
          </div>
        </div>
      </router-link>
    </div>

    <!-- 服务提示条 -->
    <div class="notice service-line">
      <UiIcon name="service" /><span
        >从选型到售后，<router-link class="blue" to="/support"
          >联系我们</router-link
        ></span
      >
    </div>
  </div>
</template>
<script>
// 线性图标：十宫格与服务提示条复用
import UiIcon from "@/components/UiIcon.vue";
// 学习内容目录（与学习专区同源）
import catalog from "@/mock/catalog.json";
// 领域工具：金额分转元、静态资源路径
import { money, asset } from "@/domain/productFields";
export default {
  components: { UiIcon },
  data() {
    return {
      // 十宫格入口：前六项直达对应分类，后四项为专题入口
      kingkong: [
        {
          name: "激光器",
          icon: "zap",
          to: { path: "/goods", query: { cat: "laser" } },
        },
        {
          name: "光学系统",
          icon: "lens",
          to: { path: "/goods", query: { cat: "optics" } },
        },
        {
          name: "机械结构",
          icon: "grid",
          to: { path: "/goods", query: { cat: "mechanic" } },
        },
        {
          name: "电气电源",
          icon: "power",
          to: { path: "/goods", query: { cat: "power" } },
        },
        {
          name: "整机选配",
          icon: "box",
          to: { path: "/goods", query: { cat: "extra" } },
        },
        {
          name: "耗材保养",
          icon: "tool",
          to: { path: "/goods", query: { cat: "care" } },
        },
        { name: "一站式采购", icon: "grid", to: "/diy" },
        { name: "积分商城", icon: "coin", to: "/points-mall" },
        { name: "学习专区", icon: "book", to: "/learning" },
        { name: "全部分类", icon: "menu", to: "/categories" },
      ],
    };
  },
  computed: {
    loggedIn() {
      return this.$store.state.loggedIn;
    },
    // 当前企业（按 currentCompanyId 取）
    company() {
      return this.$store.getters.currentCompany;
    },
    // 企业简称：去掉公司类型后缀，便于放入首页积分卡
    companyShort() {
      return (this.company.name || "").replace(
        /(股份有限公司|有限责任公司|有限公司|公司)$/,
        ""
      );
    },
    // 积分余额（千分位）
    pointsText() {
      return Number(this.$store.state.points || 0).toLocaleString("zh-CN");
    },
    // 常备配件：热销 5 件优先，再补非热销，共 6 件
    picks() {
      const list = this.$store.state.products;
      return [
        ...list.filter((p) => p.hot),
        ...list.filter((p) => !p.hot),
      ].slice(0, 6);
    },
    // 选型与装配指南：取前两条学习内容
    guides() {
      return catalog.contents.slice(0, 2);
    },
  },
  methods: { money, asset },
};
</script>
