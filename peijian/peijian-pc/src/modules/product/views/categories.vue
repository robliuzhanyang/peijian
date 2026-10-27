<!--
  页面：全部分类（categories.vue）
  路由：/categories ｜ 分组：采购入口
  作用：与「配件采购」同一套页面骨架：页头 + 左侧分类栏 + 右侧商品网格；
        左侧为一级分类，右侧为该分类下的二级分类图片卡片，最多两级；
        点击二级卡片携带 cat + q 进入配件采购列表。
  数据：Vuex state.categories（应用启动时 bootstrap 载入的分类树），
        二级分类图片按名称关键字匹配本地图示资源，缺失时回退一级分类图示
-->
<template>
  <div>
    <!-- 页头：与配件采购一致的标题区 -->
    <div class="page-title">
      <h1>全部分类</h1>
      <small>按一级 / 二级分类浏览配件，最多两级；点击图片卡片进入配件采购</small>
    </div>

    <div class="list-layout">
      <!-- 左栏：一级分类 -->
      <aside class="card filter-aside">
        <div class="cat-head">全部商品分类</div>
        <button
          v-for="c in categories"
          :key="c.id"
          type="button"
          class="cat-item"
          :class="{ on: c.id === activeId }"
          @click="activeId = c.id"
        >
          <AppIcon :name="c.icon" />
          <span>{{ c.name }}</span>
          <em>{{ c.children.length }}</em>
        </button>
      </aside>

      <!-- 右侧：当前一级分类下的二级分类（筛选条 + 图片卡片，与配件采购同构） -->
      <div v-if="active">
        <div class="card list-toolbar cat-toolbar">
          <div>
            <h2 class="cat-title">{{ active.name }}</h2>
            <span class="tiny"
              >共 {{ active.children.length }} 个二级分类，点击图片卡片查看对应配件</span
            >
          </div>
          <router-link
            class="btn sm"
            :to="{ path: '/goods', query: { cat: active.id } }"
            >查看全部{{ active.name }}</router-link
          >
        </div>

        <div class="product-grid">
          <router-link
            v-for="child in active.children"
            :key="child"
            class="product-card"
            :to="{ path: '/goods', query: { cat: active.id, q: child } }"
          >
            <div class="image-box">
              <img :src="childImage(active.id, child)" :alt="child" />
            </div>
            <div class="prod-info">
              <h3>{{ child }}</h3>
              <p class="tiny">查看配件 →</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppIcon from "@/components/AppIcon.vue";
import { asset } from "@/domain/productFields";

// 二级分类名称 → 本地图示资源（按关键字就近匹配）
const IMAGE_RULES = [
  [/镜片|场镜|镜/, "lens"],
  [/振镜|打标头|光路|预览|指示/, "head"],
  [/视觉|识别/, "vision"],
  [/激光器|激光管|光源/, "laser"],
  [/轴|传送带|旋转/, "rotary"],
  [/立柱|机架|机箱|底座/, "column"],
  [/电源|板卡|控制/, "power"],
  [/显示屏|灯箱|货道|终端/, "machine"],
  [/清洁|易损件|工具|耗材|喷嘴|密封|眼镜|卡尺|校准/, "kit"],
];

export default {
  components: { AppIcon },
  data() {
    return {
      // 当前选中的一级分类；优先取路由 query.cat
      activeId: this.$route.query.cat || "",
    };
  },
  computed: {
    // 商品分类树：一级 + children（二级名称）
    categories() {
      return this.$store.state.categories;
    },
    active() {
      return this.categories.find((c) => c.id === this.activeId) || null;
    },
  },
  created() {
    // 分类已就绪时直接选中第一个一级分类
    if (!this.activeId && this.categories.length) {
      this.activeId = this.categories[0].id;
    }
  },
  watch: {
    // 分类数据异步载入后补齐默认选中项
    categories(list) {
      if (!this.activeId && list.length) this.activeId = list[0].id;
    },
    // 从首页分类跳入时同步选中一级分类
    "$route.query.cat"(id) {
      if (id) this.activeId = id;
    },
  },
  methods: {
    // 二级分类图示：命中关键字用对应图示，未命中回退一级分类默认图
    childImage(catId, child) {
      const matched = IMAGE_RULES.find(([re]) => re.test(child));
      if (matched) return asset(matched[1]);
      const fallback = {
        laser: "laser",
        optics: "lens",
        mechanic: "column",
        power: "power",
        extra: "machine",
        care: "kit",
      };
      return asset(fallback[catId] || "machine");
    },
  },
};
</script>

<style>
/* 右侧工具栏：与配件采购的筛选条同一高度与间距 */
.cat-toolbar {
  align-items: flex-start;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--line);
}
.cat-title {
  margin: 0 0 4px;
  font-size: 18px;
}
.cat-toolbar .tiny {
  display: block;
}
</style>
