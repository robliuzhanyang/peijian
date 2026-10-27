<!--
  页面：配件采购（H5）
  路由：/goods ｜ 分组：采购入口
  作用：左侧一级分类竖排导航，右侧筛选条 + 二级分类快捷筛选 + 商品网格；
        与 PC 端同一口径：分类最多两级，点击二级按关键词筛选。
  数据：读取 Vuex state.products / state.categories；筛选条件初始化自路由 query.q、query.cat
-->
<template>
  <div>
    <!-- 页头：标题 + 业务说明 -->
    <div class="page-title">
      <h1>配件采购</h1>
      <small>左侧选分类，右侧看商品</small>
    </div>

    <div class="h5-cat-layout">
      <!-- 左栏：一级分类 -->
      <aside class="h5-cat-rail">
        <button
          type="button"
          class="h5-rail-item"
          :class="{ on: !cat }"
          @click="pickCat('')"
        >
          全部
        </button>
        <button
          v-for="c in categories"
          :key="c.id"
          type="button"
          class="h5-rail-item"
          :class="{ on: cat === c.id }"
          @click="pickCat(c.id)"
        >
          {{ c.name }}
        </button>
      </aside>

      <div class="h5-cat-main">
        <!-- 筛选工具栏：关键词、排序与结果计数 -->
        <div class="card list-toolbar h5-cat-toolbar">
          <div class="filter-controls">
            <input
              v-model="q"
              placeholder="名称 / 型号 / SKU"
              @keyup.enter="apply"
            />
            <select v-model="sort">
              <option value="default">综合排序</option>
              <option value="price">价格从低到高</option>
            </select>
            <button class="btn primary sm" @click="apply">筛选</button>
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
            style="margin-top: 8px"
            :to="{ path: '/goods', query: { cat } }"
            >查看全部{{ activeCategory.name }}</router-link
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// 商品卡片组件
import ProductCard from "@/components/ProductCard.vue";
export default {
  components: { ProductCard },
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
    // 分类下拉与左栏
    categories() {
      return this.$store.state.categories;
    },
    // 当前一级分类对象
    activeCategory() {
      return this.categories.find((c) => c.id === this.cat) || null;
    },
    // 当前一级分类下的二级分类
    activeChildren() {
      return this.activeCategory ? this.activeCategory.children : [];
    },
  },
  watch: {
    // 路由 query 变化（如从分类页跳入）时同步关键词与分类
    "$route.query"(v) {
      this.q = v.q || "";
      this.cat = v.cat || "";
    },
  },
  methods: {
    // 切换一级分类：清空关键词后刷新列表
    pickCat(id) {
      this.cat = id;
      this.q = "";
      this.apply();
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
<style>
/* 左分类 + 右商品：移动端两列骨架 */
.h5-cat-layout {
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
}
.h5-cat-rail {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}
.h5-rail-item {
  width: 100%;
  padding: 12px 6px;
  border: 0;
  border-bottom: 1px solid #f1f4f8;
  background: #fff;
  color: #5c6b80;
  font-size: 12px;
  line-height: 1.35;
  text-align: center;
  cursor: pointer;
}
.h5-rail-item:last-child {
  border-bottom: 0;
}
.h5-rail-item.on {
  background: #eef4ff;
  color: var(--blue);
  font-weight: 700;
  box-shadow: inset 3px 0 0 var(--blue);
}
.h5-cat-main {
  min-width: 0;
}
/* 窄栏下的筛选条：输入框独占一行 */
.h5-cat-toolbar {
  padding: 12px;
  margin-bottom: 10px;
}
.h5-cat-toolbar .filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.h5-cat-toolbar .filter-controls input {
  flex: 1 1 100%;
}
.h5-cat-toolbar .filter-controls select {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 12px;
}
.h5-cat-toolbar .tiny {
  margin-top: 2px;
}
/* 二级分类：横向滑动，避免换行占高 */
.cat-chips {
  flex-wrap: nowrap;
  overflow-x: auto;
  margin-bottom: 10px;
  padding-bottom: 2px;
}
.cat-chips .chip {
  flex: 0 0 auto;
  font-size: 11px;
  padding: 4px 10px;
}
</style>
