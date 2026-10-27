# 套装编辑（package-detail.vue）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/views/package-detail.vue` |
| 路由地址 | `/package-detail`（query 参数 `id`，缺省 `PK1`） |
| 路由名称 | `package-detail` |
| 业务分组 | 选型与采购 |
| 页面标题 | 套装编辑 |

## 页面作用

套装详情/配置查看页：左侧「配置清单」逐行展示套装内商品的图片、名称、产品型号、可售 SKU 与数量，并提供单品详情入口；右侧「套装信息」展示套装简介、套装价与演示提示，可携带套装 id 跳转报价单。

## 数据来源

- `state.packages`：计算属性 `bundle` 按路由 `query.id`（缺省 `PK1`）查找当前套装；套装 `items` 每项为 `[商品id, SKU, 数量]` 结构
- `getters.product(id)`：方法 `part(id)` 解析清单中的商品；未命中时返回 `{ image: 'machine.svg', name: '待加载', skuCode: null }` 占位
- 清单行优先显示套装指定的 SKU（`item[1]`），为空时回退商品自身 `skuCode`

## 交互说明

| 操作 | 触发 | 行为 |
| --- | --- | --- |
| 查看单品详情 | 点击清单行「详情」 | 跳转 `/detail?id=商品id` |
| 生成报价单 | 点击「生成报价单」 | 跳转 `/quote?bundle=套装id` |

## 依赖的组件或工具

- `money(fen)`：套装价格式化
- `asset(path)`：商品图片路径
- `fieldValue(value)`：型号/SKU 空值显示「待补充」
- `getters.product`：按 id 解析套装内商品

## 状态与边界

- 未找到套装时整页显示「套装不存在」
- 页面标注「套装配置及价格仅用于原型演示」，正式配置需后端校验兼容性与报价
- 本页仅查看配置，不含增删替换套装部件的编辑交互；跳往报价单时携带的 `bundle` 参数是否被报价页使用以报价页实现为准
