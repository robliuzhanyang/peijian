# 根组件（App.vue · PC 版）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/App.vue` |
| 根 class | `app pc`（使用 PC 宽屏布局样式） |
| 两端差异 | PC 为"公告条 + 品牌头 + 主导航 + 页脚"框架；H5 为吸顶头部 + 底部 Tab |

## 结构

- 顶部公告条 `.topbar`：企业采购服务与原型演示声明
- 品牌头 `.brand-header`：Logo 入口、搜索框、企业工作台/我的订单/购物车（带件数）
- 主导航 `.navbar`：遍历 `data.nav`（全部分类、配件采购、套装直购、模块化选配、积分商城、学习专区）
- 路由出口 `<router-view />`
- 页脚 `.footer`：品牌信息与客户支持入口
- 全局轻提示 `.toast`：绑定 Vuex `notice`

## 脚本逻辑

- `created`：dispatch `bootstrap` 加载商品、分类、套装目录
- `watch.notice`：提示出现 3 秒后自动 commit `setNotice('')`
- `watch.$route`：按 `meta.title` 设置 `document.title`
- `search()`：把关键词通过 `query.q` 跳转 `/search`

## 依赖

- Vuex：`mapState('notice')`、`mapGetters('cartCount')`
