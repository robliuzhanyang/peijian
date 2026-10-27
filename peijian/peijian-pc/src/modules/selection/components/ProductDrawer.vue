<!--
  组件：商品详情右侧抽屉（ProductDrawer）
  用途：一站式选配中「详情 / 查阅商品详情」统一入口，从右侧滑出
  内容：与 /detail 商品详情页同口径——主图轮播、关键参数、资料下载、价格、
        亮点 / 规格 / 介绍 / 须知四段；底部提供「选入本步骤」操作
  Props：product 商品对象；compatible 是否与当前配置适配；
         selected 是否已选入；ctaText 底部按钮文案
  事件：close 关闭；confirm 选入本步骤
-->
<template>
  <div class="pd-drawer-mask" @click.self="emit('close')">
    <aside class="pd-drawer" role="dialog" aria-modal="true">
      <!-- 抽屉头：标题 + 关闭 -->
      <header class="pd-head">
        <div>
          <small>商品详情</small>
          <h2>{{ product.name }}</h2>
        </div>
        <button type="button" aria-label="关闭" @click="emit('close')">
          ×
        </button>
      </header>

      <!-- 抽屉正文：可滚动，复用详情页结构 -->
      <div class="pd-body">
        <!-- 主图轮播：箭头 + 张数 -->
        <div class="pd-image">
          <button
            v-if="gallery.length > 1"
            class="pd-img-nav prev"
            type="button"
            aria-label="上一张"
            @click="stepImage(-1)"
          >
            ‹
          </button>
          <img :src="asset(activeImage)" :alt="product.name" />
          <span v-if="gallery.length > 1" class="pd-img-count"
            >{{ galleryIndex + 1 }} / {{ gallery.length }}</span
          >
          <button
            v-if="gallery.length > 1"
            class="pd-img-nav next"
            type="button"
            aria-label="下一张"
            @click="stepImage(1)"
          >
            ›
          </button>
        </div>

        <!-- 关键参数四格 -->
        <div class="pd-specs">
          <div v-for="row in heroSpecs" :key="row.label">
            <small>{{ row.label }}</small><strong>{{ row.value }}</strong>
          </div>
        </div>

        <!-- 资料下载胶囊：有文件才渲染 -->
        <div v-if="docRows.length" class="pd-docs">
          <div
            v-for="entry in docRows"
            :key="entry.key"
            class="pd-doc"
            @click="openDoc(entry)"
          >
            <i>{{ entry.icon }}</i>
            <span>{{ entry.label }}</span>
          </div>
        </div>

        <!-- 价格面板 -->
        <div class="pd-price-panel">
          <p>参考价格</p>
          <strong class="price">{{ money(product.priceFen) }}</strong>
          <p class="tiny">
            库存：{{ product.stock == null ? "待确认" : product.stock }} ·
            价格与库存以实际下单确认为准
          </p>
          <!-- 适配标记：与当前配置不符时明确提示 -->
          <p v-if="compatible === false" class="pd-incompat">
            与当前配置不适配，如需选用请先调整关联步骤。
          </p>
        </div>

        <!-- 详情四段：亮点 / 规格 / 介绍 / 须知 -->
        <ProductContent
          :highlights="content.highlights"
          :specs="content.specs"
          :intro-html="content.introHtml"
          :notes="content.notes"
        />
      </div>

      <!-- 抽屉底部操作 -->
      <footer class="pd-foot">
        <button class="btn" type="button" @click="emit('close')">关闭</button>
        <button
          class="btn primary"
          type="button"
          :disabled="compatible === false"
          @click="emit('confirm')"
        >
          {{ ctaText || "选入本步骤" }}
        </button>
      </footer>
    </aside>
  </div>
</template>

<script>
import {
  money,
  asset,
  viewFields,
  downloadFields,
} from "@/domain/productFields";
import { resolveProductContent } from "@/modules/product/domain/productContent";
import ProductContent from "@/components/ProductContent.vue";

export default {
  name: "ProductDrawer",
  components: { ProductContent },
  props: {
    // 当前商品对象
    product: { type: Object, required: true },
    // 与当前配置适配：null 未知按适配处理
    compatible: { type: Boolean, default: null },
    // 底部主按钮文案
    ctaText: { type: String, default: "" },
  },
  emits: ["close", "confirm"],
  data() {
    return {
      galleryIndex: 0,
      downloadFields,
    };
  },
  computed: {
    // 详情四段：与详情页完全同一口径
    content() {
      return resolveProductContent(this.product);
    },
    // 关键参数四格
    heroSpecs() {
      const p = this.product;
      return [
        { label: "品牌", value: p.brand || p.series || "—" },
        { label: "型号", value: p.model || p.code || "—" },
        { label: "SKU", value: p.skuCode || "—" },
        { label: "库存", value: p.stock == null ? "待确认" : "现货 " + p.stock },
      ];
    },
    // 轮播图组：商品 gallery > 主图（与详情页同一逻辑）
    gallery() {
      const p = this.product;
      if (Array.isArray(p.gallery) && p.gallery.length) return p.gallery;
      return [
        p.image,
        p.perspective,
        ...viewFields.map(([key]) => p.views && p.views[key]),
      ].filter(Boolean);
    },
    activeImage() {
      return this.gallery[this.galleryIndex] || this.product.image;
    },
    // 已录入文件的资料项
    docRows() {
      const files = this.product.downloads || {};
      const iconMap = {
        assembly3d: "3D",
        engineeringPdf: "PDF",
        packagingDrawing: "BOX",
      };
      return downloadFields
        .filter(([key]) => files[key])
        .map(([key, label]) => ({
          key,
          label,
          file: files[key],
          icon: iconMap[key] || "DOC",
        }));
    },
  },
  watch: {
    // 切换商品时回到第一张
    product() {
      this.galleryIndex = 0;
    },
  },
  methods: {
    money,
    asset,
    stepImage(delta) {
      const total = this.gallery.length;
      if (!total) return;
      this.galleryIndex = (this.galleryIndex + delta + total) % total;
    },
    openDoc(entry) {
      window.open(asset(entry.file), "_blank");
    },
    emit(name) {
      this.$emit(name);
    },
  },
};
</script>

