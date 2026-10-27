# 鑫戩配件商城 数据模型设计

## 0. 设计决策（本轮已确认）

### 基础设施
- 数据库：**只出逻辑模型**，不绑定 MySQL/PostgreSQL
- 金额：统一 BIGINT 存「分」，禁用浮点
- 主键：业务单号（订单/合同/发票/报价单）对外可见，内部用自增或雪花 ID

### 本期范围
- 商品实物档案：**不落库**（外形尺寸/材质/重量、包装、工程图、3D 下载暂不建字段）
- 库存物流：**单仓 + 一单一包裹**，结构预留 shipment 扩展位
- 支付方式：**对公转账 + 在线支付**（不做账期与信用额度）

### 结构决策
- 用户与企业：**一人多企业**，新增 user_company 关联表
- 商品多规格：**拆独立 product_sku 表**
- 一站式选配：**目录落库可配置**，运营可在后台调整流程
- 报价单：**持久化可查历史**，单号由后端生成

## 1. 商品域

### product 商品主表
- 标识
  - id 商品ID
  - code 产品编码（厂内）
  - skuCode 默认SKU编码（无多规格时使用）
  - model 规格型号
  - series 系列
- 归类
  - cat → category.id
  - brand 品牌
  - type 品类细分（光纤/紫外/CO₂）
- 销售
  - priceFen 销售价（分）
  - stock 库存（无多规格时）
  - points 赠送积分
  - buyable 是否可售
  - sourceType 数据来源（prototype/customer/platform）
  - hot 热销标记
- 展示
  - name 商品名称
  - sub 副标题（参数摘要）
  - image / gallery
  - scene 适用场景
  - machine 适配机型
  - power 功率
- 积分商城扩展
  - exchange 兑换积分价
  - exchangeInfo.marketPriceFen 市场价
  - exchangeInfo.monthLimit 月限购
  - exchangeInfo.introHtml 兑换富文本
  - exchangeInfo.notes 兑换须知
- 本期不落库（字段已梳理，留待二期）
  - physical 外形尺寸/材质/重量/行程
  - packaging 包装尺寸/毛重/材质
  - engineering 轮廓图/装配尺寸/运动边界
  - downloads 3D/工程图/包装图纸
  - applications 应用实拍/视频
  - views 四视图 / perspective 透视图

### product_sku 规格表（本轮新增）
- id 规格ID
- productId → product.id
- skuCode 规格SKU编码（全表唯一）
- power 功率（20W/50W）
- cool 冷却方式（风冷/水冷）
- range 加工范围（110×110）
- priceFen 规格价（分）
- stock 规格库存
- 说明：购物车与订单明细改为指向 skuId，价格与库存以规格为准

### category 分类表
- id / name / icon
- parentId 自关联（0 = 一级）
- sortNo 排序
- 层级：两级树（六大一级分类 + 二级）

### package 套装表
- id / name / machine / scene / image
- priceFen 套装价（整套计价）
- desc 套装说明
- package_item 关联表（建议拆）
  - packageId / productId / skuId / qty

## 2. 选配域

### 配置表（落库可配置，本轮新增）
- one_stop_orientation 加工方向
  - id / name / scene / recommended
  - cabinetIds 可选机柜
- one_stop_step 选配步骤
  - key / name / required / skippable / sortNo
  - 固定 8 步：机柜 → 铝件5件套 → 激光器 → 打标卡 → 振镜 → 场镜 → 电脑套装 → 扩展配件
- one_stop_kit 标准套件
  - cabinetId → 套件名
- one_stop_kit_part 套件槽位
  - kitId / slot / productId
  - 五个槽位：立柱 / 光路 / 治具板 / 定位条 / 电脑支架
- one_stop_kit_variant 可选套件
  - orientationId / name / desc / parts
- one_stop_default 默认配置
  - orientationId / galvo / fieldLens / laser / controller / computer / extensions
