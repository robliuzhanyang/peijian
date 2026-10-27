/**
 * 选型域 API（selection 模块）：一站式选购目录、计价、草稿
 * - mock：直接返回本地 oneStopCatalog，页面无需感知数据来源
 * - 真实接口契约：
 *     GET  /selection/one-stop/catalog
 *       → { version, bundleDiscountRate, orientations[], steps[], kits{},
 *           kitVariants{}, defaults{}, relations{}, products[] }
 *     POST /selection/one-stop/calculate
 *       body: { selection, priceMode } → { retailTotalFen, bundleTotalFen, savingsFen, rows[] }
 *     POST /selection/one-stop/drafts
 *       body: { selection, scheme } → { draftId, schemeId }
 *   products 中的 priceFen / stock / buyable 必须由服务端实时返回。
 */
import { http } from "@/api/http";
import { IS_MOCK } from "@/config/env";
import catalog from "./domain/oneStopCatalog";

const clone = (value) => JSON.parse(JSON.stringify(value));

export const oneStopApi = {
  /** 选配目录 */
  async catalog() {
    return IS_MOCK
      ? clone(catalog)
      : http.get("/selection/one-stop/catalog").then((r) => r.data);
  },
  /** 计价：mock 回显请求参数 */
  async calculate(payload) {
    return IS_MOCK
      ? { requestId: "MOCK-CALC-" + Date.now(), ...clone(payload) }
      : http.post("/selection/one-stop/calculate", payload).then((r) => r.data);
  },
  /** 保存方案草稿 */
  async saveDraft(payload) {
    return IS_MOCK
      ? { draftId: "MOCK-DRAFT-" + Date.now(), ...clone(payload) }
      : http.post("/selection/one-stop/drafts", payload).then((r) => r.data);
  },
};

export default oneStopApi;
