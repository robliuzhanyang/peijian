<!--
  页面：一站式选购（PC）
  路由：/diy；/package 保留为兼容入口并转入本页
  结构：方案形态 -> 8 步选配 -> 全量配置核对 -> 报价确认
-->
<template>
  <div class="one-stop pc-one-stop">
    <div v-if="loading" class="card os-loading">正在加载一站式选配数据…</div>

    <template v-else>
      <section class="card os-orientations">
        <div class="os-section-head">
          <div>
            <small>先选整机形态</small>
            <h2>选择方案</h2>
          </div>
        </div>
        <div class="os-orientation-grid">
          <button
            v-for="item in orientations"
            :key="item.id"
            class="os-orientation-card"
            :class="{ on: item.id === orientationId }"
            @click="selectOrientation(item.id)"
          >
            <span class="os-radio"></span>
            <div>
              <strong>{{ item.name }}</strong>
              <small>{{ item.desc }}</small>
            </div>
            <em v-if="item.recommended">推荐</em>
          </button>
        </div>
      </section>

      <div class="os-workspace">
        <aside class="card os-step-nav">
          <div class="os-progress-copy">
            <span>配置进度</span><strong>{{ completionCount }}/8</strong>
          </div>
          <div class="os-progress">
            <i :style="{ width: (completionCount / 8) * 100 + '%' }"></i>
          </div>
          <button
            v-for="(step, index) in steps"
            :key="step.key"
            :class="{ on: activeStep === index, done: stepDone(step.key) }"
            @click="goStep(index)"
          >
            <i>{{ index + 1 }}</i>
            <span
              ><strong>{{ step.name }}</strong
              ><small>{{
                skippedSteps[step.key]
                  ? "已跳过"
                  : stepDone(step.key)
                  ? "已完成"
                  : step.required
                  ? "待选择"
                  : "可跳过"
              }}</small></span
            >
          </button>
        </aside>

        <main class="card os-selector">
          <div class="os-selector-head">
            <div>
              <span>STEP {{ String(activeStep + 1).padStart(2, "0") }}</span>
              <h2>{{ currentStep.name }}</h2>
            </div>
          </div>
          <p class="os-fit-note"><b>适配提示</b>{{ currentHint }}</p>

          <!-- 已跳过的步骤：不再展示候选商品，避免与「已跳过」状态矛盾 -->
          <div v-if="skippedSteps[currentStep.key]" class="os-step-skipped">
            <span>✓</span>
            <div>
              <h3>已跳过「{{ currentStep.name }}」</h3>
              <p>该项不计入方案与报价，可点击右侧按钮恢复选择。</p>
            </div>
            <button
              class="btn sm"
              type="button"
              @click="resumeStep(currentStep.key)"
            >
              重新选择
            </button>
          </div>

          <section
            v-if="currentStep.key === 'kit' && !skippedSteps[currentStep.key]"
            class="os-kit-card"
          >
            <div class="os-kit-title">
              <div>
                <span>按当前机柜带出</span>
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
              class="os-kit-options-wrap"
              :class="{ scrollable: kitScroll.overflowing }"
            >
              <button
                v-if="kitScroll.overflowing && kitScroll.left"
                type="button"
                class="os-kit-nav prev"
                aria-label="上一组套件"
                @click="scrollKitOptions(-1)"
              >
                ‹
              </button>
              <div
                ref="kitOptions"
                class="os-kit-options"
                @scroll="onKitScroll"
              >
                <button
                  v-for="option in kitVariants"
                  :key="option.id"
                  type="button"
                  class="os-kit-option"
                  :class="{ on: option.id === activeKitOptionId }"
                  @click="chooseKitOption(option)"
                >
                  <span class="os-radio"></span>
                  <div>
                    <strong>
                      {{ option.name }}
                      <em v-if="option.recommended" class="os-kit-tag">推荐</em>
                    </strong>
                    <small>{{ option.desc }}</small>
                  </div>
                  <em class="os-kit-price">{{ kitOptionPrice(option) }}</em>
                </button>
              </div>
              <button
                v-if="kitScroll.overflowing && kitScroll.right"
                type="button"
                class="os-kit-nav next"
                aria-label="下一组套件"
                @click="scrollKitOptions(1)"
              >
                ›
              </button>
            </div>
            <p v-else class="os-kit-empty-tip">
              请先选择机柜，以带出可选套件。
            </p>

            <!-- 选中套件的具体部件，默认展开 -->
            <div v-if="kitVariants.length" class="os-kit-detail">
              <div class="os-kit-detail-head">
                <span>套件明细</span>
                <!-- 手工改过 5 件中的任意一件后转为红色，提示已偏离该套件标准配置 -->
                <strong :class="{ 'is-custom': kitDeviated }">{{
                  kitLabel
                }}</strong>
              </div>
              <div class="os-kit-list">
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
                    <span class="os-kit-empty-img">—</span>
                    <span
                      ><small>{{ row.label }}</small
                      ><strong class="os-kit-empty"
                        >未选择（可选）</strong
                      ></span
                    >
                  </template>
                  <span class="os-kit-row-side">
                    <!-- 套件部件数量固定 1，只显示该件价格 -->
                    <em class="os-kit-formula">{{ row.priceText }}</em>
                    <button
                      v-if="row.product"
                      class="os-link"
                      type="button"
                      @click="openProductDetail(row.product, 'review', row)"
                    >
                      详情
                    </button>
                    <button class="os-link" @click="openEditor(row)">
                      编辑
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div
            v-else-if="
              currentStep.key === 'fieldLens' &&
              videoGalvo &&
              !skippedSteps[currentStep.key]
            "
            class="os-auto-complete"
          >
            <span>✓</span>
            <div>
              <h3>场镜已随视频振镜配套</h3>
              <p>无需再次选择，系统已自动完成本步骤。</p>
            </div>
          </div>

          <div
            v-else-if="!skippedSteps[currentStep.key]"
            class="os-candidate-grid"
          >
            <div
              v-for="item in currentCandidates"
              :key="item.id"
              class="os-candidate"
              :class="{ on: isSelectedCandidate(item) }"
            >
              <!-- 主区域点击即选择 -->
              <span v-if="isSelectedCandidate(item)" class="os-selected-mark"
                >✓</span
              >
              <span class="os-candidate-pick" @click="chooseCandidate(item)">
                <img :src="asset(item.image)" :alt="item.name" />
                <span class="os-candidate-body">
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.model }} · {{ item.desc }}</small>
                  <em>{{ priceText(item.priceFen) }}</em>
                </span>
              </span>
              <!-- 底部操作：选择 + 查阅商品详情 -->
              <span class="os-candidate-foot">
                <button
                  type="button"
                  class="os-candidate-detail"
                  @click="openProductDetail(item, 'step')"
                >
                  查阅商品详情
                </button>
                <button
                  v-if="currentStep.key === 'extensions'"
                  type="button"
                  class="os-candidate-check"
                  @click="chooseCandidate(item)"
                >
                  {{ isSelectedCandidate(item) ? "已选 · 取消" : "选择" }}
                </button>
                <button
                  v-else
                  type="button"
                  class="os-candidate-check"
                  @click="chooseCandidate(item)"
                >
                  {{ isSelectedCandidate(item) ? "已选 · 取消" : "选择此项" }}
                </button>
              </span>
            </div>
          </div>

          <div class="os-selector-actions">
            <button
              class="btn"
              :disabled="activeStep === 0"
              @click="previousStep"
            >
              上一步
            </button>
            <span>可随时点击左侧步骤返回修改</span>
            <div class="os-actions-right">
              <!-- 跳过按钮放在主操作旁：跳过当前步骤并从方案中剔除 -->
              <button
                v-if="currentStep.skippable && !skippedSteps[currentStep.key]"
                class="btn soft"
                @click="skipStep(currentStep.key)"
              >
                跳过此项
              </button>
              <button class="btn primary" @click="nextStep">
                {{ activeStep === 7 ? "完成并核对" : "下一步" }}
              </button>
            </div>
          </div>
        </main>
      </div>

      <section id="one-stop-review" class="card os-review">
        <div class="os-review-head">
          <div>
            <span>完整选购结果</span>
            <h2>{{ orientation.name }}配置清单</h2>
            <p>以下为当前已选配置，如需更换请在上方对应步骤中修改。</p>
          </div>
        </div>
        <div
          v-for="group in groupedFinalRows"
          :key="group.name"
          class="os-review-group"
        >
          <h3>
            {{ group.name }}<small>{{ group.rows.length }} 项</small>
          </h3>
          <div class="os-review-table">
            <div v-for="row in group.rows" :key="row.key" class="os-review-row">
              <span class="os-review-type">{{ row.label }}</span>
              <img
                v-if="row.product"
                :src="asset(row.product.image)"
                :alt="row.product.name"
              />
              <span v-else class="os-review-placeholder">—</span>
              <span class="os-review-name">
                <strong>{{
                  row.product ? row.product.name : row.includedText
                }}</strong>
                <small v-if="row.product"
                  >{{ row.product.model }} · 类型限定为“{{ row.label }}”</small
                >
              </span>
              <!-- 右侧：单价（左对齐） × 数量（右对齐） = 小计（右对齐），三列定宽保证跨行对齐 -->
              <span class="os-review-buy">
                <template v-if="row.product">
                  <span class="os-buy-price">
                    {{ priceText(row.product.priceFen) }}
                  </span>
                  <span class="os-buy-times">×</span>
                  <span class="os-review-qty">
                    <button
                      type="button"
                      class="os-qty-btn"
                      aria-label="减少数量"
                      @click="stepRowQty(row, -1)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      >
                        <path d="M5 12h14" />
                      </svg>
                    </button>
                    <input
                      class="os-qty-input"
                      :value="rowQtyOf(row.key)"
                      type="number"
                      min="1"
                      max="99"
                      @change="setRowQty(row, $event.target.value)"
                    />
                    <button
                      type="button"
                      class="os-qty-btn"
                      aria-label="增加数量"
                      :disabled="rowQtyOf(row.key) >= 99"
                      @click="stepRowQty(row, 1)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </span>
                  <span class="os-buy-eq">=</span>
                  <strong class="os-buy-total">
                    {{ priceText(rowTotalFenOf(row)) }}
                  </strong>
                </template>
                <template v-else>
                  <span class="os-buy-price os-buy-blank"></span>
                  <span class="os-buy-times os-buy-blank"></span>
                  <span class="os-review-qty os-buy-blank"></span>
                  <span class="os-buy-eq os-buy-blank"></span>
                  <strong
                    class="os-buy-total"
                    :class="row.includedPrice ? 'is-included' : 'is-empty'"
                  >
                    {{ row.includedPrice ? "已包含" : "—" }}
                  </strong>
                </template>
              </span>
            </div>
          </div>
        </div>
        <!-- 电控仓升级：仅在已选机柜时展示 -->
        <label
          v-if="selection.cabinetId"
          class="os-upgrade"
          :class="{ on: cabinetUpgrade }"
        >
          <input v-model="cabinetUpgrade" type="checkbox" />
          <span>
            <strong>将机柜升级为电控仓</strong>
            <small
              >升级后含电气控制与整机走线，方案总价增加
              {{ money(cabinetUpgradeFee) }}</small
            >
          </span>
          <em>+ {{ money(cabinetUpgradeFee) }}</em>
        </label>
        <div class="os-review-total">
          <div class="os-total-info">
            <span>{{
              priceMode === "bundle" ? "套餐参考价" : "一站式组合价"
            }}</span>
            <small v-if="priceMode === 'bundle'"
              >保持默认套内配置可享套餐价</small
            >
            <small v-else>仍属一站式选购，当前金额为所选商城商品正价之和</small>
            <small v-if="cabinetUpgrade" class="os-upgrade-note"
              >已含机柜升级电控仓 +{{ money(cabinetUpgradeFee) }}</small
            >
          </div>
          <button
            v-if="!canSeePrice"
            class="btn primary os-total-login"
            @click="loginForPrice"
          >
            登录查看价格
          </button>
          <!-- 已登录：价格区 + 分隔线 + 三按钮 -->
          <div v-else class="os-total-right">
            <div class="os-total-price">
              <span class="os-total-label">合计</span>
              <strong>
                <i>¥</i
                >{{ priceText(totalPrice).replace("¥", "").replace("￥", "") }}
              </strong>
            </div>
            <span class="os-total-divider"></span>
            <div class="os-review-actions3">
              <button class="btn os-btn-cart" @click="confirmAddCart">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="9" cy="20" r="1.4" />
                  <circle cx="18" cy="20" r="1.4" />
                  <path
                    d="M2.5 3h2l2.2 12.4a1.5 1.5 0 0 0 1.5 1.2h8.9a1.5 1.5 0 0 0 1.5-1.2L21 7H6"
                  />
                </svg>
                加入购物车
              </button>
              <button class="btn os-btn-quote" @click="confirmQuote">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"
                  />
                  <path d="M14 3v5h5" />
                  <path d="M9 13h6M9 17h4" />
                </svg>
                生成报价单
              </button>
              <button class="btn primary os-btn-buy" @click="confirmBuyNow">
                立即购买
              </button>
            </div>
          </div>
        </div>
      </section>

      <div
        v-if="picker.visible"
        class="os-modal-mask"
        @click.self="closePicker"
      >
        <section class="os-picker-modal" role="dialog" aria-modal="true">
          <header>
            <div>
              <h2>{{ picker.title }}</h2>
            </div>
            <!-- 搜索框移到右上角：标题与关闭按钮之间 -->
            <div class="os-picker-headsearch">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.6" />
                <path d="M16 16l4.6 4.6" />
              </svg>
              <input
                v-model="picker.keyword"
                type="search"
                placeholder="搜索名称 / 型号 / SKU / 描述"
              />
              <button
                v-if="picker.keyword"
                type="button"
                @click="clearPickerKeyword"
              >
                清空
              </button>
              <span v-else>共 {{ pickerItems.length }} 件</span>
            </div>
            <button @click="closePicker">×</button>
          </header>
          <div class="os-picker-body">
            <!-- 改动套件/部件后的计价口径提示（原套件明细底部提示移到此处） -->
            <div class="os-picker-alert">
              变更后，将不会享受配件套餐价格，将按照实际价格计算。
            </div>
            <div v-if="picker.tabs.length" class="os-picker-tabs">
              <button
                v-for="tab in picker.tabs"
                :key="tab.slot"
                :class="{ on: picker.slot === tab.slot }"
                @click="switchPickerSlot(tab.slot)"
              >
                {{ tab.label }}
              </button>
            </div>
            <div v-if="pickerItems.length" class="os-picker-grid">
              <div
                v-for="item in pickerItems"
                :key="item.id"
                class="os-picker-card"
                :class="{
                  on: pickerSelected(item),
                  off: item.compatible === false,
                }"
              >
                <!-- 点击图片或信息区查看商品详情，右下角按钮才是选入 -->
                <img
                  :src="asset(item.image)"
                  :alt="item.name"
                  @click="openProductDetail(item)"
                />
                <span class="os-picker-info" @click="openProductDetail(item)">
                  <strong>{{ item.name }}</strong>
                  <small class="os-picker-meta"
                    >{{ item.model }} · {{ item.skuCode }}</small
                  >
                  <small class="os-picker-desc">{{ item.desc }}</small>
                  <span class="os-picker-tags">
                    <em
                      v-if="item.orientationName"
                      :class="{ cross: item.crossOrientation }"
                      >{{ item.orientationName }}</em
                    >
                    <em v-if="item.compatible === false" class="warn"
                      >与当前配置不适配</em
                    >
                    <em v-else-if="item.cartQuantity" class="ok"
                      >购物车 ×{{ item.cartQuantity }}</em
                    >
                  </span>
                </span>
                <span class="os-picker-buy">
                  <i>{{ priceText(item.priceFen) }}</i>
                  <span class="os-picker-actions">
                    <button
                      type="button"
                      class="os-picker-ghost"
                      @click="openProductDetail(item)"
                    >
                      详情
                    </button>
                    <button
                      type="button"
                      class="os-picker-cta"
                      :disabled="item.compatible === false"
                      @click="choosePickerItem(item)"
                    >
                      {{ pickerCta(item) }}
                    </button>
                  </span>
                </span>
              </div>
            </div>
            <p v-else class="os-picker-empty">
              {{
                picker.keyword
                  ? "没有找到与“" +
                    picker.keyword +
                    "”相关的商品，换个关键字试试。"
                  : "暂无可选商品，请先完成上一步配置。"
              }}
            </p>
          </div>
        </section>
      </div>

      <!-- 商品详情：右侧抽屉，内容与 /detail 同口径，可直接选入本步骤 -->
      <ProductDrawer
        v-if="detailProduct"
        :product="detailProduct"
        :compatible="detailCompatible"
        :cta-text="detailCtaText"
        @close="detailProduct = null"
        @confirm="chooseDetailProduct"
      />
    </template>
  </div>
