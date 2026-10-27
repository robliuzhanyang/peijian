/**
 * 合同装配（billing 域）
 *
 * 把后端/本地的合同数据 + 订单数据 + 双方主体信息填入合同 md 模板：
 *   1. 依据订单 items 与商品目录生成商品明细表
 *   2. 金额转大写
 *   3. 统一替换 {{字段}} 占位
 * 页面只负责调用装配结果并交给 markdown 渲染器，不关心字段来源。
 */
import { PLATFORM } from "@/domain/platform";
import { money } from "@/domain/productFields";

/**
 * 金额（分）转人民币大写
 * @param {number} fen
 * @returns {string} 如：伍仟零肆拾元整
 */
export function amountToChinese(fen) {
  const n = Math.round(Number(fen) || 0) / 100;
  if (n === 0) return "零元整";
  const digits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  const units = [
    { v: 1e8, n: "亿" },
    { v: 1e4, n: "万" },
    { v: 1, n: "" },
  ];
  const small = ["", "拾", "佰", "仟"];

  // 万以内四段转换
  function four(num) {
    let str = "";
    let zero = false;
    for (let p = 1000; p >= 1; p /= 10) {
      const d = Math.floor(num / p) % 10;
      if (d === 0) {
        if (str) zero = true;
      } else {
        if (zero) {
          str += "零";
          zero = false;
        }
        str += digits[d] + small[Math.log10(p)];
      }
    }
    return str;
  }

  let intPart = Math.floor(n);
  let result = "";
  units.forEach(({ v, n: unit }) => {
    if (intPart >= v) {
      const seg = Math.floor(intPart / v) % 10000;
      if (seg) result += four(seg) + unit;
      intPart -= seg * v;
    }
  });

  const jiao = Math.floor(n * 10) % 10;
  const fenDigit = Math.round(n * 100) % 10;
  if (!jiao && !fenDigit) {
    result += "元整";
  } else {
    result += "元";
    result += jiao ? digits[jiao] + "角" : fenDigit ? "零" : "";
    result += fenDigit ? digits[fenDigit] + "分" : "";
  }
  return result;
}

/**
 * 生成订单商品明细表（md 表格）
 * @param {Array} orderItems 订单 items：{productId, model, skuCode, quantity, unitPriceFen}
 * @param {Function} productName 按 productId 取商品名称的函数
 */
export function buildItemsTable(orderItems, productName) {
  const head =
    "| 序号 | 商品名称 | 规格型号 | 商品编码 | 数量 | 单价（元） | 小计（元） |\n" +
    "| --- | --- | --- | --- | --- | --- | --- |";
  const rows = (orderItems || []).map((it, idx) => {
    const name = productName(it.productId) || it.productId;
    const subtotal = money(it.unitPriceFen * it.quantity);
    return `| ${idx + 1} | ${name} | ${it.model || "-"} | ${it.skuCode || "-"} | ${
      it.quantity
    } | ${money(it.unitPriceFen)} | ${subtotal} |`;
  });
  return [head, ...rows].join("\n");
}

// md 表格 HTML 渲染需要：将 "| ... |" 段落转成表格（renderMarkdown 之外的补充处理）
// 这里直接在装配阶段把表格 md 转成 HTML 表，避免渲染器额外支持表格语法
function tableToHtml(mdTable) {
  const rows = mdTable
    .split("\n")
    .map((r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
  const head = rows[0];
  const body = rows.slice(2);
  const th = head.map((c) => `<th>${c}</th>`).join("");
  const trs = body
    .map((r) => "<tr>" + r.map((c) => `<td>${c}</td>`).join("") + "</tr>")
    .join("");
  return `<div class="doc-table-wrap"><table class="doc-table"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`;
}

/**
 * 装配合同 md：模板 + 合同 + 订单 + 买方企业 + 印章锚点
 * @param {object} args
 * @param {string} args.template 合同 md 模板
 * @param {object} args.contract 合同数据
 * @param {object|null} args.order 关联订单
 * @param {object} args.buyerCompany 买方企业（含 name/taxId/contact/phone/address）
 */
export function fillContractTemplate({
  template,
  contract,
  order,
  buyerCompany = {},
}) {
  const items = (order && order.items) || [];
  // 商品名称从 store 商品目录 + 一站式商品合并索引中取
  const store = require("@/store").default;
  const productMap = new Map(store.state.products.map((p) => [p.id, p]));
  const productName = (id) => (productMap.get(id) || {}).name || "";

  // 明细表先转 HTML，用占位键注入
  const tableHtml = tableToHtml(buildItemsTable(items, productName));

  const map = {
    contractNo: contract.id,
    orderNo: contract.orderId,
    date: contract.createdAt || "",
    buyerName: contract.buyer || buyerCompany.name || "",
    buyerTaxId: contract.buyerTaxId || buyerCompany.taxId || "",
    buyerContact: buyerCompany.contact || "待补充",
    buyerPhone: buyerCompany.phone || "待补充",
    buyerAddress: buyerCompany.address || "待补充",
    sellerName: PLATFORM.sellerName,
    sellerTaxId: PLATFORM.sellerTaxId,
    sellerAddress: PLATFORM.sellerAddress,
    sellerPhone: PLATFORM.sellerPhone,
    sellerBank: PLATFORM.sellerBank,
    sellerBankAccount: PLATFORM.sellerBankAccount,
    amount: money(contract.amountFen),
    amountText: amountToChinese(contract.amountFen),
    platformName: PLATFORM.platformName,
    itemsTable: tableHtml,
    // 印章锚点：渲染后由页面 v-html 之外的逻辑替换为组件不现实，
    // 故注入唯一注释锚点，页面在 v-html 后用 DOM 挂载印章
    sellerSeal: "<!--SELLER_SEAL_ANCHOR-->",
  };

  let md = template;
  Object.keys(map).forEach((key) => {
    md = md.split("{{" + key + "}}").join(map[key]);
  });
  return md;
}

export default { amountToChinese, buildItemsTable, fillContractTemplate };
