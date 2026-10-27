# 鑫戩配件商城 PC 端项目说明

> 工程目录：`peijian-pc/`
> 技术栈：Vue 2.6.11 + Vue Router 3.3.4（hash 模式）+ Vuex 3.5.1 + Axios 0.19.2 + Vue CLI 4.4.6 / Webpack 4
> 定位：工业激光打标设备与配件一站式直采商城的 PC 端，当前为高保真原型，内置 mock 数据可完整走通全部业务，API 已按业务域拆分，切换 `dataMode=api` 即可对接真实后端。

---

## 1. 目录结构

```text
peijian-pc/
├─ public/
│  ├─ index.html              # HTML 模板（#app 挂载点）
│  ├─ config.js               # 运行时配置 window.__XJ_CONFIG__（部署后可改，免重新构建）
│  └─ assets/                 # 不经过 Webpack 处理的静态资源（SVG 图示、字体、客户场景图）
├─ src/
│  ├─ main.js                 # 应用入口：组装根实例、按序加载全局样式、输出环境信息
│  ├─ App.vue                 # 根组件：品牌头 / 主导航 / router-view / 页脚 / 全局轻提示
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
│  │  └─ index.js             # 路由表（含 meta.title、登录守卫、旧路由 redirect）
│  ├─ components/             # 全局公共组件（见第 4 节）
│  │  ├─ AppIcon.vue
│  │  ├─ FloatQuick.vue
│  │  ├─ ProductCard.vue
│  │  ├─ ProductContent.vue
│  │  └─ QrCode.vue
│  ├─ styles/                 # 全局样式（按顺序在 main.js 引入）
│  │  ├─ v12.css              # 设计令牌与基础组件样式
│  │  ├─ product-fields.css   # 商品资料 / 字段行样式
│  │  ├─ app.css              # 页面排版与全部业务页面样式（含合同 A4 文档样式）
│  │  └─ xj-sans.woff         # 自定义字体
│  └─ modules/                # 业务模块（按业务域拆分，见第 2 节）
│     ├─ product/             # 商品域：首页 / 分类 / 列表 / 搜索 / 详情 + api.js
│     ├─ trade/               # 交易域：购物车 / 结算 / 支付 / 订单 / 物流 + api.js
│     ├─ selection/           # 选型域：一站式选配 / 报价单 / 套装 + api.js
│     ├─ billing/             # 票据域：合同 / 发票 + api.js + md 模板
│     ├─ marketing/           # 营销域：积分商城 / 积分流水 / 推荐有礼 + api.js
│     ├─ service/             # 服务域：客户支持 / 售后工单 + api.js
│     ├─ account/             # 账号域：登录注册 / 工作台 / 企业 / 地址 / 消息 + api.js
│     └─ learning/            # 内容域：学习中心 / 文章（直接读 mock，无 api.js）
├─ .env.development           # 本地开发：mock + /api/pc
├─ .env.mock                  # 静态演示包：mock + /api/pc
├─ .env.sit                   # 测试环境：api + /api/pc
├─ .env.production            # 正式环境：api + /api/pc
├─ vue.config.js              # Vue CLI 配置（相对路径、端口 8002、关闭 sourcemap/lint）
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

路由为 hash 模式，访问形如 `http://localhost:8002/#/user/contracts`。

### 2.1 product 商品域（`src/modules/product/`）

| 页面文件 | 路由 | 功能 | API 对接 |
| --- | --- | --- | --- |
| views/home.vue | `/home` | 首页：左分类导航、主视觉功能入口、企业卡、商品墙、品类楼层与服务承诺 | 无（Vuex，store bootstrap 调 productsApi） |
| views/categories.vue | `/categories` | 商品分类：左侧一级分类、右侧二级分类图片卡片，点击进入商品列表 | 无（Vuex） |
| views/goods.vue | `/goods` | 商品列表：分类导航 + 筛选排序工具栏 + 商品网格，支持二级分类快捷筛选 | 无（Vuex） |
| views/search.vue | `/search` | 关键词搜索：按名称 / 系列 / 型号 / SKU 检索，结果网格与空态 | 无（Vuex） |
| views/detail.vue | `/detail` | 商品详情：多视图、价格库存、规格选择，按钮 加入购物车 / 收藏 / 立即询价 | 无（Vuex） |

