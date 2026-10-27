# 积分商城（points-mall.vue）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/views/points-mall.vue` |
| 路由地址 | `/points-mall` |
| 路由名称 | `points-mall` |
| 业务分组 | 积分与营销 |
| 页面标题 | 积分商城 |

## 页面作用

展示当前演示积分余额，并以商品网格列出所有支持积分兑换的商品；点击商品图片或"查看兑换"按钮进入积分商品详情页。

## 数据来源

全部来自 Vuex，无独立接口调用：

- `state.points`：演示积分余额（仓库初始值为 2300，正式环境应由积分接口提供）
- `state.products`：商品目录（应用启动时 `bootstrap` 从接口或 mock 载入），本页过滤出带 `exchange` 积分价字段的商品
- 商品图片路径通过领域工具 `asset(path)` 拼接

## 交互说明

| 操作 | 触发 | 行为 |
| --- | --- | --- |
| 查看兑换商品 | 点击商品图片 | 跳转 `/points-detail?id={商品id}` |
| 查看兑换商品 | 点击"查看兑换"按钮 | 跳转 `/points-mall` 同款链接 `/points-detail?id={商品id}` |

## 依赖的组件或工具

- `asset(path)`：来自 `@/domain/productFields`，拼接静态资源路径
- `router-link`：商品图片与按钮的详情页跳转
- 样式类：`product-grid`、`product-card`、`price gold` 等全局类

## 状态与边界

- 页头已明确标注"积分规则需接口确认"，积分获取、扣减、冻结、有效期等规则均待正式积分接口
- 可兑换商品完全由 mock/接口商品数据中的 `exchange` 字段决定，无该字段的商品不会展示
- 积分余额为写死的演示数据（2300），兑换流程不会实际扣减积分
