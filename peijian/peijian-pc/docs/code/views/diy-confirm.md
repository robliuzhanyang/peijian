# 组合配置确认（diy-confirm.vue）

| 项目     | 说明                        |
| -------- | --------------------------- |
| 文件路径 | `src/views/diy-confirm.vue` |
| 路由地址 | `/diy-confirm`              |
| 路由名称 | `diy-confirm`               |
| 业务分组 | 选型与采购                  |
| 页面标题 | 选配方案确认                |

## 页面作用

组合配置确认页：核对选型结果的组合概览与配置明细，确认后生成询价 / 报价单；可返回选配页修改，或进入采购报价单。

- **组合概览卡**：组合名称、标签徽章（标准 / 飞行 / PLUS，按 `tagClass` 动态配色）、组合型号（`model`，缺失显示「待补充」）、加工方向、适用场景、加工材料与组合要点；推荐组合显示绿色「推荐组合」徽章，自定义调整显示金色「自定义调整」徽章
- **组合明细**（有 `selectedScheme` 时，含真实组合直选与自定义调整两种来源）分两层：
  - 主体构成（core）：立柱 · 光路 · 运动轴 · 底板 · 机箱
  - 配套附件（extras）：随组合提供的辅助件，无附件时提示「该组合无单列配套附件。」
  - 每层再按模块分组，逐行显示部品名、数量（`qty > 1` 时显示 ×N）、产品型号、SKU、行小计；型号 / SKU 缺失显示「待补充」，未报价行小计显示「待报价」
- 侧栏报价预览显示「主体构成 N 件 ＋ 配套附件 M 件」与合计金额（待报价），并提示所列部品为客户资料、不支持直接加购下单

## 数据来源

- `state.selectedScheme`：组合快照对象，由 diy.vue 写入：
  - 真实组合直选：原组合对象 spread + 合并后的 `parts`（每行 `{ module, id, qty, section }`）
  - 自定义调整：基础组合 spread + 名称后缀「（自定义调整）」+ `customized: true` + 按模块 `section` 重建的 `parts`
  - 无快照时为 `null`，页面回退为按 `state.selected` 逐行展示的旧形态
- `state.selected`：部品 id 数组（无快照时使用），localStorage 持久化
- `getters.product(id)`：解析名称、`model`、`skuCode`、`priceFen`，未命中返回 `{}`

## 计算属性与方法

- `coreRows` / `extrasRows`：按行 `section` 过滤；缺 `section` 标记的旧快照统一视为 core
- `groupBy(rows)`：按 `module` 归组（对象按插入序遍历，保持模块顺序）
- `sectionCount(rows)`：一段的件数（含数量）
- `sectionTotal(rows)`：一段的金额合计；**任一行 `priceFen == null` 即返回 `null`**
- `lineTotal(p)`：单价 × 数量；未报价返回 null
- `partCount` / `total`：全组合件数与合计（同样为 null 敏感，渲染「待报价」）

## 交互说明

| 操作       | 触发               | 行为          |
| ---------- | ------------------ | ------------- |
| 查看报价单 | 点击「查看报价单」 | 跳转 `/quote` |
| 返回修改   | 点击「返回修改」   | 跳转 `/diy`   |

## 依赖的组件或工具

- `money(fen)`：金额格式化，`null` 渲染「待报价」
- `fieldValue(value)`：型号/SKU 空值显示「待补充」
- `getters.product`：按 id 解析组合部品
- `@/mock/catalog.json` 的 `directions`：方向 id 转中文名
- `vue-router` 的 `router-link`：报价单与返回修改入口

## 状态与边界

- `selectedScheme` 与 `selected` 均为空时明细区显示「尚未选配产品」
- 提示文案：「所列部品为客户资料、价格待业务确认；提交后生成询价 / 报价单，不支持直接加购下单。」
- 本页只读，修改需返回 `/diy`；所有真实组合部品均 `priceFen:null`，合计不会出现 ¥0.00，统一为「待报价」
