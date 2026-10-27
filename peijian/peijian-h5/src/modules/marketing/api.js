/**
 * 营销域 API（marketing 模块）：积分流水 + 推荐有礼
 * - mock：积分流水读 Vuex（兑换后新增记录）；推荐数据读 catalog.json
 * - 真实接口：GET /marketing/points-ledger、/marketing/referral；
 *   积分兑换 POST /marketing/points/exchange
 */
import { http } from "@/api/http";
import { IS_MOCK } from "@/config/env";
import catalog from "@/mock/catalog.json";

// 延迟取 store 避免循环依赖
function getStore() {
  return require("@/store").default;
}

export const marketingApi = {
  /** 积分流水 */
  pointsLedger() {
    return IS_MOCK
      ? Promise.resolve(getStore().state.pointsLedger)
      : http.get("/marketing/points-ledger").then((r) => r.data);
  },
  /** 推荐有礼：邀请码、规则与邀请记录 */
  referral() {
    return IS_MOCK
      ? Promise.resolve(catalog.referral)
      : http.get("/marketing/referral").then((r) => r.data);
  },
};

export default marketingApi;
