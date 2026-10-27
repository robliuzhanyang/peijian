# 订单详情（order-detail.vue）

| 项目     | 说明                         |
| -------- | ---------------------------- |
| 文件路径 | `src/views/order-detail.vue` |
| 路由地址 | `/order-detail`              |
| 路由名称 | `order-detail`               |
| 业务分组 | 交易与履约                   |
| 页面标题 | 订单详情                     |

## 页面作用

展示单个订单的完整信息：订单信息卡（下单时间、支付方式、收货地址全称、采购备注，已取消订单另展示取消原因）、订单状态与商品明细（名称、型号、SKU、数量、小计）、合计金额，并在右栏集中提供物流、合同、开票、售后等履约操作入口；待付款订单额外出现"继续支付"。

## 数据来源

- `state.orders`：按路由 `query.id` 精确查找当前订单；订单首次加载时由 `catalog.json` 的 `orders` 种子与本地订单按 id 合并，并写入 localStorage 持久化
- `state.addresses`：computed `addressText` 按 `order.addressId` 反查地址簿，展示 `full` 地址全称；地址簿种子来自 `catalog.json` 的 `seedAddresses`
- `getters.product(id)`：按行项 `productId` 反查商品目录获取名称；查不到时直接回显 id
- 金额取行项 `unitPriceFen × quantity` 与订单快照 `totalFen`，经 `money` 格式化；空字段经 `fieldValue` 统一显示"待补充"

## 交互说明

| 操作     | 触发                                   | 行为                                                                         |
| -------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| 下单时间 | 信息卡展示                             | 取 `order.createdAt`，为空时经 `fieldValue` 显示"待补充"                     |
| 支付方式 | 信息卡展示                             | 取 `order.payMethod`，为空（未支付）时显示"待支付"                           |
| 收货地址 | 信息卡与右栏"地址"                     | 按 `addressId` 从 `state.addresses` 取 `full` 全称；查不到时回显地址 id      |
| 采购备注 | 信息卡展示                             | 仅当 `order.remark` 非空时渲染该行，直接展示备注全文                         |
| 取消原因 | 信息卡底部                             | 仅当状态为"已取消"且存在 `cancelReason` 时，以 `alert` 样式展示"取消原因：…" |
| 查看物流 | 点击"查看物流"                         | 携带订单 id 跳转 `/logistics`                                                |
| 查看合同 | 点击"查看合同"                         | 携带订单 id 跳转 `/contract-detail`                                          |
| 申请开票 | 点击"申请开票"                         | 携带订单 id 跳转 `/invoice-apply`                                            |
| 申请售后 | 点击"申请售后"                         | 携带订单 id 跳转 `/aftersale-apply`                                          |
| 继续支付 | 点击"继续支付"（仅 `待付款` 状态显示） | 携带订单 id 跳转 `/pay`                                                      |

## 依赖的组件或工具

- `money(fen)`、`fieldValue(value)`：来自 `@/domain/productFields`
- Vuex：`state.orders`、`state.addresses` 与 getter `product`
- vue-router：跳转物流、合同、开票、售后、支付各页

## 状态与边界

- 按 id 找不到订单时页头显示"未找到订单"，正文显示"订单不存在"空态及返回订单列表入口
- 收货地址依赖 `addressId` 与地址簿匹配；地址簿中没有对应 id 时回显 id 本身，不虚构地址文案
- 各履约入口不校验前置条件（如未付款也可点开票/售后），具体资格以对应页面或后端为准
- mock 模式订单、地址均为 `catalog.json` 种子数据，正式数据以接口返回为准
