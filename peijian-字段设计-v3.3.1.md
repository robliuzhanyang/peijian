# 鑫戩配件商城 · 全业务字段设计（v3.3.1）

> 覆盖 PC 端与 H5 端全部业务实体。金额统一以「分」为整数存储。
> 配套 Excel：`peijian-字段设计-v3.3.1.xlsx`（每实体一 Sheet，可筛选）。

## 业务域索引

| 业务域 | 实体 | 说明 |
|---|---|---|
| 商品域 | product / category / package | 商品目录、分类、套装 |
| 选配域 | one_stop_catalog / scheme | 一站式 8 步选配与方案快照 |
| 交易域 | cart_item / order / order_item / logistics | 购物车、订单、物流 |
| 票据域 | contract / invoice | 合同、发票 |
| 服务域 | aftersale | 售后工单 |
| 单据域 | quote | 报价单 |
| 账号域 | profile / company / address / message | 用户、企业、地址、消息 |
| 营销域 | points_ledger / referral | 积分、推荐 |
| 内容域 | content | 学习中心 |

## 字典与枚举

| 分组 | 取值 | 含义 | 字段 |
|---|---|---|---|
| 订单状态 | `待付款` | 已下单未付款，可取消 | `order.status` |
| 订单状态 | `待核款` | 对公转账待到账核验 | `order.status` |
| 订单状态 | `待发货` | 已付款待出库 | `order.status` |
| 订单状态 | `待收货` | 已发货待签收 | `order.status` |
| 订单状态 | `运输中` | 物流在途 | `order.status` |
| 订单状态 | `已完成` | 已签收完结 | `order.status` |
| 订单状态 | `已取消` | 超时或主动取消 | `order.status` |
| 合同状态 | `待买方签署` | 已生成待盖章 | `contract.status` |
| 合同状态 | `已生效` | 双方签署完成 | `contract.status` |
| 发票状态 | `审核中` | 提交待审 | `invoice.status` |
| 发票状态 | `已开具` | 已出票可下载 | `invoice.status` |
| 发票状态 | `已驳回` | 需修改重提 | `invoice.status` |
| 发票类型 | `增值税专用发票` | 可抵扣，税号必填 | `invoice.type` |
| 发票类型 | `增值税普通发票` | 不可抵扣 | `invoice.type` |
| 售后状态 | `处理中` | 工单进行中 | `aftersale.status` |
| 售后状态 | `已完成` | 换货签收/退款到账 | `aftersale.status` |
| 售后类型 | `维修换货` | 寄回检测后换新 | `aftersale.type` |
| 售后类型 | `退货退款` | 原路退回 | `aftersale.type` |
| 流程节点状态 | `done` | 已完成节点 | `*.steps[].state` |
| 流程节点状态 | `active` | 当前进行中 | `*.steps[].state` |
| 流程节点状态 | `todo` | 未开始 | `*.steps[].state` |
| 消息类型 | `order` | 订单相关 | `message.type` |
| 消息类型 | `contract` | 合同相关 | `message.type` |
| 消息类型 | `invoice` | 发票相关 | `message.type` |
| 消息类型 | `aftersale` | 售后相关 | `message.type` |
| 消息类型 | `system` | 系统通知 | `message.type` |
| 积分类型 | `earn` | 获得积分 | `points_ledger.type` |
| 积分类型 | `exchange` | 兑换扣减 | `points_ledger.type` |
| 商品来源 | `prototype` | 原型录入，价格可用 | `product.sourceType` |
| 商品来源 | `customer` | 客户原始资料，需人工核价 | `product.sourceType` |
| 商品来源 | `platform` | 一站式平台部件 | `product.sourceType` |
| 部件类型 | `cabinet` | 机柜 | `one_stop_product.type` |
| 部件类型 | `column` | 立柱 | `one_stop_product.type` |
| 部件类型 | `opticalPath` | 光路 | `one_stop_product.type` |
| 部件类型 | `fixture` | 治具板 | `one_stop_product.type` |
| 部件类型 | `positionStrip` | 定位条 | `one_stop_product.type` |
| 部件类型 | `pcBracket` | 电脑支架 | `one_stop_product.type` |
| 部件类型 | `galvo` | 振镜 | `one_stop_product.type` |
| 部件类型 | `fieldLens` | 场镜 | `one_stop_product.type` |
| 部件类型 | `laser` | 激光器 | `one_stop_product.type` |
| 部件类型 | `controller` | 打标卡 | `one_stop_product.type` |
| 部件类型 | `computer` | 电脑套装 | `one_stop_product.type` |
| 部件类型 | `extension` | 扩展配件 | `one_stop_product.type` |
| 选配步骤 | `1 机柜` | cabinet | `steps[0]` |
| 选配步骤 | `2 铝件5件套` | kit（5 个槽位部件） | `steps[1]` |
| 选配步骤 | `3 激光器` | laser | `steps[2]` |
| 选配步骤 | `4 打标卡` | controller | `steps[3]` |
| 选配步骤 | `5 振镜` | galvo | `steps[4]` |
| 选配步骤 | `6 场镜` | fieldLens（视频振镜可跳过） | `steps[5]` |
| 选配步骤 | `7 电脑套装` | computer | `steps[6]` |
| 选配步骤 | `8 扩展配件` | extensions（多选） | `steps[7]` |
| 加工方向 | `cabinet` | 柜式机型 | `orientation.id` |
| 加工方向 | `flying` | 飞行式机型 | `orientation.id` |
| 加工方向 | `split` | 分体式机型 | `orientation.id` |
| 加工方向 | `desktop` | 桌面款机型 | `orientation.id` |
| 企业认证 | `待认证` | 未提交资料 | `company.status` |
| 企业认证 | `已认证` | 可批发采购 | `company.status` |
| 推荐进度 | `已浏览` | 仅注册浏览，无奖励 | `referral.invited[].status` |
| 推荐进度 | `已注册` | 待首单，奖励待结算 | `referral.invited[].status` |
| 推荐进度 | `已签约` | 首单完成，奖励可结算 | `referral.invited[].status` |

## 商品Product

