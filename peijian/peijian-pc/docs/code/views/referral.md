# 推荐有礼（referral.vue）

| 项目     | 说明                     |
| -------- | ------------------------ |
| 文件路径 | `src/views/referral.vue` |
| 路由地址 | `/referral`              |
| 路由名称 | `referral`               |
| 业务分组 | 积分与营销               |
| 页面标题 | 推荐有礼                 |

## 页面作用

展示企业推荐活动：深色邀请码卡片与一键复制按钮、活动规则文案、已到账/待结算奖励统计，以及邀请记录明细表（被邀请企业、时间、状态、奖励积分、是否到账）。

## 数据来源

- `businessApi.referral()`：`created` 时调用 `loadReferral()` 拉取，mock 模式读取 `catalog.json` 的 `referral`，字段包括邀请码 `code`（种子 XJ8K86）、活动规则 `rule`、已到账奖励 `totalReward`、待结算奖励 `pendingReward` 与邀请记录数组 `invited`（每项含 `company`、`time`、`status`、`reward`、`settled`）
- 接口返回前本地 data `referral` 为 `null`

## 交互说明

| 操作       | 触发             | 行为                                                                                                                                                                                                                                                       |
| ---------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 复制邀请码 | 点击"复制邀请码" | `copyCode` 优先在安全上下文使用 `navigator.clipboard.writeText`，成功后全局提示"邀请码已复制"；Clipboard API 不可用或抛错时走 `fallbackCopy`，通过临时隐藏 `textarea` 选中 + `document.execCommand('copy')` 兜底；仍失败则提示"邀请码：{code}"便于手动复制 |
| 奖励统计   | 静态展示         | 已到账奖励以绿色显示 `totalReward`，待结算奖励以金色小字显示 `pendingReward`                                                                                                                                                                               |
| 邀请记录表 | 渲染 `invited`   | 列：企业名称、时间、状态、奖励、到账；状态徽章：已签约 `green`、已注册 `gold`、已浏览用默认徽章；奖励为 0 显示"待发放"；`settled` 为 true 显示"已到账"否则"待结算"                                                                                         |

## 依赖的组件或工具

- `businessApi`：`@/api` 的推荐有礼接口
- Vuex：`commit('setNotice')` 全局轻提示
- 全局样式类：`card`、`price-panel`、`order-line`、`item-table`、`badge`、`green`、`gold`、`empty`、`alert`、`btn`
- 组件声明为 `{ name: 'Page' }`

## 状态与边界

- 接口返回前 `referral` 为 `null`，整块活动内容使用 `v-if` 不渲染（无骨架/占位）
- 邀请记录为空时表格下方显示"暂无邀请记录。"
- 复制仅写入系统剪贴板，不建立推荐关系、不触发发奖；活动资格、奖励结算以正式营销接口为准
