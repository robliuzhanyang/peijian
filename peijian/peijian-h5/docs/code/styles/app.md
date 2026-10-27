# 页面排版样式（styles/app.css）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/styles/app.css` |
| 样式层级 | 页面级结构排版（在 v12.css 之后加载） |
| 两端关系 | 同一文件，末尾用 `.app.h5` 前缀做移动端适配 |

## 主要内容

- 应用容器：`.app`、`.app.pc`、`.app.h5`（H5 限宽 460px 居中、浅灰底）
- H5 移动框架：吸顶头部 `.m-header`、搜索条、固定底部 Tab `.tabbar`、全局 toast
- 页面标题 `.page-title`
- 栅格布局：`content-grid`（正文+侧栏）、`two-col`、`three-col`
- 商品详情：`detail-hero`、五视图网格 `view-grid`、规格段 `spec-grid`
- 交易组件：商品行 `line-product`、数量步进器 `stepper`、订单行 `order-line`、结算操作栏
- 表单与资料：`review-field`、字段区 `field-section`、下载卡、身份信息栅格
- 营销与反馈：Hero 区 `hero-simple`、入口宫格 `link-grid`、警示条 `alert`、报价表格 `item-table`

## H5 适配（文件末尾 `.app.h5` 规则）

- 多列栅格全部降级为单列
- 商品网格两列、卡片字号/图片高度压缩
- 表格缩小内边距与字号
- 隐藏 PC 页脚，操作按钮拉伸通栏
