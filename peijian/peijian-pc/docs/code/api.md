# 接口层（api/index.js · PC 版）

| 项目        | 说明                                                   |
| ----------- | ------------------------------------------------------ |
| 文件路径    | `src/api/index.js`                                     |
| HTTP 客户端 | axios 实例，baseURL 默认 `/api/pc`，超时 10 秒         |
| 数据开关    | `VUE_APP_DATA_MODE=mock` 走本地 JSON；`api` 走真实后端 |

## productsApi

| 方法         | mock 行为                                                     | 真实接口            |
| ------------ | ------------------------------------------------------------- | ------------------- |
| list(query)  | 按 q（名称/型号/编码/系列）与 cat 过滤，返回 `{items, total}` | GET `/products`     |
| detail(id)   | 按 id 查 catalog.json，未命中返回 null                        | GET `/products/:id` |
| categories() | 返回演示分类树                                                | GET `/categories`   |
| packages()   | 返回演示套装                                                  | GET `/packages`     |

## ordersApi

- `list()`：mock 返回 `catalog.json` 的 `orders` 种子订单；真实接口 GET `/orders`
- `detail(id)`：订单详情；真实接口 GET `/orders/:id`
- `submit(payload)`：mock 返回 `DEMO-时间戳` 订单号、状态"待付款"；真实接口 POST `/orders`

## businessApi（交易后业务线）

mock 全部读取 `catalog.json` 对应键，真实接口统一挂 `/business` 前缀：

| 方法                               | mock 数据键                          | 真实接口                         |
| ---------------------------------- | ------------------------------------ | -------------------------------- |
| profile()                          | profile                              | GET /business/profile            |
| companies()                        | companies                            | GET /business/companies          |
| authFlow()                         | authFlow                             | GET /business/auth-flow          |
| logistics(orderId)                 | logistics[orderId]，未发货返回 null  | GET /business/logistics/:orderId |
| contracts() / contractDetail(id)   | contracts（支持合同号或订单号查询）  | GET /business/contracts(/:id)    |
| invoices() / invoiceDetail(id)     | invoices                             | GET /business/invoices(/:id)     |
| aftersales() / aftersaleDetail(id) | aftersales（支持工单号或订单号查询） | GET /business/aftersales(/:id)   |
| messages()                         | messages                             | GET /business/messages           |
| pointsLedger()                     | pointsLedger                         | GET /business/points-ledger      |
| referral()                         | referral                             | GET /business/referral           |
| support()                          | support                              | GET /business/support            |

## 与 H5 端差异

- 接口前缀 `/api/pc`（H5 为 `/api/h5`）
- 列表参数为 q/cat 分页式，响应含 total；mock 订单号前缀为 `DEMO-`（H5 为 `H5-DEMO-`）

## 环境配置

| 文件             | DATA_MODE | API_BASE_URL |
| ---------------- | --------- | ------------ |
| .env.development | mock      | /api/pc      |
| .env.sit         | api       | /api/pc      |
| .env.production  | mock      | /api/pc      |