### 2.2 trade 交易域（`src/modules/trade/`）

| 页面文件 | 路由 | 功能 | API 对接 |
| --- | --- | --- | --- |
| views/cart.vue | `/cart` | 购物车：方案行（可展开配置 / 看报价）与商品行，数量步进、移除、去结算 | 无（Vuex） |
| views/checkout.vue | `/checkout` | 确认订单：选择收货地址、商品清单、采购备注，按钮 新增地址 / 提交订单 | dispatch `submitOrder`（内部调 ordersApi.submit） |
| views/pay.vue | `/pay` | 订单支付：扫码支付（自绘二维码 + 倒计时）与对公转账两面板，按钮 我已完成支付 | 无（Vuex） |
| views/pay-success.vue | `/pay-success` | 支付成功 / 对公待核款结果页，按钮 查看订单 / 返回首页 | 无（纯展示） |
| views/pay-failed.vue | `/pay-failed` | 支付未完成结果页，按钮 查看订单 / 返回首页 | 无（纯展示） |
| views/orders.vue | `/user/orders` | 我的订单：状态筛选胶囊 + 订单卡片，按钮 取消 / 催发货 / 确认收货 / 详情 | 无（Vuex） |
| views/order-detail.vue | `/order-detail` | 订单详情：状态、元信息、商品明细合计，按状态显示履约侧栏（支付 / 物流 / 合同 / 开票 / 售后） | 无（Vuex） |
| views/logistics.vue | `/logistics` | 物流跟踪：公司、运单号、倒序轨迹时间线，按钮 返回订单 | tradeApi.logistics |

### 2.3 selection 选型域（`src/modules/selection/`）

| 页面文件 | 路由 | 功能 | API 对接 |
| --- | --- | --- | --- |
| views/diy.vue | `/diy` | 一站式选配：选整机形态 + 8 步选配（机柜 / 铝件 / 激光器 / 打标卡 / 振镜 / 场镜 / 电脑套装 / 扩展配件）+ 联动计价，按钮 加入购物车 / 生成报价单 / 立即购买 | oneStopApi.catalog、saveDraft（经 oneStopMixin） |
| views/diy-confirm.vue | `/diy-confirm` | 配置确认：主体 / 附件两层明细与小计，按钮 返回修改 / 查看报价单 / 加入购物车 | 无（Vuex） |
| views/quote.vue | `/quote` | 正式报价单：双方抬头、八列明细表、合计大写、不含印章的落款区（报价人下方为报价日期），按钮 导出图片 / 导出 PDF / 修改组合 | 无（本地 quoteImage 导出） |
| views/package-detail.vue | `/package-detail` | 套装配置清单：型号 / SKU / 数量与套装价侧栏，按钮 查看细节 / 生成报价单 | 无（Vuex） |
| views/package.vue | `/package` | 历史兼容页：created 自动 replace 跳转 `/diy?entry=package` | 无（路由跳转） |

### 2.4 billing 票据域（`src/modules/billing/`）

| 页面文件 | 路由 | 功能 | API 对接 |
| --- | --- | --- | --- |
| views/contracts.vue | `/user/contracts` | 合同列表：编号 / 买方 / 金额 / 状态 + 可申请合同订单区，按钮 查看合同 / 申请合同 | contractApi.list、create |
| views/contract-detail.vue | `/contract-detail` | 合同详情：后端 md 渲染、双方主体回填、自动盖电子章，按钮 确认签署 / 下载合同 | contractApi.detail、template、sign、create |
| views/invoices.vue | `/user/invoices` | 发票列表：号码 / 类型 / 抬头 / 金额 / 状态 + 可开票订单区，按钮 查看发票 / 申请开票 | invoiceApi.list |
| views/invoice-apply.vue | `/invoice-apply` | 申请开票：类型 / 企业抬头 / 税号 / 接收邮箱表单，按钮 提交申请 | 无（Vuex commit） |
| views/invoice-detail.vue | `/invoice-detail` | 发票详情：完整字段、状态、驳回原因，已开具提供下载入口 | invoiceApi.detail |

### 2.5 marketing 营销域（`src/modules/marketing/`）

