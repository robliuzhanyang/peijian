# 商品详情（detail.vue）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/views/detail.vue` |
| 路由地址 | `/detail`（query 参数 `id`，缺省 `columnStandard`） |
| 路由名称 | `detail` |
| 业务分组 | 选型与采购 |
| 页面标题 | 商品详情 |

## 页面作用

商品详情页：展示面包屑、主图与透视图/五视图切换、客户资料或演示商品角标、系列/产品型号/可售 SKU、参考价格与库存、多规格（SKU）选择、客户资料完整字段区块以及相关产品；可售商品支持加入购物车，不可售商品引导咨询报价，并支持收藏切换。

## 数据来源

- `getters.product(id)`：按路由 `query.id` 查找商品，未传 id 时使用演示商品 `columnStandard`
- `state.favorites`：收藏 id 列表，计算属性 `favorite` 判定当前商品是否已收藏
- `state.products`：计算属性 `related` 过滤同分类（`cat`）且非自身的商品，取前 4 件
- 视图切换项 `viewChoices` 由商品自身的 `perspective` 与领域常量 `viewFields`（正视/侧视/背面/下视/上视）组合生成
- 商品不存在时整页渲染空态

## 交互说明

| 操作 | 触发 | 行为 |
| --- | --- | --- |
| 切换视图 | 点击透视图/五视图按钮 | 设置 `activeImage`，主图随之切换；缺图按钮显示「待提供」 |
| 选择规格 | 点击某个 SKU 按钮 | 设置 `selectedSku`，参考价格切换为该 SKU 价格 |
| 加入购物车 | 点击「加入购物车」（仅 `buyable`） | 提交 `addCart`（携带商品与选中 SKU，可售与库存校验在 mutation 内） |
| 查看购物车 | 点击「查看购物车」（仅 `buyable`） | 跳转 `/cart` |
| 咨询报价 | 点击「咨询报价」（不可售商品） | 跳转 `/support` |
| 收藏切换 | 点击「收藏资料」/「已收藏」 | 提交 `toggleFavorite`，结果持久化到 localStorage |
| 查看相关商品 | 点击相关商品卡片 | 由 `ProductCard` 跳转对应 `/detail?id=` |

## 依赖的组件或工具

- `ProductFields`（`@/components/ProductFields.vue`）：客户资料字段区块（实物参数、工程文件等）
- `ProductCard`（`@/components/ProductCard.vue`）：相关产品卡片
- `money(fen)`、`asset(path)`、`fieldValue(value)`（`@/domain/productFields`）：金额、资源路径与空字段占位
- `viewFields`（同文件）：五视图字段定义
- Vuex mutation：`addCart`、`toggleFavorite`

## 状态与边界

- 商品 id 不存在时显示「商品不存在。」并提供返回列表链接
- 不可售商品（`buyable` 为假）隐藏加购与购物车入口，显示「未提供可售 SKU、价格和库存，此商品不能下单。」
- 价格随选中 SKU 切换；库存为 `null` 时显示「待确认」
- 价格、库存与多视图图片均为原型演示数据，正式信息以后端接口为准