> 商品主表，PC/H5 共用一套字段；价格统一以「分」为整数存储

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `id` | 商品ID | VARCHAR | 32 | Y | - | laser50 | 主键；与一站式部件商品共用同一 id 空间 | PK |
| `name` | 商品名称 | VARCHAR | 120 | Y | - | 光纤激光器 50W（创鑫） | 列表与详情的标题 | IDX |
| `code` | 产品编码 | VARCHAR | 64 | Y | - | XJ-GX-50W-CX | 厂内编码，报价单/合同引用 | UK |
| `skuCode` | 可售SKU编码 | VARCHAR | 64 | Y | - | XJ-GX-50W-CX | 加入购物车必填，无此值不可售 | IDX |
| `brand` | 品牌 | VARCHAR | 64 | N | - | 创鑫 | 选型参考 | - |
| `cat` | 所属分类ID | VARCHAR | 32 | Y | - | laser | 外键 → category.id | FK |
| `type` | 品类细分 | VARCHAR | 32 | N | - | 光纤 / 紫外 / CO₂ | 同类商品的技术分支 | - |
| `power` | 功率 | VARCHAR | 16 | N | - | 50W | 激光器/电源类必填 | - |
| `scene` | 适用场景 | VARCHAR | 64 | N | - | 金属打标 | 筛选与推荐用 | - |
| `machine` | 适配机型 | VARCHAR | 64 | N | - | 桌面便携A款 | 选型提示 | - |
| `series` | 系列 | VARCHAR | 64 | N | - | 鑫戩一站式选配 | 卡片副标题展示 | - |
| `model` | 规格型号 | VARCHAR | 64 | N | - | JG-GS-01 | 报价单「规格型号」列来源 | IDX |
| `sub` | 副标题 | VARCHAR | 200 | N | - | 1064nm · 风冷 · 金属打标 | 用 · 分隔的关键参数摘要 | - |
| `image` | 主图 | VARCHAR | 255 | N | - | assets/laser.svg | 静态资源相对路径 | - |
| `gallery` | 图集 | JSON | - | N | [] | ["laser","head"] | 详情页轮播图数组 | - |
| `priceFen` | 销售价（分） | BIGINT | - | Y | - | 480000 = ¥4800.00 | 整数分，禁止浮点；null 表示待报价 | IDX |
| `stock` | 库存 | INT | - | N | - | 26 | null 表示待确认；下单前校验 | - |
| `points` | 赠送积分 | INT | - | N | 0 | 48 | 下单后入账积分（前端已隐藏展示） | - |
| `hot` | 热销标记 | TINYINT | 1 | N | 0 | 1 | 1=显示「热销配件」角标 | - |
| `buyable` | 是否可售 | TINYINT | 1 | Y | 1 | 1 | 0=资料类商品，仅可查看/询价 | IDX |
| `sourceType` | 数据来源 | VARCHAR | 16 | N | prototype | prototype / customer / platform | customer=客户原始资料，需人工核价 | - |
| `views.front` | 正视图 | VARCHAR | 255 | N | - | null | 四视图（工程图纸区） | - |
| `views.side` | 侧视图 | VARCHAR | 255 | N | - | null | 同上 | - |
| `views.back` | 后视图 | VARCHAR | 255 | N | - | null | 同上 | - |
| `views.bottom` | 仰视图 | VARCHAR | 255 | N | - | null | 同上 | - |
| `views.top` | 俯视图 | VARCHAR | 255 | N | - | null | 同上 | - |
| `perspective` | 透视图 | VARCHAR | 255 | N | - | null | 立体效果图 | - |
| `physical.length` | 外形-长 | DECIMAL | 10,2 | N | - | null | 单位 mm | - |
| `physical.width` | 外形-宽 | DECIMAL | 10,2 | N | - | null | 单位 mm | - |
| `physical.height` | 外形-高 | DECIMAL | 10,2 | N | - | null | 单位 mm | - |
| `physical.material` | 主体材质 | VARCHAR | 64 | N | - | null | 如 铝合金 6061 | - |
| `physical.weight` | 净重 | DECIMAL | 10,2 | N | - | null | 单位 kg | - |
| `physical.color` | 颜色 | VARCHAR | 32 | N | - | null | 外观色 | - |
| `physical.shaftLength` | 轴长 | DECIMAL | 10,2 | N | - | null | 立柱类专属，单位 mm | - |
| `physical.isMotorized` | 是否电动 | TINYINT | 1 | N | - | null | 运动轴类专属 | - |
| `physical.travel.min` | 行程-下限 | DECIMAL | 10,2 | N | - | null | 运动轴行程范围 | - |
| `physical.travel.max` | 行程-上限 | DECIMAL | 10,2 | N | - | null | 同上 | - |
| `physical.travel.unit` | 行程-单位 | VARCHAR | 8 | N | - | mm | 同上 | - |
| `engineering.outlineImage` | 轮廓图 | VARCHAR | 255 | N | - | null | 工程图区首图 | - |
| `engineering.assemblyDimensions` | 装配尺寸 | JSON | - | N | [] | [{"name":"A","value":120}] | 尺寸标注数组 | - |
| `engineering.movementBounds.min` | 运动边界-下限 | DECIMAL | 10,2 | N | - | null | 工程选型用 | - |
| `engineering.movementBounds.max` | 运动边界-上限 | DECIMAL | 10,2 | N | - | null | 同上 | - |
| `engineering.movementBounds.unit` | 运动边界-单位 | VARCHAR | 8 | N | - | mm | 同上 | - |
| `packaging.length` | 包装-长 | DECIMAL | 10,2 | N | - | null | 单位 mm | - |
| `packaging.width` | 包装-宽 | DECIMAL | 10,2 | N | - | null | 单位 mm | - |
| `packaging.height` | 包装-高 | DECIMAL | 10,2 | N | - | null | 单位 mm | - |
| `packaging.material` | 包装材质 | VARCHAR | 64 | N | - | null | 如 木箱 / 纸箱 | - |
| `packaging.weight` | 毛重 | DECIMAL | 10,2 | N | - | null | 单位 kg，运费计算用 | - |
| `packaging.image` | 包装图 | VARCHAR | 255 | N | - | null | 包装示意 | - |
| `downloads.assembly3d` | 3D装配图 | VARCHAR | 255 | N | - | null | 资料下载地址 | - |
| `downloads.engineeringPdf` | 工程图PDF | VARCHAR | 255 | N | - | null | 同上 | - |
| `downloads.packagingDrawing` | 包装图纸 | VARCHAR | 255 | N | - | null | 同上 | - |
| `applications.assemblyImages` | 应用实拍 | JSON | - | N | [] | [] | 装配实景图数组 | - |
| `applications.videos` | 应用视频 | JSON | - | N | [] | [] | 视频地址数组 | - |
| `exchange` | 兑换积分价 | INT | - | N | - | 1200 | 仅积分商品：兑换所需积分 | - |
| `exchangeInfo.marketPriceFen` | 市场价（分） | BIGINT | - | N | - | 168000 | 仅积分商品：划线价 | - |
| `exchangeInfo.monthLimit` | 月限购 | INT | - | N | - | 2 | 仅积分商品 | - |
| `exchangeInfo.highlights` | 兑换亮点 | JSON | - | N | [] | [] | 仅积分商品 | - |
| `exchangeInfo.introHtml` | 兑换富文本 | TEXT | - | N | - | <p>…</p> | 仅积分商品 | - |
| `exchangeInfo.notes` | 兑换须知 | JSON | - | N | [] | [] | 仅积分商品 | - |
| `skus[].id` | 规格ID | VARCHAR | 32 | N | - | L20 | 多规格（功率/冷却）组合 | PK(子表) |
| `skus[].power` | 规格-功率 | VARCHAR | 16 | N | - | 20W | 同上 | - |
| `skus[].cool` | 规格-冷却方式 | VARCHAR | 16 | N | - | 风冷 / 水冷 | 同上 | - |
| `skus[].range` | 规格-加工范围 | VARCHAR | 32 | N | - | 110×110 | 场镜类专属 | - |
| `skus[].priceFen` | 规格-价格（分） | BIGINT | - | N | - | 360000 | 选中规格后覆盖主表价 | - |
| `skus[].stock` | 规格-库存 | INT | - | N | - | 38 | 按规格独立扣减 | - |