| 页面文件 | 路由 | 功能 | API 对接 |
| --- | --- | --- | --- |
| views/points-mall.vue | `/points-mall` | 积分商城：兑换分类、筛选条、积分商品网格 | 无（Vuex） |
| views/points-detail.vue | `/points-detail` | 积分商品详情：主图、积分价比对、规格与兑换须知，按钮 立即兑换 | 无（Vuex） |
| views/points-confirm.vue | `/points-confirm` | 兑换确认：商品、积分价、收货地址，按钮 确认兑换 | 无（Vuex） |
| views/points-ledger.vue | `/user/points-ledger` | 积分明细：余额卡 + 收支流水（收入 / 支出），入口 积分商城 | marketingApi.pointsLedger |
| views/referral.vue | `/user/referral` | 推荐有礼：邀请码、活动规则、奖励统计与邀请记录，按钮 复制邀请码 | marketingApi.referral |

### 2.6 service 服务域（`src/modules/service/`）

| 页面文件 | 路由 | 功能 | API 对接 |
| --- | --- | --- | --- |
| views/service.vue | `/service` | 全周期服务说明：头图统计、热线、微信二维码、服务流程与 FAQ，按钮 联系顾问 / 浏览配件 | serviceApi.support |
| views/support.vue | `/support`、`/user/support` | 客户支持：联系方式卡、支持渠道卡片与产品 / 订单 / 售后快捷入口 | serviceApi.support |
| views/aftersales.vue | `/user/aftersales` | 售后工单列表（撤回 / 查看进度）+ 按订单发起售后入口 | serviceApi.aftersales |
| views/aftersale-apply.vue | `/aftersale-apply` | 申请售后：类型 / 描述 / 附件表单，按钮 提交申请 | 无（Vuex commit） |
| views/aftersale-detail.vue | `/aftersale-detail` | 售后详情：工单信息与倒序处理进度时间线，按钮 返回 | serviceApi.aftersaleDetail |

### 2.7 account 账号域（`src/modules/account/`）

| 页面文件 | 路由 | 功能 | API 对接 |
| --- | --- | --- | --- |
| views/login.vue | `/login` | 登录：手机号 / 邮箱 + 密码，按钮 登录 / 演示账号一键登录 | authApi.login |
| views/register.vue | `/register` | 注册：企业名称 / 信用代码 / 联系人 / 电话认证表单，按钮 提交认证申请 | authApi.register |
| views/user.vue | `/user` | 工作台外壳：左侧固定导航 + 企业横幅，右侧 router-view 嵌入子页面 | accountApi.profile |
| views/user-overview.vue | `/user`（默认子路由） | 工作台总览：订单状态统计、最近订单、合同发票概览、售后支持入口 | 无（Vuex） |
| views/companies.vue | `/user/companies` | 企业列表：当前企业角标，按钮 切换企业 / 提交新企业认证 | accountApi.companies |
| views/auth-status.vue | `/user/auth-status` | 企业认证：当前状态与审核节点时间线，按钮 切换企业 / 填写申请表 | accountApi.authFlow |
| views/addresses.vue | `/user/addresses` | 收货地址列表，按钮 设为默认 / 编辑 / 删除 / 新增 | 无（Vuex） |
| views/address-edit.vue | `/address-edit` | 新增 / 编辑地址：省市区联动 + 整段粘贴识别，按钮 保存 | 无（Vuex + addressParse/regions） |
| views/favorites.vue | `/user/favorites` | 我的收藏商品网格，按钮 取消收藏 | 无（Vuex） |
| views/messages.vue | `/user/messages` | 站内消息列表与未读数，按钮 全部已读 | accountApi.messages |
| views/settings.vue | `/user/settings` | 个人与企业资料摘要，按钮 编辑 / 保存 / 取消 | 无（Vuex） |

### 2.8 learning 内容域（`src/modules/learning/`，无 api.js，直接 import `@/mock/catalog.json`）

| 页面文件 | 路由 | 功能 | API 对接 |
| --- | --- | --- | --- |
| views/learning.vue | `/learning` | 学习中心：图文 / 文章 / 视频 / 专题四维切换的内容卡片列表（带数量徽标） | 无（直接读 mock） |
| views/article.vue | `/article` | 文章详情：左侧章节目录 + 右侧 ContentBlocks 正文，上一篇 / 下一篇导航 | 无（直接读 mock） |

---

