<!--
  页面：学习专区（learning.vue）
  路由：/learning ｜ 分组：内容与支持
  作用：按「图文 / 文章 / 视频 / 专题」四个维度组织内容。
        顶部维度切换带数量徽标；四种类型统一使用短图卡片列表，
        卡片展示封面、类型角标、栏目、时长/阅读时长与学习人数。
  数据：catalog.json 的 contents（type: 图文|文章|视频|专题）
-->
<template>
  <div class="learning-page">
    <!-- 页头：标题 + 统计 + 维度切换 -->
    <div class="page-title learning-head">
      <div>
        <h1>学习专区</h1>
        <small>图文 · 文章 · 视频 · 专题</small>
      </div>
      <div class="segment type-segment">
        <button
          v-for="t in types"
          :key="t.key"
          :class="{ on: active === t.key }"
          @click="active = t.key"
        >
          {{ t.label }}<em class="seg-count">{{ countOf(t.key) }}</em>
        </button>
      </div>
    </div>
    <!-- 图文 / 文章 / 视频 / 专题：统一卡片列表（短图模式），专题不再单独用大横卡 -->
    <div v-if="filtered.length" class="three-col learning-grid">
      <router-link
        v-for="a in filtered"
        :key="a.id"
        class="card learn-card"
        :to="{ path: '/article', query: { id: a.id } }"
      >
        <div class="learn-cover">
          <img :src="asset(a.image)" :alt="a.title" />
          <b class="type-badge" :class="badgeClass(a.type)">{{ a.type }}</b>
          <span v-if="a.type === '视频'" class="play-ico">▶</span>
          <span v-if="mediaLength(a)" class="cover-duration">{{
            mediaLength(a)
          }}</span>
        </div>
        <div class="learn-meta">
          <span class="card-cat">{{ a.cat }}</span>
          <h2>{{ a.title }}</h2>
          <p>{{ a.desc }}</p>
          <small>
            <span>{{ a.date }}</span>
            <!-- 专题补充篇数，其余展示标签 -->
            <span v-if="a.type === '专题'"> · 共 {{ a.topics.length }} 篇</span>
            <span v-else-if="a.tag"> · {{ a.tag }}</span>
            <span> · {{ a.read }} 人学习</span>
          </small>
        </div>
      </router-link>
    </div>
    <!-- 空态 -->
    <p v-else class="empty">该类型内容正在整理中，敬请期待。</p>
  </div>
</template>
<script>
// 学习内容目录数据（与双端同源）
import catalog from "@/mock/catalog.json";
// 静态资源路径工具
import { asset } from "@/domain/productFields";
export default {
  data() {
    return {
      // active 当前维度：all 全部 / article 文章 / image 图文 / video 视频 / topic 专题
      active: "all",
      // 维度定义，label 为页签文案，key 对应 type 或全部
      types: [
        { key: "all", label: "全部" },
        { key: "image", label: "图文" },
        { key: "article", label: "文章" },
        { key: "video", label: "视频" },
        { key: "topic", label: "专题" },
      ],
      // 类型 key 到内容 type 文案的映射
      typeMap: { image: "图文", article: "文章", video: "视频", topic: "专题" },
    };
  },
  computed: {
    contents() {
      return catalog.contents;
    },
    // 当前维度过滤后的内容（专题与其余类型共用同一套卡片）
    filtered() {
      if (this.active === "all") return this.contents;
      const want = this.typeMap[this.active];
      return this.contents.filter((a) => a.type === want);
    },
  },
  methods: {
    asset,
    // 类型角标配色
    badgeClass(type) {
      return {
        图文: "green",
        文章: "blue",
        视频: "orange",
        专题: "purple",
      }[type];
    },
    // 各维度内容数量（页签徽标）
    countOf(key) {
      if (key === "all") return this.contents.length;
      const want = this.typeMap[key];
      return this.contents.filter((a) => a.type === want).length;
    },
    // 视频卡片封面上的时长（从 blocks 中的 video 模块取，兜底 tag）
    mediaLength(a) {
      if (a.type !== "视频") return "";
      const v = ((a.body && a.body.blocks) || []).find(
        (b) => b.type === "video",
      );
      return (v && v.duration) || a.tag || "";
    },
  },
};
</script>

<style>
/* 封面统一 16:9 比例 */
.learning-page .learn-cover {
  aspect-ratio: 16 / 9;
  height: auto;
}
.learning-page .learn-card h2 {
  font-size: 14px;
  margin: 6px 12px 4px;
}
.learning-page .learn-card p {
  margin: 0 12px;
  font-size: 12px;
  -webkit-line-clamp: 2;
}
</style>
