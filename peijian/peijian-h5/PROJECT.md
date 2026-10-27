# 鑫戩配件商城 H5 端项目说明

> 工程目录：`peijian-h5/`
> 技术栈：Vue 2.6.11 + Vue Router 3.3.4（hash 模式）+ Vuex 3.5.1 + Axios 0.19.2 + Vue CLI 4.4.6 / Webpack 4
> 定位：工业激光打标设备与配件一站式直采商城的移动端 H5，与 PC 端业务对称、独立维护。当前为高保真原型，内置 mock 数据可完整走通全部业务，API 已按业务域拆分，切换 `dataMode=api` 即可对接真实后端。

---

## 1. 目录结构

```text
peijian-h5/
├─ public/
│  ├─ index.html              # HTML 模板（#app 挂载点）
│  ├─ config.js               # 运行时配置 window.__XJ_CONFIG__（部署后可改，免重新构建）
│  └─ assets/                 # 不经过 Webpack 处理的静态资源（SVG 图示、字体、客户场景图）
├─ src/
│  ├─ main.js                 # 应用入口：组装根实例、按序加载全局样式、输出环境信息
│  ├─ App.vue                 # 根组件：吸顶头部 / router-view / 底部 Tab / 客服抽屉 / 全局轻提示
│  ├─ config/
│  │  └─ env.js               # 环境解析（APP_ENV / DATA_MODE / API_BASE_URL / token）
│  ├─ api/
│  │  └─ http.js              # Axios 实例：baseURL、Bearer token、响应解包、401 跳登录
│  ├─ domain/                 # 跨模块共享的领域常量与工具
│  │  ├─ platform.js          # 我方平台公司信息（合同 / 发票 / 售后的"乙方"来源）
│  │  └─ productFields.js     # 商品字段格式化（money 分→¥ 等）
│  ├─ mock/
│  │  └─ catalog.json         # 全量 mock 种子数据（商品、分类、订单、物流、推荐、认证等）
│  ├─ store/
│  │  └─ index.js             # Vuex：全局状态、localStorage 持久化、bootstrap 引导、本地 CRUD
│  ├─ router/
│  │  └─ index.js             # 路由表（含 meta.title、登录守卫）
│  ├─ components/             # 全局公共组件（见第 4 节）
│  │  ├─ UiIcon.vue
│  │  ├─ FloatQuick.vue
│  │  ├─ ProductCard.vue
│  │  ├─ ProductContent.vue
│  │  └─ QrCode.vue
│  ├─ styles/                 # 全局样式（按顺序在 main.js 引入）
│  │  ├─ v12.css              # 设计令牌与基础组件样式
│  │  ├─ product-fields.css   # 商品资料 / 字段行样式
│  │  ├─ app.css              # 页面排版与全部业务页面样式（含合同文档样式与 .app.h5 窄版降级）
│  │  └─ xj-sans.woff         # 自定义字体
│  └─ modules/                # 业务模块（按业务域拆分，见第 2 节）
│     ├─ product/             # 商品域：首页 / 分类 / 列表 / 搜索 / 详情 + api.js
│     ├─ trade/               # 交易域：购物车 / 结算 / 支付 / 订单 / 物流 + api.js
│     ├─ selection/           # 选型域：一站式选配 / 报价单 / 套装 + api.js
│     ├─ billing/             # 票据域：合同 / 发票 + api.js + md 模板
│     ├─ marketing/           # 营销域：积分商城 / 积分流水 / 推荐有礼 + api.js
│     ├─ service/             # 服务域：客户支持 / 售后工单 + api.js
│     ├─ account/             # 账号域：登录注册 / 我的 / 企业 / 地址 / 消息 + api.js
│     └─ learning/            # 内容域：学习中心 / 文章（直接读 mock，无 api.js）
├─ .env.development           # 本地开发：mock + /api/h5
├─ .env.mock                  # 静态演示包：mock + /api/h5
├─ .env.sit                   # 测试环境：api + /api/h5
├─ .env.production            # 正式环境：api + /api/h5
├─ vue.config.js              # Vue CLI 配置（相对路径、端口 8003、关闭 sourcemap/lint）
├─ babel.config.js            # Babel 配置
└─ package.json               # 依赖与脚本
```

