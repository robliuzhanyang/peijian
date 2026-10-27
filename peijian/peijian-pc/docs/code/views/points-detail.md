# 积分商品详情（points-detail.vue）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/views/points-detail.vue` |
| 路由地址 | `/points-detail` |
| 路由名称 | `points-detail` |
| 业务分组 | 积分与营销 |
| 页面标题 | 积分商品详情 |

## 页面作用

展示单个积分兑换商品的图片、名称、产品型号、可售 SKU、兑换所需积分及当前演示余额，并提供"去兑换"入口跳转确认积分兑换页；商品不存在时展示空态。

## 数据来源

- `getters.product(id)`：按 id 在 `state.products` 中查找商品
- `route.query.id`：路由查询参数指定商品 id；未传时默认 `'kit'`
- `state.points`：模板中直接读取的演示积分余额
- `asset(path)`、`fieldValue(value)`：来自 `@/domain/productFields`，分别用于图片路径拼接与空字段占位（"待补充"）

## 交互说明

| 操作 | 触发 | 行为 |
| --- | --- | --- |
| 去兑换 | 点击"去兑换"按钮 | 跳转 `/points-confirm?id={商品id}` |
| 商品不存在 | 路由 id 未命中商品 | 渲染"积分商品不存在"空态 |

## 依赖的组件或工具

- `getters.product`：Vuex getter，按 id 查找商品
- `asset(path)` / `fieldValue(value)`：领域工具
- 样式类：`detail-hero`、`detail-image`、`detail-summary`、`catalog-model`、`price gold`

## 状态与边界

- 商品查找仅依赖已载入的 `state.products`（本地目录），未命中不会再请求接口
- 页面只展示积分价与演示余额，不在此页校验余额是否足够（校验在确认兑换页进行）
- 积分余额与兑换规则均为演示数据，以服务端正式接口为准
