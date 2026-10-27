<!--
  页面：一站式选购（H5）
  路由：/diy；/package 为历史兼容入口
  与 PC 端共享 oneStopMixin，移动端独立维护布局与交互密度。
-->
<template>
  <div class="m-one-stop">
    <div v-if="loading" class="card m-os-loading">正在加载选配数据…</div>

    <template v-else>
      <div class="page-title m-os-page-title">
        <h1>一站式选购</h1>
        <small>选方案与机柜，自动带出铝件 5 件套</small>
      </div>

      <section class="card m-os-section">
        <div class="m-os-title">
          <div>
            <small>先选整机形态</small>
            <h2>选择方案</h2>
          </div>
          <span>{{ orientations.length }} 款机型</span>
        </div>
        <div class="m-os-orientations">
          <button
            v-for="item in orientations"
            :key="item.id"
            :class="{ on: item.id === orientationId }"
            @click="selectOrientation(item.id)"
          >
            <i>{{ item.id === orientationId ? "✓" : "" }}</i>
            <strong>{{ item.name }}</strong>
            <small>{{ item.desc }}</small>
          </button>
        </div>
      </section>

      <div class="m-os-body">
        <aside class="m-os-rail">
          <div class="m-os-rail-head">
            <strong>{{ completionCount }}/{{ steps.length }}</strong>
            <small>已完成</small>
            <i
              ><b
                :style="{ width: (completionCount / steps.length) * 100 + '%' }"
              ></b
            ></i>
          </div>
          <button
            v-for="(step, index) in steps"
            :key="step.key"
            :class="{ on: activeStep === index, done: stepDone(step.key) }"
            @click="jumpToStep(index)"
          >
            <i>{{ stepDone(step.key) ? "✓" : index + 1 }}</i>
            <span>{{ railLabel(step.key) }}</span>
          </button>
        </aside>

        <div class="m-os-modules">
          <section
            v-for="(step, index) in steps"
            :id="'m-os-step-' + step.key"
            :key="step.key"
            :class="['card', 'm-os-module', { on: activeStep === index }]"
          >
            <header>
              <div>
                <small>STEP {{ pad(index) }}</small>
                <h2>{{ step.name }}</h2>
              </div>
              <div class="m-os-selector-tools">
                <em :class="{ skip: skippedSteps[step.key] }">{{
                  skippedSteps[step.key]
                    ? "已跳过"
                    : step.required
                    ? "必选"
                    : "可选"
                }}</em>
              </div>
            </header>
            <p class="m-os-hint">{{ hintForStep(step.key) }}</p>

            <!-- 已跳过的步骤：不再展示候选商品，避免与「已跳过」状态矛盾 -->
            <div v-if="skippedSteps[step.key]" class="m-os-skipped">
              <span>✓</span>
              <div>
                <strong>已跳过「{{ step.name }}」</strong>
                <small>该项不计入方案与报价</small>
              </div>
              <button type="button" @click="resumeStep(step.key)"
                >重新选择</button
              >
            </div>

            <section
              v-if="step.key === 'kit' && !skippedSteps[step.key]"
              class="m-os-kit"
            >
              <div class="m-os-kit-head">
                <div>
                  <small>按当前机柜带出</small>
                  <h3>{{ kit ? kit.name : "尚未选择机柜" }}</h3>
                  <p>
                    先选择一个套件，下方同步展开该套件的 5
                    个具体部件；也可逐件编辑，更换机柜时手动调整的部件会保留。
                  </p>
                </div>
              </div>

              <!-- 套件选项：标准套装 + 套件1/2/3，单选；超出宽度时横向滚动 -->
              <div
                v-if="kitVariants.length"
                class="m-os-kit-options-wrap"
                :class="{ scrollable: kitScroll.overflowing }"
              >
                <button
                  v-if="kitScroll.overflowing && kitScroll.left"
                  type="button"
                  class="m-os-kit-nav prev"
                  aria-label="上一组套件"
                  @click="scrollKitOptions(-1)"
                >
                  ‹
                </button>
                <div
                  ref="kitOptions"
                  class="m-os-kit-options"
                  @scroll="onKitScroll"
                >
                  <button
                    v-for="option in kitVariants"
                    :key="option.id"
                    type="button"
                    class="m-os-kit-option"
                    :class="{ on: option.id === activeKitOptionId }"
                    @click="chooseKitOption(option)"
                  >
                    <span class="m-os-radio"></span>
                    <strong>
                      {{ option.name }}
                      <em v-if="option.recommended" class="m-os-kit-tag"
                        >推荐</em
                      >
                    </strong>
                    <small>{{ option.desc }}</small>
                    <b>{{ kitOptionPrice(option) }}</b>
                  </button>
                </div>
                <button
                  v-if="kitScroll.overflowing && kitScroll.right"
                  type="button"
                  class="m-os-kit-nav next"
                  aria-label="下一组套件"
                  @click="scrollKitOptions(1)"
                >
                  ›
                </button>
              </div>
              <p v-else class="m-os-kit-empty-tip">
                请先选择机柜，以带出可选套件。
              </p>

              <!-- 选中套件的具体部件，默认展开 -->
              <div v-if="kitVariants.length" class="m-os-kit-detail">
                <div class="m-os-kit-detail-head">
                  <span>套件明细</span>
                  <!-- 手工改过 5 件中的任意一件后转为红色，提示已偏离该套件标准配置 -->
                  <strong :class="{ 'is-custom': kitDeviated }">{{
                    kitLabel
                  }}</strong>
                </div>
                <div class="m-os-kit-list">
                  <div v-for="row in kitRows" :key="row.key">
                    <template v-if="row.product">
                      <img
                        :src="asset(row.product.image)"
                        :alt="row.product.name"
                      />
                      <span
                        ><small>{{ row.label }}</small
                        ><strong>{{ row.product.name }}</strong
                        ><em>{{ row.product.model }}</em></span
                      >
                    </template>
                    <template v-else>
                      <span class="m-os-kit-empty-img">—</span>
                      <span
                        ><small>{{ row.label }}</small
                        ><strong class="m-os-kit-empty"
                          >未选择（可选）</strong
                        ></span
                      >
                    </template>
                    <span class="m-os-kit-row-side">
                      <!-- 套件部件数量固定 1，只显示价格 -->
                      <em class="m-os-kit-formula">{{ row.priceText }}</em>
                      <button
                        v-if="row.product"
                        type="button"
                        @click="openProductDetail(row.product, 'review', row)"
                        >详情</button
                      >
                      <button type="button" @click="openEditor(row)"
                        >编辑</button
                      >
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <div
              v-else-if="
                step.key === 'fieldLens' &&
                videoGalvo &&
                !skippedSteps[step.key]
              "
              class="m-os-auto"
            >
              <i>✓</i>
              <div>
                <strong>场镜已随视频振镜配套</strong>
                <p>无需再次选择，本步骤自动完成。</p>
              </div>
            </div>

            <div v-else-if="!skippedSteps[step.key]" class="m-os-candidates">
              <div
                v-for="item in candidatesForStep(step.key)"
                :key="item.id"
                class="m-os-candidate"
                :class="{ on: isPicked(step, item) }"
              >
                <!-- 主区域点击即选择 -->
                <span class="m-os-candidate-pick" @click="pick(index, item)">
                  <img :src="asset(item.image)" :alt="item.name" />
                  <span>
                    <strong>{{ item.name }}</strong>
                    <small>{{ item.model }}</small>
                    <p>{{ item.desc }}</p>
                    <em>{{ priceText(item.priceFen) }}</em>
                    <i v-if="isPicked(step, item)" class="m-os-pick-tip"
                      >已选 · 再点取消</i
                    >
                  </span>
                  <b>{{ isPicked(step, item) ? "✓" : "+" }}</b>
                </span>
                <!-- 查阅商品详情：底部抽屉 -->
                <button
                  type="button"
                  class="m-os-candidate-detail"
                  @click.stop="openProductDetail(item, 'step')"
                >
                  查阅商品详情
                </button>
              </div>
            </div>

            <!-- 跳过入口：放在模块底部，跳过即不计入方案与报价 -->
            <div
              v-if="step.skippable && !skippedSteps[step.key]"
              class="m-os-module-foot"
            >
              <span>跳过该项后不计入方案与报价</span>
              <button type="button" @click="skipStep(step.key)">
                跳过此项
              </button>
            </div>
          </section>
        </div>
      </div>

      <section id="one-stop-review" class="card m-os-review">
        <header>
          <div>
            <small>完整选购结果</small>
            <h2>{{ orientation.name }}配置清单</h2>
          </div>
        </header>
        <p class="m-os-review-note">
          以下为当前已选配置，如需更换请在上方对应步骤中修改。
        </p>

        <section
          v-for="group in groupedFinalRows"
          :key="group.name"
          class="m-os-review-group"
        >
          <h3>
            {{ group.name }}<small>{{ group.rows.length }} 项</small>
          </h3>
          <div v-for="row in group.rows" :key="row.key" class="m-os-review-row">
            <img
              v-if="row.product"
              :src="asset(row.product.image)"
              :alt="row.product.name"
            />
            <span v-else class="m-os-empty-img">—</span>
            <div class="m-os-review-info">
              <small>{{ row.label }}</small>
              <strong>{{
                row.product ? row.product.name : row.includedText
              }}</strong>
              <!-- 单价（左对齐） × 数量 = 小计（右对齐），各列跨行对齐 -->
              <div class="m-os-review-buy" :class="{ 'is-blank': !row.product }">
                <template v-if="row.product">
                  <span class="m-buy-price">{{ priceText(row.product.priceFen) }}</span>
                  <span class="m-buy-times">×</span>
                  <span class="m-os-review-qty">
                    <button
                      type="button"
                      class="m-qty-btn"
                      aria-label="减少"
                      @click="stepRowQty(row, -1)"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>
                    </button>
                    <input
                      class="m-qty-input"
                      :value="rowQtyOf(row.key)"
                      type="number"
                      min="1"
                      max="99"
                      @change="setRowQty(row, $event.target.value)"
                    />
                    <button
                      type="button"
                      class="m-qty-btn"
                      aria-label="增加"
                      :disabled="rowQtyOf(row.key) >= 99"
                      @click="stepRowQty(row, 1)"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                  </span>
                  <span class="m-buy-eq">=</span>
                  <b class="m-buy-total">{{ priceText(rowTotalFenOf(row)) }}</b>
                </template>
                <template v-else>
                  <span class="m-buy-price m-buy-blank"></span>
                  <span class="m-buy-times m-buy-blank"></span>
                  <span class="m-os-review-qty m-buy-blank"></span>
                  <span class="m-buy-eq m-buy-blank"></span>
                  <b class="m-buy-total" :class="row.includedPrice ? 'is-included' : 'is-empty'">{{
                    row.includedPrice ? "已包含" : "—"
                  }}</b>
                </template>
              </div>
            </div>
          </div>
        </section>

        <!-- 电控仓升级：仅在已选机柜时展示 -->
        <label
          v-if="selection.cabinetId"
          class="m-os-upgrade"
          :class="{ on: cabinetUpgrade }"
        >
          <input v-model="cabinetUpgrade" type="checkbox" />
          <span>
            <strong>将机柜升级为电控仓</strong>
            <small
              >升级后含电气控制与整机走线，方案总价增加
              {{ priceText(cabinetUpgradeFee) }}</small
            >
          </span>
          <em>+ {{ priceText(cabinetUpgradeFee) }}</em>
        </label>

        <div class="m-os-total">
          <div class="m-os-total-info">
            <span>{{
              priceMode === "bundle" ? "套餐参考价" : "一站式组合价"
            }}</span
            ><small>{{
              priceMode === "bundle"
                ? "保留套内配置可享套餐价"
                : "套餐优惠已取消，按商城正价合计"
            }}</small>
            <small v-if="cabinetUpgrade" class="m-os-upgrade-note"
              >已含机柜升级电控仓 +{{ priceText(cabinetUpgradeFee) }}</small
            >
          </div>
          <strong class="m-os-total-price">
            <i>¥</i>{{ priceText(totalPrice).replace("¥", "").replace("￥", "") }}
          </strong>
        </div>
        <button
          v-if="!canSeePrice"
          class="btn primary block"
          @click="loginForPrice"
        >
          登录查看价格
        </button>
        <!-- 已登录：加入购物车 / 生成报价单 / 立即购买 -->
        <div v-else class="m-os-actions3">
          <button
            class="btn"
            :disabled="!retailProductIds.length"
            @click="confirmAddCart"
          >
            加入购物车
          </button>
          <button
            class="btn"
            :disabled="!retailProductIds.length"
            @click="confirmQuote"
          >
            生成报价单
          </button>
          <button
            class="btn primary"
            :disabled="!retailProductIds.length"
            @click="confirmBuyNow"
          >
            立即购买
          </button>
        </div>
      </section>

      <button class="m-os-cart-fab" @click="scrollToReview">
        <span class="fab-cart">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M3 4h2.2l2.1 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.55L21 8H6.4"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
            />
            <circle cx="10" cy="20" r="1.5" fill="currentColor" />
            <circle cx="17.5" cy="20" r="1.5" fill="currentColor" />
          </svg>
          <b>{{ retailProductIds.length }}</b>
        </span>
        <span class="fab-price">
          <small>{{ priceMode === "bundle" ? "套餐价" : "组合价" }}</small>
          <strong>{{ priceText(totalPrice) }}</strong>
        </span>
        <em>清单</em>
      </button>

      <!-- 移动端同类型配件商城：底部抽屉 -->
      <div v-if="picker.visible" class="m-os-mask" @click.self="closePicker">
        <section class="m-os-picker" role="dialog" aria-modal="true">
          <header>
            <h2>{{ picker.title }}</h2>
            <div class="m-os-headsearch">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.6" />
                <path d="M16 16l4.6 4.6" />
              </svg>
              <input
                v-model="picker.keyword"
                type="search"
                placeholder="搜索名称 / 型号 / SKU"
              />
            </div>
            <button @click="closePicker">×</button>
          </header>
          <!-- 改动后的计价口径提示（原套件明细底部提示移到此处） -->
          <p class="m-os-picker-warn">
            变更后，将不会享受配件套餐价格，将按照实际价格计算。
          </p>
          <div v-if="picker.tabs.length" class="m-os-picker-tabs">
            <button
              v-for="tab in picker.tabs"
              :key="tab.slot"
              :class="{ on: picker.slot === tab.slot }"
              @click="switchPickerSlot(tab.slot)"
            >
              {{ tab.label }}
            </button>
          </div>
          <div class="m-os-picker-list">
            <div
              v-for="item in pickerList"
              :key="item.id"
              class="m-os-picker-item"
              :class="{ on: pickerSelected(item) }"
            >
              <!-- 点信息区看详情，右侧按钮才是选入 -->
              <div class="m-os-picker-main" @click="openProductDetail(item)">
                <img :src="asset(item.image)" :alt="item.name" />
                <span
                  ><strong>{{ item.name }}</strong
                  ><small>{{ item.model }} · {{ item.desc }}</small
                  ><em>{{ priceText(item.priceFen) }}</em></span
                >
              </div>
              <div class="m-os-picker-actions">
                <button type="button" @click="openProductDetail(item)">
                  详情
                </button>
                <button
                  type="button"
                  class="pick"
                  @click="choosePickerItem(item)"
                >
                  {{ pickerSelected(item) ? "已加入" : "选入" }}
                </button>
              </div>
            </div>
            <p v-if="!pickerList.length" class="m-os-picker-empty">
              {{
                picker.keyword
                  ? "没有找到与“" + picker.keyword + "”相关的商品，换个关键字试试。"
                  : "暂无可选商品，请先完成上一步配置。"
              }}
            </p>
          </div>
        </section>
      </div>

      <!-- 商品详情：点击抽屉里的商品后展示完整参数 -->
      <!-- 商品详情：底部抽屉，内容与商品详情页同口径 -->
      <div
        v-if="detailProduct"
        class="m-os-mask"
        @click.self="detailProduct = null"
      >
        <section class="m-os-detail" role="dialog" aria-modal="true">
          <span class="m-os-detail-grip"></span>
          <header>
            <h2>{{ detailProduct.name }}</h2>
            <button @click="detailProduct = null">×</button>
          </header>
          <div class="m-os-detail-body">
            <!-- 主图：摄影棚底 -->
            <div class="m-os-detail-img">
              <img
                :src="asset(detailProduct.image)"
                :alt="detailProduct.name"
              />
            </div>
            <!-- 关键参数两列 -->
            <dl class="m-os-detail-specs">
              <div>
                <dt>品牌</dt>
                <dd>{{ detailProduct.brand || detailProduct.series || "—" }}</dd>
              </div>
              <div>
                <dt>型号</dt>
                <dd>{{ detailProduct.model || detailProduct.code || "—" }}</dd>
              </div>
              <div>
                <dt>可售 SKU</dt>
                <dd>{{ detailProduct.skuCode || "—" }}</dd>
              </div>
              <div>
                <dt>库存</dt>
                <dd>
                  {{
                    detailProduct.stock != null
                      ? "现货 " + detailProduct.stock
                      : "待确认"
                  }}
                </dd>
              </div>
            </dl>
            <!-- 价格面板 -->
            <div class="m-os-detail-price">
              <p>参考价格</p>
              <strong>{{ priceText(detailProduct.priceFen) }}</strong>
              <span
                >库存：{{
                  detailProduct.stock != null ? detailProduct.stock : "待确认"
                }} · 价格以实际下单为准</span
              >
            </div>
            <!-- 详情四段：亮点/规格/介绍/须知 -->
            <ProductContent
              :highlights="detailContent.highlights"
              :specs="detailContent.specs"
              :intro-html="detailContent.introHtml"
              :notes="detailContent.notes"
            />
          </div>
          <footer>
            <button class="btn" @click="detailProduct = null">关闭</button>
            <button class="btn primary" @click="chooseDetailProduct">
              {{ detailCta }}
            </button>
          </footer>
        </section>
      </div>
    </template>
  </div>
