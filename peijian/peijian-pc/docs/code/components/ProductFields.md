# 产品资料全量表组件（ProductFields.vue）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/components/ProductFields.vue` |
| 组件类型 | 资料展示组件（含子组件 FieldRow） |
| 两端共用 | 是 |

## 作用

按客户表《配件》的资料结构，分区完整呈现产品工程资料。资料缺失时统一显示"待提供 / 待补充"，不编造数据。

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| product | Object | 是 | 完整商品对象，需包含 views、perspective、engineering、physical、packaging、downloads、applications 节点 |

## 资料分区

1. **产品资料·客户模板**：系列/名称/型号 + 五视图（缺图显示"待提供"），透视图单独附注
2. **工程外形与活动范围**：外形尺寸图、装配尺寸、活动范围上下限
3. **实物参数**：按 `physicalFields` 定义循环渲染 + 活动范围上下限
4. **包装资料**：长宽高（mm）、材料、重量（kg）、包装图
5. **工程文件下载**：按 `downloadFields` 渲染；无文件时按钮置灰显示"待提供"
6. **周边结构与应用**：装配示意图片与视频数量统计

## 依赖

- 子组件 [FieldRow.vue](FieldRow.md)
- 领域模块 [productFields.js](../domain-productFields.md)：字段定义、fieldValue、asset

## 使用位置

- 商品详情页 [detail.vue](../views/detail.md)
