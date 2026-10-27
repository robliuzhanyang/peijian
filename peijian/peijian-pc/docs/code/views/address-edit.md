# 新增编辑地址（address-edit.vue）

| 项目 | 说明 |
| --- | --- |
| 文件路径 | `src/views/address-edit.vue` |
| 路由地址 | `/address-edit` |
| 路由名称 | `address-edit` |
| 业务分组 | 企业与账号 |
| 页面标题 | 新增编辑地址 |

## 页面作用

收货地址录入表单，填写收货人、手机号码、省 / 市 / 区及详细地址，校验通过后保存到 Vuex 地址列表并返回收货地址页。

## 数据来源

- 组件 `data`：`name`（收货人）、`phone`（手机号）、`full`（完整地址），均通过 `v-model.trim` 绑定
- 保存时通过 Vuex mutation `addAddress` 写入 `state.addresses`（store 自动生成 `id` 并本地持久化），无接口调用
- 不读取路由参数，不回填已有地址

## 交互说明

| 操作 | 触发 | 行为 |
| --- | --- | --- |
| 填写地址信息 | 输入框 / 文本域录入 | 双向绑定到对应字段，自动去除首尾空格 |
| 保存地址 | 点击"保存地址" | 姓名非空、手机号符合 `/^1\d{10}$/`（以 1 开头共 11 位数字）、地址非空时：提交 `addAddress`（`primary` 固定为 `false`）并跳转 `/addresses`；否则提交 `setNotice` 提示"请填写姓名、有效手机号和完整地址" |

## 依赖的组件或工具

- Vue Router：`$router.push('/addresses')`
- Vuex：mutation `addAddress`（新增并持久化）、`setNotice`（校验提示）

## 状态与边界

- 路由名为"新增编辑地址"，但当前仅实现新增：不接收地址 id、不做编辑回填
- 仅校验手机号格式与姓名/地址非空，不做省市区联动选择
- 新地址固定为非默认地址，数据保存在前端本地
