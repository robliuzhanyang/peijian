<!--
  页面：搜索与联想（search.vue）
  路由：/search ｜ 分组：采购入口
  作用：按产品名称、系列、产品型号及可售 SKU 关键词检索商品并展示结果网格
  数据：读取 Vuex state.products / state.categories；关键词 q 初始化自路由 query.q
-->
<template>
  <div>
    <!-- 页头：标题 + 可搜索字段说明 -->
    <div class="page-title">
      <h1>搜索商品</h1>
      <small>可搜索产品名称、系列、产品型号及可售 SKU</small>
    </div>
    <!-- 搜索工具栏：输入框 + 搜索按钮 + 结果计数 -->
    <div class="card list-toolbar">
      <!-- 搜索控件：回车或点击「搜索」提交关键词 -->
      <div class="filter-controls">
        <input v-model="q" placeholder="例如 LZ130-550U" @keyup.enter="apply" /><button
          class="btn primary"
          @click="apply"
        >
          搜索
        </button>
      </div>
      <span class="tiny">找到 {{ products.length }} 个结果</span>
    </div>
    <!-- 搜索结果网格 -->
    <div class="product-grid"><ProductCard v-for="p in products" :key="p.id" :product="p" /></div>
    <!-- 无结果空态 -->
    <div v-if="!products.length" class="empty">没有搜索结果。</div>
  </div>
</template>
<script>
// 商品卡片组件
import ProductCard from '@/components/ProductCard.vue'
// 领域工具：金额分转元、静态资源路径、空字段占位
import { money, asset, fieldValue } from '@/domain/productFields'
export default {
  components: { ProductCard },
  data() {
    // 查询条件：关键词 q 取路由 query；cat、sort 与商品列表页保持同构（本页模板未提供入口）
    return { q: this.$route.query.q || '', cat: this.$route.query.cat || '', sort: 'default' }
  },
  computed: {
    // 匹配商品：关键词在名称/型号/SKU/系列中做包含匹配，并兼容分类参数；价格排序时无价格商品排最后
    products() {
      let a = this.$store.state.products.filter(
        (p) =>
          (!this.q ||
            [p.name, p.model, p.skuCode, p.series].some(
              (x) => x && x.toLowerCase().includes(this.q.toLowerCase())
            )) &&
          (!this.cat || p.cat === this.cat)
      )
      return this.sort === 'price'
        ? a.slice().sort((x, y) => (x.priceFen ?? Infinity) - (y.priceFen ?? Infinity))
        : a
    },
    // 分类数据（本页模板未直接渲染，保留同构数据来源）
    categories() {
      return this.$store.state.categories
    },
  },
  watch: {
    // 路由 query 变化时同步关键词与分类
    '$route.query'(v) {
      this.q = v.q || ''
      this.cat = v.cat || ''
    },
  },
  methods: {
    // 提交搜索：把关键词与分类写回路由 query，驱动结果更新
    apply() {
      this.$router.push({ path: this.$route.path, query: { q: this.q, cat: this.cat } })
    },
  },
}
</script>