</template>

<script>
import oneStopMixin from "@/modules/selection/domain/oneStopMixin";
// 商品详情四段：亮点/规格/介绍/须知
import { resolveProductContent } from "@/modules/product/domain/productContent";
import ProductContent from "@/components/ProductContent.vue";

const RAIL_LABELS = {
  cabinet: "机柜",
  kit: "铝件",
  galvo: "振镜",
  fieldLens: "场镜",
  laser: "激光器",
  controller: "打标卡",
  computer: "电脑",
  extensions: "扩展",
};

export default {
  name: "OneStopH5Page",
  components: { ProductContent },
  mixins: [oneStopMixin],
  data() {
    return {
      // 机柜升级为电控仓（可选），勾选后方案总价叠加差价
      cabinetUpgrade: false,
      // 套件卡片横向滚动的可用状态：用于在套件过多时显示左右翻页按钮
      kitScroll: { overflowing: false, left: false, right: false },
      // 选配抽屉里点开的商品详情（null 表示未打开）
      detailProduct: null,
      // 详情来源：picker 商城抽屉 | step 步骤候选卡
      detailSource: "picker",
    };
  },
  computed: {
    // 电控仓升级差价：200 元 = 20000 分
    cabinetUpgradeFee() {
      return 20000;
    },
    // 覆盖共享逻辑的总价：在套餐价/组合价基础上叠加升级差价
    totalPrice() {
      const base =
        this.priceMode === "bundle" ? this.bundleTotal : this.retailTotal;
      return base + (this.cabinetUpgrade ? this.cabinetUpgradeFee : 0);
    },
    // 详情抽屉四段内容
    detailContent() {
      return this.detailProduct
        ? resolveProductContent(this.detailProduct)
        : { highlights: [], specs: [], introHtml: "", notes: [] };
    },
    // 详情抽屉底部按钮文案
    detailCta() {
      if (!this.detailProduct) return "选入";
      if (this.detailSource === "step") {
        return this.stepItemSelected(this.detailProduct)
          ? "取消选择"
          : "选入本步骤";
      }
      return this.pickerCta
        ? this.pickerCta(this.detailProduct)
        : "选入";
    },
  },
  mounted() {
    this.scheduleKitMeasure();
    window.addEventListener("scroll", this.syncActiveStep, { passive: true });
    window.addEventListener("resize", this.scheduleKitMeasure);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.syncActiveStep);
    window.removeEventListener("resize", this.scheduleKitMeasure);
  },
  watch: {
    // 目录加载、切换机柜或方案方向后，套件数量与宽度变化，重新测量
    catalog() {
      this.scheduleKitMeasure();
    },
    orientationId() {
      this.scheduleKitMeasure();
    },
    kitVariants() {
      this.scheduleKitMeasure();
    },
    // 取消机柜后不再具备升级电控仓的条件，勾选状态一并清除
    "selection.cabinetId"(val) {
      if (!val) this.cabinetUpgrade = false;
    },
  },
  methods: {
    pad(index) {
      return String(index + 1).padStart(2, "0");
    },
    railLabel(key) {
      return RAIL_LABELS[key] || key;
    },
    isPicked(step, item) {
      if (step.key === "extensions")
        return this.selection.extensions.includes(item.id);
      return this.selectedIdForStep(step.key) === item.id;
    },
    // 详情抽屉：步骤候选卡是否已选（以当前步骤判断）
    stepItemSelected(item) {
      const step = this.steps[this.activeStep];
      return step ? this.isPicked(step, item) : false;
    },
    pick(index, item) {
      this.activeStep = index;
      this.chooseCandidate(item);
    },
    // 渲染完成后再测量，并补测一次，避免懒加载页面首帧宽度未定
    scheduleKitMeasure() {
      this.$nextTick(() => {
        this.measureKitScroll();
        setTimeout(this.measureKitScroll, 200);
      });
    },
    // 测量套件卡片是否横向溢出，并同步左右翻页按钮的可用状态
    measureKitScroll() {
      // 模块在 v-for 内渲染，$refs 取到的是数组，这里统一取首个节点
      const ref = this.$refs.kitOptions;
      const el = Array.isArray(ref) ? ref[0] : ref;
      const next = { overflowing: false, left: false, right: false };
      if (el) {
        const max = el.scrollWidth - el.clientWidth;
        next.overflowing = max > 4;
        next.left = el.scrollLeft > 4;
        next.right = next.overflowing && el.scrollLeft < max - 4;
      }
      const prev = this.kitScroll;
      if (
        prev.overflowing !== next.overflowing ||
        prev.left !== next.left ||
        prev.right !== next.right
      )
        this.kitScroll = next;
    },
    onKitScroll() {
      this.measureKitScroll();
    },
    // 左右翻页：每次滚动约 3 张卡片，保留上一张作为视觉锚点
    scrollKitOptions(dir) {
      const ref = this.$refs.kitOptions;
      const el = Array.isArray(ref) ? ref[0] : ref;
      if (!el) return;
      el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: "smooth" });
    },
    jumpToStep(index) {
      this.activeStep = index;
      const target = document.getElementById(
        "m-os-step-" + this.steps[index].key
      );
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    syncActiveStep() {
      let current = 0;
      this.steps.forEach((step, index) => {
        const el = document.getElementById("m-os-step-" + step.key);
        if (el && el.getBoundingClientRect().top <= 112) current = index;
      });
      if (current !== this.activeStep) this.activeStep = current;
    },
    scrollToReview() {
      const target = document.getElementById("one-stop-review");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    // 打开商品详情抽屉：source 区分商城抽屉、套件明细与步骤候选卡
    openProductDetail(item, source = "picker", ctx = null) {
      this.detailProduct = item;
      this.detailSource = source;
      // 从商城抽屉进入时关闭下层（保留 slot 等上下文）
      if (source === "picker" && this.picker.visible) {
        this.picker.visible = false;
      }
      // 套件明细行：预置该部件 picker 上下文，使「选择」走 choosePickerItem
      if (source === "review" && ctx) {
        this.picker = {
          visible: false,
          slot: ctx.slot,
          title: "从配件商城更换" + ctx.label,
          candidates: this.pickerCandidates(ctx.slot),
          source: "review",
          tabs: [],
          keyword: "",
        };
      }
    },
    // 从详情抽屉选入：商城抽屉走 choosePickerItem，步骤卡走 chooseCandidate
    chooseDetailProduct() {
      const item = this.detailProduct;
      const source = this.detailSource;
      this.detailProduct = null;
      if (!item) return;
      if (source === "step") this.chooseCandidate(item);
      else this.choosePickerItem(item);
    },
  },
};
</script>

