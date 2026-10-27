# 鑫戩配件商城 H5 原型 · 代码说明总索引

面向开发与验收的代码导览。本目录（`docs/code/`）为每个源码文件提供一份中文说明，源码内同步配有格式化排版与中文注释。

## 技术栈

- Vue 2.6 + Vue Router 3（hash 模式）+ Vuex 3
- Vue CLI 4 / webpack 4，axios 0.19，element-ui 2.13（原型基础依赖）
- Node 14 环境；样式为原生 CSS（设计令牌 + 无外部 UI 依赖）
- 数据默认走 mock（`src/mock/catalog.json`），可经环境变量切换真实接口

## 运行与构建

```bash
npm install
npm run serve        # 默认端口 8003；可用 $env:DEV_PORT="8013" 覆盖
npm run build        # 生产构建（mock 模式）
npm run build:sit    # SIT 构建（接口模式）
```

## 目录结构与文档对应

| 源码 | 说明文档 |
| --- | --- |
| `src/main.js` | [main.md](main.md) |
| `src/App.vue`（H5 移动框架） | [App.md](App.md) |
| `src/router/index.js`（46 条路由） | [router.md](router.md) |
| `src/store/index.js`（Vuex，localStorage 键 xinjian-h5-v3） | [store.md](store.md) |
| `src/api/index.js`（/api/h5，mock/api 双模式） | [api.md](api.md) |
| `src/domain/productFields.js`（字段定义与展示工具） | [domain-productFields.md](domain-productFields.md) |
| `src/components/`（3 个公共组件） | [components/FieldRow.md](components/FieldRow.md)、[ProductCard.md](components/ProductCard.md)、[ProductFields.md](components/ProductFields.md) |
| `src/views/`（46 个页面） | [views/README.md](views/README.md) |
| `src/styles/v12.css` | [styles/v12.md](styles/v12.md) |
| `src/styles/app.css` | [styles/app.md](styles/app.md) |
| `src/styles/product-fields.css` | [styles/product-fields.md](styles/product-fields.md) |

## 代码约定

- 金额一律以"分"存储与计算，展示用 `money()` 转元；无价格显示"待报价"
- 客户未提供的资料保持 null，界面统一显示"待补充/待提供"，不生成虚构数据
- 状态变更走 Vuex mutations，购物车等数据持久化在 localStorage
- 源码风格：单引号、无分号、2 空格缩进，使用 Prettier 2.8 统一格式化

## 与 PC 端的关系

姊妹工程 `pc-vue` 与本工程共享全部 46 个页面、3 个组件、领域工具与样式；仅根组件、接口层、状态仓库、首页 4 处按端独立维护（接口前缀、列表查询方式、持久化键、框架布局不同）。
