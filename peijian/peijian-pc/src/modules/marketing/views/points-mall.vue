<!--
  页面：积分商城（points-mall.vue）
  路由：/points-mall ｜ 分组：积分与营销
  作用：与配件采购同一套布局：左侧兑换分类，右侧筛选条 + 积分商品网格；
        点击卡片进入积分商品详情。
  数据：读取 Vuex state.points 与 state.products，过滤出带 exchange 积分价的商品
-->
<template>
  <div>
    <div class="list-layout">
      <!-- 左栏：兑换分类（仅展示有可兑换商品的分类） -->
      <aside class="card filter-aside">
        <div class="cat-head">兑换分类</div>
        <button
          type="button"
          class="cat-item"
          :class="{ on: !cat }"
          @click="cat = ''"
        >
          <AppIcon name="gift" /><span>全部兑换</span><em>{{ totalExchange }}</em>
        </button>
        <button
          v-for="c in cats"
          :key="c.id"
          type="button"
          class="cat-item"
          :class="{ on: cat === c.id }"
          @click="cat = c.id"
        >
          <AppIcon :name="c.icon" /><span>{{ c.name }}</span
          ><em>{{ countByCat(c.id) }}</em>
        </button>
      </aside>

      <div>
        <!-- 筛选工具栏：关键词、分类、积分区间与余额 -->
        <div class="card list-toolbar">
          <div class="filter-controls">
            <input v-model="q" placeholder="搜索兑换商品" />
            <select v-model="cat">
              <option value="">全部分类</option>
              <option v-for="c in cats" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
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
            >我的积分 {{ points }} · {{ exchangeable.length }} 件可兑换</span
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
import AppIcon from "@/components/AppIcon.vue";
export default {
  components: { AppIcon },
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
    // 可兑换商品总数
    totalExchange() {
      return this.allExchange.length;
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
    // 单个分类下的可兑换商品数
    countByCat(id) {
      return this.allExchange.filter((p) => p.cat === id).length;
    },
    reset() {
      this.q = "";
      this.cat = "";
      this.range = "";
    },
  },
};
</script>
