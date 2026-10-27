# 字段行组件（FieldRow.vue）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/components/FieldRow.vue` |
| 组件类型 | 纯展示型基础组件 |
| 两端共用 | 是 |

## 作用

产品资料区统一的"标签 + 值"行，空值自动高亮为待补充样式并显示"待补充"。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| label | String | — | 字段中文名 |
| value | Any | null | 字段值，经 `fieldValue` 处理后展示 |
| unit | String | '' | 单位（如 mm、kg） |

## 依赖

- `fieldValue`（domain/productFields.js）：空值占位、布尔值转中文、单位拼接

## 使用位置

- [ProductFields.vue](ProductFields.md) 的各资料分区