## 分类Category

> 两级分类树，供导航/筛选/首页宫格使用

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `id` | 分类ID | VARCHAR | 32 | Y | - | laser | 主键 | PK |
| `name` | 分类名称 | VARCHAR | 64 | Y | - | 激光器 | 导航文案 | - |
| `icon` | 图标标识 | VARCHAR | 32 | N | - | laser | 映射到 AppIcon / UiIcon | - |
| `parentId` | 上级分类ID | VARCHAR | 32 | N | 0 | 0=一级 | 自关联，两级树 | FK(self) |
| `sortNo` | 排序号 | INT | - | N | 0 | 1,2,3… | 导航展示顺序 | IDX |

## 套装Package

> 以固定组合打包售卖的套装（历史「套餐」页）

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `id` | 套装ID | VARCHAR | 32 | Y | - | pk1 | 主键 | PK |
| `name` | 套装名称 | VARCHAR | 120 | Y | - | 光纤打标入门套装 | 展示标题 | - |
| `machine` | 适配机型 | VARCHAR | 64 | N | - | 桌面便携A款 | 选型提示 | - |
| `scene` | 适用场景 | VARCHAR | 64 | N | - | 小件批量打标 | 筛选条件 | - |
| `image` | 封面图 | VARCHAR | 255 | N | - | machine.svg | 列表封面 | - |
| `priceFen` | 套装价（分） | BIGINT | - | Y | - | 980000 | 整套计价，不再叠加单品价 | IDX |
| `desc` | 套装说明 | TEXT | - | N | - | 含激光器/振镜/场镜… | 详情描述 | - |
| `items` | 套装明细 | JSON | - | Y | - | ["laser50","galvoF"] | 商品 id 数组，指向 product.id | FK |

## 一站式选配目录

> 一站式选购的目录与规则，建议后端提供同结构接口，前端零改动切换

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `version` | 目录版本号 | VARCHAR | 32 | N | - | 2026.10.20-v3.2 | 用于前端缓存失效判断 | - |
| `bundleDiscountRate` | 套餐折扣率 | DECIMAL | 4,2 | Y | - | 0.92 | 正价合计 × 该系数 = 套餐价 | - |
| `orientations[].id` | 加工方向ID | VARCHAR | 32 | Y | - | cabinet / flying / split / desktop | 整机形态，决定默认配置 | PK(子表) |
| `orientations[].name` | 加工方向名称 | VARCHAR | 64 | Y | - | 柜式机型 | 首屏选择卡片标题 | - |
| `orientations[].scene` | 方向说明 | VARCHAR | 120 | N | - | 整机柜体，通用工位调节方便 | 卡片副标题 | - |
| `orientations[].cabinetIds` | 可选机柜 | JSON | - | Y | - | ["os-cab-v1","os-cab-v2"] | 限定该方向可选机柜 → oneStopProduct.id | FK |
| `orientations[].recommended` | 是否推荐 | TINYINT | 1 | N | 0 | 1 | 显示「推荐」角标 | - |
| `steps[].key` | 步骤标识 | VARCHAR | 32 | Y | - | cabinet / kit / laser / controller / galvo / fieldLens / computer / extensions | 顺序即页面步骤顺序 | PK(子表) |
| `steps[].name` | 步骤名称 | VARCHAR | 32 | Y | - | 机柜 | 左侧步骤栏文案 | - |
| `steps[].required` | 是否必选 | TINYINT | 1 | Y | 0 | 0 | 0=可跳过 | - |
| `steps[].skippable` | 允许跳过 | TINYINT | 1 | Y | 1 | 1 | 控制「跳过此项」按钮 | - |
| `steps[].sortNo` | 步骤序号 | INT | - | Y | - | 1..8 | 落库时固化顺序 | IDX |
| `kits[cabinetId].name` | 标准套件名 | VARCHAR | 64 | N | - | 柜式标准铝件 5 件套 | 机柜带出的默认套件 | - |
| `kits[cabinetId].parts.column` | 套件-立柱 | VARCHAR | 32 | N | - | os-col-v550 | 槽位→商品id | FK |
| `kits[cabinetId].parts.opticalPath` | 套件-光路 | VARCHAR | 32 | N | - | os-opt-vf | 同上 | FK |
| `kits[cabinetId].parts.fixture` | 套件-治具板 | VARCHAR | 32 | N | - | os-fixture-std | 同上 | FK |
| `kits[cabinetId].parts.positionStrip` | 套件-定位条 | VARCHAR | 32 | N | - | os-position-300 | 同上 | FK |
| `kits[cabinetId].parts.pcBracket` | 套件-电脑支架 | VARCHAR | 32 | N | - | os-pc-side | 同上 | FK |
| `kitVariants[orientationId][].id` | 可选套件ID | VARCHAR | 32 | N | - | kit-1 | 同机柜的替代配置 | PK(子表) |
| `kitVariants[orientationId][].name` | 可选套件名 | VARCHAR | 64 | N | - | 套件1 · 加宽台面 | 选项卡标题 | - |
| `kitVariants[orientationId][].desc` | 可选套件说明 | VARCHAR | 120 | N | - | 加宽治具板 + 加长定位条 | 选项卡副标题 | - |
| `kitVariants[orientationId][].parts` | 套件部件映射 | JSON | - | N | - | {"column":"os-col-v550"} | 五个槽位→商品id | FK |
| `defaults[orientationId].galvo` | 默认振镜 | VARCHAR | 32 | N | - | os-galvo-fiber | 进入步骤时预选 | FK |
| `defaults[orientationId].fieldLens` | 默认场镜 | VARCHAR | 32 | N | - | os-lens-f110 | 视频振镜时为 null | FK |
| `defaults[orientationId].laser` | 默认激光器 | VARCHAR | 32 | N | - | os-laser-f50 | 同上 | FK |
| `defaults[orientationId].controller` | 默认打标卡 | VARCHAR | 32 | N | - | os-card-f | 同上 | FK |
| `defaults[orientationId].computer` | 默认电脑套装 | VARCHAR | 32 | N | - | os-pc-basic | 同上 | FK |
| `defaults[orientationId].extensions` | 默认扩展件 | JSON | - | N | [] | ["os-ext-belt"] | 多选，可为空 | FK |
| `relations.columnToOpticalPaths` | 立柱→光路兼容 | JSON | - | N | - | {"os-col-v550":["os-opt-vf"]} | 选立柱后过滤光路候选 | FK |
| `relations.galvoToFieldLenses` | 振镜→场镜兼容 | JSON | - | N | - | {"os-galvo-fiber":["os-lens-f110"]} | 视频振镜为空数组=自带场镜 | FK |
| `relations.galvoToLasers` | 振镜→激光器兼容 | JSON | - | N | - | {"os-galvo-uv":["os-laser-uv5"]} | 保证光路波长匹配 | FK |
| `relations.laserToControllers` | 激光器→打标卡兼容 | JSON | - | N | - | {"os-laser-uv5":["os-card-uv"]} | 保证控制协议匹配 | FK |
| `relations.controllerToExtensions` | 打标卡→扩展件兼容 | JSON | - | N | - | {"os-card-f":["os-ext-xy"]} | 扩展件多选白名单 | FK |