- one_stop_relation 兼容矩阵
  - 立柱→光路 / 振镜→场镜 / 振镜→激光器 / 激光器→打标卡 / 打标卡→扩展件
  - 空数组语义：视频振镜自带场镜，跳过场镜步骤

### one_stop_product 部件商品
- 复用 product，用 type 区分 12 类
  - cabinet 机柜 / column 立柱 / opticalPath 光路 / fixture 治具板
  - positionStrip 定位条 / pcBracket 电脑支架
  - galvo 振镜 / fieldLens 场镜 / laser 激光器
  - controller 打标卡 / computer 电脑套装 / extension 扩展配件
- includesFieldLens 是否自带场镜

### scheme 方案快照
- id / name / direction / model / tag
- recommend / scene / workpiece / features
- parts[] 部件快照
  - id / module / qty / section（core|extras）
- packagePriceFen 套餐价
- oneStop 是否整套计价

## 3. 交易域

### cart_item 购物车行项
- id = productId:skuCode（方案行为 scheme:id）
- kind：product / scheme
- schemeId + scheme 快照
- name / model / skuCode / image（快照，防改价改名）
- unitPriceFen 成交单价（快照）
- quantity（方案行固定 1）
- checked 勾选态（仅前端）
- 规则：只有勾选行参与结算与生成报价单

### order 订单主表
- id 订单号（XJ+日期+流水）
- status 状态机（7 态）
  - 待付款 → 待核款（对公转账）→ 待发货 → 待收货 → 运输中 → 已完成
  - 任意态可 已取消
- createdAt / payMethod / addressId / remark
- totalFen 订单总额（服务端重算校验）
- buyerCompanyId 采购主体
- createdBy 下单人

### order_item 订单明细
- orderId / productId / skuId / kind
- name / model / skuCode（下单时快照）
- quantity / unitPriceFen / subtotalFen
- 原则：下单后不随商品表变化

### logistics 物流（一期单包裹）
- orderId（1:1）
- company 承运商 / waybill 运单号
- nodes[] 轨迹节点
  - time / title / desc / state（done|active|todo）
- 二期扩展：shipment + shipment_item 支持一单多包裹

## 4. 票据域

### contract 合同
- id / orderId（1:1）/ title
- amountFen
- buyer / buyerTaxId / seller
- status：待买方签署 → 已生效
- createdAt / signedAt / terms
- fileUrl 未盖章 / sealFileUrl 带章

### invoice 发票
- id / orderId（可分批）
- type：增值税专用发票 / 增值税普通发票
- title / taxId / amountFen / email
- status：审核中 → 已开具 / 已驳回
- appliedAt / issuedAt / fileUrl

## 5. 服务域

### aftersale 售后工单
- id / orderId / type（维修换货 / 退货退款）
- reason 问题描述
- status：处理中 → 已完成
- createdAt
### aftersale_step 处理轨迹
- aftersaleId / title / desc / time / state
- 五段流程：提交申请 → 客服审核 → 寄回检测 → 换货发出 → 完成
### support 客户支持（配置）
- hotline / hours / email
- channels[]（报价咨询 / 技术支持 / 订单售后）

## 6. 单据域

### quote 报价单（本轮改为持久化）
- quoteNo 单号（XJJS-YYMMDD+B+流水，后端生成）
- quoteDate 报价日期
- customerName / customerContact / customerPhone
- sellerName 报价方（吉安鑫戬科技有限公司）
- sellerSender / sellerPhone（业务员，右侧联系卡）
- sellerAddress
- totalFen / totalWords 大写
- status 报价状态（待客户确认 / 已接受 / 已失效）
- createdBy / createdAt
### quote_item 报价明细
- quoteId / index
- name / model / qty / unit
- priceFen / totalFen
- remark（方案行标注模块）
### 版式规则
- 报价人下方显示报价日期
- 客户确认下方留 年月日
- **不含印章**、**不显示报价周期与交货周期**

## 7. 账号域

