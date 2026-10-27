<!--
  页面：学习内容详情（article.vue）
  路由：/article ｜ 分组：内容与服务
  作用：统一渲染图文 / 文章 / 视频 / 专题四类内容。视频与图文正文统一为
        body.blocks[] 有序模块（video 是其中一类模块），不再使用独立的视频字段；
        适配后端两种录入方式：
    1. 整篇富文本 body.mode === 'html'（编辑器一次录入，目录从 h2 自动提取）
    2. 固定逻辑结构 body.mode === 'blocks'（blocks[] 模块化录入，缺省模式）
  布局：左侧「章节目录」侧栏（粘性、滚动高亮、点击锚点跳转） + 右侧正文卡；
        正文由 ContentBlocks 组件统一渲染；底部为上一篇 / 下一篇导航。
  专题额外使用 topics[]（{ title, summary, contentId }）；
  附件统一走 attachments[]（url 为 null 时表示待后端接入）。
  数据：读取 catalog.json 的 contents，按 route.query.id（缺省 'A1'）匹配
-->
<template>
  <!-- 内容存在时展示详情 -->
  <div v-if="article" class="article-page">
    <!-- 页头：类型角标 + 栏目角标、标题、导语、日期作者；按类型切换 Hero 主题色 -->
    <div class="page-title article-head" :class="headTheme">
      <div class="article-badges">
        <b class="type-badge" :class="badgeClass">{{ article.type }}</b>
        <span class="badge blue">{{ article.cat }}</span>
        <span v-if="duration" class="badge">{{ duration }}</span>
      </div>
      <h1>{{ article.title }}</h1>
      <p v-if="body.summary" class="article-summary">{{ body.summary }}</p>
      <small
        >{{ article.date }} · {{ article.author || "鑫戩技术部" }} ·
        <template v-if="article.source">{{ article.source }} · </template>
        {{ article.read }} 人学习</small
      >
    </div>

    <!-- 两栏：左侧目录 + 右侧正文；目录不足时收起为单栏，避免正文被压入窄列 -->
    <div class="article-layout" :class="{ 'no-toc': toc.length <= 1 }">
      <!-- 左侧章节目录（超过 1 个章节才展示） -->
      <aside v-if="toc.length > 1" class="article-toc card">
        <b class="toc-title">{{ tocTitle }}</b>
        <ul>
          <li
            v-for="(t, i) in toc"
            :key="i"
            :class="{ active: activeAnchor === t.id, sub: t.level === 3 }"
          >
            <a :href="'#' + t.id" @click.prevent="jumpTo(t.id)">{{ t.text }}</a>
          </li>
        </ul>
      </aside>

      <section class="card article-body">
        <!-- 统一正文：视频 / 图文均为 blocks 有序模块，两种录入模式由 ContentBlocks 渲染 -->
        <ContentBlocks ref="blocks" :body="body" anchor-base="sec" />

        <!-- 专题：子篇目录（对象数组，contentId 跳转真实子篇） -->
        <template v-if="article.type === '专题' && article.topics">
          <h2>本篇包含</h2>
          <router-link
            v-for="(tp, i) in article.topics"
            :key="i"
            class="topic-row topic-link"
            :to="{ path: '/article', query: { id: tp.contentId } }"
          >
            <b class="step-no">{{ i + 1 }}</b>
            <div>
              <h3>{{ tp.title }}</h3>
              <p class="tiny">{{ tp.summary }}</p>
            </div>
            <span class="link">开始学习</span>
          </router-link>
        </template>

        <!-- 附件列表：url 缺失时置灰待提供 -->
        <template v-if="article.attachments && article.attachments.length">
          <h2>相关资料</h2>
          <div class="attach-list">
            <a
              v-for="(f, i) in article.attachments"
              :key="i"
              class="attach-item"
              :class="{ disabled: !f.url }"
              :href="f.url || 'javascript:void(0)'"
            >
              <span class="attach-kind">{{ f.kind }}</span>
              <span class="attach-name">{{ f.name }}</span>
              <small>{{ f.size }}</small>
              <span class="link">{{ f.url ? "下载" : "待提供" }}</span>
            </a>
          </div>
        </template>

        <!-- 关联商品 -->
        <template v-if="relatedProducts.length">
          <h2>相关配件</h2>
          <div class="related-products">
            <router-link
              v-for="p in relatedProducts"
              :key="p.id"
              class="related-chip"
              :to="{ path: '/detail', query: { id: p.id } }"
            >
              <img :src="asset(p.image)" :alt="p.name" />
              <span>{{ p.name }}</span>
            </router-link>
          </div>
        </template>

        <router-link class="btn article-back" to="/learning"
          >返回学习专区</router-link
        >
      </section>
    </div>

    <!-- 上一篇 / 下一篇导航 -->
    <nav v-if="prev || next" class="article-pager">
      <router-link
        v-if="prev"
        class="pager-item prev"
        :to="{ path: '/article', query: { id: prev.id } }"
      >
        <small>上一篇</small>
        <b>{{ prev.title }}</b>
      </router-link>
      <span v-else></span>
      <router-link
        v-if="next"
        class="pager-item next"
        :to="{ path: '/article', query: { id: next.id } }"
      >
        <small>下一篇</small>
        <b>{{ next.title }}</b>
      </router-link>
    </nav>
  </div>
  <!-- 找不到内容时的空态 -->
  <div v-else class="empty">内容不存在</div>
