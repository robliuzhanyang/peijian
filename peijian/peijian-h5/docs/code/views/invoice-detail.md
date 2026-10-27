# 发票详情（invoice-detail.vue）

| 项目     | 说明                           |
| -------- | ------------------------------ |
| 文件路径 | `src/views/invoice-detail.vue` |
| 路由地址 | `/invoice-detail`              |
| 路由名称 | `invoice-detail`               |
| 业务分组 | 合同与发票                     |
| 页面标题 | 发票详情                       |

## 页面作用

展示单张发票的完整字段：发票号码、类型徽章、企业抬头、税号、接收邮箱、开票状态徽章、申请时间、开具时间与发票金额；已驳回发票额外展示驳回原因，已开具发票提供电子发票下载入口（演示仅提示）。按 id 查不到发票时（如从开票申请页提交后跳入）回退展示申请占位。

## 数据来源

- `businessApi.invoiceDetail(query.id)`：`created` 时拉取，mock 模式读取 `catalog.json` 的 `invoices`，按发票 id 精确查找，找不到时返回 `null`
- 占位分支读取路由参数：`query.title`（上一页透传的企业抬头）、`query.orderId` 或 `query.id`（关联订单号）
- 发票金额 `amountFen` 经 `money(fen)` 格式化

## 交互说明

| 操作         | 触发                                            | 行为                                                                |
| ------------ | ----------------------------------------------- | ------------------------------------------------------------------- |
| 下载电子发票 | 仅"已开具"发票显示按钮，点击后调用 `download()` | 提交 Vuex `setNotice`："演示环境不生成真实发票文件"，不产生真实文件 |
| 驳回原因     | 状态为"已驳回"时                                | 以 `alert` 样式展示"驳回原因：{rejectReason}"                       |
| 状态徽章     | 渲染时由 computed `invoiceStatusClass` 配色     | 已开具 `green`、已驳回 `red`、审核中等其余状态 `gold`               |
| 开具时间     | 字段渲染                                        | `issuedAt` 为空时显示"待开具"                                       |
| 返回发票列表 | 点击"返回发票列表"                              | 路由跳转 `/invoices`                                                |

## 依赖的组件或工具

- `businessApi`：`@/api` 的发票详情接口
- `money(fen)`：来自 `@/domain/productFields`
- Vuex：`commit('setNotice')` 全局轻提示
- vue-router：通过 `$route.query` 读取 id/title/orderId，`<router-link>` 返回列表

## 状态与边界

- 仅当按 id 查不到发票时才渲染申请占位：发票号码"待接口提供"、开票状态"演示申请待提交"，抬头取 `query.title`（无则"待接口提供"），并提示"正式发票号码和文件由发票接口回传"
- 开票申请数据未持久化，离开申请页后无法找回，占位仅作演示回退
- mock 模式发票为 `catalog.json` 种子数据，正式票据以发票接口返回为准
