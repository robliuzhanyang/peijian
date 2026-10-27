<!--
  页面：正式采购报价单（H5）
  路由：/quote ｜ 分组：选型与采购
  作用：与 PC 端同一口径、同一版式的正式报价单：
        居中的公司名与「报 价 单」标题、左右两栏抬头（客户 / 发件人、地址、单号、交货周期）、
        八列带框明细表（序号 / 产品名称 / 规格型号 / 数量 / 单位 / 单价 / 总价 / 备注）、
        合计大写、报价说明、报价人与客户确认盖章区。
        支持导出 PDF（浏览器打印）与导出图片（Canvas 绘制，同版式含电子章）。
  数据：state.selectedScheme + state.selected；
        客户名称 / 联系人 / 电话取 getters.currentCompany
-->
<template>
  <div class="m-quote">
    <!-- 操作条：返回与导出（打印/导出时隐藏） -->
    <div class="m-quote-tools">
      <button
        class="btn sm"
        type="button"
        style="margin-right: auto"
        @click="$router.back()"
      >
        返回
      </button>
      <button class="btn sm" type="button" @click="exportImage">导出图片</button>
      <button class="btn primary sm" type="button" @click="exportPdf">
        导出 PDF
      </button>
    </div>

    <!-- 报价单纸张：整体黑色细边框，与线下单据一致 -->
    <section ref="sheet" class="m-quote-sheet">
      <!-- 抬头：公司名 + 单据名 + 左右两栏信息 -->
      <div class="mq-head">
        <h1 class="mq-company">{{ seller.name }}</h1>
        <h2 class="mq-title">报 价 单</h2>

        <div class="mq-meta">
          <!-- 左栏：客户信息 -->
          <div class="mq-meta-col">
            <p><em>客户名称：</em><b>{{ customerName }}</b></p>
            <p><em>联 系 人：</em><b>{{ customerContact }}</b></p>
            <p><em>联系电话：</em><b>{{ customerPhone }}</b></p>
          </div>
          <!-- 右栏：报价方信息与单据信息 -->
          <div class="mq-meta-col">
            <p><em>发 件 人：</em><b>{{ seller.sender }}/{{ seller.phone }}</b></p>
            <p><em>公司地址：</em><b>{{ seller.address }}</b></p>
            <p><em>报价单号：</em><b>{{ quoteNo }}/{{ quoteDateCn }}</b></p>
            <p><em>交货周期：</em><b>{{ delivery }}</b></p>
          </div>
        </div>
      </div>

      <!-- 明细表：八列全框线 -->
      <table class="mq-table">
        <colgroup>
          <col style="width: 7%" />
          <col style="width: 25%" />
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
      <div v-if="!rows.length" class="mq-empty">
        没有组合，请先选配。
        <router-link class="btn sm" style="margin-top: 8px" to="/diy"
          >去一站式选配</router-link
        >
      </div>

      <!-- 报价说明 + 落款盖章 -->
      <div v-else class="mq-extra">
        <p class="mq-extra-title">报价说明：</p>
        <p v-for="(note, i) in noteLines" :key="i" class="mq-extra-line">
          {{ i + 1 }}. {{ note }}
        </p>

        <div class="mq-sign">
          <div class="mq-sign-col">
            <p>报价人：{{ seller.sender }}</p>
          </div>
          <div class="mq-sign-col">
            <p>客户确认（盖章）：</p>
            <p class="mq-sign-date">日期：　　年　　月　　日</p>
          </div>
        </div>

        <!-- 电子章压在报价人落款上 -->
        <CompanySeal :size="82" class="mq-seal" />
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
// 方案方向定义（direction id 转中文名）
import catalog from "@/mock/catalog.json";

// 明细表最少显示行数（不足时补空行，保持单据的表格观感）
const MIN_ROWS = 6;

