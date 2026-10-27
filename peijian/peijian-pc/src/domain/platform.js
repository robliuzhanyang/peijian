/**
 * 平台主体信息（卖方 / 平台运营方）
 *
 * 合同、发票、售后等单据中"我方"信息的唯一来源；
 * 后续接后端时可改为由 GET /platform/profile 下发，再注入 Vuex 与本常量。
 */
export const PLATFORM = {
  // 合同/订单中的卖方主体
  sellerName: "鑫戩智能装备（苏州）有限公司",
  sellerTaxId: "91320500MA1XJ2026A",
  sellerAddress: "江苏省苏州市工业园区金鸡湖大道 1688 号鑫戩智能产业园",
  sellerBank: "中国工商银行苏州工业园区支行",
  sellerBankAccount: "1102 0260 0920 0260 1688",
  sellerPhone: "0512-8888 6666",
  // 平台对外名称（客户支持等场景）
  platformName: "鑫戩配件商城",
};

export default PLATFORM;
