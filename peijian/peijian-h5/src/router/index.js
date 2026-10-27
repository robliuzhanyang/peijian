/**
 * 路由表（H5 端）
 * - 采用 hash 模式，无需服务端配置回退即可直接部署静态文件
 * - 全部页面使用动态 import 懒加载，按页生成独立 chunk
 * - meta.title 用于浏览器标题；meta.group 为业务分组（导航与文档归类使用）
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
    {
      path: "/orders",
      name: "orders",
      component: () => import("@/modules/trade/views/orders.vue"),
      meta: { title: "我的订单", group: "交易与履约" },
    },
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
    {
      path: "/contracts",
      name: "contracts",
      component: () => import("@/modules/billing/views/contracts.vue"),
      meta: { title: "采购合同", group: "合同与发票" },
    },
    {
      path: "/contract-detail",
      name: "contract-detail",
      component: () => import("@/modules/billing/views/contract-detail.vue"),
      meta: { title: "合同预览与回传", group: "合同与发票" },
    },
    {
      path: "/invoices",
      name: "invoices",
      component: () => import("@/modules/billing/views/invoices.vue"),
      meta: { title: "发票管理", group: "合同与发票" },
    },
    {
      path: "/invoice-apply",
      name: "invoice-apply",
      component: () => import("@/modules/billing/views/invoice-apply.vue"),
      meta: { title: "单笔订单开票", group: "合同与发票" },
    },
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
    {
      path: "/points-ledger",
      name: "points-ledger",
      component: () => import("@/modules/marketing/views/points-ledger.vue"),
      meta: { title: "积分明细", group: "积分与营销" },
    },
    {
      path: "/referral",
      name: "referral",
      component: () => import("@/modules/marketing/views/referral.vue"),
      meta: { title: "推荐有礼", group: "积分与营销" },
    },
    {
      path: "/favorites",
      name: "favorites",
      component: () => import("@/modules/account/views/favorites.vue"),
      meta: { title: "常用套装与方案", group: "积分与营销" },
    },

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
      path: "/support",
      name: "support",
      component: () => import("@/modules/service/views/support.vue"),
      meta: { title: "客户支持", group: "内容与服务" },
    },
    {
      path: "/messages",
      name: "messages",
      component: () => import("@/modules/account/views/messages.vue"),
      meta: { title: "消息通知", group: "内容与服务" },
    },
    {
      path: "/aftersales",
      name: "aftersales",
      component: () => import("@/modules/service/views/aftersales.vue"),
      meta: { title: "售后退款", group: "内容与服务" },
    },
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
    {
      path: "/user",
      name: "user",
      component: () => import("@/modules/account/views/user.vue"),
      meta: { title: "企业工作台", group: "企业与账号" },
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
    {
      path: "/auth-status",
      name: "auth-status",
      component: () => import("@/modules/account/views/auth-status.vue"),
      meta: { title: "认证进度", group: "企业与账号" },
    },
    {
      path: "/companies",
      name: "companies",
      component: () => import("@/modules/account/views/companies.vue"),
      meta: { title: "切换企业", group: "企业与账号" },
    },
    {
      path: "/addresses",
      name: "addresses",
      component: () => import("@/modules/account/views/addresses.vue"),
      meta: { title: "收货地址", group: "企业与账号" },
    },
    {
      path: "/address-edit",
      name: "address-edit",
      component: () => import("@/modules/account/views/address-edit.vue"),
      meta: { title: "新增编辑地址", group: "企业与账号" },
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("@/modules/account/views/settings.vue"),
      meta: { title: "账号设置", group: "企业与账号" },
    },

    // 未匹配路由统一回首页
    { path: "*", redirect: "/home" },
  ],
});