模块内部统一结构（以 billing 为例）：

```text
modules/billing/
├─ api.js                     # 业务 API：mock / 真实接口双分支（对接后端只改这里）
├─ contractTemplate.js        # 合同 md 模板（mock 时使用，真实环境由后端下发）
├─ components/
│  └─ ContractSeal.vue        # 模块私有组件：SVG 合同专用章
├─ domain/
│  ├─ markdown.js             # 轻量 Markdown 渲染器
│  └─ contractRender.js       # 合同装配：占位替换、明细表、金额大写
└─ views/                     # 页面（与路由一一对应）
   ├─ contracts.vue
   ├─ contract-detail.vue
   ├─ invoices.vue
   ├─ invoice-apply.vue
   └─ invoice-detail.vue
```

---

## 2. 页面功能清单

路由为 hash 模式，访问形如 `http://localhost:8003/#/contracts`。移动端页面为一级扁平路由（无 PC 的 `/user` 父级外壳）。

### 2.1 product 商品域（`src/modules/product/`）

| 页面文件 | 路由 | 功能 | API 对接 |
| --- | --- | --- | --- |
| views/home.vue | `/home` | 首页：搜索栏、轮播图、分类入口、精选商品与品类楼层 | 无（Vuex，store bootstrap 调 productsApi） |
| views/categories.vue | `/categories` | 商品分类：左侧分类树、右侧对应分类商品，支持搜索或进详情 | 无（Vuex） |
| views/goods.vue | `/goods` | 分类商品列表：按 query 参数展示商品卡片、价格与加购入口 | 无（Vuex） |
| views/search.vue | `/search` | 搜索页：关键词输入、热门搜索词、结果列表，按钮 搜索 / 清空 | 无（Vuex） |
| views/detail.vue | `/detail` | 商品详情：图集、亮点、规格参数与富文本介绍，按钮 加购 / 立即购买 | 无（Vuex） |

### 2.2 trade 交易域（`src/modules/trade/`）

| 页面文件 | 路由 | 功能 | API 对接 |
| --- | --- | --- | --- |
| views/cart.vue | `/cart` | 购物车：方案行与商品行数量步进、移除，空态引导选购，按钮 去结算 | 无（Vuex） |
| views/checkout.vue | `/checkout` | 确认订单：选择地址、商品清单、采购备注，按钮 新增地址 / 提交订单 | dispatch `submitOrder`（内部调 ordersApi.submit） |
| views/pay.vue | `/pay` | 订单支付：对公转账 / 线上支付说明，按钮 确认已支付 / 支付遇到问题 | 无（Vuex） |
| views/pay-success.vue | `/pay-success` | 支付成功结果页：按 pending 展示到账或待核款文案，按钮 查看订单 / 首页 | 无（纯展示） |
| views/pay-failed.vue | `/pay-failed` | 支付未完成结果页，按钮 查看订单 / 返回首页 | 无（纯展示） |
| views/orders.vue | `/orders` | 我的订单：状态胶囊筛选 + 订单卡片，按钮 取消 / 催发货 / 确认收货 / 详情 | 无（Vuex） |
| views/order-detail.vue | `/order-detail` | 订单详情：状态、订单信息、商品明细合计，按状态显示履约操作按钮 | 无（Vuex） |
| views/logistics.vue | `/logistics` | 物流跟踪：公司、运单号、倒序轨迹时间线，按钮 返回订单 | tradeApi.logistics |

### 2.3 selection 选型域（`src/modules/selection/`）

| 页面文件 | 路由 | 功能 | API 对接 |
| --- | --- | --- | --- |
| views/diy.vue | `/diy` | 一站式选配：8 步选型 + 联动计价，商城商品选择 / 详情以内置底部抽屉实现，按钮 加入购物车 / 生成报价单 / 立即购买 | oneStopApi.catalog、saveDraft（经 oneStopMixin） |
| views/diy-confirm.vue | `/diy-confirm` | 配置确认：主体 / 附件两层明细与小计，按钮 加购 / 报价单 / 立即购买 | 无（Vuex） |
| views/quote.vue | `/quote` | 正式报价单：双方抬头、明细表、合计大写、不含印章的落款区（报价人下方为报价日期），按钮 导出图片 / 导出 PDF | 无（本地 quoteImage 导出） |
| views/package-detail.vue | `/package-detail` | 套装配置清单：逐行型号、SKU、数量，按钮 查看细节 / 生成报价单 | 无（Vuex） |
| views/package.vue | `/package` | 历史兼容页：created 自动 replace 跳转 `/diy?entry=package` | 无（路由跳转） |

