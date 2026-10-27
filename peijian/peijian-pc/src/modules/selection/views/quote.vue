<!--
  页面：正式采购报价单（quote.vue）
  路由：/quote ｜ 分组：选型与采购
  作用：把所选配置生成正式报价单，版式对齐线下纸质报价单：
        居中的公司名与「报 价 单」标题、左右两栏抬头（客户 / 发件人、地址、单号、交货周期）、
        八列带框明细表（序号 / 产品名称 / 规格型号 / 数量 / 单位 / 单价 / 总价 / 备注）、
        合计大写、报价说明、报价人与客户确认盖章区。
        支持导出 PDF（浏览器打印）与导出 PNG 图片（Canvas 绘制，同版式含电子章）。
  数据：Vuex state.selectedScheme（组合对象或 null）+ state.selected（商品 id 数组）；
        客户名称 / 联系人 / 电话取当前企业（getters.currentCompany）
-->
<template>
  <div class="quote-page">
    <!-- 操作条：导出与返回（打印/导出时隐藏） -->
    <div class="quote-bar">
      <div>
        <h1>采购报价单</h1>
        <small
          >按所选配置生成正式报价单，可导出 PDF 或图片；报价单加盖报价专用章后生效</small
        >
      </div>
      <div class="quote-tools">
        <button class="btn" type="button" @click="exportImage">导出图片</button>
        <button class="btn primary" type="button" @click="exportPdf">
          导出 PDF
        </button>
        <router-link class="btn soft" to="/diy?edit=1">修改组合</router-link>
      </div>
    </div>

    <!-- 正式报价单纸张：整体黑色细边框，与线下单据一致 -->
    <section ref="sheet" class="quote-sheet">
      <!-- 抬头：公司名 + 单据名 + 左右两栏信息 -->
      <div class="qd-head">
        <h1 class="qd-company">{{ seller.name }}</h1>
        <h2 class="qd-title">报 价 单</h2>

        <div class="qd-meta">
          <!-- 左栏：客户信息 -->
          <div class="qd-meta-col">
            <p><em>客户名称：</em><b>{{ customerName }}</b></p>
            <p><em>联 系 人：</em><b>{{ customerContact }}</b></p>
            <p><em>联系电话：</em><b>{{ customerPhone }}</b></p>
          </div>
          <!-- 右栏：报价方信息与单据信息 -->
          <div class="qd-meta-col">
            <p>
              <em>发 件 人：</em
              ><b>{{ seller.sender }}/{{ seller.phone }}</b>
            </p>
            <p><em>公司地址：</em><b>{{ seller.address }}</b></p>
            <p><em>报价单号：</em><b>{{ quoteNo }}/{{ quoteDateCn }}</b></p>
            <p><em>交货周期：</em><b>{{ delivery }}</b></p>
          </div>
        </div>
      </div>

      <!-- 明细表：八列全框线 -->
      <table class="qd-table">
        <colgroup>
          <col style="width: 6%" />
          <col style="width: 26%" />
          <col style="width: 16%" />
          <col style="width: 7%" />
          <col style="width: 6%" />
          <col style="width: 13%" />
          <col style="width: 13%" />
          <col style="width: 13%" />
        </colgroup>
        <thead>
          <tr>
            <th>序号</th>
            <th>产品名称</th>
            <th>规格型号</th>
            <th>数量</th>
            <th>单位</th>
            <th>单价（RMB）</th>
            <th>总价（RMB）</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableRows" :key="row.key">
            <td>{{ row.index }}</td>
            <td class="cell-name">{{ row.name }}</td>
            <td>{{ row.model }}</td>
            <td>{{ row.qty }}</td>
            <td>{{ row.unit }}</td>
            <td>{{ row.priceText }}</td>
            <td>{{ row.totalText }}</td>
            <td>{{ row.remark }}</td>
          </tr>
        </tbody>
        <tfoot v-if="rows.length">
          <tr>
            <td colspan="6" class="cell-total-label">
              合计金额（大写）：{{ totalWords }}
            </td>
            <td class="cell-total-value">{{ money(total) }}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <!-- 无配置时的空态 -->
      <div v-if="!rows.length" class="qd-empty">
        没有组合，请先选配或查看真实组合。
        <router-link class="btn primary sm" style="margin-top: 12px" to="/diy"
          >去一站式选配</router-link
        >
      </div>

      <!-- 报价说明 + 落款盖章：同一区块，底部留白供手写与盖章 -->
      <div v-else class="qd-extra">
        <p class="qd-extra-title">报价说明：</p>
        <p v-for="(note, i) in noteLines" :key="i" class="qd-extra-line">
          {{ i + 1 }}. {{ note }}
        </p>

        <div class="qd-sign">
          <div class="qd-sign-col">
            <p>报价人：{{ seller.sender }}</p>
          </div>
          <div class="qd-sign-col">
            <p>客户确认（盖章）：</p>
            <p class="qd-sign-date">日期：　　　年　　月　　日</p>
          </div>
        </div>

        <!-- 电子章压在报价人落款上 -->
        <CompanySeal :size="132" class="qd-seal" />
      </div>
    </section>
  </div>
