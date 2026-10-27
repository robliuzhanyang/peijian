# 确认积分兑换（points-confirm.vue）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/views/points-confirm.vue` |
| 路由地址 | `/points-confirm` |
| 路由名称 | `points-confirm` |
| 业务分组 | 积分与营销 |
| 页面标题 | 确认积分兑换 |

## 页面作用

兑换确认页：核对兑换商品名称、所需积分与收货地址；在有地址且积分余额足够时允许点击"模拟兑换"，提交后写入一条演示提示并跳转积分明细页。

## 数据来源

- `getters.product(id)`：按 `route.query.id`（未传时默认 `'kit'`）在 `state.products` 中查找兑换商品
- `state.addresses[0]`：收货地址取地址列表第一条；无记录时为 `undefined`，页面提示"请先添加地址"
- `state.points`：演示积分余额，模板中直接与商品 `exchange` 积分价比较

## 交互说明

| 操作 | 触发 | 行为 |
| --- | --- | --- |
| 模拟兑换 | 点击"模拟兑换"按钮 | 提交 `setNotice` 提示"演示兑换已记录，正式兑换需积分接口核算"，并跳转 `/points-ledger` |
| 按钮禁用 | 无收货地址 | `!address` 为真，按钮禁用 |
| 按钮禁用 | 演示余额小于所需积分 | `state.points < product.exchange` 为真，按钮禁用 |
| 商品不存在 | 路由 id 未命中商品 | 渲染"积分商品不存在"空态 |

## 依赖的组件或工具

- Vuex `getters.product`、`state.addresses`、`state.points`
- mutation `setNotice`：写入全局轻提示（App.vue 监听展示）
- `router.push`：兑换后跳转积分明细页

## 状态与边界

- "模拟兑换"不扣减积分、不生成真实兑换单，仅做页面跳转演示
- 地址只取列表第一条，页内没有选择/切换地址的能力，也没有新增地址入口
- 积分余额、兑换资格、库存与收货规则均待正式积分/订单接口核算，页头已声明"以服务端为准"
