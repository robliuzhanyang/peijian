<!--
  组件：学习内容统一渲染（ContentBlocks.vue）
  对应后端「学习内容」两种录入方式：
    1. 整篇富文本：body.mode === 'html'，只给一个 body.html，编辑器录入什么就渲染什么
       —— 目录（章节标题）由前端从 h2 自动提取，无需后端再给结构
    2. 固定逻辑结构：body.mode === 'blocks'（缺省），按模块 blocks[] 顺序渲染
  block 模块类型（与后端枚举一一对应）：
    video     视频（url 完整地址 / 无 url 时用 poster 占位，duration 时长，caption 说明）
              —— 视频内容与图文内容统一为 blocks 有序模块，视频通常作为第一个模块
    heading   标题（level 2/3，带锚点，供目录跳转）
    paragraph 富文本段落（html，编辑器产出的安全 HTML）
    list      列表（ordered 有序/无序）
    table     表格（head[] + rows[][]，规格/参数对照类）
    image     单图（src 资源 key + caption）
    steps     图文步骤（items[]{ title, text, image }）
    quote     引用块（text + cite）
    callout   提示框（kind: info/warn/danger/success，title + text/html）
  props：body（内容体）、anchorBase（锚点 id 前缀，默认 'sec'）
-->
<template>
  <div class="content-blocks">
    <!-- ===== 模式一：整篇富文本 ===== -->
    <div
      v-if="body.mode === 'html'"
      class="rich-body rich-html-mode"
      ref="htmlRoot"
      v-html="body.html"
    ></div>

    <!-- ===== 模式二：固定逻辑模块 ===== -->
    <template v-else>
      <template v-for="(b, i) in body.blocks">
        <!-- 视频模块：有 url 渲染播放器，无 url 用封面占位（视频/图文统一为有序模块） -->
        <div v-if="b.type === 'video'" :key="'v' + i" class="video-box">
          <video
            v-if="b.url"
            :src="b.url"
            :poster="b.poster ? asset(b.poster) : ''"
            controls
          ></video>
          <template v-else>
            <img
              v-if="b.poster"
              :src="asset(b.poster)"
              :alt="b.caption || ''"
            />
            <button class="play-circle" disabled>▶</button>
            <small class="video-note">
              视频资源待接入，此处为播放器占位<span v-if="b.duration">
                · 时长 {{ b.duration }}</span
              >
            </small>
          </template>
          <figcaption v-if="b.caption" class="video-caption">
            {{ b.caption }}
          </figcaption>
        </div>

        <!-- 标题：带锚点，供侧栏目录跳转 -->
        <component
          :is="b.level === 3 ? 'h3' : 'h2'"
          v-if="b.type === 'heading'"
          :id="anchorId(i)"
          :key="'h' + i"
          class="block-heading"
          >{{ b.text }}</component
        >

        <!-- 富文本段落 -->
        <div
          v-else-if="b.type === 'paragraph'"
          :key="'p' + i"
          class="rich-body"
          v-html="b.html"
        ></div>

        <!-- 列表：有序 / 无序 -->
        <ol
          v-else-if="b.type === 'list' && b.ordered"
          :key="'ol' + i"
          class="outline-list ordered"
        >
          <li v-for="(it, j) in b.items" :key="j">{{ it }}</li>
        </ol>
        <ul v-else-if="b.type === 'list'" :key="'ul' + i" class="outline-list">
          <li v-for="(it, j) in b.items" :key="j">{{ it }}</li>
        </ul>

        <!-- 表格：参数 / 规格对照 -->
        <div
          v-else-if="b.type === 'table'"
          :key="'t' + i"
          class="data-table-wrap"
        >
          <table v-if="b.head && b.head.length" class="data-table">
            <thead>
              <tr>
                <th v-for="(h, j) in b.head" :key="j">{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, r) in b.rows" :key="r">
                <td v-for="(c, cj) in row" :key="cj">{{ c }}</td>
              </tr>
            </tbody>
          </table>
          <small v-if="b.caption" class="data-table-note">{{
            b.caption
          }}</small>
        </div>

        <!-- 单图 -->
        <figure
          v-else-if="b.type === 'image'"
          :key="'img' + i"
          class="rich-figure"
        >
          <img :src="asset(b.src)" :alt="b.caption || ''" />
          <figcaption v-if="b.caption">{{ b.caption }}</figcaption>
        </figure>

        <!-- 图文步骤 -->
        <div v-else-if="b.type === 'steps'" :key="'st' + i" class="steps-block">
          <div
            v-for="(st, n) in b.items"
            :key="n"
            :id="anchorId(i) + '-' + n"
            class="image-step"
          >
            <div class="step-img">
              <img v-if="st.image" :src="asset(st.image)" :alt="st.title" />
              <b class="step-no">{{ n + 1 }}</b>
            </div>
            <div>
              <h3>{{ st.title }}</h3>
              <p class="tiny">{{ st.text }}</p>
            </div>
          </div>
        </div>

        <!-- 引用 -->
        <blockquote
          v-else-if="b.type === 'quote'"
          :key="'q' + i"
          class="rich-quote"
        >
          <p>{{ b.text }}</p>
          <cite v-if="b.cite">—— {{ b.cite }}</cite>
        </blockquote>

        <!-- 提示框 -->
        <div
          v-else-if="b.type === 'callout'"
          :key="'c' + i"
          class="callout"
          :class="b.kind || 'info'"
        >
          <b class="callout-title" v-if="b.title">{{ b.title }}</b>
          <p v-if="b.text" class="tiny">{{ b.text }}</p>
          <div
            v-else-if="b.html"
            class="rich-body callout-html"
            v-html="b.html"
          ></div>
        </div>
      </template>
    </template>
  </div>
</template>
<script>
// 静态资源 key -> 路径
import { asset } from "@/domain/productFields";

export default {
  name: "ContentBlocks",
  props: {
    // 内容体：{ mode, html } 或 { mode, blocks[] }
    body: { type: Object, default: () => ({}) },
    // 锚点 id 前缀，保证同页多个组件不冲突
    anchorBase: { type: String, default: "sec" },
  },
  methods: {
    asset,
    anchorId(i) {
      return this.anchorBase + "-" + i;
    },
  },
};
</script>
