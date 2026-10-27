# 常用套装与方案（favorites.vue）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/views/favorites.vue` |
| 路由地址 | `/favorites` |
| 路由名称 | `favorites` |
| 业务分组 | 积分与营销 |
| 页面标题 | 常用套装与方案 |

## 页面作用

以商品卡片网格展示当前用户收藏的产品资料（常用套装与方案）；没有任何收藏时展示空态，并提供"浏览产品"链接跳转产品列表。

## 数据来源

全部来自 Vuex，无独立接口调用：

- `state.favorites`：已收藏的商品 id 列表，写入 localStorage（键 `xinjian-h5-v3`）持久化
- `state.products`：商品目录，本页从中筛出 id 命中收藏列表的商品
- 收藏的增删由 mutation `toggleFavorite` 在商品详情/卡片等位置触发，本页只负责展示

## 交互说明

| 操作 | 触发 | 行为 |
| --- | --- | --- |
| 浏览收藏商品 | 点击卡片图片或名称（ProductCard 内） | 跳转 `/detail?id={商品id}` |
| 加入购物车 | 点击卡片"加入购物车"（仅可售商品） | ProductCard 内提交 `addCart` |
| 查看资料 / 咨询报价 | 点击卡片次级按钮（不可售商品） | ProductCard 内跳转 `/detail?id={商品id}` |
| 空态浏览产品 | 点击"浏览产品" | 跳转 `/goods` |

## 依赖的组件或工具

- `ProductCard`（`@/components/ProductCard.vue`）：统一商品卡片，必传 prop `product`；内部依赖 `money`、`fieldValue`、`asset` 领域工具及 `addCart` mutation
- 全局样式类：`product-grid`、`empty`

## 状态与边界

- 收藏列表为空时网格不渲染任何卡片，仅显示空态提示
- 本页不提供取消收藏入口，收藏切换发生在 ProductCard 之外的其他页面（`toggleFavorite`）
- 若已收藏的商品 id 未出现在当前已载入的 `state.products` 中，对应卡片不会显示
- 页面标题为"常用套装与方案"，当前实现内容等同"收藏的商品列表"，套装/方案维度待后续完善