### 2.4 billing 票据域（`src/modules/billing/`）

| 页面文件 | 路由 | 功能 | API 对接 |
| --- | --- | --- | --- |
| views/contracts.vue | `/contracts` | 合同列表：编号、金额、状态 + 可申请合同订单区，按钮 查看合同 / 申请合同 | contractApi.list、create |
| views/contract-detail.vue | `/contract-detail` | 合同详情：后端 md 渲染、双方主体回填、自动盖电子章，按钮 确认签署 / 下载合同 | contractApi.detail、template、sign、create |
| views/invoices.vue | `/invoices` | 发票列表：抬头、金额、状态，按钮 查看详情 / 去申请开票 | invoiceApi.list |
| views/invoice-apply.vue | `/invoice-apply` | 申请开票：填写抬头、税号等表单，按钮 提交开票申请 | 无（Vuex commit） |
| views/invoice-detail.vue | `/invoice-detail` | 发票详情：发票信息与关联订单，按钮 返回列表 | invoiceApi.detail |

### 2.5 marketing 营销域（`src/modules/marketing/`）

| 页面文件 | 路由 | 功能 | API 对接 |
| --- | --- | --- | --- |
| views/points-mall.vue | `/points-mall` | 积分商城：积分余额与可兑换商品列表，点击进入商品详情 | 无（Vuex） |
| views/points-detail.vue | `/points-detail` | 积分商品详情：亮点、规格参数、兑换须知，按钮 立即兑换 | 无（Vuex） |
| views/points-confirm.vue | `/points-confirm` | 兑换确认：商品、收货地址、所需积分，按钮 确认兑换 | 无（Vuex） |
| views/points-ledger.vue | `/points-ledger` | 积分明细：收支流水的时间、数额与说明 | marketingApi.pointsLedger |
| views/referral.vue | `/referral` | 推荐有礼：推荐规则、专属链接与奖励记录，按钮 复制链接 | marketingApi.referral |

### 2.6 service 服务域（`src/modules/service/`）

| 页面文件 | 路由 | 功能 | API 对接 |
| --- | --- | --- | --- |
| views/support.vue | `/support` | 客户支持：热线、邮箱、微信二维码与快捷入口，按钮 复制微信号 | serviceApi.support |
| views/aftersales.vue | `/aftersales` | 售后页：上部我的工单（撤回 / 查看进度），下部按订单发起售后 | serviceApi.aftersales |
| views/aftersale-apply.vue | `/aftersale-apply` | 申请售后：关联订单摘要 + 类型 / 描述 / 附件表单，按钮 提交申请 | 无（Vuex commit） |
| views/aftersale-detail.vue | `/aftersale-detail` | 售后进度：工单信息、问题描述与处理进度时间线，按钮 返回 | serviceApi.aftersaleDetail |

### 2.7 account 账号域（`src/modules/account/`）

