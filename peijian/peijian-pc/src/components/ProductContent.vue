<!--
  组件：商品详情内容（ProductContent.vue）
  作用：统一「商品亮点 / 规格参数 / 商品介绍 / 购买须知（兑换须知）」四段结构，
       配件采购详情与积分商城详情共用，后台只需维护一套 product.content 字段
  入参：highlights 亮点标签、specs 规格参数行、introHtml 富文本、notes 须知条目
-->
<template>
  <div class="product-content" :class="'tone-' + tone">
    <!-- 商品亮点：后台亮点标签，或由副标题拆分而来 -->
    <section v-if="highlights.length" class="card">
      <div class="pc-head"><h2>商品亮点</h2></div>
      <div class="pc-chips">
        <span v-for="(item, i) in highlights" :key="i">{{ item }}</span>
      </div>
    </section>

    <!-- 规格参数：后台自定义项 + 商品字段，空值不展示 -->
    <section v-if="specs.length" class="card">
      <div class="pc-head">
        <h2>规格参数</h2>
        <small>{{ specs.length }} 项</small>
      </div>
      <div class="spec-grid">
        <div v-for="row in specs" :key="row.label" class="field-row">
          <span>{{ row.label }}</span><strong>{{ row.value }}</strong>
        </div>
      </div>
    </section>

    <!-- 商品介绍：后台编辑器输出的富文本，前端统一 v-html 渲染 -->
    <section v-if="introHtml" class="card">
      <div class="pc-head"><h2>商品介绍</h2></div>
      <div class="rich-body" v-html="introHtml"></div>
    </section>

    <!-- 须知：配件采购为购买须知，积分商城为兑换须知 -->
    <section v-if="notes.length" class="card">
      <div class="pc-head"><h2>{{ notesTitle }}</h2></div>
      <ul class="outline-list">
        <li v-for="(note, i) in notes" :key="i">{{ note }}</li>
      </ul>
    </section>
  </div>
</template>
<script>
export default {
  name: "ProductContent",
  props: {
    // 亮点标签
    highlights: { type: Array, default: () => [] },
    // 规格参数行：[{ label, value }]
    specs: { type: Array, default: () => [] },
    // 商品介绍富文本 HTML
    introHtml: { type: String, default: "" },
    // 须知条目
    notes: { type: Array, default: () => [] },
    // 须知标题
    notesTitle: { type: String, default: "购买须知" },
    // 主题色：blue 配件采购 / gold 积分商城
    tone: { type: String, default: "blue" },
  },
};
</script>
<style scoped>
.product-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pc-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}
.pc-head h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
}
/* 标题左侧色条：与既有详情板块保持一致 */
.pc-head h2::before {
  content: "";
  width: 4px;
  height: 17px;
  border-radius: 2px;
  background: linear-gradient(#4a86e8, #1554c7);
}
.pc-head small {
  margin-left: auto;
  color: var(--muted);
  font-size: 12px;
}
.pc-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pc-chips span {
  padding: 5px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #f7faff;
  color: #31517c;
  font-size: 12px;
}
/* 积分商城：金色主题 */
.tone-gold .pc-head h2::before {
  background: linear-gradient(#e0a63f, #b7791f);
}
.tone-gold .pc-chips span {
  border-color: #eddcbb;
  background: #fffaf0;
  color: #8a6a2c;
}
/* 移动端：板块间距与标题字号收紧 */
.app.h5 .product-content {
  gap: 12px;
}
.app.h5 .pc-head {
  margin-bottom: 11px;
}
.app.h5 .pc-head h2 {
  font-size: 15px;
}
.app.h5 .pc-head h2::before {
  height: 15px;
}
</style>
