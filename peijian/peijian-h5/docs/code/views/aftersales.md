# 售后退款（aftersales.vue）

| 项目     | 说明                       |
| -------- | -------------------------- |
| 文件路径 | `src/views/aftersales.vue` |
| 路由地址 | `/aftersales`              |
| 路由名称 | `aftersales`               |
| 业务分组 | 内容与服务                 |
| 页面标题 | 售后退款                   |

## 页面作用

页面分上下两区：上区"我的售后工单"展示接口返回的工单列表（工单号、状态徽章、申请类型、关联订单号、问题原因、申请时间），每行提供"查看进度"入口；下区"按订单发起售后"逐单展示本地订单号与状态，每行提供"申请售后"入口。

## 数据来源

- `businessApi.aftersales()`：`created` 时调用 `loadAftersales()` 拉取工单数组，mock 模式读取 `catalog.json` 的 `aftersales`（种子 2 单：处理中、已完成）
- `state.orders`：computed `orders` 直接返回 Vuex 订单列表，用于"按订单发起售后"区；订单首次加载时由 `catalog.json` 的 `orders` 种子与本地订单按 id 合并，并通过 localStorage（H5 端键 `xinjian-h5-v3`）持久化
- 每行工单使用 `id`、`type`、`orderId`、`status`、`reason`、`createdAt` 字段

## 交互说明

| 操作         | 触发                        | 行为                                                                       |
| ------------ | --------------------------- | -------------------------------------------------------------------------- |
| 查看进度     | 点击工单行"查看进度"        | 携带**工单 id** 跳转 `/aftersale-detail?id={工单id}`                       |
| 申请售后     | 点击订单行"申请售后"        | 携带**订单 id** 跳转 `/aftersale-apply?id={订单id}`                        |
| 工单状态徽章 | 渲染时由 `statusClass` 配色 | 处理中 `gold`、已完成 `green`、待审核 `blue`、已拒绝 `red`，未知状态无配色 |
| 问题原因     | 工单行展示                  | "原因：…"单行省略（nowrap + text-overflow: ellipsis）                      |

## 依赖的组件或工具

- `businessApi`：`@/api` 的售后工单列表接口
- Vuex：读取 `state.orders`
- `router-link`：携带工单 id / 订单 id 的两类入口
- 全局样式类：`card`、`order-line`、`between`、`tiny`、`badge`、`btn sm`、`empty`

## 状态与边界

- 工单列表为空时上区显示"暂无售后工单。"；订单列表为空时下区显示"暂无关联订单。"
- 不限制订单状态，`state.orders` 中的全部订单（含演示订单与本机下单）都显示申请入口，是否可售后以后端规则为准
- mock 模式工单为 `catalog.json` 种子数据，正式工单范围与状态以售后接口返回为准