</template>

<script>
import oneStopMixin from "@/modules/selection/domain/oneStopMixin";
// 商品详情右侧抽屉
import ProductDrawer from "@/modules/selection/components/ProductDrawer.vue";

export default {
  name: "OneStopPcPage",
  components: { ProductDrawer },
  mixins: [oneStopMixin],
  data() {
    return {
      // 机柜升级为电控仓（可选），勾选后方案总价叠加差价
      cabinetUpgrade: false,
      // 套件卡片横向滚动的可用状态：用于在套件过多时显示左右翻页按钮
      kitScroll: { overflowing: false, left: false, right: false },
      // 选配抽屉里点开的商品详情（null 表示未打开）
      detailProduct: null,
      // 详情来源：picker 商城/购物车弹窗 | review 套件明细 | step 步骤候选卡
      detailSource: "picker",
    };
  },
  mounted() {
    this.measureKitScroll();
    window.addEventListener("resize", this.measureKitScroll);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.measureKitScroll);
  },
  watch: {
    // 切换步骤或套件数量变化后重新测量是否溢出
    activeStep() {
      this.$nextTick(this.measureKitScroll);
    },
    kitVariants() {
      this.$nextTick(this.measureKitScroll);
    },
    // 取消机柜后不再具备升级电控仓的条件，勾选状态一并清除
    "selection.cabinetId"(val) {
      if (!val) this.cabinetUpgrade = false;
    },
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
  },
  methods: {
    // 测量套件卡片是否横向溢出，并同步左右翻页按钮的可用状态
    measureKitScroll() {
      const el = this.$refs.kitOptions;
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
      const el = this.$refs.kitOptions;
      if (!el) return;
      el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: "smooth" });
    },
    // 打开商品详情抽屉：source 标记选入时走哪条逻辑
    openProductDetail(item, source = "picker", ctx = null) {
      this.detailProduct = item;
      this.detailSource = source;
      // 商城/购物车弹窗里查看：弹窗保持在下层，抽屉叠在其上方（见 ProductDrawer z-index）
      // 套件明细行查看：预置该部件的 picker 上下文（不弹窗），
      // 使抽屉里「选择」仍走 choosePickerItem 的破套计价逻辑
      if (source === "review" && ctx) {
        this.picker = {
          visible: false,
          slot: ctx.slot,
          title: "从配件商城更换" + ctx.label,
          candidates: this.pickerCandidates(ctx.slot),
          source: "review",
          mode: "mall",
          tabs: [],
          keyword: "",
        };
      }
    },
    // 从详情抽屉选入：picker/review 走商城更换逻辑，step 走步骤候选选择
    chooseDetailProduct() {
      const item = this.detailProduct;
      const source = this.detailSource;
      this.detailProduct = null;
      if (!item) return;
      if (source === "step") {
        this.chooseCandidate(item);
      } else {
        this.choosePickerItem(item);
      }
    },
  },
  computed: {
    // 详情抽屉的适配状态：picker 候选带 compatible 标记；其余来源默认适配
    detailCompatible() {
      if (!this.detailProduct) return null;
      if (this.detailSource === "picker")
        return this.detailProduct.compatible !== false;
      return null;
    },
    // 详情抽屉底部主按钮文案，与各入口保持一致
    detailCtaText() {
      if (!this.detailProduct) return "选入本步骤";
      if (this.detailSource === "step")
        return this.isSelectedCandidate(this.detailProduct)
          ? "取消选择"
          : "选择此项";
      return this.pickerCta(this.detailProduct);
    },
  },
};
</script>