## 一站式方案Scheme

> 一站式选配的成品方案快照（下单/报价时的不可变副本）

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `id` | 方案ID | VARCHAR | 32 | Y | - | C01 / scheme:<ts> | 组合方案模板 id 或运行时生成 | PK |
| `name` | 方案名称 | VARCHAR | 120 | Y | - | 台式光纤打标套装·普通款 | 清单与报价单标题 | - |
| `direction` | 加工方向ID | VARCHAR | 32 | Y | - | fiber-desktop | 外键 → orientation.id | FK |
| `model` | 组合型号 | VARCHAR | 64 | N | - | FG1355BP3700S1 | 报价单「规格型号」 | IDX |
| `tag` | 标签 | VARCHAR | 16 | N | - | 标准 / 进阶 | 卡片角标 | - |
| `recommend` | 是否推荐 | TINYINT | 1 | N | 0 | 1 | 推荐位展示 | - |
| `scene` | 适用场景 | VARCHAR | 200 | N | - | 适配圆角机柜的台式光纤打标 | 选型说明 | - |
| `workpiece` | 适用工件 | VARCHAR | 200 | N | - | 不锈钢、碳钢、铝合金 | 选型说明 | - |
| `features` | 方案特性 | JSON | - | N | [] | ["固定脖光纤光路","通用治具板"] | 卖点列表 | - |
| `parts[].id` | 部件商品ID | VARCHAR | 32 | Y | - | columnStandard | 快照最小单元 → product.id | FK |
| `parts[].module` | 部件所属模块 | VARCHAR | 16 | Y | - | 立柱 / 光路 / 附件 / 机柜 | 报价单「备注」列来源 | - |
| `parts[].qty` | 部件数量 | INT | - | Y | 1 | 1..n | 同商品多行时累加计价 | - |
| `parts[].section` | 主体/附件 | VARCHAR | 8 | N | core | core / extras | 区分主体与附件分区 | - |
| `packagePriceFen` | 套餐价（分） | BIGINT | - | N | - | 1585160 | oneStop=true 时按整套计价 | IDX |
| `oneStop` | 是否整套计价 | TINYINT | 1 | N | 1 | 1 | 1=不逐件累加 | - |

## 购物车CartItem

> 购物车行项；一站式方案整条作为 kind=scheme 的一行

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `id` | 行项ID | VARCHAR | 80 | Y | - | laser50:XJ-GX-50W-CX | productId:skuCode（方案行为 scheme:<id>） | PK |
| `productId` | 商品ID | VARCHAR | 32 | N | - | laser50 | 方案行为 null | FK |
| `kind` | 行类型 | VARCHAR | 16 | Y | product | product / scheme | 区分单品与整套方案 | IDX |
| `schemeId` | 方案ID | VARCHAR | 32 | N | - | C01 | kind=scheme 时指向方案快照 | FK |
| `scheme` | 方案快照 | JSON | - | N | - | {parts:[…]} | 整套配置副本，避免后续改价影响已加入项 | - |
| `name` | 商品名称 | VARCHAR | 120 | Y | - | 光纤激光器 50W（创鑫） | 快照，防商品改名 | - |
| `model` | 规格型号 | VARCHAR | 64 | N | - | null | 同上 | - |
| `skuCode` | SKU编码 | VARCHAR | 64 | Y | - | XJ-GX-50W-CX | 方案行存「一站式选购 · 共 N 件配置」 | - |
| `unitPriceFen` | 成交单价（分） | BIGINT | - | Y | - | 480000 | 加入时快照，不随后台调价变化 | - |
| `quantity` | 数量 | INT | - | Y | 1 | 1..999 | 方案行固定 1 | - |
| `image` | 图片 | VARCHAR | 255 | N | - | laser.svg | 列表缩略图 | - |
| `checked` | 是否勾选 | TINYINT | 1 | N | 1 | 1 | 仅前端态，用于选中结算/生成报价单 | - |
| `subtotalFen` | 小计（分） | BIGINT | - | N | - | =unitPriceFen×quantity | 服务端计算校验，勿信前端 | - |

## 订单Order

> 订单主表；金额以分存储，状态机见 01-字典枚举

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `id` | 订单号 | VARCHAR | 32 | Y | - | XJ20261013006 | 业务单号，对外展示 | PK |
| `status` | 订单状态 | VARCHAR | 16 | Y | 待付款 | 待付款/待核款/待发货/待收货/运输中/已完成/已取消 | 驱动列表筛选与操作按钮 | IDX |
| `createdAt` | 下单时间 | DATETIME | - | Y | - | 2026-10-13 14:22 | 列表排序依据 | IDX |
| `payMethod` | 支付方式 | VARCHAR | 32 | N | - | 对公转账 / 在线支付 | 未支付时为 null | - |
| `addressId` | 收货地址ID | VARCHAR | 32 | Y | - | a1 | 外键 → address.id | FK |
| `remark` | 订单备注 | VARCHAR | 500 | N | - | 请随货附上检验报告 | 客户留言 | - |
| `totalFen` | 订单总额（分） | BIGINT | - | Y | - | 131000 | =Σ明细小计；服务端重算校验 | - |
| `buyerCompanyId` | 采购企业ID | VARCHAR | 32 | N | - | C1 | 外键 → company.id，账期与开票主体 | FK |
| `createdBy` | 下单人 | VARCHAR | 32 | N | - | 张建国 | 外键 → profile.id | FK |

## 订单明细OrderItem

