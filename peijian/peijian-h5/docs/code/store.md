# Vuex 状态仓库（store/index.js · H5 版）

| 项目     | 说明                                          |
| -------- | --------------------------------------------- |
| 文件路径 | `src/store/index.js`                          |
| 持久化键 | `xinjian-h5-v3`（localStorage，与 PC 端隔离） |

## 演示种子数据合并（重要）

首次打开（含旧版本地数据）时，store 会把 `catalog.json` 的种子数据与 localStorage 本地数据按 id 合并去重：

- `orders` ← `demo.orders`（8 笔覆盖各状态的订单链路）
- `cart` ← `demo.seedCart`（2 个行项）
- `favorites` ← `demo.seedFavorites`、`addresses` ← `demo.seedAddresses`（3 条）
- `points` / `authStatus` 初值取 `demo.profile`

首次任意写操作持久化时会写入 `seeded: true` 标记；之后刷新完全以本地数据为准，因此下单清空购物车等操作不会被种子"复活"。新下单的订单继续 `unshift` 置顶，与种子订单共存。

## state 一览

| 状态                             | 持久化 | 说明                                                                             |
| -------------------------------- | ------ | -------------------------------------------------------------------------------- |
| products / categories / packages | 否     | 接口或 mock 载入的目录数据                                                       |
| cart                             | 是     | 购物车行项（id、productId、name、model、skuCode、unitPriceFen、quantity、image） |
| orders                           | 是     | 订单列表，新订单 unshift 置顶                                                    |
| favorites                        | 是     | 收藏商品 id 数组                                                                 |
| addresses                        | 是     | 收货地址，首次有一条演示默认地址                                                 |
| selected                         | 是     | 模块化选配选中的部品 id                                                          |
| selectedScheme                   | 是     | 选定的真实组合快照（组合直选 / 自定义调整写入，无则 null）                       |
| checkoutItems                    | 否     | 结算页使用的购物车快照                                                           |
| lastOrder                        | 否     | 最近下单结果（支付页兜底）                                                       |
| points / authStatus              | 否     | 演示积分 2300、认证状态"待认证"                                                  |
| notice                           | 否     | 全局轻提示                                                                       |
| mobileCatalog                    | 否     | H5 列表查询条件（keyword、categoryId、cursor 游标）                              |

## getters

- `product(id)`：按 id 查商品
- `cartTotal`：合计金额（分）
- `cartCount`：合计件数
- `money`：暴露金额格式化函数

## 关键 mutations

- `addCart`：三重校验（buyable / 价格 / SKU；规格库存），同 SKU 累加数量，通过后持久化并提示
- `updateQty` / `removeCart`：数量修改（最小 1）与删除
- `setCheckout` / `addOrder`：结算快照与下单后清空
- `toggleFavorite` / `addAddress` / `setAuth` / `setOrderStatus`
- `setSelected` / `setSelectedScheme`：写入选配部品 id 与真实组合快照，写入即持久化
- 所有写操作均通过 `persist()` 同步 localStorage

## 真实组合快照（selectedScheme）

- 来源一·真实组合直选：原组合对象 spread，附合并后的 `parts`（core + extras，每行 `{ module, id, qty, section }`）
- 来源二·自定义调整：基础组合 spread，名称追加「（自定义调整）」后缀，`customized: true`，`parts` 按所属模块的 `section`（core/extras）重建
- `diy-confirm.vue`、`quote.vue` 统一依据 `parts[].section` 做「主体构成 / 配套附件」两层渲染；无快照（null）时回退为按 `selected` 逐行展示
- 17 套真实组合（C01–C17）的部品全部为客户资料（`buyable:false、priceFen:null`），确认页与报价单合计统一显示「待报价」
- 持久化内容包含 `selected`、`selectedScheme` 与 `seeded` 标记

## actions

- `bootstrap`：并发拉取商品/分类/套装
- `loadMore`：按游标追加并去重商品（H5 分页加载）
- `productDetail`：本地优先、未命中请求接口
- `submitOrder`：以结算快照或购物车组装订单，调用 ordersApi 后清空购物车
