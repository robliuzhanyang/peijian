/**
 * 商品详情正文兜底：后台未录入 detailHtml / content.introHtml 时使用
 * - 只拼接已录入的资料，缺失项整段省略，不输出「待补充」占位
 * - 规格参数由详情页「规格参数」板块统一展示，此处不再重复
 */
import { asset, viewFields } from '@/domain/productFields'

// 富文本值转义，避免字段中的特殊字符破坏 HTML 结构
function esc(value) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function isBlank(value) {
  return value === null || value === undefined || value === ''
}

// 两列一组的参数表：[[标签, 值], ...]
function specTable(rows) {
  let html = '<table>'
  for (let i = 0; i < rows.length; i += 2) {
    const left = rows[i] || ['', '']
    const right = rows[i + 1] || ['', '']
    html += `<tr><th>${esc(left[0])}</th><td>${esc(left[1])}</td>`
    html += `<th>${esc(right[0])}</th><td>${esc(right[1])}</td></tr>`
  }
  return html + '</table>'
}

/** 按商品字段生成演示富文本正文（仅输出已有资料） */
export function buildProductDetailHtml(product) {
  if (!product) return ''
  const engineering = product.engineering || {}
  const bounds = engineering.movementBounds || {}
  const packaging = product.packaging || {}
  const views = product.views || {}

  // 首段：品牌 / 适用场景 / 适配机型，均为已录入字段
  const facts = []
  if (product.brand) facts.push(`由 ${product.brand} 提供`)
  if (product.scene) facts.push(`面向${product.scene}场景`)
  if (product.machine) facts.push(`适配${product.machine}`)
  const lead =
    product.name +
    (facts.length ? '，' + facts.join('，') : '') +
    (product.sub ? `。产品特点：${product.sub}` : '') +
    '。'

  // 五视图：仅渲染已上传的图片
  const figures = viewFields
    .map(([key, label]) => {
      const src = asset(views[key])
      return src
        ? `<figure class="rich-figure"><img src="${src}" alt="${esc(
            label,
          )}"><figcaption>${esc(label)}</figcaption></figure>`
        : ''
    })
    .join('')

  // 工程资料：有装配尺寸或活动范围才输出
  const engineeringRows = []
  const assembly = (engineering.assemblyDimensions || [])
    .map((item) => `${item.label}: ${item.value}`)
    .join('；')
  if (assembly) engineeringRows.push(['涉及装配的尺寸', assembly])
  if (!isBlank(bounds.min) || !isBlank(bounds.max)) {
    engineeringRows.push([
      '活动部分范围',
      [bounds.min, bounds.max]
        .filter((v) => !isBlank(v))
        .join(' ~ ') + (bounds.unit ? ' ' + bounds.unit : ''),
    ])
  }

  // 包装资料：仅输出已录入的项
  const packagingRows = []
  if (!isBlank(packaging.length)) packagingRows.push(['包装长', packaging.length + ' mm'])
  if (!isBlank(packaging.width)) packagingRows.push(['包装宽', packaging.width + ' mm'])
  if (!isBlank(packaging.height)) packagingRows.push(['包装高', packaging.height + ' mm'])
  if (!isBlank(packaging.material)) packagingRows.push(['包装材料', packaging.material])
  if (!isBlank(packaging.weight)) packagingRows.push(['包装重量', packaging.weight + ' kg'])

  return [
    `<p>${esc(lead)}</p>`,
    figures ? '<h3>产品图示</h3>' + figures : '',
    engineeringRows.length
      ? '<h3>工程资料</h3>' + specTable(engineeringRows)
      : '',
    packagingRows.length ? '<h3>包装资料</h3>' + specTable(packagingRows) : '',
  ].join('')
}
