<!--
  页面：商品详情（detail.vue）
  路由：/detail ｜ 分组：选型与采购
  作用：展示商品主图与多视图、系列/型号/SKU、参考价格、库存与规格选择，支持加购、收藏和询价跳转
  数据：getters.product(id) 取商品（query.id 缺省 columnStandard）；state.favorites 判定收藏；相关商品取 state.products
-->
<template>
  <div v-if="product">
    <!-- 面包屑：返回配件列表 -->
    <div class="breadcrumb">
      <router-link to="/goods">配件采购</router-link> / {{ product.name }}
    </div>
    <!-- 从一键式采购跳进详情时显示返回条：跳回套装配置清单 -->
    <div v-if="backBundle" class="back-bar">
      <router-link
        class="btn soft sm"
        :to="{ path: '/package-detail', query: { id: backBundle } }"
        >&larr; 返回一键选购（{{ backBundleName }}）</router-link
      >
    </div>
    <!-- 商品主区块：左侧图片与视图切换，右侧摘要与操作 -->
    <section class="card detail-hero">
      <div>
        <!-- 主图轮播：按规格切换图组（后端 sku.images），左右箭头 + 圆点 -->
        <div class="detail-image">
          <button
            v-if="gallery.length > 1"
            class="gallery-nav prev"
            type="button"
            aria-label="上一张"
            @click="stepImage(-1)"
          >
            ‹
          </button>
          <img :src="asset(activeImage)" :alt="product.name" />
          <!-- 图片张数：替代缩略图，保持画面干净 -->
          <span v-if="gallery.length > 1" class="gallery-count"
            >{{ galleryIndex + 1 }} / {{ gallery.length }}</span
          >
          <button
            v-if="gallery.length > 1"
            class="gallery-nav next"
            type="button"
            aria-label="下一张"
            @click="stepImage(1)"
          >
            ›
          </button>
        </div>
        <!-- 关键参数：放在主图下方，左右两栏高度更均衡 -->
        <div v-if="heroSpecs.length" class="hero-spec">
          <div v-for="row in heroSpecs" :key="row.label">
            <small>{{ row.label }}</small><strong>{{ row.value }}</strong>
          </div>
        </div>
      </div>
      <!-- 商品摘要：来源角标、资料下载、身份信息、价格库存、规格选择与操作栏 -->
      <div class="detail-summary">
        <!-- 顶部一行：左侧来源角标，右侧三个资料下载（点击预览 / 尾部下载） -->
        <div class="summary-head">
          <span class="badge blue">{{
            product.sourceType === "customer" ? "客户资料" : "现货商品"
          }}</span>
          <div class="drawing-row">
            <div
              v-for="entry in downloadFields"
              :key="entry[0]"
              class="doc-chip"
              :class="{ 'is-empty': !docFile(entry) }"
              role="button"
              tabindex="0"
              @click="previewDoc(entry)"
              @keyup.enter="previewDoc(entry)"
            >
              <i>{{ docIcon(entry[0]) }}</i>
              <span>{{ docLabel(entry) }}</span>
              <button type="button" @click.stop="downloadDoc(entry)">下载</button>
            </div>
          </div>
        </div>
        <h1>{{ product.name }}</h1>
        <p class="muted">{{ product.sub }}</p>
        <!-- 价格面板：随选中规格切换参考价，库存为空显示待确认 -->
        <div class="price-panel">
          <p>参考价格</p>
          <strong class="price">{{
            money(selectedSku ? selectedSku.priceFen : product.priceFen)
          }}</strong>
          <p class="tiny">
            库存：{{ product.stock === null ? "待确认" : product.stock }} ·
            {{
              product.sourceType === "customer"
                ? "客户未提供报价及库存"
                : "价格与库存以实际下单确认为准"
            }}
          </p>
        </div>
        <!-- 规格选择：存在多个 SKU 时渲染，按功率/量程/制冷量等字段展示 -->
        <div v-if="product.skus && product.skus.length">
          <p>
            选择规格
            <!-- 选中规格回显，避免多规格时看不清当前选择 -->
            <em v-if="selectedSku" class="sku-picked"
              >已选：{{ selectedSku.id }} ·
              {{ selectedSku.power || selectedSku.range || selectedSku.cool }}</em
            >
          </p>
          <div class="segment">
            <button
              v-for="s in product.skus"
              :key="s.id"
              :class="{ on: selectedSku && selectedSku.id === s.id }"
              @click="selectedSku = s"
            >
              {{ s.id }} · {{ s.power || s.range || s.cool || "规格" }}
            </button>
          </div>
        </div>
        <!-- 购买区：数量与操作按钮收进同一面板，主次更分明 -->
        <div class="buy-panel">
          <!-- 购买数量：与购物车一致，先选数量再下单 -->
          <div v-if="product.buyable" class="qty-row">
            <span>购买数量</span>
            <div class="qty-stepper">
              <button type="button" aria-label="减少数量" @click="stepQty(-1)">
                −</button
              ><input
                :value="quantity"
                type="number"
                min="1"
                @change="setQty($event.target.value)"
              /><button type="button" aria-label="增加数量" @click="stepQty(1)">
                +
              </button>
            </div>
            <small class="tiny"
              >库存
              {{ product.stock === null ? "待确认" : product.stock }} 件</small
            >
          </div>
          <!-- 操作栏：可售商品加入购物车 / 立即购买，否则引导询价；收藏可切换 -->
          <div class="action-row">
            <template v-if="product.buyable">
              <button class="btn" @click="add">加入购物车</button>
              <button class="btn primary" @click="buyNow">立即购买</button>
            </template>
            <router-link v-else to="/support" class="btn primary"
              >咨询报价</router-link
            ><button
              class="btn fav"
              @click="$store.commit('toggleFavorite', product.id)"
            >
              {{ favorite ? "♥ 已收藏" : "♡ 收藏" }}
            </button>
          </div>
          <!-- 不可售提示 -->
          <p v-if="!product.buyable" class="alert">
            未提供可售 SKU、价格和库存，此商品不能下单。
          </p>
        </div>
      </div>
    </section>
    <!-- 商品内容：亮点 / 规格参数 / 富文本介绍 / 购买须知，与积分商城详情同一结构 -->
    <ProductContent
      :highlights="content.highlights"
      :specs="content.specs"
      :intro-html="content.introHtml"
      :notes="content.notes"
      :notes-title="content.notesTitle"
    />
    <!-- 相关学习内容：学习专区中关联本商品的图文 / 文章 / 视频 -->
    <template v-if="relatedArticles.length">
      <div class="section-title"><h2>相关学习内容</h2></div>
      <section class="card">
        <router-link
          v-for="a in relatedArticles"
          :key="a.id"
          class="topic-row article-link"
          :to="{ path: '/article', query: { id: a.id } }"
        >
          <b class="type-badge" :class="articleBadge(a.type)">{{ a.type }}</b>
          <div>
            <h3>{{ a.title }}</h3>
            <p class="tiny">{{ a.desc }}</p>
          </div>
          <span class="link">查看</span>
        </router-link>
      </section>
    </template>
    <!-- 相关产品：同分类其他商品 -->
    <div class="section-title"><h2>相关产品</h2></div>
    <div class="product-grid">
      <ProductCard v-for="p in related" :key="p.id" :product="p" />
    </div>
  </div>
  <!-- 商品不存在空态 -->
  <div v-else class="empty">
    商品不存在。<router-link to="/goods">返回配件列表</router-link>
  </div>