### user 用户
- id / name / mobile（登录凭证）/ email
- role 岗位
- points 积分余额
- token（会话，localStorage 持久化）
### user_company 用户-企业关联（本轮新增）
- userId / companyId
- roleInCompany 企业内角色（采购经理/财务等）
- isDefault 默认企业
- 支撑「一人多企业切换」
### company 企业主体
- id / name / taxId（唯一）
- contact / phone
- status：待认证 / 已认证 / 已驳回
- authFlow 认证进度时间轴
### address 收货地址
- id / companyId / name / phone / full
- primary 默认地址（企业内唯一）
### message 站内消息
- id / type（order|contract|invoice|aftersale|system）
- title / content / time / read
- bizId 多态关联业务单据

## 8. 营销域

### points_ledger 积分流水
- id / type（earn|exchange）
- title / points（正负）/ balance 变动后余额
- time / orderId 来源订单
- 余额存 user.points，流水用于对账
### referral 推荐有礼
- code 邀请码（唯一）/ rule 规则
- totalReward / pendingReward
### referral_invited 邀请明细
- code / company / time
- status：已浏览 → 已注册 → 已签约
- reward / settled 防重复发放

## 9. 内容域

### content 学习内容
- id / title / cat / type（视频|图文）
- date / read 阅读量 / image / tag
- desc / author / source（原创|转载）
- relatedProducts[] / topics[]
### content_block 模块化正文
- contentId / sortNo
- type：heading|list|paragraph|video|table
- text / html / items / ordered / url / poster / duration
- attachment[] 附件下载

## 10. 枚举字典（唯一权威）

### 订单状态
- 待付款 / 待核款 / 待发货 / 待收货 / 运输中 / 已完成 / 已取消
### 合同状态
- 待买方签署 / 已生效
### 发票状态
- 审核中 / 已开具 / 已驳回
### 发票类型
- 增值税专用发票 / 增值税普通发票
### 售后状态
- 处理中 / 已完成
### 售后类型
- 维修换货 / 退货退款
### 流程节点
- done 已完成 / active 进行中 / todo 未开始
### 消息类型
- order / contract / invoice / aftersale / system
### 积分类型
- earn 获得 / exchange 兑换扣减
### 商品来源
- prototype 原型 / customer 客户资料 / platform 一站式部件
### 企业认证
- 待认证 / 已认证 / 已驳回
### 推荐进度
- 已浏览 / 已注册 / 已签约

## 11. 接口分组（47 个）

### 商品
- GET /products · /products/:id · /categories · /packages
### 选配
- GET /one-stop/catalog
- POST /one-stop/calculate · /one-stop/drafts
### 交易
- POST /orders · GET /orders · /orders/:id
- POST /orders/:id/pay · cancel · confirm-receipt · remind
- GET /business/logistics/:orderId
### 票据
- /business/contracts（含 :id/sign · /file · /seal-file）
- /business/invoices（含 :id/resubmit · /file）
### 服务
- /business/aftersales（含 :id/attachments · /cancel）
- GET /business/support
### 单据
- GET /quote · POST /quote（含 quote_item 落库）
### 账号
- /auth/login · /auth/logout
- /business/profile · /business/companies · /business/companies/:id/switch
- /business/addresses（含 :id/default）
- /business/messages（含 :id/read · /read-all）
### 营销
- /business/points · /business/points/exchange · /business/points-ledger
- /business/referral
### 内容
- GET /learning

## 12. 待确认项（需客户或业务补充）

### 数据缺失
- 商品 model 仅 17/46 有值
- 商品 points 仅 24/46 有值
- 商品 skus 仅 3/46 有值（拆表后需客户补全规格）
### 规则待定
- 积分有效期与冻结规则（当前仅有 earn/exchange 两类）
- 售后是否支持部分退款（当前只有整单换货）
- 报价单状态流转与失效规则（新增字段，需业务确认）
- 在线支付渠道具体对接（微信/支付宝/银联）
- 附件与图片存储方案（对象存储 or 本地）
### 二期预留
- 多仓库存（warehouse / stock）
- 一单多包裹（shipment / shipment_item）
- 商品实物档案与工程图纸
- 多语言（当前全中文硬编码）
