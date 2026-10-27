<!--
  页面：合同预览与回传（contract-detail.vue）
  路由：/contract-detail ｜ 分组：合同与发票
  作用：展示平台按合同 md 模板渲染的正式合同——
        1) 正文来自后端合同模板（mock 读 contractTemplate.js）；
        2) 买方企业信息与平台（卖方）信息自动填入占位字段；
        3) 订单商品明细与金额（含大写）自动生成；
        4) 乙方落款自动加盖平台电子合同专用章，甲方保留盖章位置；
        待买方签署合同保留"确认签署 / 回传盖章文件"入口，已生效可下载。
  数据：contractApi.detail(id) + contractApi.template()，订单与买方企业读 Vuex
-->
<template>
  <div class="contract-detail-page">
    <!-- 页头：标题 + 关联订单 + 状态 -->
    <div class="page-title contract-head-bar">
      <div>
        <h1>合同预览与回传</h1>
        <small v-if="contract">
          合同编号 {{ contract.id }} · 关联订单 {{ contract.orderId }}
        </small>
        <small v-else>关联订单 {{ $route.query.id || "未选择" }}</small>
      </div>
      <span v-if="contract" class="badge" :class="statusClass">
        {{ contract.status }}
      </span>
    </div>

    <!-- 合同文档：A4 纸张风格 -->
    <section v-if="contract" class="contract-sheet card">
      <!-- 文档工具栏 -->
      <div class="sheet-toolbar">
        <span class="sheet-tip">电子合同由平台生成，字段与印章自动填入</span>
        <div class="action-row">
          <button v-if="isSigned" class="btn primary" @click="download">
            下载合同 PDF
          </button>
          <template v-else>
            <button class="btn primary" @click="sign">确认签署</button>
            <label class="btn">
              回传盖章文件
              <input
                type="file"
                accept=".pdf,.png,.jpg"
                hidden
                @change="file = $event.target.files[0] && $event.target.files[0].name"
              />
            </label>
          </template>
          <router-link class="btn" to="/user/contracts">返回合同列表</router-link>
        </div>
      </div>
      <p v-if="file" class="tiny sheet-file-tip">
        已选择：{{ file }}，签署后请回传盖章文件。
      </p>

      <!-- md 渲染的合同正文；印章在 mounted/updated 后挂载到锚点 -->
      <div
        ref="doc"
        class="contract-doc"
        :class="{ 'is-signed': isSigned }"
        v-html="docHtml"
      ></div>
    </section>

    <!-- 查不到合同：保留"待平台生成"占位 -->
    <section v-else class="card sheet-doc">
      <h2>采购合同资料</h2>
      <div class="spec-grid">
        <div class="field-row">
          <span>合同编号</span><strong>待平台生成</strong>
        </div>
        <div class="field-row">
          <span>订单编号</span
          ><strong>{{ $route.query.id || "待选择" }}</strong>
        </div>
        <div class="field-row">
          <span>买方企业</span><strong>待企业认证资料回填</strong>
        </div>
        <div class="field-row">
          <span>签署状态</span><strong>待生成</strong>
        </div>
      </div>
      <p class="alert">合同正文、金额及双方主体以合同接口返回为准。</p>
      <div class="action-row">
        <button v-if="canCreate" class="btn primary" @click="create">
          生成采购合同
        </button>
        <button class="btn" disabled>下载合同（待生成）</button>
        <router-link class="btn" to="/user/contracts">返回合同列表</router-link>
      </div>
    </section>
  </div>
</template>
<script>
// 合同接口：详情 / 模板 / 签署 / 生成
import { contractApi } from "@/modules/billing/api";
import { renderMarkdown } from "@/modules/billing/domain/markdown";
import { fillContractTemplate } from "@/modules/billing/domain/contractRender";
import ContractSeal from "@/modules/billing/components/ContractSeal.vue";