</template>
<script>
// 商品卡片组件（相关产品）
import ProductCard from "@/components/ProductCard.vue";
// 商品内容板块组件：亮点 / 规格参数 / 富文本介绍 / 购买须知
import ProductContent from "@/components/ProductContent.vue";
// 学习内容目录：用于反查关联本商品的文章（contents.relatedProducts）
import catalog from "@/mock/catalog.json";
// 领域工具：金额分转元、静态资源路径
import { money, asset } from "@/domain/productFields";
// 商品详情内容：统一四段结构，后台录入 product.content 后自动生效
import { resolveProductContent } from "@/modules/product/domain/productContent";
// 五视图字段定义与工程文件字段定义：[数据键名, 中文标签]
import { viewFields, downloadFields } from "@/domain/productFields";
export default {
  components: { ProductCard, ProductContent },
  data() {
    // selectedSku 当前选中规格；galleryIndex 轮播位置；quantity 购买数量
    return {
      selectedSku: null,
      galleryIndex: 0,
      quantity: 1,
      downloadFields,
    };
  },
  computed: {
    // 当前商品：取路由 query.id，缺省 id columnStandard
    product() {
      return this.$store.getters.product(
        this.$route.query.id || "columnStandard",
      );
    },
    // 商品内容：亮点 / 规格参数 / 富文本介绍 / 购买须知
    content() {
      return resolveProductContent(this.product);
    },
    // 关键参数（四格）：主图下方展示，空值用「—」占位保持排版整齐
    heroSpecs() {
      const p = this.product || {};
      if (!p.id) return [];
      return [
        { label: "品牌", value: p.brand || p.series || "—" },
        { label: "产品型号", value: p.model || p.code || "—" },
        { label: "可售 SKU", value: p.skuCode || "—" },
        { label: "库存", value: p.stock == null ? "待确认" : "现货 " + p.stock },
      ];
    },
    // 从套装一键采购跳进详情时的回跳套装 id（query.back=bundle:套装id）
    backBundle() {
      const back = this.$route.query.back || "";
      return back.indexOf("bundle:") === 0 ? back.slice(7) : "";
    },
    // 回跳套装名称
    backBundleName() {
      const pkg = this.$store.state.packages.find(
        (p) => p.id === this.backBundle,
      );
      return pkg ? pkg.name : "";
    },
    // 是否已收藏当前商品
    favorite() {
      return (
        this.product && this.$store.state.favorites.includes(this.product.id)
      );
    },
    // 轮播图组：规格自带图组（sku.images）> 商品图组（gallery）> 主图/透视图/五视图
    gallery() {
      const p = this.product || {};
      const sku = this.selectedSku;
      if (sku && Array.isArray(sku.images) && sku.images.length)
        return sku.images;
      if (Array.isArray(p.gallery) && p.gallery.length) return p.gallery;
      return [
        p.image,
        p.perspective,
        ...viewFields.map(([key]) => p.views && p.views[key]),
      ].filter(Boolean);
    },
    // 当前展示图：图组为空时回退商品主图
    activeImage() {
      return this.gallery[this.galleryIndex] || (this.product && this.product.image);
    },
    // 相关产品：同分类且排除自身，最多 4 件
    related() {
      return this.$store.state.products
        .filter(
          (p) =>
            this.product &&
            p.cat === this.product.cat &&
            p.id !== this.product.id,
        )
        .slice(0, 4);
    },
    // 相关学习内容：学习专区中 relatedProducts 包含当前商品 id 的内容
    relatedArticles() {
      if (!this.product) return [];
      return catalog.contents.filter(
        (a) =>
          (a.relatedProducts || []).includes(this.product.id) &&
          a.type !== "专题",
      );
    },
  },
  watch: {
    // 商品切换时重置轮播与数量，并默认选中与商品价格一致的规格
    product: {
      immediate: true,
      handler(v) {
        this.galleryIndex = 0;
        this.quantity = 1;
        this.selectedSku =
          v && v.skus
            ? v.skus.find((s) => s.priceFen === v.priceFen) || v.skus[0]
            : null;
      },
    },
    // 切换规格后回到该图组第一张
    selectedSku() {
      this.galleryIndex = 0;
    },
  },
  methods: {
    money,
    asset,
    // 学习内容类型角标配色
    articleBadge(type) {
      return {
        图文: "green",
        文章: "blue",
        视频: "orange",
        专题: "purple",
      }[type];
    },
    // 轮播左右切换（循环）
    stepImage(delta) {
      const total = this.gallery.length;
      if (!total) return;
      this.galleryIndex = (this.galleryIndex + delta + total) % total;
    },
    // 资料文件地址：未录入时返回空串
    docFile(entry) {
      const files = (this.product && this.product.downloads) || {};
      return files[entry[0]] || "";
    },
    // 资料类型角标：3D / PDF / BOX
    docIcon(key) {
      return { assembly3d: "3D", engineeringPdf: "PDF", packagingDrawing: "BOX" }[
        key
      ] || "DOC";
    },
    // 顶部空间有限，资料名用短标签
    docLabel(entry) {
      return (
        {
          assembly3d: "装配 3D",
          engineeringPdf: "工程图 PDF",
          packagingDrawing: "包装图",
        }[entry[0]] || entry[1]
      );
    },
    // 点击资料卡：有文件则新窗口预览，无文件给出提示
    previewDoc(entry) {
      const file = this.docFile(entry);
      if (!file) {
        this.$store.commit(
          "setNotice",
          `「${entry[1]}」暂未提供，可联系业务索取`
        );
        return;
      }
      window.open(asset(file), "_blank");
    },
    // 下载资料：走浏览器下载，文件缺失同样提示
    downloadDoc(entry) {
      const file = this.docFile(entry);
      if (!file) {
        this.$store.commit(
          "setNotice",
          `「${entry[1]}」暂未提供，可联系业务索取`
        );
        return;
      }
      const a = document.createElement("a");
      a.href = asset(file);
      a.download = entry[1];
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    // 购买数量加减：1~99
    stepQty(delta) {
      this.setQty(this.quantity + delta);
    },
    setQty(value) {
      this.quantity = Math.min(99, Math.max(1, parseInt(value, 10) || 1));
    },
    // 加入购物车：携带当前商品、选中规格与购买数量（可售校验在 mutation 内）
    add() {
      this.$store.commit("addCart", {
        product: this.product,
        sku: this.selectedSku,
        quantity: this.quantity,
      });
    },
    // 立即购买：先加入购物车，再进入结算
    buyNow() {
      const qtyBefore = this.$store.state.cart.reduce(
        (n, line) => n + line.quantity,
        0
      );
      this.add();
      const qtyAfter = this.$store.state.cart.reduce(
        (n, line) => n + line.quantity,
        0
      );
      // 加购失败（不可售 / 所选规格无库存）时 store 已给出提示，这里不跳转
      if (qtyAfter === qtyBefore) return;
      this.$router.push("/checkout");
    },
  },
};
</script>

<style>
/* 主图轮播：16:9 画幅 + 左右箭头 + 张数角标 */
.detail-image {
  position: relative;
}
.gallery-nav {
  position: absolute;
  top: 50%;
  z-index: 1;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  transform: translateY(-50%);
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #41546d;
  font-size: 22px;
  line-height: 1;
  box-shadow: 0 4px 14px rgba(21, 49, 88, 0.14);
  backdrop-filter: blur(4px);
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease,
    box-shadow 0.18s ease;
}
.gallery-nav.prev {
  left: 14px;
}
.gallery-nav.next {
  right: 14px;
}
.gallery-nav:hover {
  background: var(--blue);
  color: #fff;
  box-shadow: 0 6px 18px rgba(21, 84, 199, 0.32);
}
/* 主图：固定 16:9 画幅，摄影棚式径向渐变底，商品悬浮投影，页面更精致 */
.detail-hero {
  grid-template-columns: minmax(0, 1.02fr) minmax(0, 1fr);
  gap: 30px;
  align-items: start;
  border-radius: 14px;
  box-shadow: 0 12px 34px rgba(18, 46, 88, 0.06);
}
.detail-hero .detail-image {
  height: auto;
  aspect-ratio: 16 / 9;
  border: 0;
  border-radius: 12px;
  background: radial-gradient(
    125% 95% at 50% 6%,
    #ffffff 0%,
    #eef4fb 56%,
    #e1eaf5 100%
  );
  box-shadow: inset 0 0 0 1px #e7eef7;
}
.detail-hero .detail-image img {
  max-height: 86%;
  max-width: 86%;
  transition: transform 0.35s ease;
  filter: drop-shadow(0 16px 20px rgba(20, 42, 74, 0.2));
}
.detail-hero .detail-image:hover img {
  transform: translateY(-3px) scale(1.035);
}
/* 主图下方的关键参数：平衡左右两栏高度 */
.hero-spec {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid #e4ebf4;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(21, 49, 88, 0.04);
}
.hero-spec > div {
  min-width: 0;
  padding: 13px 15px;
  border-right: 1px solid #edf1f6;
}
.hero-spec > div:last-child {
  border-right: 0;
}
.hero-spec small {
  display: block;
  color: var(--light);
  font-size: 11.5px;
  letter-spacing: 0.3px;
}
.hero-spec strong {
  display: block;
  margin-top: 5px;
  overflow: hidden;
  color: var(--ink);
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}
/* 右栏标题：字重与字距更精致 */
.detail-summary h1 {
  margin: 10px 0 6px;
  font-size: 27px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: var(--ink);
}
.detail-summary > .muted {
  margin: 0;
}
/* 资料胶囊：悬浮轻微浮起 */
.doc-chip {
  transition: border-color 0.18s ease, background 0.18s ease,
    box-shadow 0.18s ease, transform 0.18s ease;
}
.doc-chip:hover {
  box-shadow: 0 4px 12px rgba(21, 84, 199, 0.1);
  transform: translateY(-1px);
}
/* 价格面板：左侧强调色条，层次更清晰 */
.detail-summary .price-panel {
  position: relative;
  margin: 18px 0;
  padding: 16px 18px 15px;
  border: 1px solid #e4ecf8;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8faff, #f2f6fd);
}
.detail-summary .price-panel::before {
  content: "";
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(var(--blue), #4a86e8);
}
.detail-summary .price-panel > p:first-child {
  margin: 0;
  color: var(--muted);
  font-size: 12.5px;
}
.detail-summary .price-panel .price {
  margin: 2px 0 4px;
  font-size: 34px;
  line-height: 1.25;
}
.detail-summary .price-panel .tiny {
  margin: 0;
  color: var(--muted);
}
/* 规格选择标题 */
.detail-summary .segment {
  margin: 10px 0 4px;
}
.detail-summary .segment button {
  padding: 9px 16px;
  border-radius: 9px;
  transition: border-color 0.16s ease, color 0.16s ease,
    box-shadow 0.16s ease, transform 0.16s ease;
}
.detail-summary .segment button:hover {
  border-color: #9bbcf3;
  color: var(--blue);
  transform: translateY(-1px);
}
.detail-summary .segment button.on {
  box-shadow: 0 4px 12px rgba(21, 84, 199, 0.16);
}
/* 已选规格：改成柔和小胶囊 */
.detail-summary .sku-picked {
  padding: 2px 9px;
  border-radius: 999px;
  background: #eaf1fd;
  font-size: 11.5px;
  white-space: nowrap;
}
/* 图片张数角标 */
.gallery-count {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 1;
  padding: 4px 11px;
  border-radius: 999px;
  background: rgba(13, 28, 56, 0.62);
  color: #fff;
  font-size: 12px;
  line-height: 1.4;
  backdrop-filter: blur(3px);
}
/* 顶部一行：角标 + 右侧资料下载胶囊 */
.detail-summary .summary-head {
  align-items: center;
  gap: 12px;
}
/* 资料下载：一行小胶囊，点击预览、尾部下载 */
.drawing-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}
.doc-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px 5px 6px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #f8fafd;
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease,
    box-shadow 0.18s ease, transform 0.18s ease;
}
.doc-chip:hover {
  border-color: var(--blue);
  background: #f2f7ff;
}
.doc-chip i {
  width: 19px;
  height: 19px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #eaf1fd;
  color: var(--blue);
  font-size: 8px;
  font-style: normal;
  font-weight: 800;
}
.doc-chip span {
  color: var(--ink);
  font-size: 12px;
  white-space: nowrap;
}
.doc-chip button {
  padding: 0 1px;
  border: 0;
  background: transparent;
  color: var(--blue);
  font-size: 11.5px;
  cursor: pointer;
}
.doc-chip button:hover {
  text-decoration: underline;
}
/* 未提供资料：整体弱化，点击后提示联系业务 */
.doc-chip.is-empty {
  background: #fbfcfd;
}
.doc-chip.is-empty i {
  background: #f0f3f7;
  color: #9aa7b9;
}
.doc-chip.is-empty span {
  color: #7d8b9f;
}
.doc-chip.is-empty button {
  color: #9aa7b9;
}
/* 已选规格回显 */
.sku-picked {
  margin-left: 8px;
  color: var(--blue);
  font-size: 12px;
  font-style: normal;
}
/* 购买区：数量与按钮统一在一张浅色面板里，主次更分明 */
.buy-panel {
  margin-top: 18px;
  padding: 15px 17px 17px;
  border: 1px solid #e2e9f4;
  border-radius: 14px;
  background: linear-gradient(180deg, #fcfdff, #f3f8fe);
  box-shadow: 0 6px 18px rgba(21, 64, 120, 0.05);
}
.qty-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 1px dashed #dde5f0;
  color: #41546d;
  font-size: 13px;
}
.qty-row .tiny {
  margin-left: auto;
  color: var(--muted);
}
.qty-stepper {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  height: 34px;
  border: 1px solid #d9e1ec;
  border-radius: 8px;
  background: #fff;
}
.qty-stepper button {
  width: 32px;
  height: 100%;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #41546d;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
}
.qty-stepper button:hover {
  background: #eef4fe;
  color: var(--blue);
}
.qty-stepper input {
  width: 46px;
  height: 100%;
  padding: 0;
  border: 0;
  border-right: 1px solid #eef2f8;
  border-left: 1px solid #eef2f8;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  color: var(--ink);
  font-size: 13px;
  text-align: center;
}
.qty-stepper input:focus {
  outline: none;
  box-shadow: none;
}
/* 操作按钮等分一行，收藏作为次要按钮弱化 */
.buy-panel .action-row {
  justify-content: flex-start;
  flex-wrap: nowrap;
  gap: 10px;
  margin-top: 14px;
}
.buy-panel .action-row .btn {
  flex: 1 1 0;
  height: 44px;
  font-size: 14.5px;
}
.buy-panel .action-row .btn.primary {
  flex: 1.15 1 0;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(21, 84, 199, 0.24);
  transition: background 0.18s ease, box-shadow 0.18s ease;
}
.buy-panel .action-row .btn.primary:hover {
  box-shadow: 0 8px 20px rgba(21, 84, 199, 0.32);
}
.buy-panel .action-row .btn.fav {
  flex: 0 0 auto;
  min-width: 92px;
  border-color: #dbe3ee;
  background: #fff;
  color: #5b6b80;
  font-size: 13px;
}
.buy-panel .action-row .btn.fav:hover {
  border-color: var(--blue);
  color: var(--blue);
}
</style>
