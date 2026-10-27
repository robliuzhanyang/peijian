/**
 * 应用入口
 * 职责：组装根实例，挂载路由与 Vuex 状态仓库，并按顺序引入全局样式
 */
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
// 运行环境信息：便于在控制台确认当前连的是测试还是正式接口
import { APP_ENV, DATA_MODE, API_BASE_URL } from "@/config/env";

// 全局样式加载顺序：设计令牌(v12) → 产品资料组件样式 → 页面排版样式(app)
import "./styles/v12.css";
import "./styles/product-fields.css";
import "./styles/app.css";

// 关闭生产环境提示
Vue.config.productionTip = false;

// 环境与接口信息（只在控制台输出，不影响页面）
console.info(
  `[鑫戩配件商城 PC] env=${APP_ENV} data=${DATA_MODE} api=${API_BASE_URL}`
);

// 创建根实例并挂载到 public/index.html 中的 #app 节点
new Vue({ router, store, render: (h) => h(App) }).$mount("#app");
