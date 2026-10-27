# 积分明细（points-ledger.vue）

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 文件路径 | `src/views/points-ledger.vue` |
| 路由地址 | `/points-ledger`              |
| 路由名称 | `points-ledger`               |
| 业务分组 | 积分与营销                    |
| 页面标题 | 积分明细                      |

## 页面作用

顶部余额卡片展示当前积分余额；下方"积分流水"逐条展示每笔变动的标题、时间、变动后余额与收支积分（收入绿色 +N、支出金色显示负 N）；底部提供积分商城入口。

## 数据来源

- `state.points`：模板直接读取的 Vuex 演示积分余额，仓库初始化时取 `catalog.json` 中 `profile.points`（2300）
- `businessApi.pointsLedger()`：`created` 时调用 `loadLedger()` 拉取流水数组写入本地 data `ledger`；mock 模式读取 `catalog.json` 的 `pointsLedger`（种子 7 条，已按时间倒序；字段含 `type`（earn/exchange）、`title`、`points`（带正负号）、`time`、`balance`（该笔变动后余额））

## 交互说明

| 操作         | 触发                      | 行为                                                                                               |
| ------------ | ------------------------- | -------------------------------------------------------------------------------------------------- |
| 余额展示     | 顶部卡片渲染              | 以 `price gold` 样式展示 `state.points` 与"积分"后缀                                               |
| 流水收支配色 | 每行渲染时判断 `row.type` | `earn` 为绿色（`green`）并加 `+` 前缀；`exchange` 等支出类型为金色（`gold`），直接显示带负号的原值 |
| 变动后余额   | 每行小字                  | 展示"{time} · 余额 {balance}"                                                                      |
| 进入积分商城 | 点击"积分商城"按钮        | 路由跳转 `/points-mall`                                                                            |

## 依赖的组件或工具

- `businessApi`：`@/api` 的积分流水接口
- Vuex：模板直接读取 `state.points`
- `router-link`：积分商城入口
- 全局样式类：`card`、`price gold`、`order-line`、`tiny`、`green`、`gold`、`empty`、`alert`、`btn`
- 组件声明为 `{ name: 'Page' }`

## 状态与边界

- 流水为空时显示"暂无积分流水。"，并以 `alert` 提示"演示流水，正式记录以积分接口为准。"
- 余额（Vuex）与流水（接口）为两个独立数据源，流水末行的 `balance` 不参与余额计算；积分兑换演示流程不会回写 Vuex 余额
- mock 模式流水为 `catalog.json` 种子数据，正式积分余额、获取/扣减与有效期以积分接口为准
