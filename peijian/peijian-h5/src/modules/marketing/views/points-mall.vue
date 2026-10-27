<!--
  页面：积分商城（H5）
  路由：/points-mall ｜ 分组：积分与营销
  作用：与配件采购同一套布局：左侧兑换分类，右侧筛选条 + 积分商品网格；
        点击卡片进入积分商品详情。
  数据：读取 Vuex state.points 与 state.products，过滤出带 exchange 积分价的商品
-->
<template>
  <div>
    <!-- 页头：标题 + 积分余额提示 -->
    <div class="page-title">
      <h1>积分商城</h1>
      <small>我的积分 {{ points }} · {{ exchangeable.length }} 件可兑换</small>
    </div>

    <div class="h5-cat-layout">
      <!-- 左栏：兑换分类（仅展示有可兑换商品的分类） -->
      <aside class="h5-cat-rail">
        <button
          type="button"
          class="h5-rail-item"
          :class="{ on: !cat }"
          @click="cat = ''"
        >
          全部
        </button>
        <button
          v-for="c in cats"
          :key="c.id"
          type="button"
          class="h5-rail-item"
          :class="{ on: cat === c.id }"
          @click="cat = c.id"
        >
          {{ c.name }}
        </button>
      </aside>

      <div class="h5-cat-main">
        <!-- 筛选工具栏：关键词、积分区间与重置 -->
        <div class="card list-toolbar h5-cat-toolbar">
          <div class="filter-controls">
            <input v-model="q" placeholder="搜索兑换商品" />
            <select v-model="range">
              <option value="">全部积分</option>
              <option value="0-1000">1000 积分以内</option>
              <option value="1000-2000">1000 - 2000 积分</option>
              <option value="2000-6000">2000 - 6000 积分</option>
              <option value="6000-">6000 积分以上</option>
            </select>
            <button class="btn gold sm" @click="reset">重置</button>
          </div>
          <span class="tiny"
            >{{ exchangeable.length }} 件可兑换 · 每月有兑换上限</span
          >
        </div>

        <!-- 可兑换商品网格：遍历 exchangeable，卡片图片与按钮均跳转积分商品详情 -->
        <div class="product-grid">
          <article v-for="p in exchangeable" :key="p.id" class="product-card">
            <router-link
              :to="{ path: '/points-detail', query: { id: p.id } }"
              class="image-box"
              ><img :src="asset(p.image)" :alt="p.name"
            /></router-link>
            <div class="prod-info">
              <h3>{{ p.name }}</h3>
              <p class="tiny">SKU：{{ p.skuCode }}</p>
              <p class="price gold">{{ p.exchange }} 积分</p>
              <router-link
                class="btn gold sm block"
                :to="{ path: '/points-detail', query: { id: p.id } }"
                >查看兑换</router-link
              >
            </div>
          </article>
        </div>
        <!-- 空结果态 -->
        <div v-if="!exchangeable.length" class="empty">
          暂无符合条件的兑换商品。
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// 领域工具：静态资源路径拼接
import { asset } from "@/domain/productFields";
export default {
  data() {
    return {
      q: "", // 关键词
      cat: "", // 分类 id
      range: "", // 积分区间 min-max
    };
  },
  computed: {
    // 积分余额
    points() {
      return this.$store.state.points;
    },
    // 全部可兑换商品
    allExchange() {
      return this.$store.state.products.filter((p) => p.exchange);
    },
    // 分类下拉与左栏：只展示含有可兑换商品的分类
    cats() {
      const used = new Set(this.allExchange.map((p) => p.cat));
      return this.$store.state.categories.filter((c) => used.has(c.id));
    },
    // 可积分兑换的商品：带 exchange，并按关键词、分类、积分区间过滤
    exchangeable() {
      const [min, max] = this.range.split("-");
      const kw = this.q.trim().toLowerCase();
      return this.allExchange.filter(
        (p) =>
          (!kw ||
            [p.name, p.skuCode].some(
              (x) => x && x.toLowerCase().includes(kw)
            )) &&
          (!this.cat || p.cat === this.cat) &&
          (this.range === "" ||
            (Number(min) <= p.exchange &&
              (max === "" || p.exchange <= Number(max))))
      );
    },
  },
  methods: {
    asset,
    reset() {
      this.q = "";
      this.cat = "";
      this.range = "";
    },
  },
};
</script>
<style>
/* 左分类 + 右商品：与配件采购同一套移动端骨架 */
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
</style>