> 订单行快照，下单后不随商品表变化

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `id` | 明细ID | BIGINT | - | Y | 自增 | 1 | 主键 | PK |
| `orderId` | 订单号 | VARCHAR | 32 | Y | - | XJ20261013006 | 外键 → order.id | FK |
| `productId` | 商品ID | VARCHAR | 32 | Y | - | lens110 | 指向 product.id；方案行为 null | FK |
| `kind` | 行类型 | VARCHAR | 16 | Y | product | product / scheme | 同购物车口径 | - |
| `name` | 商品名称 | VARCHAR | 120 | Y | - | 场镜 110 × 110mm | 快照 | - |
| `model` | 规格型号 | VARCHAR | 64 | N | - | null | 快照 | - |
| `skuCode` | SKU编码 | VARCHAR | 64 | Y | - | XJ-LB-110 | 快照 | - |
| `quantity` | 数量 | INT | - | Y | 1 | 1 | 同 SKU 合并后数量 | - |
| `unitPriceFen` | 成交单价（分） | BIGINT | - | Y | - | 85000 | 下单时快照 | - |
| `subtotalFen` | 小计（分） | BIGINT | - | Y | - | 85000 | =unitPriceFen×quantity | - |

## 物流Logistics

> 按订单号 1:1 关联的物流轨迹

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `orderId` | 订单号 | VARCHAR | 32 | Y | - | XJ20260918001 | 主键兼外键 → order.id | PK/FK |
| `company` | 承运商 | VARCHAR | 32 | N | - | 顺丰速运 | 轨迹页头部 | - |
| `waybill` | 运单号 | VARCHAR | 64 | N | - | SF1384421685297 | 可复制/跳转查询 | IDX |
| `nodes[].time` | 节点时间 | DATETIME | - | Y | - | 2026-09-21 16:32 | 轨迹倒序展示 | - |
| `nodes[].title` | 节点标题 | VARCHAR | 64 | Y | - | 已签收 | 轨迹主文案 | - |
| `nodes[].desc` | 节点描述 | VARCHAR | 255 | N | - | 快件已由本人签收 | 轨迹详情 | - |
| `nodes[].state` | 节点状态 | VARCHAR | 8 | Y | todo | done / active / todo | 控制时间轴高亮 | - |

## 合同Contract

> 电子采购合同；签署后生成带章 PDF

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `id` | 合同编号 | VARCHAR | 32 | Y | - | HT20260918001 | 主键 | PK |
| `orderId` | 关联订单号 | VARCHAR | 32 | Y | - | XJ20260918001 | 外键 → order.id，1:1 | FK/UK |
| `title` | 合同名称 | VARCHAR | 120 | Y | - | 工业激光配件采购合同 | 单据标题 | - |
| `amountFen` | 合同金额（分） | BIGINT | - | Y | - | 504000 | 与订单总额一致 | - |
| `buyer` | 买方名称 | VARCHAR | 120 | Y | - | 深圳市精刻自动化设备有限公司 | 取企业资料 | - |
| `buyerTaxId` | 买方税号 | VARCHAR | 32 | N | - | 91440300MA5JK8811X | 开票与合同必备 | - |
| `seller` | 卖方名称 | VARCHAR | 120 | Y | - | 鑫戩智能装备（苏州）有限公司 | 平台主体常量 PLATFORM | - |
| `status` | 合同状态 | VARCHAR | 16 | Y | 待买方签署 | 待买方签署 / 已生效 | 决定是否可下载带章件 | IDX |
| `createdAt` | 生成时间 | DATETIME | - | Y | - | 2026-09-18 | 创建时间 | - |
| `signedAt` | 签署时间 | DATETIME | - | N | - | 2026-09-18 17:42 | 签署后回填 | - |
| `terms` | 合同条款 | TEXT | - | N | - | 含13%增值税及运费；质保12个月 | 正文条款摘要 | - |
| `fileUrl` | 合同文件地址 | VARCHAR | 255 | N | - | - | 未盖章版 PDF | - |
| `sealFileUrl` | 带章文件地址 | VARCHAR | 255 | N | - | - | 签署后生成 | - |

## 发票Invoice

> 开票申请与开具状态

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `id` | 发票ID | VARCHAR | 32 | Y | - | INV20260922001 | 主键 | PK |
| `orderId` | 关联订单号 | VARCHAR | 32 | Y | - | XJ20260918001 | 外键 → order.id | FK |
| `type` | 发票类型 | VARCHAR | 16 | Y | - | 增值税专用发票 / 增值税普通发票 | 决定必填税号 | IDX |
| `title` | 发票抬头 | VARCHAR | 120 | Y | - | 深圳市精刻自动化设备有限公司 | 默认取企业名称 | - |
| `taxId` | 纳税人识别号 | VARCHAR | 32 | Y | - | 91440300MA5JK8811X | 专票必填 | - |
| `amountFen` | 开票金额（分） | BIGINT | - | Y | - | 504000 | 不得超过订单已支付金额 | - |
| `status` | 开票状态 | VARCHAR | 16 | Y | 审核中 | 审核中 / 已开具 / 已驳回 | 驱动按钮与提示 | IDX |
| `email` | 接收邮箱 | VARCHAR | 120 | N | - | finance@jingke.com | 电子票推送地址 | - |
| `appliedAt` | 申请时间 | DATETIME | - | Y | - | 2026-09-20 10:12 | 创建时间 | - |
| `issuedAt` | 开具时间 | DATETIME | - | N | - | 2026-09-22 09:30 | 已开具时回填 | - |
| `fileUrl` | 发票文件 | VARCHAR | 255 | N | - | - | PDF/OFD 下载地址 | - |

## 售后Aftersale

> 售后工单（退换修）与处理轨迹

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `id` | 工单号 | VARCHAR | 32 | Y | - | AS20261005001 | 主键 | PK |
| `orderId` | 关联订单号 | VARCHAR | 32 | Y | - | XJ20260925007 | 外键 → order.id | FK |
| `type` | 售后类型 | VARCHAR | 16 | Y | - | 维修换货 / 退货退款 | 决定表单字段 | IDX |
| `reason` | 问题描述 | TEXT | - | Y | - | 清洁液瓶盖渗漏，申请换货 | 客户填写 | - |
| `status` | 工单状态 | VARCHAR | 16 | Y | 处理中 | 处理中 / 已完成 | 列表筛选 | IDX |
| `createdAt` | 提交时间 | DATETIME | - | Y | - | 2026-10-05 14:10 | 创建时间 | - |
| `steps[].title` | 环节标题 | VARCHAR | 64 | Y | - | 客服审核 | 时间轴节点 | - |
| `steps[].desc` | 环节说明 | VARCHAR | 255 | N | - | 售后客服已审核通过 | 时间轴描述 | - |
| `steps[].time` | 环节时间 | DATETIME | - | N | - | 2026-10-06 10:22 | 未完成为 null | - |
| `steps[].state` | 环节状态 | VARCHAR | 8 | Y | todo | done / active / todo | 高亮当前环节 | - |
| `attachments` | 凭证附件 | JSON | - | N | [] | ["url1","url2"] | 照片/视频证据 | - |

## 报价单Quote