export default {
  name: "ContractDetail",
  components: { ContractSeal },
  data() {
    return {
      // 合同详情；接口查不到时为 null，展示待生成占位
      contract: null,
      // 合同模板 md（后端下发，mock 读本地）
      templateMd: "",
      // 已选择的回传文件名（仅前端展示）
      file: "",
    };
  },
  computed: {
    // 是否已签署生效（生效后才盖合同章）
    isSigned() {
      return this.contract && this.contract.status === "已生效";
    },
    statusClass() {
      return this.isSigned ? "green" : "gold";
    },
    // 关联订单（明细与金额来源）
    order() {
      if (!this.contract) return null;
      return (
        this.$store.state.orders.find(
          (o) => o.id === this.contract.orderId,
        ) || null
      );
    },
    // 买方企业：优先按合同买方名称匹配企业列表，否则取当前企业
    buyerCompany() {
      if (!this.contract) return {};
      const list = this.$store.state.companies || [];
      return (
        list.find((c) => c.name === this.contract.buyer) ||
        this.$store.getters.currentCompany ||
        {}
      );
    },
    // 未生成合同时，来源 id 对应真实订单才允许直接生成
    canCreate() {
      return this.$store.state.orders.some(
        (o) => o.id === this.$route.query.id,
      );
    },
    // 装配 + 渲染后的合同 HTML
    docHtml() {
      if (!this.contract || !this.templateMd) return "";
      const md = fillContractTemplate({
        template: this.templateMd,
        contract: this.contract,
        order: this.order,
        buyerCompany: this.buyerCompany,
      });
      return renderMarkdown(md);
    },
  },
  async created() {
    const [c, tpl] = await Promise.all([
      contractApi.detail(this.$route.query.id),
      contractApi.template(),
    ]);
    this.contract = c;
    this.templateMd = tpl || "";
  },
  updated() {
    // v-html 重渲染或状态变化后同步印章槽
    this.mountSeal();
  },
  beforeDestroy() {
    // 销毁印章子实例，避免脱离文档的 DOM 泄漏
    if (this.sealVm) {
      this.sealVm.$destroy();
      this.sealVm = null;
    }
  },
  methods: {
    // 乙方落款印章槽：已生效挂 ContractSeal 组件，未生效显示待盖提示
    // 槽位随合同状态切换内容；v-html 字符串不变时 Vue 不会重写 DOM，
    // 因此已存在的槽也要按当前状态就地更新
    mountSeal() {
      const doc = this.$refs.doc;
      if (!doc || !this.contract) return;

      let slot = doc.querySelector(".doc-seal-slot");
      // 首次渲染：用注释锚点换出槽位
      if (!slot) {
        const walker = document.createTreeWalker(
          doc,
          NodeFilter.SHOW_COMMENT,
          null,
        );
        let node;
        while ((node = walker.nextNode())) {
          if (node.nodeValue === "SELLER_SEAL_ANCHOR") {
            slot = document.createElement("div");
            slot.className = "doc-seal-slot";
            node.parentNode.replaceChild(slot, node);
            break;
          }
        }
      }
      if (!slot) return;

      slot.classList.toggle("is-signed", !!this.isSigned);
      if (this.isSigned) {
        if (!slot.querySelector(".contract-seal")) {
          const SealClass = this.$options.components.ContractSeal;
          if (this.sealVm) {
            this.sealVm.$destroy();
            this.sealVm = null;
          }
          this.sealVm = new this.$root.constructor({
            render: (h) => h(SealClass, { props: { size: 150 } }),
          });
          this.sealVm.$mount();
          slot.innerHTML = "";
          slot.appendChild(this.sealVm.$el);
        }
      } else if (!slot.querySelector(".doc-seal-pending")) {
        slot.innerHTML =
          '<span class="doc-seal-pending">乙方电子章 · 合同生效后自动加盖</span>';
      }
    },
    // 合同文件由合同接口生成后提供下载
    download() {
      this.$store.commit("setNotice", "合同文件准备中，生成后可在此下载");
    },
    // 买方签署：状态变更为已生效并刷新；生效后印章自动盖入
    async sign() {
      if (!this.contract) return;
      await contractApi.sign(this.contract.id);
      this.$store.commit("setNotice", "合同已签署生效");
      this.contract = await contractApi.detail(this.$route.query.id);
      // 状态变化触发 docHtml 重算与 updated 盖章
    },
    // 按订单生成合同，生成后刷新本页
    async create() {
      const order = this.$store.state.orders.find(
        (o) => o.id === this.$route.query.id,
      );
      if (!order) return;
      const company = this.$store.getters.currentCompany || {};
      await contractApi.create({
        orderId: order.id,
        title: "工业配件采购合同",
        amountFen: order.totalFen,
        buyer: company.name || "当前企业",
        buyerTaxId: company.taxId || "",
      });
      this.$store.commit("setNotice", "合同已生成，待买方签署");
      this.contract = await contractApi.detail(this.$route.query.id);
    },
  },
};
</script>
