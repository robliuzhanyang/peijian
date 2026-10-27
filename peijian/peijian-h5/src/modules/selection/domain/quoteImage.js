/**
 * 报价单图片导出：用 Canvas 2D 逐块绘制正式报价单
 * 不依赖第三方截图库，导出结果与页面同版式（黑框、宋体、八列明细、报价说明与盖章区）
 *
 * 入参 model 由 pages/quote.vue 的 exportModel() 组装，字段均为已格式化文本：
 *   seller / customerName / customerContact / customerPhone
 *   quoteNo / quoteDateCn
 *   rows[{index,name,model,qty,unit,priceText,totalText,remark}] / blankRows
 *   totalText / totalWords / notes[]
 */

// 逻辑纸张宽度（输出按 2 倍像素渲染，保证清晰度）
const W = 1240
// 画布外边距（纸张外围留白）
const MARGIN = 24
// 纸张内边距
const PAD = 28
const PAPER_X = MARGIN
const PAPER_W = W - MARGIN * 2
const LEFT = PAPER_X + PAD
const RIGHT = PAPER_X + PAPER_W - PAD
const INNER = RIGHT - LEFT

// 正式单据统一使用宋体，与页面保持一致
const FONT = '"SimSun", "宋体", "Songti SC", serif'

// 列宽占比：序号 / 产品名称 / 规格型号 / 数量 / 单位 / 单价 / 总价 / 备注
const COLS = [0.06, 0.26, 0.16, 0.07, 0.06, 0.13, 0.13, 0.13]
const HEADERS = [
  "序号",
  "产品名称",
  "规格型号",
  "数量",
  "单位",
  "单价（RMB）",
  "总价（RMB）",
  "备注",
]

// 行高
const HEAD_H = 46
const ROW_H = 46

function text(ctx, str, x, y, options = {}) {
  const {
    font = `19px ${FONT}`,
    color = "#111111",
    align = "left",
    baseline = "middle",
  } = options
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = baseline
  ctx.fillText(str === null || str === undefined ? "" : String(str), x, y)
}

function line(ctx, x1, y1, x2, y2, color = "#111111", width = 1) {
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function rect(ctx, x, y, w, h, color = "#111111", width = 1) {
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.strokeRect(x, y, w, h)
}

// 五角星
function drawStar(ctx, cx, cy, outer, inner) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outer : inner
    const angle = -Math.PI / 2 + (Math.PI / 5) * i
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
}