## 3. JS 对接位置（后端接口接入指南）

**唯一对接入口是各模块的 `api.js`**，页面只依赖这些导出方法，不直接使用 axios。每个方法内部按 `IS_MOCK` 分支：mock 走 `catalog.json` / Vuex，真实接口走 `http`。接入后端时把对应方法的 mock 分支替换为 http 调用即可，页面无需改动。

| 模块 api 文件 | 导出对象 | 方法 | 真实接口（baseURL 默认 `/api/pc`） |
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
- **环境解析** [src/config/env.js](src/config/env.js)，优先级：`public/config.js` 的 `window.__XJ_CONFIG__` > 构建环境变量 > 默认值（mock + `/api/pc`）。
- **金额单位为分**，展示统一用 `money()`（[src/domain/productFields.js](src/domain/productFields.js)），输出自带 ¥，模板中不要再写 ¥。
- **合同渲染链**：后端 `GET /billing/contract-template` 返回 md（含 `{{字段}}` 与 `<!--SELLER_SEAL_ANCHOR-->`）→ [contractRender.js](src/modules/billing/domain/contractRender.js) 回填买方企业、平台公司（[platform.js](src/domain/platform.js)）、明细表与金额大写 → [markdown.js](src/modules/billing/domain/markdown.js) 渲染 HTML → [ContractSeal.vue](src/modules/billing/components/ContractSeal.vue) 在锚点挂载 SVG 印章。
- 完整接口字段与数据模型见仓库根目录 `前后端接口对接说明.md`。

---

## 4. 公共组件（`src/components/`）

| 组件 | 职责 |
| --- | --- |
| AppIcon.vue | 统一 SVG 图标库，按 `name` 渲染站内全部线性图标 |
| ProductCard.vue | 商品卡片：主图、名称、型号、价格与加购入口，商品列表 / 搜索 / 首页等共用 |
| ProductContent.vue | 商品详情四段结构（商品亮点 / 规格参数 / 商品介绍 / 购买须知），配件采购与积分兑换共用 |
| FloatQuick.vue | 详情页悬浮快捷胶囊条：购物车（带数量角标）→ 企业工作台 → 个人信息，仅详情类路由显示 |
| QrCode.vue | 纯前端点阵二维码占位组件，按 `seed` 生成，用于客服微信 / 支付 / 页脚（接真实二维码库时整体替换此文件） |

模块内私有组件：billing 的 ContractSeal（合同章）、selection 的 ProductDrawer（商品详情侧滑抽屉）与 CompanySeal（报价章）、learning 的 ContentBlocks（文章模块化正文）。

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
| .env.development | development | mock | /api/pc | 本地开发，免后端 |
| .env.mock | demo | mock | /api/pc | 离线演示包 |
| .env.sit | sit | api | /api/pc | 联调测试后端 |
| .env.production | production | api | /api/pc | 正式环境（禁止 mock） |

三个变量：`VUE_APP_ENV`（环境标识）、`VUE_APP_DATA_MODE`（mock / api）、`VUE_APP_API_BASE_URL`（接口根路径，跨域时改成完整网关地址）。部署后还可直接改 `dist/config.js` 的 `window.__XJ_CONFIG__` 覆盖，无需重新构建。

### 5.3 启动开发

```bash
cd peijian-pc
npm install            # 首次拉取依赖
npm run serve          # 默认 mock 模式启动，地址 http://localhost:8002
npm run serve:sit      # 直连测试后端启动
```

端口被占用时可指定：`$env:DEV_PORT=9000; npm run serve`（PowerShell）。

---

## 6. 打包命令

```bash
npm run build:mock     # 静态演示包（本地假数据，不依赖后端），产物 dist/
npm run build:sit      # 测试环境包（走 /api/pc 测试网关）
npm run build:prod     # 正式环境包（走 /api/pc 正式网关）
```

构建说明：

- 产物输出到 `dist/`，`publicPath: './'` 使用相对路径，可部署在任意静态子目录。
- 生产构建不生成 sourcemap、不触发 ESLint 拦截（见 [vue.config.js](vue.config.js)）。
- 部署：把 `dist/` 交给静态服务器 / Nginx；若接口跨域或需切换环境，编辑 `dist/config.js` 中的 `env` / `apiBaseUrl` / `dataMode`。