<style>
.pc-one-stop {
  --os-blue: #1768d5;
  --os-pale: #f3f7fc;
  --os-line: #dfe7f1;
  color: #172033;
  padding-bottom: 28px;
}
.os-loading {
  padding: 40px;
  text-align: center;
  color: #6c7b91;
}
.os-orientations {
  padding: 20px 24px;
  margin-bottom: 14px;
}
.os-section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 15px;
}
.os-section-head small {
  color: var(--os-blue);
  font-weight: 700;
}
.os-section-head h2 {
  margin: 2px 0 0;
  font-size: 20px;
}
.os-section-head > span {
  color: #8190a6;
  font-size: 12px;
}
.os-orientation-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.os-orientation-card {
  position: relative;
  min-height: 88px;
  padding: 18px 18px 18px 46px;
  text-align: left;
  border: 1px solid var(--os-line);
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: 0.18s;
}
.os-orientation-card:hover {
  border-color: #8db9f3;
  transform: translateY(-1px);
}
.os-orientation-card.on {
  border: 2px solid var(--os-blue);
  padding: 17px 17px 17px 45px;
  background: #f2f7ff;
  box-shadow: 0 6px 18px rgba(23, 104, 213, 0.12);
}
.os-orientation-card .os-radio {
  position: absolute;
  left: 18px;
  top: 24px;
  width: 16px;
  height: 16px;
  border: 2px solid #a8b5c7;
  border-radius: 50%;
}
.os-orientation-card.on .os-radio {
  border: 5px solid var(--os-blue);
}
.os-orientation-card strong,
.os-orientation-card small {
  display: block;
}
.os-orientation-card strong {
  font-size: 17px;
  color: #1d2f4b;
}
.os-orientation-card small {
  margin-top: 5px;
  color: #75849a;
}
.os-orientation-card em {
  position: absolute;
  right: 12px;
  top: 10px;
  padding: 2px 7px;
  border-radius: 10px;
  background: #e7f7ed;
  color: #21854e;
  font-size: 11px;
  font-style: normal;
}
.os-workspace {
  display: grid;
  grid-template-columns: 176px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}
