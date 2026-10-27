# 根组件（App.vue · H5 版）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/App.vue` |
| 根 class | `app h5`（触发 H5 限宽与移动适配样式） |
| 两端差异 | H5 为"吸顶头部 + 底部 Tab"移动框架；PC 为顶栏+导航+页脚框架 |

## 结构

- 吸顶头部 `.m-header`：品牌入口（回首页）、消息入口、搜索表单
- 路由出口 `<router-view />`（`.main.wrap`）
- 固定底部 Tab：首页 / 分类 / 选配 / 购物车（带件数）/ 我的
- 全局轻提示 `.toast`：绑定 Vuex `notice`

## 脚本逻辑

- `created`：dispatch `bootstrap` 加载商品、分类、套装目录
- `watch.notice`：提示出现 3 秒后自动 commit `setNotice('')`
- `watch.$route`：按 `meta.title` 设置 `document.title`
- `search()`：把关键词通过 `query.q` 跳转 `/search`

## 依赖

- Vuex：`mapState('notice')`、`mapGetters('cartCount')`