</template>

<script>
// 领域工具：金额分转元、空字段占位
import { money, fieldValue } from "@/domain/productFields";
// 报价单口径：报价方抬头、日期、单号、交货周期、金额大写
import {
  QUOTE_SELLER,
  QUOTE_VALID_DAYS,
  QUOTE_DELIVERY,
  formatDate,
  formatCnDate,
  addDays,
  buildQuoteNo,
  amountInWords,
} from "@/modules/selection/domain/quoteDoc";
// 图片导出：Canvas 绘制同版式报价单
import { exportQuoteImage } from "@/modules/selection/domain/quoteImage";
import CompanySeal from "@/modules/selection/components/CompanySeal.vue";
// 方案方向定义（用于把 direction id 转中文名）
import catalog from "@/mock/catalog.json";

// 明细表最少显示行数（不足时补空行，保持单据的表格观感）
const MIN_ROWS = 8;

export default {
  components: { CompanySeal },
  data() {
    const now = new Date();
    return {
      // 报价方抬头（与盖章主体一致）
      seller: QUOTE_SELLER,
      // 单号与日期在进入页面时确定，导出图片 / 打印保持一致
      quoteNo: buildQuoteNo(now),
      quoteDateCn: formatCnDate(now),
      // 交货周期（后续可由订单/合同接口覆盖）
      delivery: QUOTE_DELIVERY,
      // 报价说明：有效期、税费、质保与效力
      notes: [
        `本报价单自 ${formatCnDate(now)} 起 ${QUOTE_VALID_DAYS} 天内有效（有效期至 ${formatDate(
          addDays(now, QUOTE_VALID_DAYS)
        )}），逾期需重新确认。`,
        "报价含 13% 增值税专用发票，运费与上门安装调试费用另计。",
        "整机质保 12 个月，易损件与耗材按实际使用情况更换。",
        "本报价为参考报价，最终以双方签订的合同为准。",
      ],
    };
  },
  computed: {
    // 当前组合对象（组合选型模式有值；自定义选配为 null）
    scheme() {
      return this.$store.state.selectedScheme;
    },
    // 自定义选配的商品 id 列表
    selected() {
      return this.$store.state.selected;
    },
    // 客户公司名称：取当前企业
    currentCompany() {
      return this.$store.getters.currentCompany;
    },
    customerName() {
      return this.currentCompany ? this.currentCompany.name : "—";
    },
    // 客户联系人 / 电话：企业资料里已有字段，直接带入单据
    customerContact() {
      return (this.currentCompany && this.currentCompany.contact) || "—";
    },
    customerPhone() {
      return (this.currentCompany && this.currentCompany.phone) || "—";
    },
    // 组合方向中文名（id 未命中时回退原值）
    directionName() {
      if (!this.scheme) return "";
      const d = (catalog.directions || []).find(
        (x) => x.id === this.scheme.direction
      );
      return d ? d.name : this.scheme.direction;
    },
    // 表格行归一化：组合模式取 parts，自定义模式映射为 {id, qty:1}
    rows() {
      if (this.scheme) return this.scheme.parts;
      return this.selected.map((id) => ({ id, qty: 1 }));
    },
    // 表格渲染行：真实明细 + 补齐空行（空行不参与合计）
    tableRows() {
      const list = this.rows.map((row, i) =>
        Object.assign({ key: "row-" + i, index: i + 1 }, this.formatRow(row))
      );
      for (let i = list.length; i < MIN_ROWS; i++) {
        list.push({ key: "blank-" + i, index: "", name: "", model: "" });
      }
      return list;
    },
    // 组合配置总件数（含数量）
    partCount() {
      return this.rows.reduce((n, r) => n + (r.qty || 1), 0);
    },
    // 合计（分）：任一部品未报价则整单返回 null，由 money 渲染为「待报价」
    total() {
      if (this.scheme && this.scheme.oneStop)
        return this.scheme.packagePriceFen;
      if (this.rows.some((r) => this.product(r.id).priceFen == null))
        return null;
      return this.rows.reduce(
        (n, r) => n + this.product(r.id).priceFen * (r.qty || 1),
        0
      );
    },
    // 合计金额大写
    totalWords() {
      return amountInWords(this.total);
    },
    // 报价说明：有组合时首行补充方案信息
    noteLines() {
      if (!this.scheme) return this.notes;
      const head = `方案：${this.scheme.name}（组合型号 ${
        this.scheme.model || "待补充"
      } ｜ ${this.directionName} ｜ 共 ${this.partCount} 件）`;
      return [head].concat(this.notes);
    },
  },
  methods: {
    money,
    // 按 id 取商品，未命中返回空对象避免模板报错
    product(id) {
      return this.$store.getters.product(id) || {};
    },
    // 单行明细：名称 / 型号 / 数量 / 单位 / 单价 / 总价 / 备注
    formatRow(p) {
      const item = this.product(p.id);
      const qty = p.qty || 1;
      const price = item.priceFen;
      return {
        name: item.name || "—",
        model: fieldValue(item.model),
        qty,
        // 单位：商品表暂未维护，默认「台」，后端补 unit 字段后自动生效
        unit: item.unit || "台",
        priceText: money(price),
        totalText: price == null ? "待报价" : money(price * qty),
        // 备注：一站式方案里带出部品所属模块，自定义选配留空
        remark: p.module || "",
      };
    },
    // 导出图片所需的完整数据（与页面同口径）
    exportModel() {
      return {
        seller: this.seller,
        customerName: this.customerName,
        customerContact: this.customerContact,
        customerPhone: this.customerPhone,
        quoteNo: this.quoteNo,
        quoteDateCn: this.quoteDateCn,
        delivery: this.delivery,
        rows: this.rows.map((row, i) =>
          Object.assign({ index: i + 1 }, this.formatRow(row))
        ),
        blankRows: Math.max(0, MIN_ROWS - this.rows.length),
        totalText: this.total == null ? "待报价" : money(this.total),
        totalWords: this.totalWords,
        notes: this.noteLines,
      };
    },
    // 导出 PNG 图片
    exportImage() {
      if (!this.rows.length) {
        this.$store.commit("setNotice", "当前没有可报价的配置，请先完成选配");
        return;
      }
      exportQuoteImage(this.exportModel());
      this.$store.commit("setNotice", "报价单图片已开始下载");
    },
    // 导出 PDF：另开打印窗口只放报价单纸张，避免站点导航/页脚进入打印稿
    exportPdf() {
      if (!this.rows.length) {
        this.$store.commit("setNotice", "当前没有可报价的配置，请先完成选配");
        return;
      }
      const sheet = this.$refs.sheet;
      const win = window.open("", "_blank");
      if (!win) {
        // 弹窗被拦截时退回当前页打印
        this.$store.commit(
          "setNotice",
          "请在打印窗口中选择「另存为 PDF」保存报价单"
        );
        window.print();
        return;
      }
      // 复制当前页全部样式（开发环境为 style 标签，构建后为 link），保证版式一致
      const styles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((node) => node.outerHTML)
        .join("");
      win.document.write(
        `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><base href="${document.baseURI}"><title>报价单-${this.quoteNo}</title>${styles}` +
          "<style>@page{size:A4 portrait;margin:12mm}body{margin:0;background:#fff}" +
          ".quote-sheet{max-width:none;box-shadow:none}" +
          ".quote-bar{display:none}</style></head><body>" +
          sheet.outerHTML +
          "</body></html>"
      );
      win.document.close();
      win.focus();
      this.$store.commit(
        "setNotice",
        "请在打印窗口中选择「另存为 PDF」保存报价单"
      );
      // 等样式与字体应用后再唤起打印
      setTimeout(() => win.print(), 500);
    },
  },
};
</script>