<style>
.m-one-stop {
  --mob-blue: #1768d5;
  --mob-line: #e1e8f1;
  padding-bottom: 8px;
  color: #19253a;
}
.m-os-loading {
  padding: 32px 15px;
  text-align: center;
  color: #7b899d;
}
.m-os-page-title {
  margin: 4px 0 12px;
}
.m-os-section {
  padding: 14px;
  margin-bottom: 12px;
}
.m-os-title {
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin-bottom: 10px;
}
.m-os-title small {
  color: var(--mob-blue);
  font-size: 10px;
  font-weight: 700;
}
.m-os-title h2 {
  margin: 2px 0 0;
  font-size: 17px;
}
.m-os-title > span {
  color: #98a5b5;
  font-size: 10px;
}
.m-os-orientations {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}
.m-os-orientations button {
  position: relative;
  min-width: 0;
  min-height: 84px;
  padding: 11px 8px;
  border: 1px solid var(--mob-line);
  border-radius: 9px;
  background: #fff;
  text-align: left;
}
.m-os-orientations button.on {
  border: 2px solid var(--mob-blue);
  padding: 10px 7px;
  background: #f2f7ff;
}
.m-os-orientations i {
  position: absolute;
  right: 6px;
  top: 6px;
  width: 16px;
  height: 16px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #e9eef5;
  color: #fff;
  font-size: 9px;
  font-style: normal;
}
.m-os-orientations .on i {
  background: var(--mob-blue);
}
.m-os-orientations strong,
.m-os-orientations small {
  display: block;
}
.m-os-orientations strong {
  padding-right: 7px;
  font-size: 12px;
}
.m-os-orientations small {
  margin-top: 5px;
  color: #8391a4;
  font-size: 9px;
  line-height: 1.35;
}
.m-os-body {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr);
  gap: 9px;
  align-items: start;
}
.m-os-rail {
  position: sticky;
  top: 102px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 9px 4px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 8px 22px rgba(21, 46, 78, 0.13);
}
.m-os-rail-head {
  padding: 0 2px 7px;
  border-bottom: 1px solid #eef2f7;
  text-align: center;
}
.m-os-rail-head strong {
  display: block;
  color: var(--mob-blue);
  font-size: 13px;
  line-height: 1.1;
}
.m-os-rail-head small {
  display: block;
  margin-top: 1px;
  color: #9aa6b5;
  font-size: 8px;
}
.m-os-rail-head i {
  display: block;
  height: 3px;
  margin-top: 5px;
  border-radius: 2px;
  background: #e9eef5;
  overflow: hidden;
}
.m-os-rail-head i b {
  display: block;
  height: 100%;
  background: var(--mob-blue);
  transition: width 0.25s;
}
.m-os-rail > button {
  padding: 6px 1px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #6b7a8d;
  line-height: 1.15;
}
.m-os-rail > button.on {
  background: #edf5ff;
  color: var(--mob-blue);
  font-weight: 700;
}
.m-os-rail > button i {
  width: 19px;
  height: 19px;
  display: grid;
  place-items: center;
  margin: 0 auto 2px;
  border-radius: 50%;
  background: #edf1f6;
  color: #7d8b9d;
  font-size: 9px;
  font-style: normal;
}
.m-os-rail > button.done i {
  background: var(--mob-blue);
  color: #fff;
}
.m-os-rail > button span {
  display: block;
  font-size: 9px;
  white-space: nowrap;
}
.m-os-modules {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
.m-os-module {
  padding: 13px 12px;
  margin: 0;
  scroll-margin-top: 102px;
  border: 1px solid var(--mob-line);
  transition: box-shadow 0.2s, border-color 0.2s;
}
.m-os-module.on {
  border-color: #cfe1f8;
  box-shadow: 0 8px 20px rgba(23, 104, 213, 0.09);
}
.m-os-module > header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.m-os-module > header small {
  color: var(--mob-blue);
  font-size: 9px;
  font-weight: 700;
}
.m-os-module > header h2 {
  margin: 2px 0 0;
  font-size: 17px;
}
.m-os-selector-tools {
  display: flex;
  align-items: center;
  gap: 6px;
}
.m-os-module > header em {
  padding: 3px 7px;
  border-radius: 10px;
  background: #edf4fe;
  color: var(--mob-blue);
  font-size: 9px;
  font-style: normal;
}
.m-os-module > header em.skip {
  background: #f0f2f5;
  color: #8391a5;
}
.m-os-hint {
  padding: 9px 10px;
  margin: 11px 0;
  border-radius: 7px;
  background: #eef6ff;
  color: #637893;
  font-size: 10px;
  line-height: 1.5;
}
.m-os-candidates {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.m-os-candidates > .m-os-candidate {
  position: relative;
  padding: 8px;
  border: 1px solid var(--mob-line);
  border-radius: 9px;
  background: #fff;
  text-align: left;
}
.m-os-candidates > .m-os-candidate.on {
  border: 2px solid var(--mob-blue);
  padding: 7px;
  background: #f6f9ff;
}
/* 可点击主区域 */
.m-os-candidate-pick {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) 22px;
  align-items: center;
  gap: 9px;
  cursor: pointer;
}
.m-os-candidates img {
  width: 64px;
  height: 62px;
  object-fit: contain;
  border-radius: 7px;
  background: #f7f9fc;
}
.m-os-candidates strong,
.m-os-candidates small,
.m-os-candidates p,
.m-os-candidates em {
  display: block;
}
.m-os-candidates strong {
  font-size: 12px;
}
.m-os-candidates small {
  margin-top: 2px;
  color: #6e7d91;
  font-size: 9px;
}
.m-os-candidates p {
  margin: 3px 0;
  color: #8b98a9;
  font-size: 9px;
}
.m-os-candidates em {
  color: #df412d;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
}
.m-os-candidates b {
  width: 21px;
  height: 21px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #edf1f6;
  color: #718096;
}
.m-os-candidates .on b {
  background: var(--mob-blue);
  color: #fff;
}
/* 查阅商品详情按钮 */
.m-os-candidate-detail {
  width: 100%;
  margin-top: 7px;
  padding: 6px 0;
  border: 1px solid #c8dcf7;
  border-radius: 7px;
  background: #f2f7ff;
  color: var(--mob-blue);
  font-size: 11px;
}
.m-os-candidate-detail:active {
  background: #e3eeff;
}
.m-os-pick-tip {
  display: inline-block;
  margin-top: 4px;
  padding: 1px 6px;
  border-radius: 8px;
  background: #eaf3ff;
  color: var(--mob-blue);
  font-size: 8px;
  font-style: normal;
}
.m-os-kit {
  border: 1px solid var(--mob-line);
  border-radius: 9px;
  overflow: hidden;
}
.m-os-kit-head {
  padding: 12px;
  background: linear-gradient(120deg, #f0f6ff, #fff);
}
.m-os-kit-head small {
  color: var(--mob-blue);
  font-size: 9px;
}
.m-os-kit-head h3 {
  margin: 2px 0 3px;
  font-size: 14px;
}
.m-os-kit-head p {
  margin: 0;
  color: #8190a3;
  font-size: 9px;
  line-height: 1.5;
}
/* 套件选项：横向滑动，一屏约 1.4 张；超出时出现左右翻页 */
.m-os-kit-options-wrap {
  position: relative;
  border-top: 1px solid #edf1f5;
  background: #fbfcfe;
}
.m-os-kit-options {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.m-os-kit-options::-webkit-scrollbar {
  display: none;
}
.m-os-kit-options-wrap.scrollable .m-os-kit-options {
  padding-left: 30px;
  padding-right: 30px;
}
.m-os-kit-option {
  position: relative;
  flex: 0 0 72%;
  min-width: 0;
  padding: 9px 10px 9px 30px;
  border: 1px solid #dbe4f0;
  border-radius: 9px;
  background: #fff;
  text-align: left;
}
.m-os-kit-option.on {
  border-color: var(--mob-blue);
  background: #f4f8ff;
}
.m-os-kit-option .m-os-radio {
  position: absolute;
  left: 10px;
  top: 12px;
  width: 12px;
  height: 12px;
  border: 2px solid #a8b5c7;
  border-radius: 50%;
}
.m-os-kit-option.on .m-os-radio {
  border: 4px solid var(--mob-blue);
}
.m-os-kit-option strong {
  display: block;
  font-size: 11px;
}
.m-os-kit-option small {
  display: block;
  margin-top: 3px;
  color: #8190a6;
  font-size: 9px;
  line-height: 1.45;
}
.m-os-kit-option b {
  display: block;
  margin-top: 5px;
  color: #6f7e92;
  font-size: 10px;
  font-weight: 600;
}
.m-os-kit-tag {
  display: inline-block;
  margin-left: 4px;
  padding: 0 4px;
  border-radius: 3px;
  background: #eaf2ff;
  color: var(--mob-blue);
  font-size: 8px;
  font-style: normal;
  vertical-align: 1px;
}
.m-os-kit-nav {
  position: absolute;
  top: 50%;
  z-index: 2;
  width: 22px;
  height: 22px;
  margin-top: -11px;
  display: grid;
  place-items: center;
  border: 1px solid #dbe4f0;
  border-radius: 50%;
  background: #fff;
  color: #33465f;
  font-size: 13px;
  line-height: 1;
  box-shadow: 0 2px 6px rgba(23, 54, 95, 0.14);
}
.m-os-kit-nav.prev {
  left: 4px;
}
.m-os-kit-nav.next {
  right: 4px;
}
.m-os-kit-empty-tip {
  margin: 0;
  padding: 12px;
  border-top: 1px solid #edf1f5;
  color: #8190a6;
  font-size: 9px;
}
.m-os-kit-detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-top: 1px solid #edf1f5;
  border-bottom: 1px solid #edf1f5;
  background: #f7f9fc;
  color: #7d8b9f;
  font-size: 9px;
}
.m-os-kit-detail-head strong {
  color: #22364f;
  font-size: 9px;
}
/* 已手工调整部件：标题右侧转为红色，替代原来的破套弹窗提醒 */
.m-os-kit-detail-head strong.is-custom {
  color: #df422d;
}
.m-os-kit-list > div {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 9px 10px;
  border-top: 1px solid #edf1f5;
}
.m-os-kit-list img {
  width: 42px;
  height: 38px;
  object-fit: contain;
  border-radius: 5px;
  background: #f7f9fc;
}
.m-os-kit-empty-img {
  width: 42px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 5px;
  background: #f7f9fc;
  color: #9ca7b5;
}
.m-os-kit-empty {
  color: #98a4b4;
  font-weight: 400;
}
.m-os-kit-list small,
.m-os-kit-list strong,
.m-os-kit-list em {
  display: block;
}
.m-os-kit-list small {
  color: #8d99aa;
  font-size: 8px;
}
.m-os-kit-list strong {
  font-size: 11px;
}
.m-os-kit-list em {
  color: #718095;
  font-size: 8px;
  font-style: normal;
}
.m-os-kit-list button {
  border: 0;
  background: transparent;
  color: var(--mob-blue);
  font-size: 10px;
}
/* 套件明细行右侧：数量×单价=总价 + 编辑 */
.m-os-kit-row-side {
  display: flex;
  align-items: center;
  gap: 8px;
}
.m-os-kit-formula {
  color: #7d8b9f;
  font-size: 8px;
  font-style: normal;
  white-space: nowrap;
}
.m-os-auto {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 120px;
  justify-content: center;
  border: 1px dashed #8fc9a5;
  border-radius: 9px;
  background: #f3fbf6;
}
.m-os-auto > i {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #27a35a;
  color: #fff;
  font-style: normal;
}
.m-os-auto strong {
  font-size: 12px;
  color: #207545;
}
.m-os-auto p {
  margin: 4px 0 0;
  color: #778b7f;
  font-size: 9px;
}
/* 已跳过步骤：替换候选区 */
.m-os-skipped {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 96px;
  padding: 14px;
  border: 1px dashed var(--mob-line);
  border-radius: 9px;
  background: #f7f9fc;
}
.m-os-skipped > span {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #e6edf6;
  color: #6c7b91;
  font-size: 16px;
}
.m-os-skipped > div {
  flex: 1;
  min-width: 0;
}
.m-os-skipped strong {
  display: block;
  font-size: 12px;
  color: #33465f;
}
.m-os-skipped small {
  display: block;
  margin-top: 3px;
  color: #8190a6;
  font-size: 9px;
}
.m-os-skipped button {
  flex: 0 0 auto;
  padding: 5px 10px;
  border: 1px solid var(--mob-line);
  border-radius: 6px;
  background: #fff;
  color: var(--mob-blue);
  font-size: 10px;
}
/* 模块底部：跳过此项 */
.m-os-module-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 11px;
  padding-top: 9px;
  border-top: 1px dashed #e2e9f2;
}
.m-os-module-foot span {
  color: #98a5b5;
  font-size: 9px;
}
.m-os-module-foot button {
  flex: 0 0 auto;
  padding: 5px 10px;
  border: 1px solid var(--mob-line);
  border-radius: 6px;
  background: #fff;
  color: #6b7a8d;
  font-size: 10px;
}
.m-os-review {
  padding: 14px;
  margin-top: 12px;
  scroll-margin-top: 102px;
}
.m-os-review > header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 11px;
  border-bottom: 1px solid var(--mob-line);
}
.m-os-review > header small {
  color: var(--mob-blue);
  font-size: 9px;
}
.m-os-review > header h2 {
  margin: 2px 0 0;
  font-size: 17px;
}
.m-os-review-note {
  margin: 10px 0;
  color: #8794a5;
  font-size: 9px;
}
.m-os-review-group {
  margin-top: 12px;
}
.m-os-review-group > h3 {
  margin: 0 0 6px;
  font-size: 12px;
}
.m-os-review-group > h3 small {
  margin-left: 5px;
  color: #95a1b1;
  font-weight: 400;
}
.m-os-review-row {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 9px;
  align-items: center;
  min-height: 66px;
  padding: 8px;
  border: 1px solid var(--mob-line);
  border-bottom: 0;
}
.m-os-review-row:first-of-type {
  border-radius: 8px 8px 0 0;
}
.m-os-review-row:last-child {
  border-bottom: 1px solid var(--mob-line);
  border-radius: 0 0 8px 8px;
}
.m-os-review-row img,
.m-os-empty-img {
  width: 48px;
  height: 45px;
  object-fit: contain;
  display: grid;
  place-items: center;
  border-radius: 5px;
  background: #f7f9fc;
  color: #9ca7b5;
}
.m-os-review-row small,
.m-os-review-row strong,
.m-os-review-row em {
  display: block;
}
.m-os-review-row small {
  color: #8b98a9;
  font-size: 8px;
}
.m-os-review-row strong {
  margin: 2px 0;
  font-size: 10px;
}
/* 单价 × 数量 = 小计：五列定宽网格，跨行严格对齐 */
.m-os-review-buy {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 24px 94px 24px minmax(0, 1fr);
  align-items: center;
  margin-top: 7px;
}
/* 单价列：左对齐 */
.m-buy-price {
  justify-self: start;
  color: #6d7d92;
  font-size: 11px;
  white-space: nowrap;
}
/* × / = 符号列：在文字与步进器之间的空隙内水平 + 垂直居中 */
.m-buy-times,
.m-buy-eq {
  justify-self: center;
  align-self: center;
  display: grid;
  place-items: center;
  width: 24px;
  height: 30px;
  line-height: 1;
  color: #9aa7ba;
  font-size: 11px;
}
/* 数量步进器列：右对齐 */
.m-os-review-buy .m-os-review-qty {
  justify-self: end;
}
/* 小计列：右对齐 */
.m-buy-total {
  justify-self: end;
  color: #df422d;
  font-size: 13px;
  white-space: nowrap;
}
.m-buy-total.is-included {
  color: #2f9e63;
  font-size: 11px;
  font-weight: 700;
}
.m-buy-total.is-empty {
  color: #aab4c1;
  font-size: 11px;
  font-weight: 700;
}
/* 无商品行占位：隐藏单元格，但保留小计列的文字 */
.m-buy-blank {
  visibility: hidden;
}
.m-os-review-buy .m-os-review-qty.m-buy-blank {
  border: 0;
  box-shadow: none;
}
.m-os-review-qty {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  height: 30px;
  border: 1px solid #dbe3ee;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(16, 42, 84, 0.04);
}
.m-qty-btn {
  width: 28px;
  height: 100%;
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: #4a5d78;
}
.m-qty-btn svg {
  width: 13px;
  height: 13px;
}
.m-qty-btn:active:not(:disabled) {
  background: #eef4fe;
  color: var(--mob-blue);
}
.m-qty-btn:disabled {
  color: #c2cad6;
}
.m-qty-input {
  width: 38px;
  height: 100%;
  padding: 0;
  border: 0;
  border-left: 1px solid #eef2f7;
  border-right: 1px solid #eef2f7;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
  text-align: center;
  -moz-appearance: textfield;
}
.m-qty-input:focus {
  outline: none;
  background: #f8fbff;
}
.m-qty-input::-webkit-outer-spin-button,
.m-qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* 机柜升级电控仓：勾选项 */
.m-os-upgrade {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 12px;
  padding: 10px 11px;
  border: 1px dashed #c9d8ea;
  border-radius: 9px;
  background: #f8fbff;
  cursor: pointer;
  transition: 0.18s;
}
.m-os-upgrade.on {
  border-style: solid;
  border-color: var(--mob-blue);
  background: #eef6ff;
}
.m-os-upgrade input {
  flex: 0 0 auto;
  width: 15px;
  height: 15px;
  margin: 0;
  accent-color: var(--mob-blue);
}
.m-os-upgrade span {
  min-width: 0;
  flex: 1;
}
.m-os-upgrade strong,
.m-os-upgrade small {
  display: block;
}
.m-os-upgrade strong {
  font-size: 12px;
}
.m-os-upgrade small {
  margin-top: 3px;
  color: #8290a3;
  font-size: 9px;
  line-height: 1.45;
}
.m-os-upgrade em {
  flex: 0 0 auto;
  color: #df422d;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
}
.m-os-total .m-os-upgrade-note {
  color: #df422d;
  font-weight: 700;
}
.m-os-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  padding: 15px 16px;
  border-radius: 13px;
  border: 1px solid #e7edf6;
  background: linear-gradient(120deg, #f6f9fe, #f1f5fc);
}
.m-os-total-info {
  min-width: 0;
}
.m-os-total span,
.m-os-total small {
  display: block;
}
.m-os-total-info span {
  font-size: 12px;
  font-weight: 700;
  color: #1d2f4b;
}
.m-os-total-info small {
  margin-top: 3px;
  color: #8b98aa;
  font-size: 9px;
}
.m-os-total-price {
  flex: 0 0 auto;
  color: #df422d;
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.5px;
  white-space: nowrap;
}
.m-os-total-price i {
  margin-right: 1px;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
}
/* 三个操作按钮：加入购物车 / 生成报价单 / 立即购买 */
.m-os-actions3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1.15fr;
  gap: 9px;
  margin-top: 12px;
}
.m-os-actions3 .btn {
  height: 42px;
  padding: 0 4px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 600;
}
.m-os-actions3 .btn:not(.primary) {
  border-color: #d3deec;
  background: #fff;
  color: #3a506f;
}
.m-os-actions3 .btn.primary {
  box-shadow: 0 5px 13px rgba(21, 84, 199, 0.22);
}
.m-os-actions3 .btn:disabled {
  opacity: 0.5;
  box-shadow: none;
}
.m-os-cart-fab {
  position: fixed;
  right: 12px;
  bottom: 72px;
  z-index: 950;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 13px 7px 8px;
  border: 0;
  border-radius: 26px;
  background: #fff;
  box-shadow: 0 10px 26px rgba(16, 44, 82, 0.22);
  color: #19253a;
}
.m-os-cart-fab .fab-cart {
  position: relative;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(140deg, #2a83ea, var(--mob-blue));
  color: #fff;
}
.m-os-cart-fab .fab-cart svg {
  width: 21px;
  height: 21px;
}
.m-os-cart-fab .fab-cart b {
  position: absolute;
  right: -3px;
  top: -3px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  display: grid;
  place-items: center;
  border: 1.5px solid #fff;
  border-radius: 9px;
  background: #e5422c;
  color: #fff;
  font-size: 9px;
  line-height: 1;
}
.m-os-cart-fab .fab-price small,
.m-os-cart-fab .fab-price strong {
  display: block;
  text-align: left;
}
.m-os-cart-fab .fab-price small {
  color: #8794a6;
  font-size: 8px;
}
.m-os-cart-fab .fab-price strong {
  margin-top: 1px;
  color: #df422d;
  font-size: 15px;
}
.m-os-cart-fab em {
  padding-left: 9px;
  border-left: 1px solid #e8edf4;
  color: var(--mob-blue);
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
}
.m-os-mask {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: flex-end;
  background: rgba(12, 29, 52, 0.58);
}
.m-os-picker {
  width: 100%;
  max-height: 82vh;
  overflow: auto;
  border-radius: 17px 17px 0 0;
  background: #fff;
  padding-bottom: max(14px, env(safe-area-inset-bottom));
}
.m-os-picker > header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* 标题整体下移，与关闭按钮错开 */
  padding: 22px 14px 14px;
  border-bottom: 1px solid var(--mob-line);
  background: #fff;
}
.m-os-picker header h2 {
  flex: 0 0 auto;
  margin: 0;
  font-size: 17px;
}
/* 标题行右侧搜索框 */
.m-os-headsearch {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  min-width: 0;
  margin: 0 8px;
}
.m-os-headsearch svg {
  position: absolute;
  left: 9px;
  width: 13px;
  height: 13px;
  fill: none;
  stroke: #93a1b4;
  stroke-width: 1.8;
  stroke-linecap: round;
  pointer-events: none;
}
.m-os-headsearch input {
  width: 100%;
  height: 32px;
  padding: 0 10px 0 28px;
  border: 1px solid var(--mob-line);
  border-radius: 8px;
  background: #f7fafd;
  color: #25354c;
  font-size: 12px;
}
.m-os-headsearch input::placeholder {
  color: #9aa7b9;
}
.m-os-headsearch input::-webkit-search-cancel-button {
  display: none;
}
.m-os-headsearch input:focus {
  outline: none;
  border-color: var(--mob-blue);
  background: #fff;
  box-shadow: 0 0 0 2px rgba(23, 104, 213, 0.1);
}
.m-os-picker header > button {
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  color: #6f7e91;
  font-size: 25px;
}
.m-os-picker-empty {
  margin: 0;
  padding: 26px 14px;
  text-align: center;
  color: var(--mob-muted, #8a97a7);
  font-size: 12px;
}
.m-os-picker-tabs {
  display: flex;
  gap: 6px;
  padding: 0 12px 10px;
  overflow-x: auto;
  scrollbar-width: none;
}
.m-os-picker-tabs::-webkit-scrollbar {
  display: none;
}
.m-os-picker-tabs button {
  flex: 0 0 auto;
  padding: 5px 10px;
  border: 1px solid var(--mob-line);
  border-radius: 13px;
  background: #fff;
  color: #68778c;
  font-size: 9px;
}
.m-os-picker-tabs button.on {
  border-color: var(--mob-blue);
  background: #eaf3ff;
  color: var(--mob-blue);
  font-weight: 700;
}
/* 改动后的计价口径提示 */
.m-os-picker-warn {
  margin: 11px 12px;
  padding: 8px 9px;
  border: 1px solid #efc2b5;
  border-radius: 7px;
  background: #fff4f0;
  color: #9f3e29;
  font-size: 9px;
  line-height: 1.5;
}
.m-os-picker-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 0 12px 12px;
}
.m-os-picker-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border: 1px solid var(--mob-line);
  border-radius: 8px;
  background: #fff;
}
.m-os-picker-item.on {
  border: 2px solid var(--mob-blue);
  padding: 7px;
  background: #f4f8ff;
}
.m-os-picker-main {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr);
  gap: 9px;
  align-items: center;
  min-width: 0;
}
.m-os-picker-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.m-os-picker-actions button {
  padding: 4px 9px;
  border: 1px solid var(--mob-line);
  border-radius: 5px;
  background: #fff;
  color: #5c6b80;
  font-size: 9px;
}
.m-os-picker-actions .pick {
  border-color: rgba(23, 104, 213, 0.3);
  background: #f4f8ff;
  color: var(--mob-blue);
  font-weight: 700;
}
.m-os-picker-list img {
  width: 62px;
  height: 55px;
  object-fit: contain;
  border-radius: 5px;
  background: #f7f9fc;
}
.m-os-picker-list strong,
.m-os-picker-list small,
.m-os-picker-list em {
  display: block;
}
.m-os-picker-list strong {
  font-size: 11px;
}
.m-os-picker-list small {
  margin: 3px 0;
  color: #8290a3;
  font-size: 8px;
}
.m-os-picker-list em {
  color: #df422d;
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
}
/* 商品详情：底部抽屉，贴底弹出 */
.m-os-detail {
  position: relative;
  align-self: flex-end;
  width: 100%;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 17px 17px 0 0;
  background: var(--bg, #f5f7fa);
  animation: m-os-detail-up 0.26s ease;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
}
@keyframes m-os-detail-up {
  from {
    transform: translateY(60px);
    opacity: 0.3;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
/* 顶部抓手 */
.m-os-detail-grip {
  flex: 0 0 auto;
  width: 38px;
  height: 4px;
  margin: 9px auto 2px;
  border-radius: 3px;
  background: #d4dce6;
}
.m-os-detail > header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  background: #fff;
}
.m-os-detail > header h2 {
  margin: 0;
  font-size: 16px;
}
.m-os-detail > header button {
  border: 0;
  background: transparent;
  color: #6f7e91;
  font-size: 26px;
  line-height: 1;
}
.m-os-detail-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 12px 13px;
}
/* 主图：摄影棚底 */
.m-os-detail-img {
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: radial-gradient(
    125% 95% at 50% 6%,
    #ffffff 0%,
    #eef4fb 56%,
    #e1eaf5 100%
  );
  box-shadow: inset 0 0 0 1px #e7eef7;
}
.m-os-detail-img img {
  max-width: 82%;
  max-height: 82%;
  filter: drop-shadow(0 9px 10px rgba(20, 42, 74, 0.2));
}
/* 关键参数两列 */
.m-os-detail-specs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  margin: 11px 0 0;
}
.m-os-detail-specs > div {
  padding: 9px 10px;
  border: 1px solid #e8eef5;
  border-radius: 9px;
  background: #fff;
}
.m-os-detail-specs dt {
  color: #9aa7b7;
  font-size: 9px;
}
.m-os-detail-specs dd {
  margin: 3px 0 0;
  overflow: hidden;
  color: #22364f;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}
/* 价格面板 */
.m-os-detail-price {
  margin-top: 11px;
  padding: 12px 13px;
  border: 1px solid #e4ecf8;
  border-radius: 11px;
  background: linear-gradient(180deg, #f8faff, #f1f6fd);
}
.m-os-detail-price p {
  margin: 0;
  color: #6b7a8d;
  font-size: 10px;
}
.m-os-detail-price strong {
  display: block;
  margin: 2px 0 3px;
  color: #e02e2e;
  font-size: 23px;
  font-weight: 700;
}
.m-os-detail-price span {
  color: #8a97a8;
  font-size: 10px;
}
/* 四段内容间距 */
.m-os-detail-body .product-content {
  margin-top: 14px;
}
.m-os-detail-body .product-content .card {
  padding: 14px;
}
.m-os-detail > footer {
  flex: 0 0 auto;
  display: flex;
  gap: 9px;
  padding: 10px 13px 0;
}
.m-os-detail > footer .btn {
  flex: 1;
  height: 42px;
}
.m-os-detail > footer .btn.primary {
  flex: 1.5;
  box-shadow: 0 5px 13px rgba(21, 84, 199, 0.24);
}
</style>
