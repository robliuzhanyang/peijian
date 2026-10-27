# 产品资料组件样式（styles/product-fields.css）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/styles/product-fields.css` |
| 服务组件 | ProductFields.vue、FieldRow.vue 及详情页视图切换 |

## 主要内容

- `.catalog-model`：卡片型号说明行
- `.field-pending`：待补充字段的弱化样式
- `.view-tabs / .view-choice`：详情页五视图/透视图切换缩略按钮
- `.field-placeholder` / `.gallery-pending`：资料缺失占位块
- `.field-assets`：工程文件下载卡三列网格
- `.identity-grid`：系列/名称/型号身份信息栅格
- `.h5` 前缀规则：H5 端的尺寸压缩（视图切换三列、下载卡单列等）
- `@media print`：打印时隐藏视图切换条等交互元素
- 原型演示悬浮入口对 H5 底部导航/结算条的避让（`.h5 .dev-launch`）
