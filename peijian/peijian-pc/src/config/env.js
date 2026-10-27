/**
 * 运行环境配置（PC）
 *
 * 解析优先级（从高到低）：
 *   1. public/config.js 注入的 window.__XJ_CONFIG__（部署后可直接改，无需重新构建）
 *   2. 构建时的环境变量（.env.development / .env.sit / .env.production）
 *   3. 默认值（mock + /api/pc）
 *
 * 这样同一份 dist 可以在测试与正式环境复用：
 *   - 构建：npm run build:sit / npm run build:prod
 *   - 部署：按环境覆盖 public/config.js 中的 apiBaseUrl / env
 */
const runtime =
  (typeof window !== "undefined" && window.__XJ_CONFIG__) || {};

// 当前环境：development | sit | production
export const APP_ENV =
  runtime.env ||
  process.env.VUE_APP_ENV ||
  process.env.NODE_ENV ||
  "development";

// 数据模式：mock（本地假数据） | api（真实后端）
export const DATA_MODE =
  runtime.dataMode || process.env.VUE_APP_DATA_MODE || "mock";

// 是否走本地演示数据
export const IS_MOCK = DATA_MODE === "mock";

// 接口根路径：运行时配置 > 构建变量 > 默认同源网关
export const API_BASE_URL = (
  runtime.apiBaseUrl ||
  process.env.VUE_APP_API_BASE_URL ||
  "/api/pc"
).replace(/\/$/, "");

// 是否为正式环境（用于日志、埋点或界面上的环境标识）
export const IS_PROD = APP_ENV === "production";
export const IS_SIT = APP_ENV === "sit";

// 鉴权 token 的本地存储键（H5 与 PC 分属不同域名，互不影响）
export const TOKEN_KEY = "xinjian-token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch (e) {
    return "";
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    // 隐私模式下 localStorage 不可用时静默失败
  }
}

export function clearToken() {
  setToken("");
}