</template>
<script>
// 本地目录数据（含学习内容 contents 列表）
import catalog from "@/mock/catalog.json";
// 静态资源路径工具
import { asset } from "@/domain/productFields";
// 统一内容渲染组件（整篇富文本 / 固定模块两种模式）
import ContentBlocks from "@/modules/learning/components/ContentBlocks.vue";

export default {
  components: { ContentBlocks },
  data() {
    return {
      // 目录：[{ id, text, level }]
      toc: [],
      // 当前高亮的目录锚点
      activeAnchor: "",
      // 解绑滚动监听函数
      stopScroll: null,
    };
  },
  computed: {
    // 当前内容：按路由 query.id 在目录列表中查找，未传 id 时默认 'A1'
    article() {
      return catalog.contents.find(
        (a) => a.id === (this.$route.query.id || "A1"),
      );
    },
    // 统一内容体（后端接口对应字段 body）
    body() {
      return (this.article && this.article.body) || {};
    },
    // 类型角标配色类
    badgeClass() {
      return {
        图文: "green",
        文章: "blue",
        视频: "orange",
        专题: "purple",
      }[this.article.type];
    },
    // 视频时长徽标：从 blocks 中的 video 模块取（视频/图文统一结构）
    duration() {
      const v = (this.body.blocks || []).find((b) => b.type === "video");
      return v ? v.duration : "";
    },
    // 页头 Hero 主题类：图文绿 / 视频橙 / 专题紫 / 文章蓝
    headTheme() {
      return {
        图文: "theme-green",
        视频: "theme-orange",
        专题: "theme-purple",
      }[this.article.type] || "";
    },
    // 侧栏标题：纯图文步骤模块时显示「教程步骤」，否则为「章节目录」
    tocTitle() {
      const blocks = this.body.blocks || [];
      const hasSteps = blocks.some((b) => b.type === "steps");
      const hasHeading = blocks.some((b) => b.type === "heading");
      return hasSteps && !hasHeading ? "教程步骤" : "章节目录";
    },
    // 当前内容在列表中的下标
    currentIndex() {
      return catalog.contents.findIndex((a) => a.id === this.article.id);
    },
    // 上一篇
    prev() {
      const i = this.currentIndex;
      return i > 0 ? catalog.contents[i - 1] : null;
    },
    // 下一篇
    next() {
      const i = this.currentIndex;
      return i >= 0 && i < catalog.contents.length - 1
        ? catalog.contents[i + 1]
        : null;
    },
    // 关联配件商品（relatedProducts 为商品 id 列表）
    relatedProducts() {
      if (!this.article || !this.article.relatedProducts) return [];
      return this.article.relatedProducts
        .map((id) => catalog.products.find((p) => p.id === id))
        .filter(Boolean);
    },
  },
  watch: {
    // 路由 id 变化（上下篇、专题跳转）后重建目录
    "$route.query.id": function () {
      this.$nextTick(this.buildToc);
    },
  },
  mounted() {
    this.buildToc();
  },
  beforeDestroy() {
    if (this.stopScroll) this.stopScroll();
  },
  methods: {
    asset,
    // 构建章节目录
    buildToc() {
      if (this.stopScroll) this.stopScroll();
      this.toc = [];
      this.activeAnchor = "";

      if (this.body.mode === "html") {
        // 富文本模式：DOM 渲染后给 h2/h3 补 id 并提取目录
        this.$nextTick(() => {
          const root =
            this.$refs.blocks &&
            this.$refs.blocks.$el.querySelector(".rich-html-mode");
          if (!root) return;
          const heads = root.querySelectorAll("h2, h3");
          heads.forEach((el, i) => {
            el.id = "sec-" + i;
            this.toc.push({
              id: el.id,
              text: el.textContent.trim(),
              level: el.tagName === "H3" ? 3 : 2,
            });
          });
          this.bindScroll(this.toc.map((t) => t.id));
        });
      } else {
        // 固定模块模式：从 heading 模块提取（id 与 ContentBlocks 的 sec-<下标> 一致）
        (this.body.blocks || []).forEach((b, i) => {
          if (b.type === "heading") {
            this.toc.push({
              id: "sec-" + i,
              text: b.text,
              level: b.level === 3 ? 3 : 2,
            });
          }
          // 图文步骤模块：每个步骤作为一条目录，id 与步骤锚点 sec-<块下标>-<步下标> 一致
          if (b.type === "steps") {
            (b.items || []).forEach((st, n) => {
              this.toc.push({
                id: "sec-" + i + "-" + n,
                text: st.title,
                level: 2,
              });
            });
          }
        });
        this.bindScroll(this.toc.map((t) => t.id));
      }
    },
    // 绑定滚动高亮
    bindScroll(ids) {
      if (!ids.length) return;
      const onScroll = () => {
        let current = ids[0];
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= 120) current = id;
        }
        this.activeAnchor = current;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      this.stopScroll = () => window.removeEventListener("scroll", onScroll);
    },
    // 锚点跳转（顶部留出页头高度）
    jumpTo(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.pageYOffset - 96;
      window.scrollTo({ top, behavior: "smooth" });
      this.activeAnchor = id;
    },
  },
};
</script>
