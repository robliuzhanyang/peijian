/**
 * 票据域 API（billing 模块）：合同 + 发票
 * - mock：合同/发票直接读 Vuex state（本地 CRUD + localStorage 持久化）
 * - 真实接口：/billing/contracts、/billing/invoices 同名资源
 *
 * 合同模板 md 由后端统一维护（GET /billing/contract-template），
 * 前端只负责把 md 中的占位字段替换为双方主体与订单数据后渲染。
 */
import { http } from "@/api/http";
import { IS_MOCK } from "@/config/env";
import { contractTemplate } from "./contractTemplate";

// 延迟取 store：store 可能间接 import 本文件，函数内再取避免循环依赖
function getStore() {
  return require("@/store").default;
}

export const contractApi = {
  /** 合同列表 */
  list() {
    return IS_MOCK
      ? Promise.resolve(getStore().state.contracts)
      : http.get("/billing/contracts").then((r) => r.data);
  },
  /** 合同详情：支持按合同 id 或关联订单 id 查询，查不到返回 null */
  detail(id) {
    return IS_MOCK
      ? Promise.resolve(
          getStore().state.contracts.find(
              (c) => c.id === id || c.orderId === id,
            ) || null,
        )
      : http
          .get("/billing/contracts/" + encodeURIComponent(id))
          .then((r) => r.data);
  },
  /**
   * 按订单生成合同（mock 走 store 本地创建；真实接口 POST /billing/contracts）
   * @param {{orderId:string,title?:string,amountFen:number,buyer:string,buyerTaxId:string}} payload
   */
  create(payload) {
    if (IS_MOCK) {
      return Promise.resolve(getStore().commit("createContract", payload));
    }
    return http.post("/billing/contracts", payload).then((r) => r.data);
  },
  /** 买方签署合同（mock 走 store；真实接口 POST /billing/contracts/:id/sign） */
  sign(id) {
    if (IS_MOCK) {
      getStore().commit("signContract", id);
      return Promise.resolve({ success: true });
    }
    return http
      .post("/billing/contracts/" + encodeURIComponent(id) + "/sign")
      .then((r) => r.data);
  },
  /**
   * 合同模板 md（含 {{字段}} 占位）
   * mock：读本地 contractTemplate.md；真实接口 GET /billing/contract-template
   */
  template() {
    return IS_MOCK
      ? Promise.resolve(contractTemplate)
      : http.get("/billing/contract-template").then((r) => r.data);
  },
};

export const invoiceApi = {
  /** 发票列表 */
  list() {
    return IS_MOCK
      ? Promise.resolve(getStore().state.invoices)
      : http.get("/billing/invoices").then((r) => r.data);
  },
  /** 发票详情 */
  detail(id) {
    return IS_MOCK
      ? Promise.resolve(
          getStore().state.invoices.find((v) => v.id === id) || null,
        )
      : http
          .get("/billing/invoices/" + encodeURIComponent(id))
          .then((r) => r.data);
  },
};

export default { contractApi, invoiceApi };