<style>
/* ===== 右侧抽屉：遮罩与滑出容器 ===== */
.pd-drawer-mask {
  position: fixed;
  inset: 0;
  /* 高于商城更换弹窗（z-index 1200），保证抽屉叠在弹窗之上 */
  z-index: 1400;
  background: rgba(10, 24, 48, 0.36);
}
.pd-drawer {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  width: min(560px, 92vw);
  height: 100%;
  background: var(--bg);
  box-shadow: -12px 0 40px rgba(9, 25, 51, 0.18);
  animation: pd-slide-in 0.26s ease;
}
@keyframes pd-slide-in {
  from {
    transform: translateX(40px);
    opacity: 0.4;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
/* 抽屉头 */
.pd-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 16px;
  border-bottom: 1px solid var(--line);
  background: #fff;
}
.pd-head small {
  color: var(--blue);
  font-size: 12px;
}
.pd-head h2 {
  margin: 2px 0 0;
  font-size: 20px;
}
.pd-head button {
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  color: #68778b;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
}
/* 正文：可滚动 */
.pd-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 18px 22px 24px;
}
/* 主图：与详情页同一摄影棚底 */
.pd-image {
  position: relative;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: radial-gradient(
    125% 95% at 50% 6%,
    #ffffff 0%,
    #eef4fb 56%,
    #e1eaf5 100%
  );
  box-shadow: inset 0 0 0 1px #e7eef7;
}
.pd-image img {
  max-width: 84%;
  max-height: 84%;
  filter: drop-shadow(0 12px 14px rgba(20, 42, 74, 0.2));
}
.pd-img-nav {
  position: absolute;
  top: 50%;
  width: 34px;
  height: 34px;
  transform: translateY(-50%);
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #41546d;
  font-size: 20px;
  line-height: 1;
  box-shadow: 0 4px 12px rgba(21, 49, 88, 0.15);
  cursor: pointer;
}
.pd-img-nav.prev {
  left: 12px;
}
.pd-img-nav.next {
  right: 12px;
}
.pd-img-nav:hover {
  background: var(--blue);
  color: #fff;
}
.pd-img-count {
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(13, 28, 56, 0.62);
  color: #fff;
  font-size: 11px;
}
/* 关键参数四格 */
.pd-specs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 14px;
  overflow: hidden;
  border: 1px solid #e4ebf4;
  border-radius: 10px;
  background: #fff;
}
.pd-specs > div {
  min-width: 0;
  padding: 10px 11px;
  border-right: 1px solid #edf1f6;
}
.pd-specs > div:last-child {
  border-right: 0;
}
.pd-specs small {
  display: block;
  color: var(--light);
  font-size: 10px;
}
.pd-specs strong {
  display: block;
  margin-top: 3px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}
/* 资料下载胶囊 */
.pd-docs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.pd-doc {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px 5px 6px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
}
.pd-doc:hover {
  border-color: var(--blue);
}
.pd-doc i {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #eaf1fd;
  color: var(--blue);
  font-size: 8px;
  font-style: normal;
  font-weight: 800;
}
.pd-doc span {
  font-size: 12px;
}
/* 价格面板：左侧蓝色竖条，与详情页一致 */
.pd-price-panel {
  position: relative;
  margin-top: 16px;
  padding: 14px 16px 13px 18px;
  border: 1px solid #e4ecf8;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8faff, #f2f6fd);
}
.pd-price-panel::before {
  content: "";
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 0;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(var(--blue), #4a86e8);
}
.pd-price-panel p {
  margin: 0;
}
.pd-price-panel p:first-child {
  color: var(--muted);
  font-size: 12px;
}
.pd-price-panel .price {
  margin: 2px 0 3px;
  font-size: 28px;
}
.pd-price-panel .tiny {
  color: var(--muted);
  font-size: 11.5px;
}
.pd-incompat {
  margin-top: 8px !important;
  padding: 7px 11px;
  border-radius: 7px;
  background: #fff0ee;
  color: #c93930 !important;
  font-size: 12px !important;
}
/* 四段内容间距 */
.pd-body :deep(.product-content) {
  margin-top: 18px;
}
.pd-body :deep(.product-content .card) {
  padding: 18px;
}
/* 抽屉底部 */
.pd-foot {
  flex: 0 0 auto;
  display: flex;
  gap: 12px;
  padding: 14px 22px;
  border-top: 1px solid var(--line);
  background: #fff;
}
.pd-foot .btn {
  flex: 1 1 0;
  height: 44px;
}
.pd-foot .btn.primary {
  flex: 1.4 1 0;
  box-shadow: 0 6px 16px rgba(21, 84, 199, 0.24);
}
</style>
