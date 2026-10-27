# 学习内容详情（article.vue）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/views/article.vue` |
| 路由地址 | `/article` |
| 路由名称 | `article` |
| 业务分组 | 内容与服务 |
| 页面标题 | 学习内容详情 |

## 页面作用

展示单条学习内容的分类角标、标题、日期与标签、简介正文；详细视频 / PDF 资料区域为接口占位，提供返回学习专区的入口；内容不存在时展示空态。

## 数据来源

- 本地 mock 文件 `@/mock/catalog.json` 的 `contents` 数组
- `route.query.id`：路由查询参数指定内容 id；未传时默认 `'A1'`
- 通过 `Array.find` 在本地数组中按 id 匹配，无接口调用

## 交互说明

| 操作 | 触发 | 行为 |
| --- | --- | --- |
| 返回学习专区 | 点击"返回学习专区"按钮 | 跳转 `/learning` |
| 内容不存在 | 路由 id 未命中任何内容 | 渲染"内容不存在"空态 |

## 依赖的组件或工具

- 本地 mock：`@/mock/catalog.json`
- `router-link`：返回列表入口
- 全局样式类：`badge blue`、`article-body`、`field-placeholder`、`empty`

## 状态与边界

- 正文仅展示 mock 中的 `desc` 简介，占位块明确说明"详细视频 / PDF 资料待内容接口提供"
- 不包含视频播放、PDF 预览、附件下载、上一篇/下一篇等能力
- 数据完全静态，刷新或直达链接只要 id 存在于 mock 中即可展示