.os-step-nav {
  position: sticky;
  top: 12px;
  padding: 15px;
}
.os-progress-copy {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.os-progress-copy span {
  color: #7b899d;
  font-size: 12px;
}
.os-progress-copy strong {
  color: var(--os-blue);
}
.os-progress {
  height: 5px;
  margin: 8px 0 15px;
  border-radius: 4px;
  background: #e8edf4;
  overflow: hidden;
}
.os-progress i {
  display: block;
  height: 100%;
  background: var(--os-blue);
}
.os-step-nav > button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.os-step-nav > button.on {
  background: #edf5ff;
  color: var(--os-blue);
}
.os-step-nav > button > i {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  display: grid;
  place-items: center;
  border: 1px solid #c6d1df;
  border-radius: 7px;
  font-style: normal;
  font-size: 11px;
}
.os-step-nav > button.done > i {
  background: #e4f1ff;
  border-color: #8ab7ef;
  color: var(--os-blue);
}
.os-step-nav strong,
.os-step-nav small {
  display: block;
}
.os-step-nav strong {
  font-size: 13px;
}
.os-step-nav small {
  margin-top: 2px;
  color: #93a0b0;
  font-size: 10px;
}
.os-selector {
  min-height: 500px;
  padding: 22px;
}
.os-selector-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.os-selector-head span {
  color: var(--os-blue);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
}
.os-selector-head h2 {
  margin: 2px 0 0;
  font-size: 23px;
}
.os-fit-note {
  margin: 16px 0;
  padding: 11px 13px;
  border: 1px solid #d7e8fd;
  border-radius: 8px;
  background: #f1f7ff;
  color: #5e7391;
  font-size: 12px;
}
.os-fit-note b {
  color: var(--os-blue);
  margin-right: 8px;
}
.os-candidate-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.os-candidate {
  position: relative;
  min-height: 184px;
  padding: 14px;
  border: 1px solid var(--os-line);
  border-radius: 12px;
  background: #fff;
  text-align: left;
  overflow: hidden;
}
.os-candidate:hover {
  border-color: #8eb9ef;
}
.os-candidate.on {
  border: 2px solid var(--os-blue);
  padding: 13px;
  background: #f6f9ff;
}
/* 可点击主区域 */
.os-candidate-pick {
  display: block;
  cursor: pointer;
}
.os-candidate img {
  width: 100%;
  height: 82px;
  object-fit: contain;
  border-radius: 8px;
  background: #f7f9fc;
}
.os-candidate-body {
  display: block;
  padding-top: 10px;
}
.os-candidate-body strong,
.os-candidate-body small,
.os-candidate-body em {
  display: block;
}
.os-candidate-body strong {
  font-size: 14px;
}
.os-candidate-body small {
  min-height: 32px;
  margin: 4px 0;
  color: #7d8b9e;
  font-size: 11px;
  line-height: 1.45;
}
.os-candidate-body em {
  color: #e2442d;
  font-style: normal;
  font-size: 18px;
  font-weight: 700;
}
/* 卡片底部操作行：查阅商品详情 + 选择 */
.os-candidate-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}
.os-candidate-detail,
.os-candidate-check {
  border: 1px solid var(--os-line);
  border-radius: 7px;
  background: #fff;
  font-size: 12px;
  cursor: pointer;
}
.os-candidate-detail {
  padding: 6px 12px;
  color: var(--os-blue);
  border-color: #bcd3f3;
  background: #f2f7ff;
}
.os-candidate-detail:hover {
  background: #e4eeff;
}
.os-candidate-check {
  margin-left: auto;
  padding: 6px 14px;
  color: #617086;
}
.os-candidate-check:hover {
  border-color: var(--os-blue);
  color: var(--os-blue);
}
.os-candidate.on .os-candidate-check {
  background: #e1f5e8;
  border-color: #bfe6cd;
  color: #17834a;
}
.os-selected-mark {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 2;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--os-blue);
  color: #fff;
}
.os-kit-card {
  border: 1px solid #dce6f2;
  border-radius: 12px;
  overflow: hidden;
}
.os-kit-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px;
  background: linear-gradient(120deg, #f0f6ff, #fff);
}
.os-kit-title span {
  color: var(--os-blue);
  font-size: 11px;
  font-weight: 700;
}
.os-kit-title h3 {
  margin: 3px 0 4px;
  font-size: 18px;
}
.os-kit-title p {
  margin: 0;
  color: #7d8b9f;
  font-size: 12px;
}
.os-kit-list > div {
  display: grid;
  grid-template-columns: 46px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 11px 15px;
  border-top: 1px solid #edf1f6;
}
/* 套件选项：一行 4 个，单选高亮；套件过多时横向滚动并出现左右翻页 */
.os-kit-options-wrap {
  position: relative;
  border-top: 1px solid #edf1f6;
  background: #fbfcfe;
}
.os-kit-options {
  display: flex;
  gap: 10px;
  padding: 14px 18px;
  overflow-x: auto;
  scrollbar-width: none;
}
.os-kit-options::-webkit-scrollbar {
  display: none;
}
.os-kit-options-wrap.scrollable .os-kit-options {
  padding-left: 40px;
  padding-right: 40px;
}
.os-kit-option {
  flex: 0 0 calc((100% - 30px) / 4);
  min-width: 0;
  display: grid;
  grid-template-columns: 16px 1fr;
  gap: 8px;
  align-items: start;
  padding: 12px;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.os-kit-option .os-kit-price {
  grid-column: 2;
  color: #6f7e92;
  font-size: 12px;
  font-style: normal;
}
.os-kit-option strong {
  display: block;
  font-size: 13px;
}
.os-kit-tag {
  display: inline-block;
  margin-left: 5px;
  padding: 1px 5px;
  border-radius: 4px;
  background: #eaf2ff;
  color: var(--os-blue);
  font-size: 10px;
  font-style: normal;
  font-weight: 600;
  vertical-align: 1px;
}
.os-kit-option small {
  display: block;
  margin-top: 3px;
  color: #8190a6;
  font-size: 11px;
  line-height: 1.5;
}
.os-kit-option .os-radio {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  border: 2px solid #a8b5c7;
  border-radius: 50%;
}
.os-kit-option.on .os-radio {
  border: 5px solid var(--os-blue);
}
.os-kit-option.on {
  border-color: var(--os-blue);
  box-shadow: 0 0 0 1px var(--os-blue) inset;
}
/* 左右翻页按钮：只在套件超出可视宽度时出现 */
.os-kit-nav {
  position: absolute;
  top: 50%;
  z-index: 2;
  width: 28px;
  height: 28px;
  margin-top: -14px;
  display: grid;
  place-items: center;
  border: 1px solid #dbe4f0;
  border-radius: 50%;
  background: #fff;
  color: #33465f;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(23, 54, 95, 0.12);
}
.os-kit-nav.prev {
  left: 8px;
}
.os-kit-nav.next {
  right: 8px;
}
.os-kit-empty-tip {
  padding: 16px 18px;
  margin: 0;
  border-top: 1px solid #edf1f6;
  color: #8190a6;
  font-size: 12px;
}
/* 套件明细：选中后默认展开 */
.os-kit-detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background: #f7f9fc;
  border-top: 1px solid #edf1f6;
  border-bottom: 1px solid #edf1f6;
  font-size: 12px;
  color: #7d8b9f;
}
.os-kit-detail-head strong {
  color: #22364f;
  font-size: 12px;
}
/* 已手工调整部件：标题右侧转为红色，替代原来的破套弹窗提醒 */
.os-kit-detail-head strong.is-custom {
  color: #df422d;
}
.os-kit-list img {
  width: 46px;
  height: 38px;
  object-fit: contain;
  background: #f7f9fc;
  border-radius: 6px;
}
.os-kit-empty-img {
  width: 46px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: #f7f9fc;
  color: #9ca7b5;
}
.os-kit-empty {
  color: #98a4b4;
  font-weight: 400;
}
.os-kit-list small,
.os-kit-list strong,
.os-kit-list em {
  display: block;
}
.os-kit-list small {
  color: #8b98a9;
}
.os-kit-list strong {
  font-size: 13px;
}
.os-kit-list em {
  margin-top: 2px;
  color: #6f7e92;
  font-size: 11px;
  font-style: normal;
}
.os-link {
  border: 0;
  background: transparent;
  color: var(--os-blue);
  cursor: pointer;
}
/* 套件明细行右侧：数量×单价=总价 + 编辑 */
.os-kit-row-side {
  display: flex;
  align-items: center;
  gap: 14px;
}
.os-kit-formula {
  color: #7d8b9f;
  font-size: 12px;
  font-style: normal;
  white-space: nowrap;
}
.os-auto-complete {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 190px;
  justify-content: center;
  border: 1px dashed #91c9a6;
  border-radius: 12px;
  background: #f3fbf6;
}
.os-auto-complete > span {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #25a35a;
  color: #fff;
  font-size: 25px;
}
.os-auto-complete h3 {
  margin: 0 0 4px;
  color: #176f40;
}
.os-auto-complete p {
  margin: 0;
  color: #6e8879;
}
/* 已跳过步骤：替换候选区，说明该项不计入方案 */
.os-step-skipped {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 150px;
  padding: 22px 26px;
  border: 1px dashed #c9d6e6;
  border-radius: 12px;
  background: #f7f9fc;
}
.os-step-skipped > span {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #e6edf6;
  color: #6c7b91;
  font-size: 20px;
}
.os-step-skipped > div {
  flex: 1;
  min-width: 0;
}
.os-step-skipped h3 {
  margin: 0 0 4px;
  color: #33465f;
  font-size: 15px;
}
.os-step-skipped p {
  margin: 0;
  color: #8190a6;
  font-size: 12px;
}
.os-selector-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #edf1f6;
}
.os-selector-actions span {
  color: #94a0b0;
  font-size: 11px;
}
.os-actions-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.os-review {
  margin-top: 18px;
  padding: 24px;
  scroll-margin-top: 16px;
}
.os-review-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--os-line);
}
.os-review-head span {
  color: var(--os-blue);
  font-size: 11px;
  font-weight: 700;
}
.os-review-head h2 {
  margin: 3px 0;
}
.os-review-head p {
  margin: 0;
  color: #8491a3;
  font-size: 12px;
}
.os-review-group {
  margin-top: 20px;
}
.os-review-group > h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  font-size: 15px;
}
.os-review-group > h3 small {
  color: #91a0b2;
  font-weight: 400;
}
.os-review-table {
  border: 1px solid var(--os-line);
  border-radius: 10px;
  overflow: hidden;
}
.os-review-row {
  display: grid;
  grid-template-columns: 90px 48px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  min-height: 70px;
  padding: 10px 14px;
  border-bottom: 1px solid #edf1f5;
}
.os-review-row:last-child {
  border-bottom: 0;
}
.os-review-type {
  color: #74839a;
  font-size: 12px;
}
.os-review-row img,
.os-review-placeholder {
  width: 48px;
  height: 44px;
  object-fit: contain;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: #f7f9fc;
  color: #aab4c1;
}
.os-review-name strong,
.os-review-name small {
  display: block;
}
.os-review-name small {
  margin-top: 4px;
  color: #8c99aa;
}
/* 右侧：单价 × 数量 = 小计，五列定宽网格保证所有行严格对齐 */
.os-review-buy {
  display: grid;
  grid-template-columns: 104px 30px 108px 30px 108px;
  align-items: center;
  gap: 0;
}
/* 单价列：左对齐 */
.os-buy-price {
  justify-self: start;
  color: #5d6d84;
  font-size: 13px;
  white-space: nowrap;
}
/* × 与 = 符号列：在文字与步进器之间的空隙内水平 + 垂直居中 */
.os-buy-times,
.os-buy-eq {
  justify-self: center;
  align-self: center;
  display: grid;
  place-items: center;
  width: 30px;
  height: 32px;
  line-height: 1;
  color: #9aa7ba;
  font-size: 13px;
}
/* 数量步进器列：右对齐 */
.os-review-buy .os-review-qty {
  justify-self: end;
}
/* 小计列：右对齐 */
.os-buy-total {
  justify-self: end;
  color: #de432e;
  font-size: 15px;
  white-space: nowrap;
}
.os-buy-total.is-included {
  color: #2f9e63;
  font-size: 13px;
  font-weight: 600;
}
.os-buy-total.is-empty {
  color: #aab4c1;
  font-size: 13px;
  font-weight: 600;
}
/* 无商品行的占位单元格，不渲染边框与背景 */
.os-buy-blank {
  visibility: hidden;
}
.os-review-buy .os-review-qty.os-buy-blank {
  border: 0;
  box-shadow: none;
}
.os-review-qty {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  height: 32px;
  border: 1px solid #dbe3ee;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(16, 42, 84, 0.04);
  transition: border-color 0.18s, box-shadow 0.18s;
}
.os-review-qty:focus-within {
  border-color: #9dbcf2;
  box-shadow: 0 0 0 3px rgba(31, 95, 207, 0.12);
}
.os-qty-btn {
  width: 30px;
  height: 100%;
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: #4a5d78;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.os-qty-btn svg {
  width: 14px;
  height: 14px;
}
.os-qty-btn:hover:not(:disabled) {
  background: #eef4fe;
  color: var(--os-blue);
}
.os-qty-btn:active:not(:disabled) {
  background: #dde9fd;
}
.os-qty-btn:disabled {
  color: #c2cad6;
  cursor: not-allowed;
}
.os-qty-input {
  width: 42px;
  height: 100%;
  padding: 0;
  border: 0;
  border-left: 1px solid #eef2f7;
  border-right: 1px solid #eef2f7;
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  -moz-appearance: textfield;
}
.os-qty-input:focus {
  outline: none;
  background: #f8fbff;
}
.os-qty-input::-webkit-outer-spin-button,
.os-qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* 机柜升级电控仓：勾选项 */
.os-upgrade {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 13px 16px;
  border: 1px dashed #c9d8ea;
  border-radius: 10px;
  background: #f8fbff;
  cursor: pointer;
  transition: 0.18s;
}
.os-upgrade:hover {
  border-color: #8db9f3;
}
.os-upgrade.on {
  border: 1px solid #8db9f3;
  background: #f2f7ff;
}
.os-upgrade input {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
  accent-color: var(--os-blue);
  cursor: pointer;
}
.os-upgrade > span {
  flex: 1;
  min-width: 0;
}
.os-upgrade strong {
  display: block;
  color: #1d2f4b;
  font-size: 14px;
}
.os-upgrade small {
  display: block;
  margin-top: 3px;
  color: #7d8b9e;
  font-size: 12px;
}
.os-upgrade em {
  flex: 0 0 auto;
  color: #df422d;
  font-size: 15px;
  font-style: normal;
  font-weight: 700;
}
.os-upgrade-note {
  color: var(--os-blue) !important;
}
.os-review-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-top: 20px;
  padding: 22px 28px;
  border-radius: 14px;
  border: 1px solid #e7edf6;
  background: linear-gradient(120deg, #f6f9fe, #f2f6fc);
}
.os-total-info {
  flex: 1 1 auto;
  min-width: 0;
}
.os-total-info span,
.os-total-info small {
  display: block;
}
.os-total-info > span {
  font-weight: 700;
  color: #1d2f4b;
  font-size: 15px;
}
.os-total-info small {
  margin-top: 5px;
  color: #7d8a9e;
  font-size: 12px;
}
/* 右侧：价格 + 分隔线 + 按钮组 */
.os-total-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 22px;
}
.os-total-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
}
.os-total-label {
  font-size: 13px;
  color: #7d8a9e;
}
.os-total-price strong {
  color: #df422d;
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.5px;
}
.os-total-price strong i {
  margin-right: 1px;
  font-size: 17px;
  font-style: normal;
  font-weight: 700;
}
.os-total-divider {
  width: 1px;
  height: 34px;
  background: #d9e1ec;
}
/* 三个操作按钮：加入购物车 / 生成报价单 / 立即购买 */
.os-review-actions3 {
  display: flex;
  gap: 12px;
}
.os-review-actions3 .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  padding: 0 22px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.18s;
}
.os-review-actions3 .btn svg {
  width: 17px;
  height: 17px;
}
.os-btn-cart,
.os-btn-quote {
  border: 1px solid #d3deec;
  background: #fff;
  color: #3a506f;
}
.os-btn-cart:hover,
.os-btn-quote:hover {
  border-color: var(--os-blue);
  color: var(--os-blue);
  background: #f5f8ff;
  transform: translateY(-1px);
}
.os-btn-buy {
  padding: 0 30px !important;
  box-shadow: 0 6px 16px rgba(21, 84, 199, 0.24);
}
.os-btn-buy:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(21, 84, 199, 0.3);
}
.os-total-login {
  flex: 0 0 auto;
  height: 44px;
  padding: 0 30px;
  border-radius: 10px;
}
.os-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 30px;
  background: rgba(12, 29, 52, 0.58);
}
.os-picker-modal {
  width: min(1180px, 94vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
}
.os-picker-modal header {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  /* 标题整体下移，与关闭按钮错开 */
  padding: 34px 28px 22px;
  border-bottom: 1px solid var(--os-line);
  background: #fff;
}
.os-picker-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding-bottom: 4px;
}
.os-picker-modal header h2 {
  margin: 0;
  font-size: 23px;
}
.os-picker-modal header > button {
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  color: #68778b;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
}
/* 右上角搜索框：标题与关闭按钮之间 */
.os-picker-headsearch {
  position: relative;
  flex: 1 1 auto;
  max-width: 440px;
  margin-left: auto;
  display: flex;
  align-items: center;
}
.os-picker-headsearch svg {
  position: absolute;
  left: 13px;
  width: 15px;
  height: 15px;
  fill: none;
  stroke: #93a1b4;
  stroke-width: 1.8;
  stroke-linecap: round;
  pointer-events: none;
}
.os-picker-headsearch input {
  width: 100%;
  height: 40px;
  padding: 0 78px 0 37px;
  border: 1px solid var(--os-line);
  border-radius: 10px;
  background: #f7fafd;
  color: #25354c;
  font-size: 13px;
  transition: border-color 0.18s ease, background 0.18s ease,
    box-shadow 0.18s ease;
}
.os-picker-headsearch input::placeholder {
  color: #9aa7b9;
}
.os-picker-headsearch input::-webkit-search-cancel-button {
  display: none;
}
.os-picker-headsearch input:focus {
  outline: none;
  border-color: var(--os-blue);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(23, 104, 213, 0.1);
}
.os-picker-headsearch > span,
.os-picker-headsearch > button {
  position: absolute;
  right: 13px;
  color: #93a1b4;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
}
.os-picker-headsearch > button {
  border: 0;
  background: transparent;
  color: var(--os-blue);
  font-weight: 600;
  cursor: pointer;
}
/* 改动后的计价口径提示 */
.os-picker-alert {
  margin: 16px 28px 0;
  padding: 11px 16px;
  border: 1px solid #f0c0b2;
  border-radius: 8px;
  background: #fff5f1;
  color: #a84029;
  font-size: 12.5px;
  line-height: 1.5;
}
.os-picker-tabs {
  display: flex;
  gap: 9px;
  padding: 14px 28px 0;
  overflow-x: auto;
}
.os-picker-tabs button {
  flex: 0 0 auto;
  padding: 8px 16px;
  border: 1px solid var(--os-line);
  border-radius: 18px;
  background: #fff;
  color: #63738a;
  font-size: 13px;
  cursor: pointer;
}
.os-picker-tabs button.on {
  border-color: var(--os-blue);
  background: #eaf3ff;
  color: var(--os-blue);
  font-weight: 700;
}
.os-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 14px;
  padding: 18px 28px 26px;
}
.os-picker-card {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 6px 14px;
  align-items: start;
  padding: 14px;
  border: 1px solid var(--os-line);
  border-radius: 12px;
  background: #fff;
  text-align: left;
  transition: border-color 0.18s ease, box-shadow 0.18s ease,
    transform 0.18s ease;
}
.os-picker-card:hover:not(.off) {
  border-color: var(--os-blue);
  box-shadow: 0 10px 24px rgba(23, 104, 213, 0.12);
  transform: translateY(-1px);
}
.os-picker-card.on {
  border-color: var(--os-blue);
  background: #f2f7ff;
  box-shadow: inset 0 0 0 1px var(--os-blue);
}
.os-picker-card.off {
  background: #fbfcfd;
}
.os-picker-card.off img {
  opacity: 0.55;
}
.os-picker-card img {
  grid-row: span 2;
  width: 92px;
  height: 84px;
  object-fit: contain;
  background: #f7f9fc;
  border-radius: 9px;
  cursor: pointer;
}
.os-picker-card .os-picker-info {
  cursor: pointer;
}
.os-picker-info {
  display: block;
  min-width: 0;
}
.os-picker-info strong {
  display: block;
  overflow: hidden;
  color: #1d2d43;
  font-size: 14.5px;
  line-height: 1.35;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.os-picker-meta {
  display: block;
  margin-top: 3px;
  color: #93a1b4;
  font-size: 11.5px;
  letter-spacing: 0.2px;
}
.os-picker-desc {
  display: -webkit-box;
  margin-top: 4px;
  overflow: hidden;
  color: #6c7b90;
  font-size: 12px;
  line-height: 1.45;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.os-picker-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 7px;
}
.os-picker-tags em {
  padding: 2px 7px;
  border-radius: 4px;
  background: #eef3fa;
  color: #55657c;
  font-size: 11px;
  font-style: normal;
  line-height: 16px;
}
.os-picker-tags em.cross {
  background: #fff4e6;
  color: #a4621a;
}
.os-picker-tags em.warn {
  background: #fdeeea;
  color: #c04a2e;
}
.os-picker-tags em.ok {
  background: #e8f6ee;
  color: #1f7a4d;
}
.os-picker-buy {
  grid-column: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 2px;
}
.os-picker-buy i {
  color: #df422d;
  font-size: 15.5px;
  font-style: normal;
  font-weight: 700;
}
/* 卡片右下角：详情（弱化）+ 选入（主操作） */
.os-picker-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.os-picker-ghost,
.os-picker-cta {
  padding: 5px 11px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}
.os-picker-ghost {
  border: 1px solid var(--os-line);
  background: #fff;
  color: #5c6b80;
}
.os-picker-ghost:hover {
  border-color: var(--os-blue);
  color: var(--os-blue);
}
.os-picker-cta {
  border: 1px solid rgba(23, 104, 213, 0.3);
  background: #f4f8ff;
  color: var(--os-blue);
}
.os-picker-card.on .os-picker-cta {
  border-color: var(--os-blue);
  background: var(--os-blue);
  color: #fff;
}
.os-picker-card.off .os-picker-buy i {
  color: #98a4b5;
}
.os-picker-card.off .os-picker-cta {
  border-color: #e3e8ef;
  background: #f4f6f9;
  color: #98a4b5;
  cursor: not-allowed;
}
.os-picker-empty {
  margin: 18px 28px 28px;
  padding: 52px 20px;
  border: 1px dashed var(--os-line);
  border-radius: 12px;
  background: #f8fafd;
  color: #7d8a9e;
  font-size: 13px;
  text-align: center;
}
@media (max-width: 1100px) {
  .os-workspace {
    grid-template-columns: 160px minmax(0, 1fr);
  }
}
</style>
