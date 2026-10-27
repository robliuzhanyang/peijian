/**
 * 服务域 API（service 模块）：售后工单 + 客户支持
 * - mock：售后工单读 Vuex（本地 CRUD 持久化）；支持渠道读 catalog.json
 * - 真实接口：GET /service/aftersales、/service/support 等
 */
import { http } from "@/api/http";
import { IS_MOCK } from "@/config/env";
import catalog from "@/mock/catalog.json";

function getStore() {
  return require("@/store").default;
}

export const serviceApi = {
  /** 售后工单列表 */
  aftersales() {
    return IS_MOCK
      ? Promise.resolve(getStore().state.aftersales)
      : http.get("/service/aftersales").then((r) => r.data);
  },
  /** 售后工单详情：支持工单 id 或关联订单 id */
  aftersaleDetail(id) {
    return IS_MOCK
      ? Promise.resolve(
          getStore().state.aftersales.find(
              (a) => a.id === id || a.orderId === id,
            ) || null,
        )
      : http
          .get("/service/aftersales/" + encodeURIComponent(id))
          .then((r) => r.data);
  },
  /** 客户支持渠道与联系方式 */
  support() {
    return IS_MOCK
      ? Promise.resolve(catalog.support)
      : http.get("/service/support").then((r) => r.data);
  },
};

export default serviceApi;
