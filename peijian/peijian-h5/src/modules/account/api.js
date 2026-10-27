/**
 * 账号域 API（account 模块）：鉴权 + 资料 / 企业 / 认证 / 消息
 * - mock：登录返回演示 token；资料、企业、消息读 Vuex；认证节点读 catalog.json
 * - 真实接口：POST /auth/login、/auth/logout；GET /account/profile、
 *   /account/companies、/account/auth-flow、/account/messages
 *
 * 登录成功后页面调用 setToken() 保存 token，后续请求自动携带。
 */
import { http } from "@/api/http";
import { IS_MOCK } from "@/config/env";
import catalog from "@/mock/catalog.json";

function getStore() {
  return require("@/store").default;
}

export const authApi = {
  login({ account, password }) {
    return IS_MOCK
      ? Promise.resolve({
          token: "MOCK-TOKEN-" + Date.now(),
          profile: getStore().state.profile,
        })
      : http.post("/auth/login", { account, password }).then((r) => r.data);
  },
  logout() {
    return IS_MOCK
      ? Promise.resolve({ success: true })
      : http.post("/auth/logout").then((r) => r.data);
  },
  /** 注册 / 企业认证：后端返回 token 与资料，注册后可直接登录 */
  register(payload) {
    return IS_MOCK
      ? Promise.resolve({
          token: "MOCK-TOKEN-" + Date.now(),
          profile: getStore().state.profile,
        })
      : http.post("/account/companies", payload).then((r) => r.data);
  },
};

export const accountApi = {
  /** 当前登录用户资料 */
  profile() {
    return IS_MOCK
      ? Promise.resolve(getStore().state.profile)
      : http.get("/account/profile").then((r) => r.data);
  },
  /** 可切换企业列表 */
  companies() {
    return IS_MOCK
      ? Promise.resolve(getStore().state.companies)
      : http.get("/account/companies").then((r) => r.data);
  },
  /** 企业认证进度节点 */
  authFlow() {
    return IS_MOCK
      ? Promise.resolve(catalog.authFlow)
      : http.get("/account/auth-flow").then((r) => r.data);
  },
  /** 消息通知列表 */
  messages() {
    return IS_MOCK
      ? Promise.resolve(getStore().state.messages)
      : http.get("/account/messages").then((r) => r.data);
  },
};

export default { authApi, accountApi };
