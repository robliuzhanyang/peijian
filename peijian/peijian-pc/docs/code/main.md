# 应用入口（main.js）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/main.js` |
| 文件角色 | 应用启动入口 |
| 两端差异 | H5 / PC 内容一致，仅引入的 `App.vue` 随端不同 |

## 作用

组装 Vue 根实例：注入路由（`router`）与状态仓库（`store`），挂载根组件 `App` 到 `public/index.html` 的 `#app` 节点。

## 启动顺序

1. 引入 Vue、根组件 `App.vue`、路由、Vuex 仓库
2. 按顺序引入全局样式：
   - `styles/v12.css`：设计令牌与基础样式
   - `styles/product-fields.css`：产品资料组件样式
   - `styles/app.css`：页面排版与双端适配
3. 关闭生产提示 `Vue.config.productionTip = false`
4. 创建根实例并 `$mount('#app')`

## 相关文件

- [App.vue](App.md)：根组件
- [router/index.js](router.md)：路由表
- [store/index.js](store.md)：Vuex 仓库
