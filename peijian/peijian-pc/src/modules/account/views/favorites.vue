<!--
  页面：常用套装与方案（favorites.vue）
  路由：/favorites ｜ 分组：积分与营销
  作用：以卡片网格展示已收藏的产品资料，无收藏时给出空态与浏览产品入口
  数据：读取 Vuex state.products 与 state.favorites（收藏商品 id 列表，localStorage 持久化）
-->
<template>
  <div>
    <!-- 页头：标题 + 副标题 -->
    <div class="page-title">
      <h1>常用套装与方案</h1>
      <small>收藏的产品资料</small>
    </div>
    <!-- 收藏商品网格：复用 ProductCard 组件渲染，右上角提供取消收藏 -->
    <div class="product-grid">
      <div v-for="p in favorites" :key="p.id" class="fav-item">
        <ProductCard :product="p" />
        <button
          class="fav-remove"
          type="button"
          @click="$store.commit('toggleFavorite', p.id)"
        >
          取消收藏
        </button>
      </div>
    </div>
    <!-- 空收藏态 -->
    <div v-if="!favorites.length" class="empty">
      暂无收藏。<router-link to="/goods">浏览产品</router-link>
    </div>
  </div>
</template>
<script>
// 商品卡片组件：负责单个商品的图片、名称、价格与收藏/加购等展示
import ProductCard from '@/components/ProductCard.vue'
export default {
  components: { ProductCard },
  computed: {
    // 已收藏商品：从商品目录中筛出 id 命中收藏列表的商品
    favorites() {
      return this.$store.state.products.filter((p) => this.$store.state.favorites.includes(p.id))
    },
  },
}
</script>
<style>
/* 收藏卡片：右上角悬浮「取消收藏」 */
.fav-item {
  position: relative;
}
.fav-remove {
  position: absolute;
  top: 9px;
  right: 9px;
  z-index: 3;
  padding: 3px 8px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: #fff;
  color: #8a99ac;
  font-size: 11px;
  cursor: pointer;
}
.fav-remove:hover {
  border-color: #f2d3d1;
  color: var(--red);
}
</style>
