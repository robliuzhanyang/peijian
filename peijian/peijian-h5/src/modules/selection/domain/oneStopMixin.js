/**
 * 一站式选购共享业务逻辑（H5 / PC 各维护一份，修改时需两端同步）
 *
 * 数据流与状态流转：
 *   1. created → loadOneStop()：通过 oneStopApi.catalog() 拉取选配目录
 *      （mock 模式来自 src/mock/oneStopCatalog.js）。
 *   2. 用户在 steps 中逐项选择，selection 保存机柜 / 铝件 5 件套 / 振镜 / 场镜 /
 *      激光器 / 打标卡 / 电脑 / 扩展配件的商品 id；联动关系见 relations 与 sync* 方法。
 *   3. 计价：retailTotal = 各部件正价合计；bundleTotal = 正价 × bundleDiscountRate。
 *      priceMode=bundle 表示套餐价；一旦改动配置（换套件 / 改部件）即静默切为 combination，
 *      只弹 toast 说明，套件明细标题转红提示已偏离标准配置，不再弹破套确认框。
 *   4. confirmConfiguration()：生成 scheme 快照（parts 含 module/section/qty），
 *      写入 Vuex selectedScheme / selected 后进入组合确认页。
 *   5. 购物车「去修改配置」→ /diy?edit=1 → restoreScheme() 按快照还原 selection 与计价模式，
 *      再次确认时沿用原 scheme.id，加入购物车会覆盖原方案行。
 *
 * 后端接入要点：
 *   - catalog 结构需与 oneStopApi.catalog() 保持一致：
 *     { orientations, steps, kits, kitVariants, defaults, relations, products, bundleDiscountRate }
 *   - priceFen / stock / buyable 必须由服务端返回实时值；若改由服务端计价，
 *     可将 retailTotal / bundleTotal 改为 await oneStopApi.calculate(selection) 的结果。
 *   - scheme 快照字段需与后端「保存草稿 / 报价单」接口一一对应（见项目根目录对接说明文档）。
 */
import oneStopApi from "@/modules/selection/api";
import { asset, money } from "@/domain/productFields";

const KIT_LABELS = {
  column: "立柱",
  opticalPath: "光路",
  fixture: "治具板",
  positionStrip: "定位条",
  pcBracket: "电脑支架",
};

/**
 * H5 / PC 一站式选购共享业务逻辑。
 * 两端只维护各自模板和样式，兼容筛选、破套计价及提交快照保持一致。
 */
