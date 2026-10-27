# 确认订单（checkout.vue）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/views/checkout.vue` |
| 路由地址 | `/checkout` |
| 路由名称 | `checkout` |
| 业务分组 | 交易与履约 |
| 页面标题 | 确认订单 |

## 页面作用

下单前核对收货地址与购买明细（产品型号、SKU、数量、行项小计），可填写选填的采购备注，提交订单后携带新订单号跳转"订单支付"页。

## 数据来源

全部来自 Vuex，无页面独立接口调用：

- `state.addresses`：收货地址列表；无记录时 store 内置一条演示默认地址
- `state.checkoutItems`：购物车点击"去结算"时写入的行项快照；该数组为空时回退使用 `state.cart`
- 合计金额：页面前端按行项 `unitPriceFen × quantity` 累加得到（分）
- 下单：`dispatch('submitOrder', { addressId, remark })`；mock 模式生成 `H5-DEMO-` 前缀订单号、状态为"待付款"，成功后订单置顶并清空购物车与结算快照

## 交互说明

| 操作 | 触发 | 行为 |
| --- | --- | --- |
| 选择收货地址 | 点击地址按钮 | 写入本地 `addressId`，当前项高亮 |
| 新增地址 | 点击"新增地址" | 跳转 `/address-edit` |
| 填写采购备注 | 文本框输入 | `v-model` 双向绑定 `remark` |
| 提交订单 | 点击"提交订单" | 置 `busy` 防重复提交；dispatch 成功后带 `id` 跳转 `/pay`，失败 commit `setNotice` 全局提示 |

提交按钮在"无可结算商品 / 未选择地址 / 提交中"任一条件成立时禁用。

## 依赖的组件或工具

- `money(fen)`、`fieldValue(value)`：来自 `@/domain/productFields`，金额格式化与空字段占位
- Vuex：`state.addresses`、`state.checkoutItems`、`state.cart`，action `submitOrder`，mutation `setNotice`
- vue-router：跳转地址编辑页与支付页

## 状态与边界

- 没有可结算商品时商品清单区显示"没有可结算商品"空态
- `created` 阶段默认选中第一条地址；地址列表为空时不预选，提交按钮保持禁用
- 页面金额为前端演示累加结果，文案明确"正式下单由后端核价、核库存"
