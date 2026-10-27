/**
 * 领域层：商品详情内容（配件采购 / 积分商城共用同一口径）
 *
 * 后台「商品编辑」录入结构（product.content）：
 *   highlights: ['亮点文案', ...]                 商品亮点标签
 *   specs: [{ label: '波长', value: '1064nm' }]    自定义规格参数，同名字段优先生效
 *   introHtml: '<p>…</p>'                         富文本介绍，编辑器直出 HTML
 *   notes: ['须知条目', ...]                       购买须知 / 兑换须知共用
 *
 * 兼容历史字段：product.detailHtml、product.exchangeInfo.{highlights,introHtml,notes}
 * 未录入时按商品字段兜底，空值不生成参数行，避免整屏「待补充」占位。
 */
import { physicalFields } from '@/domain/productFields'
import { buildProductDetailHtml } from '@/modules/product/domain/productDetailHtml'

// 空值判定：null / undefined / 空串均视为未录入
function isBlank(value) {
  return value === null || value === undefined || value === ''
}

// 字段值转文本：布尔转中文，其余可拼接单位
function toText(value, unit = '') {
  if (typeof value === 'boolean') return value ? '是' : '否'
  return String(value) + (unit ? ' ' + unit : '')
}

/**
 * 规格参数行：后台自定义项优先，其次按商品字段补全
 * 同名标签只保留一条，空值直接跳过
 * @param {object} product 商品
 * @param {Array<{label:string,value:*}>} customSpecs 后台自定义参数
 * @returns {Array<{label:string,value:string}>}
 */
export function buildSpecs(product, customSpecs = []) {
  const rows = []
  const used = {}
  const add = (label, value, unit) => {
    if (!label || isBlank(value)) return
    const key = String(label).trim()
    if (!key || used[key]) return
    used[key] = true
    rows.push({ label: key, value: toText(value, unit) })
  }

  // 1. 后台自定义参数优先占位
  ;(customSpecs || []).forEach((row) => row && add(row.label, row.value))

  // 2. 商品身份与分类字段
  const p = product || {}
  const ph = p.physical || {}
  add('品牌', p.brand)
  add('系列', p.series)
  add('产品型号', p.model)
  add('可售 SKU', p.skuCode)
  add('类型', p.type)
  add('功率', p.power)
  add('量程', p.range)
  add('适用场景', p.scene)
  add('适用机型', p.machine)

  // 3. 实物参数（长宽高 / 材质 / 重量 / 颜色 / 轴长 / 是否电动）
  physicalFields.forEach(([key, label, unit]) => add(label, ph[key], unit))

  // 4. 活动范围：两端都有值才合并成一行
  const travel = ph.travel || {}
  if (!isBlank(travel.min) || !isBlank(travel.max)) {
    const span = [travel.min, travel.max].filter((v) => !isBlank(v)).join(' ~ ')
    add('活动范围', toText(span, travel.unit))
  }
  return rows
}

/**
 * 商品亮点：优先取后台亮点，缺失时用副标题拆分成标签
 * @param {object} product 商品
 * @returns {string[]}
 */
export function buildHighlights(product) {
  const p = product || {}
  const content = p.content || {}
  const info = p.exchangeInfo || {}
  const own = content.highlights || info.highlights
  if (own && own.length) {
    return own.filter((item) => !isBlank(item)).map((item) => String(item))
  }
  return String(p.sub || '')
    .split(/[·｜|]/)
    .map((item) => item.trim())
    .filter((item) => item && !/待补充|^客户资料/.test(item))
    .slice(0, 5)
}

// 站点统一须知：后台未录入 notes 时使用，与页面既有承诺保持一致
export const DEFAULT_PURCHASE_NOTES = [
  '价格、库存与交期以订单确认为准，批量采购可在线下单或发起询价。',
  '支持开具增值税专用发票，企业采购可选择对公转账。',
  '整机质保 12 个月，易损件与耗材按实际使用情况更换。',
]

export const DEFAULT_EXCHANGE_NOTES = [
  '积分在兑换订单签收后扣减，可在积分明细中查询本次记录。',
  '兑换商品由仓配统一发出，不与采购订单合并发货。',
  '每账号每月兑换数量以商品页标注的月限兑为准。',
]

/**
 * 组装详情页四段内容
 * @param {object} product 商品
 * @param {{kind?: 'purchase'|'exchange'}} options kind 决定须知标题与默认条款
 * @returns {{highlights:string[],specs:Array,notes:string[],introHtml:string,notesTitle:string}}
 */
export function resolveProductContent(product, options = {}) {
  const p = product || {}
  const content = p.content || {}
  const exchange = options.kind === 'exchange'
  // 兑换扩展字段只服务于积分详情，避免「兑换须知」串到配件采购详情
  const info = exchange ? p.exchangeInfo || {} : {}

  const notes =
    content.notes ||
    info.notes ||
    (exchange ? DEFAULT_EXCHANGE_NOTES : DEFAULT_PURCHASE_NOTES)

  return {
    highlights: buildHighlights(p),
    specs: buildSpecs(p, content.specs),
    introHtml: content.introHtml || p.detailHtml || info.introHtml || buildProductDetailHtml(p),
    notes: (notes || []).filter((item) => !isBlank(item)),
    notesTitle: exchange ? '兑换须知' : '购买须知',
  }
}