export default {
  data() {
    return {
      loading: true,
      catalog: null,
      orientationId: "cabinet",
      activeStep: 0,
      kitExpanded: true,
      // 用户逐件调整过的铝件槽位；换机柜时保留这些部件
      kitCustom: {},
      // 最近一次选中的套件 id：逐件微调后标题仍沿用该套件名（转红表示已调整）
      lastKitOptionId: "base",
      // 允许跳过的步骤（铝件5件套 / 机柜）记录，用于展示“已跳过”
      skippedSteps: {},
      priceMode: "bundle",
      reviewReady: false,
      picker: {
        visible: false,
        slot: "",
        title: "",
        candidates: [],
        source: "review",
        tabs: [],
        keyword: "",
      },
      selection: {
        cabinetId: null,
        kitParts: {},
        galvo: null,
        fieldLens: null,
        laser: null,
        controller: null,
        computer: null,
        extensions: [],
      },
      // 配置清单中逐行调整的数量：行 key → 数量（默认 1，不落盘）
      rowQuantities: {},
    };
  },
  computed: {
    // ---- 选配目录：方向、步骤与商品索引（全部来自 oneStopApi.catalog） ----
    // 抽屉候选列表：在 candidates 基础上支持关键字过滤
    pickerList() {
      if (!this.picker.visible) return [];
      const keyword = (this.picker.keyword || "").trim().toLowerCase();
      if (!keyword) return this.picker.candidates;
      return this.picker.candidates.filter((item) =>
        [item.name, item.model, item.desc, item.skuCode, item.series]
          .filter(Boolean)
          .some((text) => String(text).toLowerCase().includes(keyword))
      );
    },
    orientations() {
      return this.catalog ? this.catalog.orientations : [];
    },
    orientation() {
      return (
        this.orientations.find((item) => item.id === this.orientationId) || null
      );
    },
    steps() {
      return this.catalog ? this.catalog.steps : [];
    },
    currentStep() {
      return this.steps[this.activeStep] || {};
    },
    products() {
      return this.catalog ? this.catalog.products : [];
    },
    cabinets() {
      if (!this.orientation) return [];
      return this.orientation.cabinetIds.map(this.product).filter(Boolean);
    },
    // ---- 当前选择：机柜、铝件 5 件套与套件可选方案 ----
    cabinet() {
      return this.product(this.selection.cabinetId);
    },
    kit() {
      return this.catalog && this.catalog.kits[this.selection.cabinetId];
    },
    kitRows() {
      return Object.keys(KIT_LABELS).map((slot) => {
        const item = this.product(this.selection.kitParts[slot]);
        // 部件数量固定 1 件，单价与总价按当前计价口径展示
        const qty = 1;
        return {
          key: "kit-" + slot,
          group: "铝件5件套",
          label: KIT_LABELS[slot],
          slot,
          product: item,
          qty,
          priceText: item ? this.priceText(item.priceFen) : "—",
          totalText: item ? this.priceText(item.priceFen * qty) : "—",
          includedText: "未选择",
          editable: true,
        };
      });
    },
    // 行数量：默认 1，用户调整后取 rowQuantities
    rowQtyOf() {
      return (key) => Math.max(1, Number(this.rowQuantities[key]) || 1);
    },
    // 行小计（分）：行数量 × 单价
    rowTotalFenOf() {
      return (row) => {
        if (!row.product || row.product.priceFen == null) return null;
        return this.rowQtyOf(row.key) * row.product.priceFen;
      };
    },
    // 铝件套件可选项：默认「标准套装」+ 当前机型方向的套件1/2/3
    kitVariants() {
      if (!this.catalog || !this.orientation) return [];
      const base = this.kit;
      const variants = this.catalog.kitVariants?.[this.orientationId] || [];
      const rows = [
        {
          id: "base",
          name: "标准套装",
          desc: "按当前机柜带出的标准 5 件套",
          parts: base ? base.parts : {},
          recommended: true,
        },
        ...variants,
      ];
      return rows.filter((row) => Object.keys(row.parts || {}).length);
    },
    // 当前选中的套件：部件与某个套件完全一致时高亮，逐件调整后视为自定义组合
    activeKitOption() {
      return (
        this.kitVariants.find((option) =>
          Object.keys(KIT_LABELS).every(
            (slot) => this.selection.kitParts[slot] === option.parts[slot]
          )
        ) || null
      );
    },
    activeKitOptionId() {
      return this.activeKitOption ? this.activeKitOption.id : "";
    },
    // 套件明细标题：完全匹配时显示匹配到的套件，手工微调后沿用最近选中的套件名
    kitLabel() {
      if (this.activeKitOption) return this.activeKitOption.name;
      if (!this.kitDeviated) return "自定义组合";
      const last = this.kitVariants.find((o) => o.id === this.lastKitOptionId);
      return last ? last.name : "自定义组合";
    },
    selectedGalvo() {
      return this.product(this.selection.galvo);
    },
    videoGalvo() {
      return !!(this.selectedGalvo && this.selectedGalvo.includesFieldLens);
    },
    canSeePrice() {
      return this.$store.state.loggedIn;
    },
    currentCandidates() {
      return this.candidatesForStep(this.currentStep.key);
    },
    completionCount() {
      return this.steps.filter((step) => this.stepDone(step.key)).length;
    },
    configurationComplete() {
      return this.steps.every(
        (step) => !step.required || this.stepDone(step.key)
      );
    },
    // ---- 计价：正价合计 → 套餐价（折扣）→ 差额 ----
    // 视频振镜自带场镜，计算正价时不再叠加单独选择的场镜，避免重复计价
    retailProductIds() {
      const ids = [
        this.selection.cabinetId,
        ...Object.values(this.selection.kitParts || {}),
        this.selection.galvo,
        this.videoGalvo ? null : this.selection.fieldLens,
        this.selection.laser,
        this.selection.controller,
        this.selection.computer,
        ...(this.selection.extensions || []),
      ];
      return ids.filter(Boolean);
    },
    retailTotal() {
      return this.retailProductIds.reduce((sum, id) => {
        const item = this.product(id);
        return sum + (item ? item.priceFen || 0 : 0);
      }, 0);
    },
    bundleTotal() {
      if (!this.catalog) return 0;
      return Math.round(this.retailTotal * this.catalog.bundleDiscountRate);
    },
    totalPrice() {
      return this.priceMode === "bundle" ? this.bundleTotal : this.retailTotal;
    },
    savings() {
      return Math.max(0, this.retailTotal - this.bundleTotal);
    },
    // ---- 配置清单：按模块生成最终行，已跳过步骤的行不展示 ----
    finalRows() {
      const rows = [
        {
          key: "cabinet",
          group: "主机结构",
          label: "机柜",
          slot: "cabinet",
          product: this.cabinet,
          includedText: "未选择（可选）",
          editable: true,
        },
        ...this.kitRows,
        {
          key: "galvo",
          group: "核心配件",
          label: "振镜",
          slot: "galvo",
          product: this.product(this.selection.galvo),
          includedText: "未选择（可选）",
          editable: true,
        },
        this.videoGalvo
          ? {
              key: "fieldLens",
              group: "核心配件",
              label: "场镜",
              slot: "fieldLens",
              product: null,
              includedText: "视频振镜已配套场镜，无需另选",
              includedPrice: true,
              editable: false,
            }
          : {
              key: "fieldLens",
              group: "核心配件",
              label: "场镜",
              slot: "fieldLens",
              product: this.product(this.selection.fieldLens),
              includedText: "未选择（可选）",
              editable: true,
            },
        {
          key: "laser",
          group: "核心配件",
          label: "激光器",
          slot: "laser",
          product: this.product(this.selection.laser),
          includedText: "未选择（可选）",
          editable: true,
        },
        {
          key: "controller",
          group: "核心配件",
          label: "打标卡",
          slot: "controller",
          product: this.product(this.selection.controller),
          includedText: "未选择（可选）",
          editable: true,
        },
        {
          key: "computer",
          group: "核心配件",
          label: "电脑套装",
          slot: "computer",
          product: this.product(this.selection.computer),
          includedText: "未选择（可选）",
          editable: true,
        },
      ];
      if (this.selection.extensions.length) {
        this.selection.extensions.forEach((id, index) =>
          rows.push({
            key: "extension-" + index,
            group: "扩展配件",
            label: "扩展配件",
            slot: "extensions",
            product: this.product(id),
            editable: true,
          })
        );
      } else {
        rows.push({
          key: "extension-empty",
          group: "扩展配件",
          label: "扩展配件",
          slot: "extensions",
          product: null,
          includedText: "未选择（可选）",
          editable: true,
        });
      }
      // 已跳过的步骤不再进入清单，避免「已跳过」与明细并存
      return rows.filter((row) => {
        const key = row.key.startsWith("kit-")
          ? "kit"
          : row.key.startsWith("extension")
          ? "extensions"
          : row.key;
        return !this.skippedSteps[key];
      });
    },
    groupedFinalRows() {
      return this.finalRows
        .reduce((groups, row) => {
          const found = groups.find((group) => group.name === row.group);
          if (found) found.rows.push(row);
          else groups.push({ name: row.group, rows: [row] });
          return groups;
        }, [])
        .filter((group) => group.rows.length);
    },
    currentHint() {
      return this.hintForStep(this.currentStep.key);
    },
    // 是否已手工改动 5 件套中的部件：套件明细标题据此转为红色
    kitDeviated() {
      return Object.keys(this.kitCustom || {}).length > 0;
    },
  },
  async created() {
    await this.loadOneStop();
  },
  methods: {
    asset,
    money,
    // ---- 数据加载与方案恢复 ----
    async loadOneStop() {
      try {
        this.catalog = await oneStopApi.catalog();
        this.selectOrientation("cabinet");
        // 从购物车「去修改配置」进入时，恢复原方案选配，避免重新配置
        if (this.$route && this.$route.query.edit) {
          const scheme = this.$store.state.selectedScheme;
          if (scheme && this.restoreScheme(scheme)) {
            this.$store.commit("setNotice", "已载入购物车方案，可继续调整");
          }
        }
      } finally {
        this.loading = false;
      }
    },
    // 从方案快照恢复选配：机柜 / 铝件套件 / 各步骤部件 / 扩展配件
    restoreScheme(scheme) {
      if (!scheme || !Array.isArray(scheme.parts)) return false;
      const orientation = this.orientations.find(
        (o) => o.name === scheme.direction || o.id === scheme.direction
      );
      if (orientation) this.orientationId = orientation.id;
      const selection = {
        cabinetId: null,
        kitParts: {},
        galvo: null,
        fieldLens: null,
        laser: null,
        controller: null,
        computer: null,
        extensions: [],
      };
      scheme.parts.forEach((part) => {
        const item = this.product(part.id);
        if (part.module === "扩展配件") {
          selection.extensions.push(part.id);
          return;
        }
        if (part.module === "机柜") {
          selection.cabinetId = part.id;
          return;
        }
        const kitSlot = Object.keys(KIT_LABELS).find(
          (slot) => KIT_LABELS[slot] === part.module
        );
        if (kitSlot) {
          selection.kitParts[kitSlot] = part.id;
          return;
        }
        if (
          item &&
          ["galvo", "fieldLens", "laser", "controller", "computer"].includes(
            item.type
          )
        ) {
          selection[item.type] = part.id;
        }
      });
      this.selection = selection;
      // 标记为逐件调整，换机柜时保留恢复出的部件
      this.kitCustom = { ...selection.kitParts };
      this.priceMode = scheme.priceMode === "retail" ? "retail" : "bundle";
      this.activeStep = Math.max(0, this.steps.length - 1);
      this.reviewReady = true;
      return true;
    },
    product(id) {
      if (!id || !this.catalog) return null;
      return this.catalog.products.find((item) => item.id === id) || null;
    },
    hintForStep(key) {
      const hints = {
        cabinet:
          "更换机柜会带出对应的铝件 5 件套默认值，已手动调整过的铝件会保留。",
        kit: "铝件 5 件套已按当前机柜带出，可展开逐件微调；手动调整的部件在更换机柜时保留。",
        galvo: "视频振镜已配套场镜，选择后第 4 步无需再选场镜。",
        fieldLens: this.videoGalvo
          ? "当前视频振镜已包含场镜，本步骤已自动完成。"
          : "仅展示与当前振镜匹配的场镜。",
        laser: "仅展示与当前振镜/光路适配的激光器。",
        controller: "打标卡由激光器联动过滤，避免控制协议不匹配。",
        computer: "选择本次设备配套的电脑套装。",
        extensions: "扩展配件为多选项，并按当前打标卡能力过滤。",
      };
      return hints[key] || "";
    },
    priceText(fen) {
      return this.canSeePrice ? money(fen) : "登录后可见";
    },
    // ---- 方向与机柜联动：切换方向时重置为默认配置 ----
    selectOrientation(id) {
      if (
        !this.catalog ||
        (id === this.orientationId && this.selection.cabinetId)
      )
        return;
      this.orientationId = id;
      const orientation = this.catalog.orientations.find(
        (item) => item.id === id
      );
      this.activeStep = 0;
      this.skippedSteps = {};
      this.setCabinet(orientation.cabinetIds[0], true);
    },
    setCabinet(cabinetId, resetPrice, keepCustom) {
      const kit = this.catalog.kits[cabinetId];
      const defaults = this.catalog.defaults[this.orientationId];
      const prevParts = { ...this.selection.kitParts };
      const kitParts = { ...kit.parts };
      // 铝件步骤在前：换机柜时保留用户手动调整过的部件，只补全未调整的槽位
      if (keepCustom) {
        Object.keys(this.kitCustom).forEach((slot) => {
          if (this.kitCustom[slot] && prevParts[slot])
            kitParts[slot] = prevParts[slot];
        });
      } else {
        this.kitCustom = {};
      }
      // 换机柜后铝件回到该机柜的标准 5 件套
      this.lastKitOptionId = "base";
      this.selection = {
        cabinetId,
        kitParts,
        galvo: defaults.galvo,
        fieldLens: defaults.fieldLens,
        laser: defaults.laser,
        controller: defaults.controller,
        computer: defaults.computer,
        extensions: [...(defaults.extensions || [])],
      };
      this.syncFromOpticalPath();
      if (resetPrice) {
        this.priceMode = "bundle";
      }
    },
    beamKind() {
      const id = this.selection.kitParts.opticalPath || "";
      if (id.includes("-vu") || id.includes("-uv")) return "uv";
      if (id.includes("-hc") || id.includes("-sc")) return "co2";
      return "fiber";
    },
    allowedGalvos() {
      const map = {
        fiber: ["os-galvo-fiber", "os-galvo-video-f"],
        uv: ["os-galvo-uv", "os-galvo-video-uv"],
        co2: ["os-galvo-co2"],
      };
      return (map[this.beamKind()] || []).map(this.product).filter(Boolean);
    },
    syncFromOpticalPath() {
      const galvos = this.allowedGalvos();
      if (!galvos.some((item) => item.id === this.selection.galvo))
        this.selection.galvo = galvos[0] && galvos[0].id;
      this.syncFromGalvo();
    },
    syncFromGalvo() {
      const galvo = this.product(this.selection.galvo);
      const lensIds =
        this.catalog.relations.galvoToFieldLenses[this.selection.galvo] || [];
      const laserIds =
        this.catalog.relations.galvoToLasers[this.selection.galvo] || [];
      if (galvo && galvo.includesFieldLens) this.selection.fieldLens = null;
      else if (!lensIds.includes(this.selection.fieldLens))
        this.selection.fieldLens = lensIds[0] || null;
      if (!laserIds.includes(this.selection.laser))
        this.selection.laser = laserIds[0] || null;
      this.syncFromLaser();
    },
    syncFromLaser() {
      const ids =
        this.catalog.relations.laserToControllers[this.selection.laser] || [];
      if (!ids.includes(this.selection.controller))
        this.selection.controller = ids[0] || null;
      this.syncFromController();
    },
    syncFromController() {
      const allowed =
        this.catalog.relations.controllerToExtensions[
          this.selection.controller
        ] || [];
      this.selection.extensions = this.selection.extensions.filter((id) =>
        allowed.includes(id)
      );
    },
    // ---- 步骤候选、完成度与前进/后退 ----
    candidatesForStep(key) {
      if (!this.catalog) return [];
      if (key === "cabinet") return this.cabinets;
      if (key === "kit") return [];
      if (key === "galvo") return this.allowedGalvos();
      if (key === "fieldLens") {
        if (this.videoGalvo) return [];
        return (
          this.catalog.relations.galvoToFieldLenses[this.selection.galvo] || []
        )
          .map(this.product)
          .filter(Boolean);
      }
      if (key === "laser")
        return (
          this.catalog.relations.galvoToLasers[this.selection.galvo] || []
        )
          .map(this.product)
          .filter(Boolean);
      if (key === "controller")
        return (
          this.catalog.relations.laserToControllers[this.selection.laser] || []
        )
          .map(this.product)
          .filter(Boolean);
      if (key === "computer")
        return this.products.filter((item) => item.type === "computer");
      if (key === "extensions")
        return (
          this.catalog.relations.controllerToExtensions[
            this.selection.controller
          ] || []
        )
          .map(this.product)
          .filter(Boolean);
      return [];
    },
    selectedIdForStep(key) {
      if (key === "cabinet") return this.selection.cabinetId;
      if (key === "extensions") return null;
      return this.selection[key];
    },
    isSelectedCandidate(item) {
      if (this.currentStep.key === "extensions")
        return this.selection.extensions.includes(item.id);
      return this.selectedIdForStep(this.currentStep.key) === item.id;
    },
    stepDone(key) {
      if (key === "cabinet") return !!this.selection.cabinetId;
      if (key === "kit")
        return Object.keys(KIT_LABELS).every(
          (slot) => !!this.selection.kitParts[slot]
        );
      if (key === "fieldLens")
        return this.videoGalvo || !!this.selection.fieldLens;
      if (key === "extensions") return true;
      return !!this.selection[key];
    },
    goStep(index) {
      this.activeStep = index;
    },
    previousStep() {
      this.activeStep = Math.max(0, this.activeStep - 1);
    },
    nextStep() {
      if (this.activeStep < this.steps.length - 1) {
        this.activeStep += 1;
        return;
      }
      this.reviewReady = true;
      this.$nextTick(() => {
        const target = document.getElementById("one-stop-review");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    // ---- 跳过 / 恢复步骤：仅允许跳过非必填步骤 ----
    skipStep(key) {
      const index = this.steps.findIndex((step) => step.key === key);
      const step = this.steps[index];
      if (!step) return;
      // 跳过即不计入方案：清空该步骤已选内容，避免清单与总价仍带出该项
      this.clearStep(key);
      this.$set(this.skippedSteps, key, true);
      if (this.priceMode === "bundle") this.priceMode = "combination";
      this.$store.commit(
        "setNotice",
        `已跳过「${step.name}」，该项不计入方案`
      );
      const nextIndex = Math.min(index + 1, this.steps.length - 1);
      this.activeStep = nextIndex;
      this.$nextTick(() => {
        const target = document.getElementById(
          "m-os-step-" + this.steps[nextIndex].key
        );
        if (target)
          target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    // 取消跳过：恢复当前步骤的候选商品，由用户重新选择
    resumeStep(key) {
      const step = this.steps.find((item) => item.key === key);
      this.$delete(this.skippedSteps, key);
      if (step) {
        this.$store.commit("setNotice", `已恢复「${step.name}」，请重新选择`);
      }
    },
    // ---- 铝件套件选择：整包替换 5 个部件，套餐价下需先破套；已逐件调整的单件会被覆盖 ----
    chooseKitOption(option) {
      if (!option || !option.parts) return;
      if (this.activeKitOptionId === option.id) return;
      const change = { kind: "kitOption", id: option.id, parts: option.parts };
      if (this.priceMode === "bundle") this.requestBreak(change);
      else this.applyChange(change);
    },
    // 套件参考价：5 个部件商城正价合计
    kitOptionPrice(option) {
      const total = Object.keys(KIT_LABELS).reduce((sum, slot) => {
        const item = this.product((option.parts || {})[slot]);
        return sum + (item ? item.priceFen || 0 : 0);
      }, 0);
      return this.priceText(total);
    },
    chooseCandidate(item) {
      const key = this.currentStep.key;
      if (this.skippedSteps[key]) this.$delete(this.skippedSteps, key);
      if (key === "cabinet") {
        // 再次点击当前机柜即取消选择，方案内的机柜与默认配置一并清空
        if (item.id === this.selection.cabinetId) this.requestClear(key);
        else
          this.setCabinet(item.id, !Object.keys(this.kitCustom).length, true);
        return;
      }
      if (key === "extensions") {
        this.toggleExtension(item.id);
        return;
      }
      const current = this.selectedIdForStep(key);
      // 再次点击已选商品即取消勾选，可只选需要的部分
      if (current === item.id) {
        this.requestClear(key);
        return;
      }
      if (current) this.requestBreak({ kind: "step", slot: key, id: item.id });
      else this.applyChange({ kind: "step", slot: key, id: item.id });
    },
    // ---- 清空选配位：单步、模块或扩展件；同样属于改动配置，套餐价下先确认破套 ----
    requestClear(slot) {
      this.requestBreak({ kind: "clear", slot, source: "guided" });
    },
    clearStep(slot) {
      if (slot === "cabinet") {
        this.selection = {
          cabinetId: null,
          kitParts: {},
          galvo: null,
          fieldLens: null,
          laser: null,
          controller: null,
          computer: null,
          extensions: [],
        };
        this.kitCustom = {};
        return;
      }
      // 整个铝件 5 件套模块不选
      if (slot === "kit") {
        this.$set(this.selection, "kitParts", {});
        this.kitCustom = {};
        return;
      }
      // 单个铝件槽位不选：只移除该件，不自动回填，允许留空
      if (Object.prototype.hasOwnProperty.call(KIT_LABELS, slot)) {
        const next = { ...this.selection.kitParts };
        delete next[slot];
        this.$delete(this.kitCustom, slot);
        if (slot === "column") {
          delete next.opticalPath;
          this.$delete(this.kitCustom, "opticalPath");
        }
        this.$set(this.selection, "kitParts", next);
        return;
      }
      if (slot === "extensions") {
        this.$set(this.selection, "extensions", []);
        return;
      }
      this.$set(this.selection, slot, null);
      // 关联步骤按光路/协议联动清空，避免留下不匹配的搭配
      if (slot === "galvo") {
        this.$set(this.selection, "fieldLens", null);
        this.$set(this.selection, "laser", null);
        this.$set(this.selection, "controller", null);
        this.$set(this.selection, "extensions", []);
      }
      if (slot === "laser") {
        this.$set(this.selection, "controller", null);
        this.$set(this.selection, "extensions", []);
      }
      if (slot === "controller")
        this.$set(this.selection, "extensions", []);
    },
    // 当前模块是否已有选择：用于展示「不选」入口
    moduleHasSelection(key) {
      if (key === "kit")
        return Object.values(this.selection.kitParts || {}).some(Boolean);
      if (key === "extensions")
        return (this.selection.extensions || []).length > 0;
      if (key === "fieldLens")
        return !this.videoGalvo && !!this.selection.fieldLens;
      return !!this.selection[key];
    },
    // 不选本模块：清空该步骤已选内容，其余步骤保持不变
    clearModule(key) {
      if (!this.moduleHasSelection(key)) return;
      this.requestClear(key);
    },
    toggleExtension(id, source = "guided") {
      const adding = !this.selection.extensions.includes(id);
      const next = this.selection.extensions.includes(id)
        ? this.selection.extensions.filter((item) => item !== id)
        : [...this.selection.extensions, id];
      const change = {
        kind: "extensions",
        ids: next,
        id,
        adding,
        source,
      };
      if (this.priceMode === "bundle") this.requestBreak(change);
      else this.applyChange(change);
    },
    // ---- 破套确认与改动落地：bundle 模式下先弹窗确认，再按 change 类型改写 selection ----
    applyChange(change) {
      if (!change) return;
      if (change.kind === "clear") {
        this.clearStep(change.slot);
        return;
      }
      if (change.kind === "cabinet") {
        this.$delete(this.skippedSteps, "cabinet");
        this.setCabinet(change.id, false, true);
        return;
      }
      if (change.kind === "extensions") {
        this.$set(this.selection, "extensions", [...change.ids]);
        return;
      }
      if (change.kind === "kitOption") {
        // 整包替换：清空逐件微调标记，并按新光路联动后续步骤
        this.kitCustom = {};
        this.lastKitOptionId = change.id;
        this.$set(this.selection, "kitParts", { ...change.parts });
        this.$delete(this.skippedSteps, "kit");
        this.syncFromOpticalPath();
        return;
      }
      if (change.kind === "kit") {
        this.$set(this.selection.kitParts, change.slot, change.id);
        this.$set(this.kitCustom, change.slot, true);
        this.$delete(this.skippedSteps, "kit");
        if (change.slot === "column") {
          const allowed =
            this.catalog.relations.columnToOpticalPaths[change.id] || [];
          if (!allowed.includes(this.selection.kitParts.opticalPath))
            this.$set(
              this.selection.kitParts,
              "opticalPath",
              allowed[0] || null
            );
        }
        if (change.slot === "column" || change.slot === "opticalPath")
          this.syncFromOpticalPath();
        return;
      }
      this.$set(this.selection, change.slot, change.id);
      if (change.slot === "galvo") this.syncFromGalvo();
      if (change.slot === "laser") this.syncFromLaser();
      if (change.slot === "controller") this.syncFromController();
    },
    // ---- 改动落地：套餐价下直接切为组合价并重算，不再弹窗打断 ----
    requestBreak(change) {
      if (this.priceMode === "bundle") {
        // 套餐价只对原始套件成立，改动后按商城正价合计（toast 轻提示即可）
        this.priceMode = "combination";
        this.$store.commit(
          "setNotice",
          "已切换组合价：仍属一站式选购，按商城商品正价合计"
        );
      }
      this.applyChange(change);
      // 单个部件 / 整包套件更换后关闭选择面板；扩展配件可连续勾选，保持打开
      if (change.kind !== "extensions") this.picker.visible = false;
    },
    resetBundle() {
      if (!this.selection.cabinetId) {
        this.priceMode = "bundle";
        return;
      }
      this.setCabinet(this.selection.cabinetId, true);
      this.$store.commit("setNotice", "已恢复该机柜的默认套餐配置与套餐价");
    },
    // ---- 选配弹窗：候选列表、插槽切换与选中状态 ----
    orientationKitIds(slot) {
      const ids = [];
      (this.orientation ? this.orientation.cabinetIds : []).forEach(
        (cabinetId) => {
          const kit = this.catalog.kits[cabinetId];
          if (kit && kit.parts[slot] && !ids.includes(kit.parts[slot]))
            ids.push(kit.parts[slot]);
        }
      );
      return ids;
    },
    pickerCandidates(slot) {
      if (slot === "cabinet") return this.cabinets;
      if (Object.prototype.hasOwnProperty.call(KIT_LABELS, slot)) {
        let ids = this.orientationKitIds(slot);
        if (slot === "opticalPath")
          ids =
            this.catalog.relations.columnToOpticalPaths[
              this.selection.kitParts.column
            ] || [];
        return ids.map(this.product).filter(Boolean);
      }
      return this.candidatesForStep(slot);
    },
    openCurrentStepMall() {
      const key = this.currentStep.key;
      if (key === "fieldLens" && this.videoGalvo) {
        this.$store.commit(
          "setNotice",
          "当前视频振镜已包含场镜，无需从商城重复加入"
        );
        return;
      }
      const tabs =
        key === "kit"
          ? Object.keys(KIT_LABELS).map((slot) => ({
              slot,
              label: KIT_LABELS[slot],
            }))
          : [];
      const slot = key === "kit" ? tabs[0].slot : key;
      this.picker = {
        visible: true,
        slot,
        title:
          key === "kit"
            ? "从配件商城选择铝件 5 件套配件"
            : "从配件商城选择" + this.currentStep.name,
        candidates: this.pickerCandidates(slot),
        source: "mall",
        tabs,
        keyword: "",
      };
    },
    switchPickerSlot(slot) {
      this.picker.slot = slot;
      this.picker.candidates = this.pickerCandidates(slot);
      this.picker.keyword = "";
    },
    clearPickerKeyword() {
      this.picker.keyword = "";
    },
    openEditor(row) {
      if (!row.editable) {
        this.$store.commit("setNotice", "视频振镜已配套场镜，无需单独更换");
        return;
      }
      this.picker = {
        visible: true,
        slot: row.slot,
        title: "从配件商城更换" + row.label,
        candidates: this.pickerCandidates(row.slot),
        source: "review",
        tabs: [],
        keyword: "",
      };
    },
    closePicker() {
      this.picker.visible = false;
    },
    pickerSelected(item) {
      if (this.picker.slot === "extensions")
        return this.selection.extensions.includes(item.id);
      if (this.picker.slot === "cabinet")
        return this.selection.cabinetId === item.id;
      if (Object.prototype.hasOwnProperty.call(KIT_LABELS, this.picker.slot))
        return this.selection.kitParts[this.picker.slot] === item.id;
      return this.selection[this.picker.slot] === item.id;
    },
    choosePickerItem(item) {
      const slot = this.picker.slot;
      if (slot === "extensions") {
        this.toggleExtension(item.id, this.picker.source);
        return;
      }
      // 再次点击已选商品即取消该选配位，允许留空
      if (this.pickerSelected(item)) {
        this.requestClear(slot);
        return;
      }
      const kind =
        slot === "cabinet"
          ? "cabinet"
          : Object.prototype.hasOwnProperty.call(KIT_LABELS, slot)
          ? "kit"
          : "step";
      this.requestBreak({
        kind,
        slot,
        id: item.id,
        source: this.picker.source,
      });
    },
    loginForPrice() {
      this.$store.commit("login");
      this.$store.commit("setNotice", "演示登录成功，价格已显示");
    },
    // ---- 配置清单：逐行调整数量（1~99，数量为 1 再减即移除该商品） ----
    setRowQty(row, value) {
      // 输入框不允许直接改成 0 或空：只做正常数量更新，移除交给减号按钮
      const qty = Math.min(99, Math.max(1, parseInt(value, 10) || 1));
      this.$set(this.rowQuantities, row.key, qty);
    },
    stepRowQty(row, delta) {
      const current = this.rowQtyOf(row.key);
      // 数量为 1 时再按减号：移除该商品所在选配位
      if (delta < 0 && current <= 1) {
        this.removeRowModule(row);
        return;
      }
      this.setRowQty(row, current + delta);
    },
    // 移除配置清单某行对应的商品：机柜清空整方案，铝件清该槽位，
    // 扩展配件移除单件，其余单选项直接清空该步骤
    removeRowModule(row) {
      if (row.key === "cabinet") {
        this.requestClear("cabinet");
        this.$store.commit("setNotice", "已移除机柜");
        return;
      }
      if (row.key.startsWith("kit-")) {
        this.requestClear(row.slot);
        this.$delete(this.rowQuantities, row.key);
        this.$store.commit("setNotice", "已移除" + row.label);
        return;
      }
      if (row.key.startsWith("extension-")) {
        const id = row.product && row.product.id;
        if (id) this.toggleExtension(id);
        // 扩展行按数组索引生成 key，移除后索引重排，直接清空自定义数量，回到默认 1
        this.rowQuantities = {};
        this.$store.commit("setNotice", "已移除扩展配件");
        return;
      }
      this.requestClear(row.slot);
      this.$delete(this.rowQuantities, row.key);
      this.$store.commit("setNotice", "已移除" + row.label);
    },
    // ---- 生成方案快照（加入购物车 / 报价单 / 立即购买共用），失败返回 null ----
    async buildScheme() {
      if (!this.retailProductIds.length) {
        this.$store.commit("setNotice", "请至少选择一项配置后再继续");
        return null;
      }
      const kitSlotById = Object.entries(this.selection.kitParts).reduce(
        (map, [slot, id]) => ({ ...map, [id]: KIT_LABELS[slot] }),
        {}
      );
      const coreIds = this.retailProductIds.filter(
        (id) => !this.selection.extensions.includes(id)
      );
      // 行 key → 数量：配置清单中调整过的数量（铝件固定 1）
      const qtyByKey = {};
      this.finalRows.forEach((row) => {
        qtyByKey[row.key] = row.key.startsWith("kit-")
          ? 1
          : this.rowQtyOf(row.key);
      });
      // 同一商品多行时数量累加
      const qtyForCoreId = (id) => {
        let n = 0;
        this.finalRows.forEach((row) => {
          if (row.product && row.product.id === id) n += qtyByKey[row.key];
        });
        return n || 1;
      };
      // parts 是方案快照的最小单元，qty 取清单调整后的数量
      const parts = [
        ...coreIds.map((id) => ({
          id,
          qty: qtyForCoreId(id),
          module:
            id === this.selection.cabinetId
              ? "机柜"
              : kitSlotById[id] || this.product(id).type,
          section: "core",
        })),
        ...this.selection.extensions.map((id) => ({
          id,
          qty: qtyForCoreId(id),
          module: "扩展配件",
          section: "extras",
        })),
      ];
      // 从购物车进入修改时沿用原方案 id，加入购物车会覆盖原方案而不是新增一条
      const editingScheme =
        this.$route && this.$route.query.edit
          ? this.$store.state.selectedScheme
          : null;
      // scheme 为前端方案快照：报价单、购物车方案行、订单展示都读取这份结构
      const scheme = {
        id: editingScheme ? editingScheme.id : "ONE-STOP-" + Date.now(),
        name:
          (this.orientation ? this.orientation.name : "一站式方案") +
          (this.cabinet ? " · " + this.cabinet.name : " · 自定义配置"),
        model: this.cabinet ? this.cabinet.model : "待确认",
        tag: this.priceMode === "bundle" ? "套餐价" : "组合价",
        direction: this.orientation ? this.orientation.name : "一站式方案",
        scene: this.orientation ? this.orientation.scene : "",
        workpiece: "按实际业务场景确认",
        features: ["机柜联动铝件5件套", "立柱/光路联动", "激光器/打标卡联动"],
        oneStop: true,
        customized: this.priceMode !== "bundle",
        priceMode: this.priceMode,
        packagePriceFen: this.totalPrice,
        retailTotalFen: this.retailTotal,
        savingsFen: this.priceMode === "bundle" ? this.savings : 0,
        parts,
      };
      await oneStopApi.saveDraft({ selection: this.selection, scheme });
      this.$store.commit("setSelectedScheme", scheme);
      this.$store.commit(
        "setSelected",
        parts.map((item) => item.id)
      );
      return scheme;
    },
    // 加入购物车：方案整体作为一行写入购物车
    async confirmAddCart() {
      const scheme = await this.buildScheme();
      if (!scheme) return;
      this.$store.commit("addSchemeCart", scheme);
      this.$store.commit("setNotice", "方案已加入购物车");
      this.$router.push("/cart");
    },
    // 生成报价单：带当前方案进入报价单页
    async confirmQuote() {
      const scheme = await this.buildScheme();
      if (!scheme) return;
      this.$router.push("/quote");
    },
    // 立即购买：写入购物车后直接进入结算
    async confirmBuyNow() {
      const scheme = await this.buildScheme();
      if (!scheme) return;
      this.$store.commit("addSchemeCart", scheme);
      this.$router.push("/checkout");
    },
    // 兼容历史调用：生成方案并进入配置确认页
    async confirmConfiguration() {
      const scheme = await this.buildScheme();
      if (scheme) this.$router.push("/diy-confirm");
    },
  },
};