| 页面文件 | 路由 | 功能 | API 对接 |
| --- | --- | --- | --- |
| views/login.vue | `/login` | 账号登录表单（手机号、密码），按钮 登录 / 去注册，成功跳回来源页 | authApi.login |
| views/register.vue | `/register` | 用户注册表单（手机号、验证码、密码等），按钮 提交注册 / 去登录 | authApi.register |
| views/user.vue | `/user` | "我的"页：个人 / 企业资料与资产、订单等功能入口，按钮 退出登录 | authApi.logout |
| views/companies.vue | `/companies` | 我的企业列表：当前企业与可切换企业，按钮 切换企业 / 注册新企业 | accountApi.companies |
| views/auth-status.vue | `/auth-status` | 企业认证流程节点与当前状态，可查看进度或重新发起认证 | accountApi.authFlow |
| views/addresses.vue | `/addresses` | 收货地址列表：设为默认、编辑、删除，提供新增入口 | 无（Vuex） |
| views/address-edit.vue | `/address-edit` | 新增 / 编辑地址：省市区级联选择与粘贴识别，按钮 保存地址 | 无（Vuex + addressParse/regions） |
| views/favorites.vue | `/favorites` | 我的收藏商品列表：查看详情 / 取消收藏 | 无（Vuex） |
| views/messages.vue | `/messages` | 站内消息列表：标题、内容、时间，支持标记已读 | accountApi.messages |
| views/settings.vue | `/settings` | 个人设置：资料项与通知开关，按钮 保存修改 | 无（Vuex） |

### 2.8 learning 内容域（`src/modules/learning/`，无 api.js，直接 import `@/mock/catalog.json`）

| 页面文件 | 路由 | 功能 | API 对接 |
| --- | --- | --- | --- |
| views/learning.vue | `/learning` | 学习中心：按分类展示图文文章卡片与目录，按钮 进入文章详情 | 无（直接读 mock） |
| views/article.vue | `/article` | 文章详情：渲染富文本或模块化正文，按钮 返回学习中心 | 无（直接读 mock） |

---

## 3. JS 对接位置（后端接口接入指南）

**唯一对接入口是各模块的 `api.js`**，页面只依赖这些导出方法，不直接使用 axios。每个方法内部按 `IS_MOCK` 分支：mock 走 `catalog.json` / Vuex，真实接口走 `http`。接入后端时把对应方法的 mock 分支替换为 http 调用即可，页面无需改动。

| 模块 api 文件 | 导出对象 | 方法 | 真实接口（baseURL 默认 `/api/h5`） |
| --- | --- | --- | --- |
| modules/product/api.js | productsApi | list / detail / categories / packages | `GET /products`、`GET /products/:id`、`GET /categories`、`GET /packages` |
| modules/trade/api.js | ordersApi | list / detail / submit | `GET /orders`、`GET /orders/:id`、`POST /orders` |
| modules/trade/api.js | tradeApi | logistics | `GET /trade/logistics/:orderId` |
| modules/billing/api.js | contractApi | list / detail / create / sign / template | `GET /billing/contracts`、`GET /billing/contracts/:id`、`POST /billing/contracts`、`POST /billing/contracts/:id/sign`、`GET /billing/contract-template` |
| modules/billing/api.js | invoiceApi | list / detail | `GET /billing/invoices`、`GET /billing/invoices/:id` |
| modules/marketing/api.js | marketingApi | pointsLedger / referral | `GET /marketing/points-ledger`、`GET /marketing/referral` |
| modules/service/api.js | serviceApi | aftersales / aftersaleDetail / support | `GET /service/aftersales`、`GET /service/aftersales/:id`、`GET /service/support` |
| modules/account/api.js | authApi | login / logout / register | `POST /auth/login`、`POST /auth/logout`、`POST /account/companies` |
| modules/account/api.js | accountApi | profile / companies / authFlow / messages | `GET /account/profile`、`GET /account/companies`、`GET /account/auth-flow`、`GET /account/messages` |
| modules/selection/api.js | oneStopApi | catalog / calculate / saveDraft | `GET /selection/one-stop/catalog`、`POST /selection/one-stop/calculate`、`POST /selection/one-stop/drafts` |

约定与机制：

- **HTTP 实例** [src/api/http.js](src/api/http.js)：统一 baseURL、15s 超时、请求自动附加 `Authorization: Bearer <token>`；响应兼容 `{ code, message, data }` 包裹（code 0/200 成功，自动解包返回 `data`）与裸数据；401 清 token 并跳 `#/login`。
- **环境解析** [src/config/env.js](src/config/env.js)，优先级：`public/config.js` 的 `window.__XJ_CONFIG__` > 构建环境变量 > 默认值（mock + `/api/h5`）。
- **金额单位为分**，展示统一用 `money()`（[src/domain/productFields.js](src/domain/productFields.js)），输出自带 ¥，模板中不要再写 ¥。
- **合同渲染链**：后端 `GET /billing/contract-template` 返回 md（含 `{{字段}}` 与 `<!--SELLER_SEAL_ANCHOR-->`）→ [contractRender.js](src/modules/billing/domain/contractRender.js) 回填买方企业、平台公司（[platform.js](src/domain/platform.js)）、明细表与金额大写 → [markdown.js](src/modules/billing/domain/markdown.js) 渲染 HTML → [ContractSeal.vue](src/modules/billing/components/ContractSeal.vue) 在锚点挂载 SVG 印章。
- 完整接口字段与数据模型见仓库根目录 `前后端接口对接说明.md`。

