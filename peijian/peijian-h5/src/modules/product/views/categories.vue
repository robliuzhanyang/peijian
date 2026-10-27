<!--
  页面：全部分类（categories.vue）
  路由：/categories ｜ 分组：采购入口
  作用：按原型 V1.2 的 H5 分类页组织：搜索条 + 左侧竖排分类 + 右侧子类宫格 + 推荐配件
  数据：categories / products 取 Vuex（bootstrap 载入），激活分类支持 ?cat= 入参
-->
<template>
  <div>
    <!-- 搜索条：型号 / 功率 / 品牌 -->
    <form class="m-cat-search" @submit.prevent="search">
      <UiIcon name="search" />
      <input v-model="keyword" placeholder="搜索型号 / 功率 / 品牌" />
    </form>

    <!-- 分类主体：左竖栏 + 右侧内容 -->
    <div class="m-cat-page">
      <aside class="m-cat-rail">
        <button
          v-for="c in categories"
          :key="c.id"
          type="button"
          class="m-cat-rail-item"
          :class="{ on: c.id === curId }"
          @click="pick(c.id)"
        >
          {{ c.name }}
        </button>
      </aside>
      <div v-if="active" class="m-cat-body">
        <h3 class="m-cat-body-title">{{ active.name }}</h3>
        <div class="m-sub-grid">
          <router-link
            v-for="child in active.children"
            :key="child"
            :to="{ path: '/goods', query: { cat: active.id, q: child } }"
            class="m-sub-item"
          >
            <span class="m-sub-ic"
              ><img :src="childImage(active.id, child)" :alt="child"
            /></span>
            <strong>{{ child }}</strong>
          </router-link>
        </div>
        <div class="m-cat-rec">
          <div class="m-cat-rec-head">
            <b>推荐配件</b>
            <router-link
              class="link tiny"
              :to="{ path: '/goods', query: { cat: active.id } }"
              >查看全部 →</router-link
            >
          </div>
          <div class="m-cat-rec-row">
            <router-link
              v-for="p in recommendations"
              :key="p.id"
              :to="{ path: '/detail', query: { id: p.id } }"
            >
              <img :src="asset(p.image)" :alt="p.name" />
              <small>{{ p.name }}</small>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// 线性图标：搜索框、子类圆形图标
import UiIcon from "@/components/UiIcon.vue";
// 领域工具：静态资源路径
import { asset } from "@/domain/productFields";

// 二级分类名称 → 本地图示资源（按关键字就近匹配，与 PC 端一致）
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
  components: { UiIcon },
  data() {
    return {
      keyword: "",
      // 手动选择的分类 id；为空时回退到第一个分类
      picked: this.$route.query.cat || "",
    };
  },
  computed: {
    categories() {
      return this.$store.state.categories;
    },
    // 当前分类：优先入参 / 手动选择，其次第一个分类
    curId() {
      const exists = this.categories.some((c) => c.id === this.picked);
      return exists ? this.picked : (this.categories[0] || {}).id;
    },
    active() {
      return this.categories.find((c) => c.id === this.curId);
    },
    // 推荐配件：当前分类下前两件商品
    recommendations() {
      if (!this.active) return [];
      return this.$store.state.products
        .filter((p) => p.cat === this.active.id)
        .slice(0, 2);
    },
  },
  watch: {
    // 顶部 Tab / 站内跳转携带 cat 时同步左侧激活项
    "$route.query.cat"(v) {
      if (v) this.picked = v;
    },
  },
  methods: {
    asset,
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
    pick(id) {
      this.picked = id;
    },
    search() {
      this.$router.push({ path: "/search", query: { q: this.keyword } });
    },
  },
};
</script>
<style>
/* 二级分类图示：由图标改为图片，与 PC 端分类页一致 */
.m-sub-ic {
  width: 58px;
  height: 52px;
  border-radius: 8px;
  background: #f2f6fc;
  overflow: hidden;
}
.m-sub-ic img {
  width: 84%;
  height: 84%;
  object-fit: contain;
}
</style>