<style>
.quote-page {
  padding-bottom: 20px;
}
/* 操作条：标题 + 导出按钮 */
.quote-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
}
.quote-bar h1 {
  margin: 0 0 6px;
  font-size: 24px;
}
.quote-bar small {
  color: var(--muted);
}
.quote-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ===== 报价单纸张：黑框、宋体，贴近线下正式单据 ===== */
.quote-sheet {
  max-width: 860px;
  margin: 0 auto;
  border: 1px solid #111;
  background: #fff;
  color: #111;
  font-family: "SimSun", "Songti SC", "宋体", "Times New Roman", serif;
  box-shadow: 0 10px 30px rgba(23, 54, 95, 0.08);
}
/* 抬头区 */
.qd-head {
  padding: 26px 30px 22px;
}
.qd-company {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 3px;
  text-align: center;
}
.qd-title {
  margin: 16px 0 20px;
  font-size: 26px;
  font-weight: 700;
  /* 字间距放大，末尾负缩进保证整体视觉居中 */
  letter-spacing: 14px;
  text-indent: 14px;
  text-align: center;
}
.qd-meta {
  display: flex;
  gap: 24px;
  font-size: 14px;
  line-height: 2.05;
}
.qd-meta-col {
  flex: 1 1 0;
  min-width: 0;
}
.qd-meta-col p {
  display: flex;
  margin: 0;
}
.qd-meta-col em {
  flex: 0 0 auto;
  font-style: normal;
  white-space: nowrap;
}
.qd-meta-col b {
  min-width: 0;
  font-weight: 400;
  word-break: break-all;
}

