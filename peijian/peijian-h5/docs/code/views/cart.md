# 购物车（cart.vue）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/views/cart.vue` |
| 路由地址 | `/cart` |
| 路由名称 | `cart` |
| 业务分组 | 交易与履约 |
| 页面标题 | 购物车 |

## 页面作用

展示已加入购物车的商品行项，核对产品型号、可售 SKU、数量与演示单价，支持数量加减、手动改数量、移除商品，确认无误后跳转"确认订单"页。

## 数据来源

全部来自 Vuex，无独立接口调用：

- `state.cart`：购物车行项列表，每行含 `id`、`productId`、`name`、`model`、`skuCode`、`unitPriceFen`、`quantity`、`image`
- `getters.cartTotal`：合计金额（分），按 `单价 × 数量` 累加
- `getters.cartCount`：合计件数

## 交互说明

| 操作 | 触发 | 行为 |
| --- | --- | --- |
| 数量加减 | 点击 `−` / `+` | 提交 `updateQty`，数量最小为 1 |
| 手动改数量 | 输入框 `change` | 提交 `updateQty`，非法输入回退为 1 |
| 移除商品 | 点击"移除" | 提交 `removeCart`，按行项 id 删除并持久化 |
| 去结算 | 点击"去结算" | 把购物车数组浅拷贝写入 `state.checkoutItems`，跳转 `/checkout` |

## 依赖的领域工具

- `money(fen)`：分转人民币展示，空值显示"待报价"
- `asset(path)`：拼接静态资源路径
- `fieldValue(value)`：空字段统一显示"待补充"

## 状态与边界

- 购物车为空时展示空态，并提供"去选购"链接
- 结算栏仅在有商品时渲染
- 页面价格为原型演示数据，正式金额以下单时后端核价为准
