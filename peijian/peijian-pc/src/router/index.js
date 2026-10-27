/**
 * 路由表（PC 端）
 * - hash 模式，静态部署无需服务端 rewrite
 * - 全部页面懒加载，按页拆分 chunk
 * - meta.title 用于浏览器标题；meta.group 为业务分组
 *
 * 「我的」模块采用父路由 /user + 子路由（订单/合同/发票/地址/积分/售后/消息/推荐/
 * 套装/企业/认证/设置/支持），右侧嵌入展示，左侧导航不刷新。
 * 旧的一级地址（/orders、/contracts 等）保留函数式 redirect 到 /user/*，并透传 query，
 * 保证历史链接、详情页「返回列表」以及站内旧入口仍然可用。
 */
import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "hash",
  routes: [
    // 默认入口重定向到商城首页
    { path: "/", redirect: "/home" },

    // —— 采购入口：浏览、分类、检索 ——
    {
      path: "/home",
      name: "home",
      component: () => import("@/modules/product/views/home.vue"),
      meta: { title: "商城首页", group: "采购入口" },
    },
    {
      path: "/categories",
      name: "categories",
      component: () => import("@/modules/product/views/categories.vue"),
      meta: { title: "全部分类", group: "采购入口" },
    },
    {
      path: "/goods",
      name: "goods",
      component: () => import("@/modules/product/views/goods.vue"),
      meta: { title: "配件采购", group: "采购入口" },
    },
    {
      path: "/search",
      name: "search",
      component: () => import("@/modules/product/views/search.vue"),
      meta: { title: "搜索与联想", group: "采购入口" },
    },

    // —— 选型与采购：详情、一站式选购、报价 ——
    {
      path: "/detail",
      name: "detail",
      component: () => import("@/modules/product/views/detail.vue"),
      meta: { title: "商品详情", group: "选型与采购" },
    },
    {
      path: "/package",
      name: "package",
      component: () => import("@/modules/selection/views/package.vue"),
      meta: { title: "一站式选购", group: "选型与采购" },
    },
    {
      path: "/package-detail",
      name: "package-detail",
      component: () => import("@/modules/selection/views/package-detail.vue"),
      meta: { title: "套装编辑", group: "选型与采购" },
    },
    {
      path: "/diy",
      name: "diy",
      component: () => import("@/modules/selection/views/diy.vue"),
      meta: { title: "一站式选购", group: "选型与采购" },
    },
    {
      path: "/diy-confirm",
      name: "diy-confirm",
      component: () => import("@/modules/selection/views/diy-confirm.vue"),
      meta: { title: "选配方案确认", group: "选型与采购" },
    },
    {
      path: "/quote",
      name: "quote",
      component: () => import("@/modules/selection/views/quote.vue"),
      meta: { title: "采购报价单", group: "选型与采购" },
    },

    // —— 交易与履约：购物车、下单、支付、订单、物流 ——
    {
      path: "/cart",
      name: "cart",
      component: () => import("@/modules/trade/views/cart.vue"),
      meta: { title: "购物车", group: "交易与履约" },
    },
    {
      path: "/checkout",
      name: "checkout",
      component: () => import("@/modules/trade/views/checkout.vue"),
      meta: { title: "确认订单", group: "交易与履约" },
    },
    {
      path: "/pay",
      name: "pay",
      component: () => import("@/modules/trade/views/pay.vue"),
      meta: { title: "订单支付", group: "交易与履约" },
    },
    {
      path: "/pay-success",
      name: "pay-success",
      component: () => import("@/modules/trade/views/pay-success.vue"),
      meta: { title: "支付成功", group: "交易与履约" },
    },
    {
      path: "/pay-failed",
      name: "pay-failed",
      component: () => import("@/modules/trade/views/pay-failed.vue"),
      meta: { title: "支付失败", group: "交易与履约" },
    },
    // 订单 / 合同 / 发票 / 地址等业务模块统一嵌入企业工作台右侧展示
    { path: "/orders", redirect: (to) => ({ path: "/user/orders", query: to.query }) },
    {
      path: "/order-detail",
      name: "order-detail",
      component: () => import("@/modules/trade/views/order-detail.vue"),
      meta: { title: "订单详情", group: "交易与履约" },
    },
    {
      path: "/logistics",
      name: "logistics",
      component: () => import("@/modules/trade/views/logistics.vue"),
      meta: { title: "物流跟踪", group: "交易与履约" },
    },

    // —— 合同与发票 ——
    { path: "/contracts", redirect: (to) => ({ path: "/user/contracts", query: to.query }) },
    {
      path: "/contract-detail",
      name: "contract-detail",
      component: () => import("@/modules/billing/views/contract-detail.vue"),
      meta: { title: "合同预览与回传", group: "合同与发票" },
    },
    { path: "/invoices", redirect: (to) => ({ path: "/user/invoices", query: to.query }) },
    { path: "/invoice-apply", name: "invoice-apply", component: () => import("@/modules/billing/views/invoice-apply.vue"), meta: { title: "单笔订单开票", group: "合同与发票" } },
    {
      path: "/invoice-detail",
      name: "invoice-detail",
      component: () => import("@/modules/billing/views/invoice-detail.vue"),
      meta: { title: "发票详情", group: "合同与发票" },
    },

    // —— 积分与营销 ——
    {
      path: "/points-mall",
      name: "points-mall",
      component: () => import("@/modules/marketing/views/points-mall.vue"),
      meta: { title: "积分商城", group: "积分与营销" },
    },
    {
      path: "/points-detail",
      name: "points-detail",
      component: () => import("@/modules/marketing/views/points-detail.vue"),
      meta: { title: "积分商品详情", group: "积分与营销" },
    },
    {
      path: "/points-confirm",
      name: "points-confirm",
      component: () => import("@/modules/marketing/views/points-confirm.vue"),
      meta: { title: "确认积分兑换", group: "积分与营销" },
    },
    { path: "/points-ledger", redirect: (to) => ({ path: "/user/points-ledger", query: to.query }) },
    { path: "/referral", redirect: (to) => ({ path: "/user/referral", query: to.query }) },
    { path: "/favorites", redirect: (to) => ({ path: "/user/favorites", query: to.query }) },

    // —— 内容与服务：学习、支持、消息、售后 ——
    {
      path: "/learning",
      name: "learning",
      component: () => import("@/modules/learning/views/learning.vue"),
      meta: { title: "学习专区", group: "内容与服务" },
    },
    {
      path: "/article",
      name: "article",
      component: () => import("@/modules/learning/views/article.vue"),
      meta: { title: "学习内容详情", group: "内容与服务" },
    },
    {
      path: "/service",
      name: "service",
      component: () => import("@/modules/service/views/service.vue"),
      meta: { title: "服务与支持", group: "内容与服务" },
    },
    {
      path: "/support",
      name: "support",
      component: () => import("@/modules/service/views/support.vue"),
      meta: { title: "客户支持", group: "内容与服务" },
    },
    { path: "/messages", redirect: (to) => ({ path: "/user/messages", query: to.query }) },
    { path: "/aftersales", redirect: (to) => ({ path: "/user/aftersales", query: to.query }) },
    {
      path: "/aftersale-apply",
      name: "aftersale-apply",
      component: () => import("@/modules/service/views/aftersale-apply.vue"),
      meta: { title: "申请售后", group: "内容与服务" },
    },
    {
      path: "/aftersale-detail",
      name: "aftersale-detail",
      component: () => import("@/modules/service/views/aftersale-detail.vue"),
      meta: { title: "售后进度", group: "内容与服务" },
    },

    // —— 企业与账号 ——
    // 企业工作台：外壳固定左侧导航，业务模块作为子路由嵌入右侧
    {
      path: "/user",
      component: () => import("@/modules/account/views/user.vue"),
      meta: { title: "企业工作台", group: "企业与账号" },
      children: [
        {
          path: "",
          name: "user",
          component: () => import("@/modules/account/views/user-overview.vue"),
          meta: { title: "工作台总览", group: "企业与账号" },
        },
        {
          path: "orders",
          name: "user-orders",
          component: () => import("@/modules/trade/views/orders.vue"),
          meta: { title: "我的订单", group: "企业与账号" },
        },
        {
          path: "contracts",
          name: "user-contracts",
          component: () => import("@/modules/billing/views/contracts.vue"),
          meta: { title: "采购合同", group: "企业与账号" },
        },
        {
          path: "invoices",
          name: "user-invoices",
          component: () => import("@/modules/billing/views/invoices.vue"),
          meta: { title: "发票管理", group: "企业与账号" },
        },
        {
          path: "addresses",
          name: "user-addresses",
          component: () => import("@/modules/account/views/addresses.vue"),
          meta: { title: "收货地址", group: "企业与账号" },
        },
        {
          path: "points-ledger",
          name: "user-points-ledger",
          component: () => import("@/modules/marketing/views/points-ledger.vue"),
          meta: { title: "积分明细", group: "企业与账号" },
        },
        {
          path: "aftersales",
          name: "user-aftersales",
          component: () => import("@/modules/service/views/aftersales.vue"),
          meta: { title: "售后退款", group: "企业与账号" },
        },
        {
          path: "messages",
          name: "user-messages",
          component: () => import("@/modules/account/views/messages.vue"),
          meta: { title: "消息通知", group: "企业与账号" },
        },
        {
          path: "referral",
          name: "user-referral",
          component: () => import("@/modules/marketing/views/referral.vue"),
          meta: { title: "推荐有礼", group: "企业与账号" },
        },
        {
          path: "favorites",
          name: "user-favorites",
          component: () => import("@/modules/account/views/favorites.vue"),
          meta: { title: "常用套装与方案", group: "企业与账号" },
        },
        {
          path: "companies",
          name: "user-companies",
          component: () => import("@/modules/account/views/companies.vue"),
          meta: { title: "切换企业", group: "企业与账号" },
        },
        {
          path: "auth-status",
          name: "user-auth-status",
          component: () => import("@/modules/account/views/auth-status.vue"),
          meta: { title: "认证进度", group: "企业与账号" },
        },
        {
          path: "settings",
          name: "user-settings",
          component: () => import("@/modules/account/views/settings.vue"),
          meta: { title: "账号设置", group: "企业与账号" },
        },
        {
          path: "support",
          name: "user-support",
          component: () => import("@/modules/service/views/support.vue"),
          meta: { title: "客户支持", group: "企业与账号" },
        },
      ],
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/modules/account/views/login.vue"),
      meta: { title: "账号登录", group: "企业与账号" },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/modules/account/views/register.vue"),
      meta: { title: "注册与企业认证", group: "企业与账号" },
    },
    { path: "/auth-status", redirect: (to) => ({ path: "/user/auth-status", query: to.query }) },
    { path: "/companies", redirect: (to) => ({ path: "/user/companies", query: to.query }) },
    { path: "/addresses", redirect: (to) => ({ path: "/user/addresses", query: to.query }) },
    {
      path: "/address-edit",
      name: "address-edit",
      component: () => import("@/modules/account/views/address-edit.vue"),
      meta: { title: "新增编辑地址", group: "企业与账号" },
    },
    { path: "/settings", redirect: (to) => ({ path: "/user/settings", query: to.query }) },

    // 未匹配路由统一回首页
    { path: "*", redirect: "/home" },
  ],
});