> 报价单单据模型；页面与 PNG 导出共用同一口径

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `quoteNo` | 报价单号 | VARCHAR | 32 | Y | 自动生成 | XJJS-261027B12 | 规则 XJJS-YYMMDD+B+两位流水，应由后端持久化 | UK |
| `quoteDate` | 报价日期 | DATE | - | Y | 当天 | 2026-10-27 | 落款「报价人」下方日期 | - |
| `customerName` | 客户名称 | VARCHAR | 120 | Y | - | 深圳市精刻自动化设备有限公司 | 取当前企业 | - |
| `customerContact` | 联系人 | VARCHAR | 32 | N | - | 张建国 | 取企业 contact | - |
| `customerPhone` | 联系电话 | VARCHAR | 20 | N | - | 13800000000 | 取企业 phone | - |
| `sellerName` | 报价方名称 | VARCHAR | 120 | Y | - | 吉安鑫戬科技有限公司 | 落款「报价人」，非业务员姓名 | - |
| `sellerSender` | 业务员 | VARCHAR | 32 | N | - | 符工 | 右侧联系卡片展示 | - |
| `sellerPhone` | 业务员电话 | VARCHAR | 20 | N | - | 13828785327 | 联系卡片可拨号 | - |
| `sellerAddress` | 公司地址 | VARCHAR | 200 | N | - | 江西省吉安市永新县工业开发区 | 抬头右栏 | - |
| `rows[].index` | 序号 | INT | - | Y | - | 1..n | 表格行号 | - |
| `rows[].name` | 产品名称 | VARCHAR | 120 | Y | - | 场镜 110 × 110mm | 明细第一列 | - |
| `rows[].model` | 规格型号 | VARCHAR | 64 | N | - | JG-GS-01 | 空值显示「待补充」 | - |
| `rows[].qty` | 数量 | INT | - | Y | 1 | 2 | 购物车口径的数量 | - |
| `rows[].unit` | 单位 | VARCHAR | 8 | N | 台 | 台 / 套 | 方案行为「套」 | - |
| `rows[].priceFen` | 单价（分） | BIGINT | - | N | - | 12000 | 取快照价，非目录价 | - |
| `rows[].totalFen` | 总价（分） | BIGINT | - | N | - | 24000 | 单价×数量 | - |
| `rows[].remark` | 备注 | VARCHAR | 64 | N | - | 一站式方案 | 方案行标注模块 | - |
| `totalFen` | 合计金额（分） | BIGINT | - | N | - | 70000 | 任一行待报价则整体为 null | - |
| `totalWords` | 合计大写 | VARCHAR | 64 | N | - | 柒佰元整 | 人民币大写，后端需同规则 | - |
| `notes` | 报价说明 | JSON | - | N | - | ["含13%增值税…","质保12个月…"] | 已移除报价有效期与交货周期 | - |

## 地址Address

> 收货地址簿

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `id` | 地址ID | VARCHAR | 32 | Y | - | a1 | 主键 | PK |
| `name` | 收货人 | VARCHAR | 32 | Y | - | 张经理 | 联系姓名 | - |
| `phone` | 联系电话 | VARCHAR | 20 | Y | - | 13800000000 | 手机号 | - |
| `full` | 详细地址 | VARCHAR | 255 | Y | - | 广东省深圳市南山区科技园 | 省市区+详细地址拼接 | - |
| `primary` | 是否默认 | TINYINT | 1 | N | 0 | 1 | 全表仅一条为 1 | IDX |
| `companyId` | 所属企业 | VARCHAR | 32 | N | - | C1 | 多企业地址隔离 | FK |

## 企业Company

> 客户企业主体与认证状态

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `id` | 企业ID | VARCHAR | 32 | Y | - | C1 | 主键 | PK |
| `name` | 企业名称 | VARCHAR | 120 | Y | - | 深圳市精刻自动化设备有限公司 | 合同/发票抬头 | - |
| `taxId` | 统一社会信用代码 | VARCHAR | 32 | Y | - | 91440300MA5JK8811X | 开票与合同必备，唯一 | UK |
| `contact` | 联系人 | VARCHAR | 32 | N | - | 张建国 | 默认联系人 | - |
| `phone` | 联系电话 | VARCHAR | 20 | N | - | 13800000000 | 默认电话 | - |
| `role` | 角色描述 | VARCHAR | 64 | N | - | 主企业 · 采购经理 | 多企业切换展示 | - |
| `status` | 认证状态 | VARCHAR | 16 | Y | 待认证 | 待认证 / 已认证 / 已驳回 | 仅认证企业可批发采购 | IDX |
| `current` | 是否当前企业 | TINYINT | 1 | N | 0 | 1 | 切换企业用 | - |
| `authFlow` | 认证流程 | JSON | - | N | [] | [{"title":"提交认证资料","state":"done"}] | 认证进度时间轴 | - |

## 用户Profile

> 当前登录用户资料（个人维度，与企业解耦）

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `id` | 用户ID | VARCHAR | 32 | Y | - | U1 | 主键 | PK |
| `name` | 姓名 | VARCHAR | 32 | Y | - | 张建国 | 顶部账号区展示 | - |
| `mobile` | 手机号 | VARCHAR | 20 | Y | - | 138****0000 | 登录凭证，脱敏展示 | UK |
| `email` | 邮箱 | VARCHAR | 120 | N | - | zhangjianguo@jingke.com | 通知与发票接收 | - |
| `role` | 岗位 | VARCHAR | 32 | N | - | 采购经理 | 展示用 | - |
| `companyId` | 所属企业 | VARCHAR | 32 | N | - | C1 | 外键 → company.id | FK |
| `authStatus` | 认证状态 | VARCHAR | 16 | N | - | 已认证 | 与企业认证同步 | - |
| `points` | 积分余额 | INT | - | N | 0 | 2300 | 兑换后扣减，持久化 | - |
| `token` | 登录令牌 | VARCHAR | 255 | N | - | Bearer … | localStorage 键 xinjian-token | - |

## 消息Message

> 站内消息中心

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `id` | 消息ID | VARCHAR | 32 | Y | - | M007 | 主键 | PK |
| `type` | 消息类型 | VARCHAR | 16 | Y | - | order / contract / invoice / aftersale / system | 决定图标与跳转路由 | IDX |
| `title` | 标题 | VARCHAR | 64 | Y | - | 合同待您签署 | 列表主文案 | - |
| `content` | 正文 | VARCHAR | 500 | N | - | 订单 XJ… 的电子合同已生成 | 列表副文案 | - |
| `time` | 时间 | DATETIME | - | Y | - | 2026-10-11 10:02 | 倒序排列 | IDX |
| `read` | 是否已读 | TINYINT | 1 | Y | 0 | 0 | 未读数角标 | IDX |
| `bizId` | 业务主键 | VARCHAR | 32 | N | - | XJ20261010003 | 点击跳转对应单据 | FK |

## 积分PointsLedger

