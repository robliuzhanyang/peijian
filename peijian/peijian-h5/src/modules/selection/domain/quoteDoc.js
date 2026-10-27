/**
 * 报价单文档模型：抬头、日期、单号、金额大写
 * 页面展示与图片导出共用这一份口径，避免两处文案不一致
 *
 * 后端接入提示：
 *   - 抬头（发件人 / 电话 / 地址）建议由后端「业务员 / 企业资料」接口下发；
 *   - 报价单号与报价日期应由后端生成并持久化，避免刷新页面后单号变化；
 *   - 下面的常量仅作为 mock 阶段的默认值，接口接通后按字段覆盖即可。
 */

// 报价方信息（正式报价单抬头与盖章主体）
export const QUOTE_SELLER = {
  name: "吉安鑫戬科技有限公司",
  short: "鑫戬",
  desc: "工业激光打标设备 · 配件与耗材",
  contact: "业务部",
  // 发件人（业务员）与联系电话，对应报价单右上信息
  sender: "符工",
  phone: "13828785327",
  // 公司地址，对应报价单右上信息
  address: "江西省吉安市永新县工业开发区",
}

// 日期格式化为 YYYY年M月D日（正式单据写法）
export function formatCnDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

// 报价单号：XJJS-YYMMDD + B + 两位流水（例：XJJS-261022B01）
export function buildQuoteNo(date) {
  const d = date instanceof Date ? date : new Date(date)
  const pad = (n) => String(n).padStart(2, "0")
  const ymd =
    String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate())
  const seq = String(Math.floor(Math.random() * 90) + 10)
  return `XJJS-${ymd}B${seq}`
}

const CN_DIGITS = "零壹贰叁肆伍陆柒捌玖"
const CN_UNITS = ["", "拾", "佰", "仟"]
const CN_BIG_UNITS = ["", "万", "亿", "兆"]

// 整数转中文大写（支持到兆位）
function integerToWords(num) {
  if (num === 0) return "零"
  const str = String(num)
  const len = str.length
  let out = ""
  let zero = false
  for (let i = 0; i < len; i++) {
    const digit = Number(str[i])
    const pos = len - 1 - i
    const unit = CN_UNITS[pos % 4]
    const big = pos % 4 === 0 ? CN_BIG_UNITS[Math.floor(pos / 4)] : ""
    if (digit === 0) {
      zero = true
      // 万 / 亿整节结束且后面还有更低位时，补节权位
      if (big && out && !out.endsWith(big)) out += big
    } else {
      if (zero && out) out += "零"
      zero = false
      out += CN_DIGITS[digit] + unit + big
    }
  }
  return out.replace(/零+$/, "")
}

/**
 * 金额（分）转人民币大写
 * @param {number|null} fen 金额，单位分；null 表示未报价
 * @returns {string} 例：壹万陆仟捌佰叁拾元整
 */
export function amountInWords(fen) {
  if (fen === null || fen === undefined) return "待报价"
  const yuan = Math.floor(fen / 100)
  const jiao = Math.floor((fen % 100) / 10)
  const cent = fen % 10
  if (yuan === 0 && jiao === 0 && cent === 0) return "零元整"
  let out = yuan > 0 ? integerToWords(yuan) + "元" : ""
  if (jiao === 0 && cent === 0) return out + "整"
  if (jiao > 0) out += CN_DIGITS[jiao] + "角"
  else if (yuan > 0 && cent > 0) out += "零"
  if (cent > 0) out += CN_DIGITS[cent] + "分"
  return out
}