/* ===== 明细表：八列全框线，边框与纸张外框重合 ===== */
.qd-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 14px;
}
.qd-table th,
.qd-table td {
  padding: 9px 6px;
  border: 1px solid #111;
  text-align: center;
  vertical-align: middle;
  word-break: break-all;
}
.qd-table th {
  height: 42px;
  font-weight: 700;
}
.qd-table tbody tr {
  height: 40px;
}
/* 产品名称左对齐，长名称更好读 */
.qd-table .cell-name {
  padding-left: 10px;
  text-align: left;
}
/* 合计行：左侧大写金额，右侧数字金额 */
.qd-table .cell-total-label {
  padding-left: 10px;
  text-align: left;
}
.qd-table .cell-total-value {
  font-weight: 700;
}

/* ===== 报价说明 + 落款：同一区块，底部留白供盖章 ===== */
.qd-extra {
  position: relative;
  min-height: 300px;
  padding: 12px 30px 26px;
}
.qd-extra-title {
  margin: 0 0 6px;
  font-size: 14px;
}
.qd-extra-line {
  margin: 0 0 3px;
  color: #222;
  font-size: 12.5px;
  line-height: 1.75;
}
.qd-sign {
  position: absolute;
  right: 30px;
  bottom: 40px;
  left: 30px;
  display: flex;
  align-items: flex-start;
  font-size: 14px;
}
.qd-sign-col {
  flex: 1 1 0;
  min-width: 0;
}
.qd-sign-col:first-child {
  flex: 0 0 48%;
}
.qd-sign p {
  margin: 0;
}
.qd-sign-date {
  margin-top: 10px !important;
}
/* 电子章压在报价人落款上 */
.qd-seal {
  position: absolute;
  bottom: 4px;
  left: 34px;
}

/* 空态 */
.qd-empty {
  padding: 24px 30px 30px;
  color: #333;
  font-size: 14px;
}

/* 打印 / 另存为 PDF：只保留报价单纸张 */
@media print {
  @page {
    size: A4 portrait;
    margin: 12mm;
  }
  body {
    background: #fff !important;
  }
  .app > .brand-header,
  .app > .navbar,
  .app > .footer,
  .app > .site-footer,
  .app > .toast,
  .app > .float-quick,
  .quote-bar {
    display: none !important;
  }
  .main {
    display: block !important;
    width: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .quote-sheet {
    max-width: none !important;
    margin: 0 !important;
    box-shadow: none !important;
  }
  .qd-head {
    padding: 14px 18px 12px;
  }
  .qd-company {
    font-size: 26px;
  }
  .qd-title {
    margin: 10px 0 12px;
    font-size: 22px;
  }
  .qd-table {
    font-size: 11.5px;
  }
  .qd-table th,
  .qd-table td {
    padding: 6px 4px;
  }
  .qd-table tbody tr {
    height: 30px;
  }
  .qd-extra {
    min-height: 220px;
    padding: 10px 18px 18px;
  }
  .qd-sign {
    right: 18px;
    bottom: 26px;
    left: 18px;
  }
  .qd-seal {
    bottom: 0;
    left: 22px;
  }
}
</style>
