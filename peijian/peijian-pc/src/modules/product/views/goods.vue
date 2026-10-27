<!--
  页面：配件采购（goods.vue）
  路由：/goods ｜ 分组：采购入口
  作用：左侧一级分类导航，右侧筛选条 + 二级分类快捷筛选 + 商品网格；
        点击左侧分类直接切换列表，点击二级分类按关键词筛选，保持最多两级。
  数据：读取 Vuex state.products / state.categories；筛选条件初始化自路由 query.q、query.cat
-->
<template>
  <div>
    <div class="list-layout">
      <!-- 左栏：一级分类导航 -->
      <aside class="card filter-aside">
        <div class="cat-head">全部商品分类</div>
        <router-link class="cat-item" :class="{ on: !cat }" to="/goods">
          <AppIcon name="grid" /><span>全部配件</span><em>{{ totalCount }}</em>
        </router-link>
        <router-link
          v-for="c in categories"
          :key="c.id"
          class="cat-item"
          :class="{ on: cat === c.id }"
          :to="{ path: '/goods', query: { cat: c.id } }"
        >
          <AppIcon :name="c.icon" /><span>{{ c.name }}</span
          ><em>{{ countByCat(c.id) }}</em>
        </router-link>
      </aside>

      <div>
        <!-- 筛选工具栏：关键词输入、分类下拉、排序方式与结果计数 -->
        <div class="card list-toolbar">
          <div class="filter-controls">
            <input
              v-model="q"
              placeholder="名称 / 型号 / SKU"
              @keyup.enter="apply"
            /><select v-model="cat" @change="apply">
              <option value="">全部分类</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">
                {{ c.name }}
              </option></select
            ><select v-model="sort">
              <option value="default">综合排序</option>
              <option value="price">价格从低到高</option></select
            ><button class="btn primary sm" @click="apply">筛选</button>
          </div>
          <span class="tiny"
            >{{ products.length }} 件商品 · 客户资料产品待报价</span
          >
        </div>

        <!-- 二级分类快捷筛选：随左侧一级分类联动 -->
        <div v-if="activeChildren.length" class="chips cat-chips">
          <button
            type="button"
            class="chip"
            :class="{ on: !q }"
            @click="pickChild('')"
          >
            全部{{ activeCategory.name }}
          </button>
          <button
            v-for="child in activeChildren"
            :key="child"
            type="button"
            class="chip"
            :class="{ on: q === child }"
            @click="pickChild(child)"
          >
            {{ child }}
          </button>
        </div>

        <!-- 商品网格：每张卡片由 ProductCard 渲染 -->
        <div class="product-grid">
          <ProductCard v-for="p in products" :key="p.id" :product="p" />
        </div>
        <!-- 空结果态：二级分类无匹配时给出回退入口 -->
        <div v-if="!products.length" class="empty">
          暂无匹配商品，试试更换关键词。
          <router-link
            v-if="cat && q"
            class="btn sm"
            style="margin-top: 10px"
            :to="{ path: '/goods', query: { cat } }"
            >查看全部{{ activeCategory.name }}</router-link
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// 商品卡片与线性图标
import ProductCard from "@/components/ProductCard.vue";
import AppIcon from "@/components/AppIcon.vue";
export default {
  components: { ProductCard, AppIcon },
  data() {
    // 筛选条件：关键词 q 与分类 cat 初始取路由 query；sort 支持综合排序 / 价格升序
    return {
      q: this.$route.query.q || "",
      cat: this.$route.query.cat || "",
      sort: "default",
    };
  },
  computed: {
    // 过滤后的商品：关键词匹配名称/型号/SKU/系列，再按分类过滤；价格排序时无价格商品排最后
    products() {
      let a = this.$store.state.products.filter(
        (p) =>
          (!this.q ||
            [p.name, p.model, p.skuCode, p.series].some(
              (x) => x && x.toLowerCase().includes(this.q.toLowerCase())
            )) &&
          (!this.cat || p.cat === this.cat)
      );
      return this.sort === "price"
        ? a.slice().sort((x, y) => (x.priceFen ?? Infinity) - (y.priceFen ?? Infinity))
        : a;
    },
    // 分类下拉与左栏选项
    categories() {
      return this.$store.state.categories;
    },
    // 全部商品数
    totalCount() {
      return this.$store.state.products.length;
    },
    // 当前一级分类对象
    activeCategory() {
      return this.categories.find((c) => c.id === this.cat) || null;
    },
    // 当前一级分类下的二级分类，用于快捷筛选
    activeChildren() {
      return this.activeCategory ? this.activeCategory.children : [];
    },
  },
  watch: {
    // 路由 query 变化（左侧分类点击或从首页跳入）时同步筛选条件
    "$route.query"(v) {
      this.q = v.q || "";
      this.cat = v.cat || "";
    },
  },
  methods: {
    // 单个一级分类下的商品数
    countByCat(id) {
      return this.$store.state.products.filter((p) => p.cat === id).length;
    },
    // 点击二级分类：写入关键词并刷新列表
    pickChild(child) {
      this.q = child;
      this.apply();
    },
    // 应用筛选：把当前关键词与分类写回路由 query，驱动列表与 watch 更新
    apply() {
      this.$router.push({
        path: this.$route.path,
        query: { q: this.q, cat: this.cat },
      });
    },
  },
};
</script>
