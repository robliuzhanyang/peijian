/**
 * 领域层：产品字段定义与通用展示工具
 * - 字段定义对应客户表《配件》，资料缺失时使用 null，界面统一显示"待补充"
 * - 单位（mm/kg 等）为待客户确认的展示建议
 * - H5 与 PC 两端共用本文件，保持展示口径一致
 */

// 产品五视图字段：[数据键名, 中文标签]，透视图 perspective 不计入五视图
export const viewFields = [
  ['front', '正视'],
  ['side', '侧视'],
  ['back', '背面'],
  ['bottom', '下视'],
  ['top', '上视'],
]

// 实物参数字段：[数据键名, 中文标签, 单位]
export const physicalFields = [
  ['length', '长', 'mm'],
  ['width', '宽', 'mm'],
  ['height', '高', 'mm'],
  ['material', '材质', ''],
  ['weight', '重量', 'kg'],
  ['color', '颜色', ''],
  ['shaftLength', '轴长', 'mm'],
  ['isMotorized', '是否电动', ''],
]

// 工程文件下载字段：[数据键名, 中文标题]
export const downloadFields = [
  ['assembly3d', '外形装配 3D'],
  ['engineeringPdf', '产品工程图 PDF'],
  ['packagingDrawing', '包装工程图'],
]

/**
 * 字段值展示：空值统一占位，布尔值转中文，其余拼接单位
 * @param {*} value 原始字段值
 * @param {string} unit 展示单位（可选）
 * @returns {string} 可直接渲染的文本
 */
export function fieldValue(value, unit = '') {
  if (value === null || value === undefined || value === '') return '待补充'
  if (typeof value === 'boolean') return value ? '是' : '否'
  return String(value) + (unit ? ' ' + unit : '')
}

/**
 * 金额展示：后端金额单位为分，空值表示尚未报价
 * @param {number|null} fen 金额（分）
 * @returns {string} 人民币文本
 */
export function money(fen) {
  return fen === null || fen === undefined ? '待报价' : '¥' + (fen / 100).toFixed(2)
}

/**
 * 静态资源路径：自动补全 public/assets 前缀与 .svg 后缀
 * @param {string} path 资源名或相对路径
 * @returns {string|null} 完整资源路径
 */
export function asset(path) {
  return path
    ? process.env.BASE_URL + 'assets/' + (path.includes('.') ? path : path + '.svg')
    : null
}
