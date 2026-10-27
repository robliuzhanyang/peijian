/**
 * 交易域 API（trade 模块）：订单 + 物流
 * - mock：订单读 catalog.json 种子；物流读 catalog.logistics
 * - 真实接口：GET /orders、/orders/:id；POST /orders；GET /trade/logistics/:orderId
 *
 * mock 模式下订单的写操作（submit/签署等）由 Vuex 本地 CRUD 承接，
 * 后端接入后把本文件方法替换为 http 调用并删除 store 中对应逻辑。
 */
import { http } from "@/api/http";
import { IS_MOCK } from "@/config/env";
import catalog from "@/mock/catalog.json";

export const ordersApi = {
  /** 订单列表 */
  list() {
    return IS_MOCK
      ? Promise.resolve(catalog.orders)
      : http.get("/orders").then((r) => r.data);
  },
  /** 订单详情 */
  detail(id) {
    return IS_MOCK
      ? Promise.resolve(catalog.orders.find((o) => o.id === id) || null)
      : http.get("/orders/" + encodeURIComponent(id)).then((r) => r.data);
  },
  /** 提交订单：mock 生成 XJ 前缀订单号，状态待付款 */
  submit(payload) {
    return IS_MOCK
      ? Promise.resolve({
          id: "XJ" + Date.now(),
          status: "待付款",
          ...payload,
        })
      : http.post("/orders", payload).then((r) => r.data);
  },
};

export const tradeApi = {
  /** 物流轨迹：{company, waybill, nodes}，未发货返回 null */
  logistics(orderId) {
    return IS_MOCK
      ? Promise.resolve(catalog.logistics[orderId] || null)
      : http
          .get("/trade/logistics/" + encodeURIComponent(orderId))
          .then((r) => r.data);
  },
};

export default { ordersApi, tradeApi };