> 积分收支流水（余额另存于 profile.points）

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `id` | 流水ID | VARCHAR | 32 | Y | - | P006 | 主键 | PK |
| `type` | 收支类型 | VARCHAR | 16 | Y | - | earn / exchange | earn=获得，exchange=兑换扣减 | IDX |
| `title` | 摘要 | VARCHAR | 120 | Y | - | 积分兑换 · 保护镜片 30mm | 流水行标题 | - |
| `points` | 变动积分 | INT | - | Y | - | -1200 | 正数获得、负数扣减 | - |
| `balance` | 变动后余额 | INT | - | Y | - | 2300 | 用于对账 | - |
| `time` | 时间 | DATETIME | - | Y | - | 2026-10-08 15:50 | 倒序排列 | IDX |
| `orderId` | 关联订单 | VARCHAR | 32 | N | - | XJ20261008002 | 兑换/采购入账来源 | FK |

## 推荐Referral

> 推荐有礼：邀请码与奖励结算

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `code` | 我的邀请码 | VARCHAR | 16 | Y | - | XJ8K86 | 唯一，可复制分享 | UK |
| `rule` | 活动规则 | TEXT | - | N | - | 首笔采购后奖励800积分 | 页面说明文案 | - |
| `totalReward` | 累计奖励 | INT | - | N | 0 | 800 | 已结算积分合计 | - |
| `pendingReward` | 待结算 | INT | - | N | 0 | 500 | 待入账积分 | - |
| `invited[].company` | 被推荐企业 | VARCHAR | 120 | Y | - | 东莞市锐捷激光科技有限公司 | 明细行 | - |
| `invited[].time` | 注册时间 | DATE | - | Y | - | 2026-09-22 | 明细行 | - |
| `invited[].status` | 进度 | VARCHAR | 16 | Y | - | 已浏览 / 已注册 / 已签约 | 决定是否结算 | IDX |
| `invited[].reward` | 奖励积分 | INT | - | N | 0 | 800 | 签约后发放 | - |
| `invited[].settled` | 是否已结算 | TINYINT | 1 | N | 0 | 0 | 防重复发放 | - |

## 学习内容Content

> 学习中心文章/视频，模块化区块正文

| 字段 | 中文名 | 类型 | 长度 | 必填 | 默认 | 枚举/示例 | 说明 | 键 |
|---|---|---|---|---|---|---|---|---|
| `id` | 内容ID | VARCHAR | 32 | Y | - | A1 | 主键 | PK |
| `title` | 标题 | VARCHAR | 200 | Y | - | 从选型到装配：光纤打标机入门 | 列表与详情标题 | - |
| `cat` | 栏目 | VARCHAR | 32 | Y | - | 操作视频 / 操作手册 / 选型指南 | 列表筛选 | IDX |
| `type` | 内容类型 | VARCHAR | 16 | Y | - | 视频 / 图文 | 决定封面角标 | - |
| `date` | 发布日期 | DATE | - | Y | - | 2026-10-08 | 排序依据 | IDX |
| `read` | 阅读量 | INT | - | N | 0 | 1286 | 展示热度 | - |
| `image` | 封面图 | VARCHAR | 255 | N | - | machine | 列表封面 | - |
| `tag` | 角标文案 | VARCHAR | 16 | N | - | 12:36（视频时长） | 封面右上角 | - |
| `desc` | 摘要 | VARCHAR | 300 | N | - | 认识激光器、光路、立柱的协作 | 列表副文案 | - |
| `author` | 作者 | VARCHAR | 64 | N | - | 鑫戩技术部 | 详情署名 | - |
| `source` | 来源 | VARCHAR | 32 | N | - | 原创 / 转载 | 版权标识 | - |
| `relatedProducts` | 关联商品 | JSON | - | N | [] | ["laser50"] | 详情页推荐购买 | FK |
| `topics` | 所属专题 | JSON | - | N | [] | ["光纤打标机选型专题"] | 专题聚合用 | - |
| `body.summary` | 导语 | TEXT | - | N | - | 用12分钟建立整机认识… | 详情首段 | - |
| `body.blocks[].type` | 区块类型 | VARCHAR | 16 | Y | - | heading / list / paragraph / video / table | 富文本渲染器按类型分发 | - |
| `body.blocks[].text` | 区块文本 | TEXT | - | N | - | 本期看点 | heading/paragraph 用 | - |
| `body.blocks[].html` | 区块富文本 | TEXT | - | N | - | <p>…</p> | paragraph 用，需服务端 XSS 过滤 | - |
| `body.blocks[].items` | 列表项 | JSON | - | N | [] | ["要点一","要点二"] | list 用 | - |
| `body.blocks[].ordered` | 是否有序 | TINYINT | 1 | N | 0 | 0 | list 用 | - |
| `body.blocks[].url` | 视频地址 | VARCHAR | 255 | N | - | null | video 用 | - |
| `body.blocks[].poster` | 视频封面 | VARCHAR | 255 | N | - | machine | video 用 | - |
| `body.blocks[].duration` | 视频时长 | VARCHAR | 16 | N | - | 12:36 | video 用 | - |
| `attachments[].name` | 附件名 | VARCHAR | 200 | N | - | 设备点检周期表（模板）.xlsx | 下载区 | - |
| `attachments[].url` | 附件地址 | VARCHAR | 255 | N | - | /files/… | 下载链接 | - |

## 接口清单API

> 前端已按此边界拆分，后端按同名同义实现即可