---

## 4. 公共组件（`src/components/`）

| 组件 | 职责 |
| --- | --- |
| UiIcon.vue | 统一 SVG 图标库，按 `name` 渲染移动端图标（PC 端对应组件名为 AppIcon） |
| ProductCard.vue | 商品卡片：主图、名称、型号、价格与加购入口，列表 / 搜索 / 首页等共用 |
| ProductContent.vue | 商品详情四段结构（商品亮点 / 规格参数 / 商品介绍 / 兑换须知），配件采购与积分兑换共用 |
| FloatQuick.vue | 详情页悬浮快捷胶囊条：购物车（带数量角标）→ 工作台 → 个人信息，仅详情类路由显示 |
| QrCode.vue | 纯前端点阵二维码占位组件，按 `seed` 生成，用于客服微信 / 支付（接真实二维码库时整体替换此文件） |

模块内私有组件：billing 的 ContractSeal（合同章）、selection 的 CompanySeal（报价章）、learning 的 ContentBlocks（文章模块化正文）。H5 无 PC 的 ProductDrawer，商品选择与详情抽屉直接内联在 `selection/views/diy.vue` 中。

---

## 5. 配置与开发环节

### 5.1 环境要求

| 项 | 版本 |
| --- | --- |
| Node.js | `>=14.0.0 <15`（建议 14.21.3） |
| npm | `>=6.14.0` |

### 5.2 环境变量文件

| 文件 | VUE_APP_ENV | VUE_APP_DATA_MODE | VUE_APP_API_BASE_URL | 用途 |
| --- | --- | --- | --- | --- |
| .env.development | development | mock | /api/h5 | 本地开发，免后端 |
| .env.mock | demo | mock | /api/h5 | 离线演示包 |
| .env.sit | sit | api | /api/h5 | 联调测试后端 |
| .env.production | production | api | /api/h5 | 正式环境（禁止 mock） |

三个变量：`VUE_APP_ENV`（环境标识）、`VUE_APP_DATA_MODE`（mock / api）、`VUE_APP_API_BASE_URL`（接口根路径，跨域时改成完整网关地址）。部署后还可直接改 `dist/config.js` 的 `window.__XJ_CONFIG__` 覆盖，无需重新构建。

### 5.3 启动开发

```bash
cd peijian-h5
npm install            # 首次拉取依赖
npm run serve          # 默认 mock 模式启动，地址 http://localhost:8003
npm run serve:sit      # 直连测试后端启动
```

注意：H5 的 package.json **没有 `serve:mock` 脚本**；默认 `serve` 即 mock 模式。若需显式以 mock 模式启动，可用 `npx vue-cli-service serve --mode mock`。
端口被占用时可指定：`$env:DEV_PORT=9000; npm run serve`（PowerShell）。

---

## 6. 打包命令

```bash
npm run build:mock     # 静态演示包（本地假数据，不依赖后端），产物 dist/
npm run build:sit      # 测试环境包（走 /api/h5 测试网关）
npm run build:prod     # 正式环境包（走 /api/h5 正式网关）
```

构建说明：

- 产物输出到 `dist/`，`publicPath: './'` 使用相对路径，可部署在任意静态子目录。
- 生产构建不生成 sourcemap、不触发 ESLint 拦截（见 [vue.config.js](vue.config.js)）。
- 部署：把 `dist/` 交给静态服务器 / Nginx；若接口跨域或需切换环境，编辑 `dist/config.js` 中的 `env` / `apiBaseUrl` / `dataMode`。