// 红色圆形印章：公司名环绕 + 五角星 + 章别
function drawSeal(ctx, cx, cy, r, name) {
  ctx.save()
  ctx.globalAlpha = 0.9
  ctx.strokeStyle = "#c8332b"
  ctx.fillStyle = "#c8332b"
  ctx.lineWidth = 3.2
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(cx, cy, r - 6, 0, Math.PI * 2)
  ctx.stroke()

  drawStar(ctx, cx, cy - r * 0.18, r * 0.24, r * 0.1)

  const chars = [...name]
  const radius = r - 14
  const span = Math.PI * 1.18
  const start = -Math.PI / 2 - span / 2
  ctx.font = `700 ${Math.round(r * 0.25)}px ${FONT}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  chars.forEach((ch, i) => {
    const angle = start + (span * (i + 0.5)) / chars.length
    ctx.save()
    ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
    ctx.rotate(angle + Math.PI / 2)
    ctx.fillText(ch, 0, 0)
    ctx.restore()
  })

  ctx.font = `700 ${Math.round(r * 0.26)}px ${FONT}`
  ctx.fillText("报价专用章", cx, cy + r * 0.55)
  ctx.restore()
}

// 按百分比计算各列左边界与最后一列右边界
function buildCols() {
  const xs = []
  let acc = LEFT
  COLS.forEach((pct, i) => {
    xs[i] = acc
    acc += Math.round(INNER * pct)
  })
  xs[COLS.length] = RIGHT
  return xs
}

/**
 * 导出报价单为 PNG 图片
 * @param {object} model 由页面组装的报价单数据（文案均已格式化）
 */
export function exportQuoteImage(model) {
  const rows = model.rows || []
  const blanks = model.blankRows || 0
  const notes = model.notes || []
  const seller = model.seller || {}

  // ===== 先算版面高度 =====
  const topStart = MARGIN + 24
  const metaTop = topStart + 74 + 62
  const metaLineH = 38
  const metaHeight = metaLineH * 3 + 18
  const tableTop = metaTop + metaHeight
  const tableRows = rows.length + blanks + 1 // +1 为合计行
  const tableHeight = HEAD_H + tableRows * ROW_H
  const notesTop = tableTop + tableHeight
  const notesHeight = Math.max(150, 44 + notes.length * 28 + 46)
  const signTop = notesTop + notesHeight
  const paperBottom = signTop + 236
  const height = paperBottom + MARGIN

  const scale = 2
  const canvas = document.createElement("canvas")
  canvas.width = W * scale
  canvas.height = height * scale
  const ctx = canvas.getContext("2d")
  ctx.scale(scale, scale)
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, W, height)

  // ===== 纸张外框 =====
  rect(ctx, PAPER_X, MARGIN, PAPER_W, paperBottom - MARGIN, "#111111", 1.6)

  // ===== 抬头：公司名 + 单据名 =====
  text(ctx, seller.name || "", W / 2, topStart + 36, {
    font: `700 40px ${FONT}`,
    align: "center",
  })
  // 单据名：字间加空格模拟字距，与页面「报 价 单」一致
  text(ctx, "报 价 单", W / 2, topStart + 74 + 34, {
    font: `700 34px ${FONT}`,
    align: "center",
  })

  // ===== 抬头信息：左客户 / 右报价方 =====
  const metaLeft = [
    ["客户名称：", model.customerName || "—"],
    ["联 系 人：", model.customerContact || "—"],
    ["联系电话：", model.customerPhone || "—"],
  ]
  const metaRight = [
    ["发 件 人：", `${seller.sender || "—"}/${seller.phone || "—"}`],
    ["公司地址：", seller.address || "—"],
    ["报价单号：", `${model.quoteNo || ""}/${model.quoteDateCn || ""}`],
  ]
  const halfX = LEFT + Math.round(INNER * 0.5)
  metaLeft.forEach((item, i) => {
    const y = metaTop + 18 + i * metaLineH
    text(ctx, item[0], LEFT, y, { font: `20px ${FONT}` })
    text(ctx, item[1], LEFT + 108, y, { font: `20px ${FONT}` })
  })
  metaRight.forEach((item, i) => {
    const y = metaTop + 18 + i * metaLineH
    text(ctx, item[0], halfX, y, { font: `20px ${FONT}` })
    text(ctx, item[1], halfX + 108, y, { font: `20px ${FONT}` })
  })

  // ===== 明细表：八列全框线 =====
  const xs = buildCols()
  const cellCenter = (i) => (xs[i] + xs[i + 1]) / 2

  // 表头
  HEADERS.forEach((label, i) => {
    text(ctx, label, cellCenter(i), tableTop + HEAD_H / 2, {
      font: `700 19px ${FONT}`,
      align: "center",
    })
  })

  let rowY = tableTop + HEAD_H
  rows.forEach((row) => {
    const cy = rowY + ROW_H / 2
    text(ctx, String(row.index), cellCenter(0), cy, { align: "center" })
    text(ctx, row.name, xs[1] + 14, cy, { font: `19px ${FONT}` })
    text(ctx, row.model, cellCenter(2), cy, { align: "center" })
    text(ctx, String(row.qty), cellCenter(3), cy, { align: "center" })
    text(ctx, row.unit, cellCenter(4), cy, { align: "center" })
    text(ctx, row.priceText, cellCenter(5), cy, { align: "center" })
    text(ctx, row.totalText, cellCenter(6), cy, { align: "center" })
    text(ctx, row.remark, cellCenter(7), cy, { align: "center" })
    rowY += ROW_H
  })

  // 补白行
  rowY += blanks * ROW_H

  // 合计行
  text(
    ctx,
    `合计金额（大写）：${model.totalWords || "待报价"}`,
    xs[0] + 14,
    rowY + ROW_H / 2,
    { font: `19px ${FONT}` }
  )
  text(ctx, model.totalText || "待报价", cellCenter(6), rowY + ROW_H / 2, {
    font: `700 19px ${FONT}`,
    align: "center",
  })

  // 网格线：横线逐行、竖线整表贯通
  const tableBottom = tableTop + tableHeight
  line(ctx, LEFT, tableTop, RIGHT, tableTop, "#111111", 1.4)
  line(ctx, LEFT, tableBottom, RIGHT, tableBottom, "#111111", 1.4)
  for (let y = tableTop + HEAD_H; y <= tableBottom; y += ROW_H) {
    line(ctx, LEFT, y, RIGHT, y, "#111111", 1)
  }
  for (let i = 1; i < xs.length - 1; i++) {
    line(ctx, xs[i], tableTop, xs[i], tableBottom, "#111111", 1)
  }
  line(ctx, LEFT, tableTop, LEFT, tableBottom, "#111111", 1.4)
  line(ctx, RIGHT, tableTop, RIGHT, tableBottom, "#111111", 1.4)

  // ===== 报价说明 =====
  text(ctx, "报价说明：", LEFT, notesTop + 28, { font: `700 20px ${FONT}` })
  notes.forEach((note, i) => {
    text(ctx, `${i + 1}. ${note}`, LEFT, notesTop + 60 + i * 28, {
      font: `17px ${FONT}`,
    })
  })

  // ===== 落款与盖章 =====
  const signY = signTop + 58
  text(ctx, `报价人：${seller.name || ""}`, LEFT, signY, {
    font: `20px ${FONT}`,
  })
  text(ctx, "客户确认（盖章）：", halfX, signY, { font: `20px ${FONT}` })
  text(ctx, "日期：　　　年　　月　　日", halfX, signY + 36, {
    font: `17px ${FONT}`,
  })
  drawSeal(ctx, LEFT + 86, signY + 108, 58, seller.name || "")

  // ===== 下载 =====
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `报价单-${model.quoteNo || ""}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, "image/png")
}