| 方法 | 用途 | 路径 | 请求字段 | 响应实体 | 前端文件 | 方法名 |
|---|---|---|---|---|---|---|
| GET | 商品列表 | `/products` | query: q/cat/page/pageSize | {items:[Product],total} | product/api.js | productsApi.list |
| GET | 商品详情 | `/products/:id` | path: id | Product | product/api.js | productsApi.detail |
| GET | 分类树 | `/categories` | - | [Category] | product/api.js | productsApi.categories |
| GET | 套装列表 | `/packages` | - | [Package] | product/api.js | productsApi.packages |
| GET | 一站式目录 | `/one-stop/catalog` | - | oneStopCatalog | selection/api.js | oneStopApi.catalog |
| POST | 一站式试算 | `/one-stop/calculate` | selection / direction | {retailFen,bundleFen,savingsFen} | selection/api.js | oneStopApi.calculate |
| POST | 保存选配草稿 | `/one-stop/drafts` | scheme | {id} | selection/api.js | oneStopApi.saveDraft |
| GET | 报价单 | `/quote` | schemeId 或 rows | Quote | selection/domain/quoteDoc | - |
| POST | 下单 | `/orders` | items[]/addressId/remark | Order | trade/api.js | ordersApi.submit |
| GET | 订单列表 | `/orders` | status/page | {items:[Order],total} | trade/api.js | ordersApi.list |
| GET | 订单详情 | `/orders/:id` | path: id | Order | trade/api.js | ordersApi.detail |
| POST | 支付订单 | `/orders/:id/pay` | payMethod | Order | trade/api.js | ordersApi.pay |
| POST | 取消订单 | `/orders/:id/cancel` | reason | Order | trade/api.js | ordersApi.cancel |
| POST | 确认收货 | `/orders/:id/confirm-receipt` | - | Order | trade/api.js | ordersApi.confirm |
| POST | 催发货 | `/orders/:id/remind` | - | {ok} | trade/api.js | ordersApi.remind |
| GET | 物流轨迹 | `/business/logistics/:orderId` | path: orderId | Logistics | trade/api.js | businessApi.logistics |
| GET | 合同列表/详情 | `/business/contracts` | id / idOrOrderId | [Contract] / Contract | billing/api.js | contractApi |
| POST | 签署合同 | `/business/contracts/:id/sign` | seal | Contract | billing/api.js | contractApi.sign |
| GET | 合同文件 | `/business/contracts/:id/file` | - | PDF | billing/api.js | contractApi.file |
| GET | 带章合同文件 | `/business/contracts/:id/seal-file` | - | PDF | billing/api.js | contractApi.sealFile |
| GET | 发票列表/详情 | `/business/invoices` | id | [Invoice] / Invoice | billing/api.js | invoiceApi |
| POST | 申请开票 | `/business/invoices` | type/title/taxId/amountFen/email | Invoice | billing/api.js | invoiceApi.create |
| POST | 驳回后重提 | `/business/invoices/:id/resubmit` | patch | Invoice | billing/api.js | invoiceApi.resubmit |
| GET | 售后列表/详情 | `/business/aftersales` | id / idOrOrderId | [Aftersale] / Aftersale | service/api.js | aftersaleApi |
| POST | 提交售后 | `/business/aftersales` | orderId/type/reason/attachments | Aftersale | service/api.js | aftersaleApi.create |
| POST | 上传售后凭证 | `/business/aftersales/:id/attachments` | files | {urls} | service/api.js | aftersaleApi.upload |
| POST | 取消售后 | `/business/aftersales/:id/cancel` | reason | Aftersale | service/api.js | aftersaleApi.cancel |
| GET | 地址列表 | `/business/addresses` | - | [Address] | account/api.js | addressApi.list |
| POST/PUT | 新增/编辑地址 | `/business/addresses[/:id]` | Address | Address | account/api.js | addressApi.save |
| PUT | 设为默认地址 | `/business/addresses/:id/default` | - | {ok} | account/api.js | addressApi.setDefault |
| GET | 企业列表 | `/business/companies` | - | [Company] | account/api.js | companyApi.list |
| POST | 切换企业 | `/business/companies/:id/switch` | - | Company | account/api.js | companyApi.switch |
| GET | 个人资料 | `/business/profile` | - | Profile | account/api.js | profileApi.get |
| GET | 认证进度 | `/business/auth-flow` | - | [AuthFlowNode] | account/api.js | authApi.flow |
| GET | 消息列表 | `/business/messages` | type/page | [Message] | account/api.js | messageApi.list |
| POST | 标记已读 | `/business/messages/:id/read` | - | {ok} | account/api.js | messageApi.read |
| POST | 全部已读 | `/business/messages/read-all` | - | {ok} | account/api.js | messageApi.readAll |
| GET | 积分余额 | `/business/points` | - | {points} | marketing/api.js | pointsApi.balance |
| GET | 积分流水 | `/business/points-ledger` | page | [PointsLedger] | marketing/api.js | pointsApi.ledger |
| POST | 积分兑换 | `/business/points/exchange` | productId | PointsLedger | marketing/api.js | pointsApi.exchange |
| GET | 推荐有礼 | `/business/referral` | - | Referral | marketing/api.js | referralApi.get |
| GET | 客户支持 | `/business/support` | - | Support | service/api.js | supportApi.get |
| GET | 学习内容 | `/learning` | cat/page | [Content] | learning/api.js | learningApi.list |
| GET | 服务说明 | `/service` | - | ServicePage | service/api.js | serviceApi.support |
| GET | 省市区字典 | `/regions` | parentId | [Region] | mock/regions.js | regionApi |
| POST | 登录 | `/auth/login` | mobile/code 或 password | {token,profile} | account/api.js | authApi.login |
| POST | 退出 | `/auth/logout` | - | {ok} | account/api.js | authApi.logout |

## 表关系ER

> 表间关联与基数，供建表时加外键/索引参考

| 表 | 字段 | 关联表 | 关联字段 | 基数 | 说明 |
|---|---|---|---|---|---|
| `product` | cat | category | id | N:1 | 商品归属分类；建索引 |
| `product` | id | product_sku | productId | 1:N | 多规格（功率/冷却） |
| `package` | items | product | id | N:N | JSON 数组，建议拆 package_item 关联表 |
| `one_stop_product` | id | product | id | 1:1 | 共用 id 空间，可视为 product 的扩展类型 |
| `one_stop_orientation` | cabinetIds | one_stop_product | id | 1:N | 方向限定可选机柜 |
| `one_stop_kit` | cabinetId | one_stop_product | id | N:1 | 机柜带出默认铝件套件 |
| `one_stop_kit_part` | productId | one_stop_product | id | N:1 | 五槽位各指向一个部件 |
| `one_stop_relation` | fromId/toId | one_stop_product | id | N:N | 兼容关系矩阵（立柱→光路等） |
| `scheme` | parts[].id | one_stop_product | id | N:N | 方案快照，建议拆 scheme_part |
| `cart_item` | productId | product | id | N:1 | kind=scheme 时为空 |
| `cart_item` | scheme | scheme | id | N:1 | 方案行内嵌快照 |
| `order` | addressId | address | id | N:1 | 下单时快照地址文本更稳妥 |
| `order_item` | orderId | order | id | 1:N | 级联删除需谨慎，按审计要求保留 |
| `order_item` | productId | product | id | N:1 | 仅作溯源，价格以快照为准 |
| `logistics` | orderId | order | id | 1:1 | 一单一运单，多包裹需扩展 |
| `contract` | orderId | order | id | 1:1 | 一单一合同 |
| `invoice` | orderId | order | id | N:1 | 可分批开票 |
| `aftersale` | orderId | order | id | N:1 | 一单可多次售后 |
| `aftersale_step` | aftersaleId | aftersale | id | 1:N | 处理轨迹 |
| `message` | bizId | order/contract/invoice/aftersale | id | N:1 | 多态关联，type 决定目标表 |
| `points_ledger` | orderId | order | id | N:1 | 采购入账/兑换扣减均可追溯 |
| `profile` | companyId | company | id | N:1 | 一人可绑多企业时改为 user_company 关联表 |
| `address` | companyId | company | id | N:1 | 企业级地址簿 |
| `referral_invited` | code | referral | code | 1:N | 邀请明细 |
| `content` | relatedProducts | product | id | N:N | 关联商品，建议拆 content_product |