export default {
  components: { CompanySeal },
  data() {
    const now = new Date();
    return {
      seller: QUOTE_SELLER,
      quoteNo: buildQuoteNo(now),
      quoteDateCn: formatCnDate(now),
      // 交货周期（后续可由订单/合同接口覆盖）
      delivery: QUOTE_DELIVERY,
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
    scheme() {
      return this.$store.state.selectedScheme;
    },
    selected() {
      return this.$store.state.selected;
    },
    // 客户信息：取当前企业资料
    currentCompany() {
      return this.$store.getters.currentCompany;
    },
    customerName() {
      return this.currentCompany ? this.currentCompany.name : "—";
    },
    customerContact() {
      return (this.currentCompany && this.currentCompany.contact) || "—";
    },
    customerPhone() {
      return (this.currentCompany && this.currentCompany.phone) || "—";
    },
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
    partCount() {
      return this.rows.reduce((n, r) => n + (r.qty || 1), 0);
    },
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
    // 导出图片所需数据（与页面同口径）
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
    // 导出 PNG
    exportImage() {
      if (!this.rows.length) {
        this.$store.commit("setNotice", "当前没有可报价的配置，请先完成选配");
        return;
      }
      exportQuoteImage(this.exportModel());
      this.$store.commit("setNotice", "报价单图片已开始下载");
    },
    // 导出 PDF：浏览器打印另存为 PDF
    exportPdf() {
      if (!this.rows.length) {
        this.$store.commit("setNotice", "当前没有可报价的配置，请先完成选配");
        return;
      }
      this.$store.commit(
        "setNotice",
        "请在打印窗口中选择「另存为 PDF」保存报价单"
      );
      window.print();
    },
  },
};
</script>

<style>
.m-quote {
  padding-bottom: 12px;
}
/* 操作条 */
.m-quote-tools {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 10px;
}
/* ===== 报价单纸张：黑框、宋体 ===== */
.m-quote-sheet {
  border: 1px solid #111;
  background: #fff;
  color: #111;
  font-family: "SimSun", "Songti SC", "宋体", "Times New Roman", serif;
}
/* 抬头区 */
.mq-head {
  padding: 12px 10px 8px;
}
.mq-company {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 1px;
  text-align: center;
}
.mq-title {
  margin: 8px 0 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 7px;
  text-indent: 7px;
  text-align: center;
}
/* 抬头信息：左右两栏 */
.mq-meta {
  display: flex;
  gap: 10px;
  font-size: 8.5px;
  line-height: 1.9;
}
.mq-meta-col {
  flex: 1 1 0;
  min-width: 0;
}
.mq-meta-col p {
  display: flex;
  margin: 0;
}
.mq-meta-col em {
  flex: 0 0 auto;
  font-style: normal;
  white-space: nowrap;
}
.mq-meta-col b {
  min-width: 0;
  font-weight: 400;
  word-break: break-all;
}

/* ===== 明细表：八列全框线 ===== */
.mq-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 7.5px;
}
.mq-table th,
.mq-table td {
  padding: 5px 2px;
  border: 1px solid #111;
  text-align: center;
  vertical-align: middle;
  word-break: break-all;
}
.mq-table th {
  height: 26px;
  font-weight: 700;
  line-height: 1.3;
}
.mq-table tbody tr {
  height: 26px;
}
.mq-table .cell-name {
  padding-left: 4px;
  text-align: left;
}
.mq-table .cell-total-label {
  padding-left: 4px;
  text-align: left;
}
.mq-table .cell-total-value {
  font-weight: 700;
}

/* ===== 报价说明 + 落款 ===== */
.mq-extra {
  position: relative;
  min-height: 192px;
  padding: 7px 10px 10px;
}
.mq-extra-title {
  margin: 0 0 3px;
  font-size: 9px;
}
.mq-extra-line {
  margin: 0 0 2px;
  color: #222;
  font-size: 8px;
  line-height: 1.65;
}
.mq-sign {
  position: absolute;
  right: 10px;
  bottom: 22px;
  left: 10px;
  display: flex;
  align-items: flex-start;
  font-size: 9px;
}
.mq-sign-col {
  flex: 1 1 0;
  min-width: 0;
}
.mq-sign-col:first-child {
  flex: 0 0 46%;
}
.mq-sign p {
  margin: 0;
}
.mq-sign-date {
  margin-top: 6px !important;
  color: #333;
  font-size: 8.5px;
}
/* 电子章压在报价人落款上 */
.mq-seal {
  position: absolute;
  bottom: 4px;
  left: 16px;
  opacity: 0.86;
}

/* 空态 */
.mq-empty {
  padding: 12px 10px 16px;
  color: #333;
  font-size: 11px;
}

/* 打印 / 另存为 PDF：只保留报价单纸张 */
@media print {
  @page {
    size: A4 portrait;
    margin: 10mm;
  }
  body {
    background: #fff !important;
  }
  .app > .m-header,
  .app > .tabbar,
  .app > .float-quick,
  .app > .toast,
  .m-quote-tools {
    display: none !important;
  }
  .main {
    padding: 0 !important;
    width: auto !important;
  }
  .m-quote-sheet {
    margin: 0 !important;
    border: 1px solid #111 !important;
  }
  .mq-company {
    font-size: 20px;
  }
  .mq-title {
    font-size: 17px;
  }
  .mq-meta {
    font-size: 11px;
  }
  .mq-table {
    font-size: 10.5px;
  }
  .mq-table th,
  .mq-table td {
    padding: 6px 3px;
  }
  .mq-extra {
    min-height: 200px;
  }
  .mq-extra-title {
    font-size: 11px;
  }
  .mq-extra-line {
    font-size: 10px;
  }
  .mq-sign {
    font-size: 11px;
  }
  .mq-sign-date {
    font-size: 10.5px;
  }
  .mq-seal {
    width: 104px;
    height: 104px;
  }
}
</style>
