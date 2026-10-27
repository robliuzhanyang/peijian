# 商品卡片组件（ProductCard.vue）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/components/ProductCard.vue` |
| 组件类型 | 展示 + 交互组件 |
| 两端共用 | 是 |

## 作用

商品网格中的统一卡片：图片入口、客户资料角标、系列/型号/SKU 信息、价格与库存、购买动作。

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| product | Object | 是 | 完整商品对象（id、name、image、series、model、skuCode、priceFen、stock、buyable、sourceType、sub） |

## 交互逻辑

- 图片与标题点击：跳转 `/detail?id=商品id`
- `product.buyable` 为真：显示"加入购物车"，直接提交 Vuex mutation `addCart`（可购校验在 store 内完成，不通过会有全局提示）
- 否则：显示"查看资料 / 咨询报价"，引导进入详情
- `sourceType === 'customer'`：图片左上角显示"客户资料"角标，库存行显示"规格参数待补充"

## 展示规则

- 空价格 → "待报价"；空库存 → "库存待确认"
- 数据来源标识：客户原始资料 / 原型演示

## 使用位置

首页、配件采购、搜索结果、收藏页、商品详情相关推荐等商品网格场景。
