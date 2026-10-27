<!--
  页面：订单支付（pay.vue）
  路由：/pay ｜ 分组：交易与履约
  作用：支付宝安全收银台，展示订单金额与商品明细，支持支付宝扫码支付与对公转账
  数据：按 query.id 从 state.orders 查找订单，未命中时回退 lastOrder 与首条待付款订单
-->
<template>
  <div class="pay-page">
    <!-- 页头：标题 + 支付进度 -->
    <header class="pay-head">
      <div>
        <p class="pay-eyebrow">SECURE CHECKOUT · 支付宝安全收银台</p>
        <h1>订单支付</h1>
        <p class="pay-sub">
          请在 <b>15:00</b> 内完成支付，超时订单将自动关闭并可重新下单。
        </p>
      </div>
      <ol class="pay-progress">
        <li class="done"><i>1</i>提交订单</li>
        <li class="on"><i>2</i>支付订单</li>
        <li><i>3</i>完成</li>
      </ol>
    </header>

    <div v-if="order" class="pay-layout">
      <main>
        <!-- 支付方式 -->
        <section class="card pay-panel">
          <div class="between">
            <h2>选择支付方式</h2>
            <span class="badge blue">支付宝官方收银</span>
          </div>
          <div class="pay-methods">
            <button
              class="pay-method"
              :class="{ on: method === 'alipay' }"
              type="button"
              @click="method = 'alipay'"
            >
              <span class="pm-icon ali">支</span>
              <span class="pm-text"
                ><strong>支付宝扫码支付</strong
                ><small>支持余额、花呗、银行卡，实时到账</small></span
              >
              <em v-if="method === 'alipay'">已选择</em>
            </button>
            <button
              class="pay-method"
              :class="{ on: method === 'transfer' }"
              type="button"
              @click="method = 'transfer'"
            >
              <span class="pm-icon bank">转</span>
              <span class="pm-text"
                ><strong>企业对公转账</strong
                ><small>适用于合同采购与大额付款</small></span
              >
              <em v-if="method === 'transfer'">已选择</em>
            </button>
          </div>
        </section>

        <!-- 支付宝扫码收银台 -->
        <section v-if="method === 'alipay'" class="card pay-cashier">
          <div class="qr-wrap">
            <div class="qr-box">
              <svg
                viewBox="0 0 29 29"
                shape-rendering="crispEdges"
                role="img"
                aria-label="支付宝支付二维码"
              >
                <rect width="29" height="29" fill="#ffffff" />
                <rect
                  v-for="(c, i) in qrCells"
                  :key="i"
                  :x="c.x"
                  :y="c.y"
                  width="1"
                  height="1"
                  fill="#10233f"
                />
              </svg>
              <span class="qr-corner tl"></span>
              <span class="qr-corner tr"></span>
              <span class="qr-corner bl"></span>
              <span class="qr-corner br"></span>
            </div>
            <small>打开支付宝 App 扫一扫</small>
            <span class="qr-brand">支付宝安全支付</span>
          </div>
          <div class="cashier-info">
            <div class="cashier-amount">
              <small>应付金额</small>
              <p class="pay-amount">{{ money(amount) }}</p>
              <span class="badge gold">已享企业直采价</span>
            </div>
            <ol class="pay-steps">
              <li><b>1</b>打开支付宝，扫描左侧二维码</li>
              <li><b>2</b>核对订单号与应付金额</li>
              <li><b>3</b>确认付款，完成后自动跳转结果页</li>
            </ol>
            <div class="pay-countdown">
              支付剩余时间 <strong>{{ countdownText }}</strong>
            </div>
            <div class="pay-actions">
              <button class="btn primary" @click="finish">我已完成支付</button
              ><router-link
                class="btn"
                :to="{ path: '/pay-failed', query: { id: order.id } }"
                >支付遇到问题</router-link
              >
            </div>
            <p class="pay-note">
              支付即表示同意
              <router-link to="/service">《服务与支持》</router-link
              >；如需开具增值税专用发票，请在订单完成后于发票管理中申请。
            </p>
          </div>
        </section>

        <!-- 对公转账 -->
        <section v-else class="card pay-panel">
          <h2>对公账户信息</h2>
          <div class="bank-grid">
            <div><small>收款户名</small><strong>鑫戩智能装备（苏州）有限公司</strong></div>
            <div><small>开户银行</small><strong>中国银行苏州工业园区支行</strong></div>
            <div><small>银行账号</small><strong class="num">5123 6688 0910 0188</strong></div>
            <div><small>转账备注</small><strong>订单号 {{ order.id }}</strong></div>
          </div>
          <div class="notice">
            请在转账备注中填写订单号，付款后由财务在 1
            个工作日内核款；核款成功后订单自动进入发货流程。
          </div>
          <div class="pay-actions">
            <button class="btn primary" @click="finish">我已完成转账</button
            ><router-link class="btn" to="/support">联系财务核实</router-link>
          </div>
        </section>

        <!-- 安全保障 -->
        <section class="pay-security">
          <div>
            <b>担保交易</b>
            <p>货款由支付宝托管，确认收货后结算给商家。</p>
          </div>
          <div>
            <b>全程加密</b>
            <p>支付信息经 HTTPS 与支付宝风控双重校验。</p>
          </div>
          <div>
            <b>企业专票</b>
            <p>支持 13% 增值税专用发票，订单完成即可申请。</p>
          </div>
        </section>
      </main>

      <!-- 订单信息 -->
      <aside class="pay-side">
        <section class="card">
          <div class="between">
            <h2>订单信息</h2>
            <span class="badge orange">待付款</span>
          </div>
          <p class="pay-order-no">订单号 {{ order.id }}</p>
          <p class="pay-order-time">下单时间 {{ order.createdAt }}</p>
          <div class="pay-goods">
            <div v-for="l in lines" :key="l.productId" class="pay-goods-line">
              <span
                >{{ l.name }}<small
                  >{{ l.skuCode }} × {{ l.quantity }}</small
                ></span
              >
              <strong>{{ money(l.unitPriceFen * l.quantity) }}</strong>
            </div>
          </div>
          <div class="pay-sum"><span>商品合计</span><b>{{ money(amount) }}</b></div>
          <div class="pay-sum"><span>运费</span><b>包邮</b></div>
          <div class="pay-total">
            <span>应付金额</span><strong>{{ money(amount) }}</strong>
          </div>
        </section>
        <section class="card pay-help">
          <h2>支付帮助</h2>
          <p>支付未到账或需修改开票信息，请联系客户支持。</p>
          <p class="pay-help-line">客服热线 {{ hotline }}</p>
          <router-link to="/support">联系客户支持 →</router-link>
        </section>
      </aside>
    </div>

    <!-- 订单不存在时的空态 -->
    <div v-else class="card empty">
      暂无可支付订单。<router-link to="/orders">查看我的订单</router-link>
    </div>
  </div>
</template>

<script>
// 领域工具：金额分转元
import { money } from "@/domain/productFields";

export default {
  data() {
    return {
      // 当前支付方式：alipay 支付宝扫码 / transfer 对公转账
      method: "alipay",
      // 支付倒计时（秒）
      remaining: 15 * 60,
      // 客服热线（与服务页保持一致）
      hotline: "400-880-1688",
    };
  },
  computed: {
    // 当前订单：优先按路由 query.id 匹配，其次最近下单，最后取首条待付款订单
    order() {
      const orders = this.$store.state.orders || [];
      return (
        orders.find((o) => o.id === this.$route.query.id) ||
        this.$store.state.lastOrder ||
        orders.find((o) => o.status === "待付款") ||
        orders[0]
      );
    },
    // 订单行项：补全商品名称
    lines() {
      if (!this.order) return [];
      return this.order.items.map((l) => {
        const product = this.$store.getters.product(l.productId);
        return { ...l, name: product ? product.name : l.productId };
      });
    },
    // 应付金额（分）
    amount() {
      return this.order ? this.order.totalFen : 0;
    },
    // 倒计时文本 mm:ss
    countdownText() {
      const m = String(Math.floor(this.remaining / 60)).padStart(2, "0");
      const s = String(this.remaining % 60).padStart(2, "0");
      return `${m}:${s}`;
    },
    // 二维码点阵：含三个定位角与定时图案，其余按固定规则铺点
    qrCells() {
      const size = 29;
      const zones = [
        [0, 0],
        [size - 7, 0],
        [0, size - 7],
      ];
      const inZone = (x, y) =>
        zones.some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
      const inFinder = (x, y) =>
        zones.some(([fx, fy]) => {
          const dx = x - fx;
          const dy = y - fy;
          if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return false;
          const ring = Math.min(dx, dy, 6 - dx, 6 - dy);
          return ring === 0 || ring === 2 || ring === 3;
        });
      const cells = [];
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          let dark;
          if (inZone(x, y)) dark = inFinder(x, y);
          else if (x === 6 || y === 6) dark = (x + y) % 2 === 0;
          else dark = (x * 13 + y * 29 + ((x * y) % 9) * 7) % 13 < 6;
          if (dark) cells.push({ x, y });
        }
      }
      return cells;
    },
  },
  mounted() {
    // 支付倒计时，归零后停留在当前页并提示重新下单
    this.timer = setInterval(() => {
      if (this.remaining > 0) this.remaining -= 1;
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    money,
    // 确认已支付：对公转账进入待核款，线上支付直接置为已付款，并记录支付方式
    finish() {
      if (!this.order) return;
      const transfer = this.method === "transfer";
      this.$store.commit("setOrderStatus", {
        id: this.order.id,
        status: transfer ? "待核款" : "已付款",
        payMethod: transfer ? "企业对公转账" : "支付宝",
      });
      this.$router.push({
        path: "/pay-success",
        query: { id: this.order.id, pending: transfer ? "1" : undefined },
      });
    },
  },
};
</script>

<style scoped>
.pay-page {
  padding-bottom: 10px;
}
.pay-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin: 24px 0 18px;
}
.pay-eyebrow {
  margin: 0 0 6px;
  color: var(--blue);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.4px;
}
.pay-head h1 {
  font-size: 27px;
}
.pay-sub {
  margin-top: 6px;
  color: var(--muted);
  font-size: 13px;
}
.pay-sub b {
  color: #b4451f;
}
.pay-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.pay-progress li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  color: #93a1b4;
  font-size: 12px;
}
.pay-progress i {
  display: grid;
  place-items: center;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: #edf1f7;
  color: #93a1b4;
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
}
.pay-progress li.done {
  color: #2f7d4f;
  border-color: #cfe6d9;
  background: #f4fbf7;
}
.pay-progress li.done i {
  background: #2f7d4f;
  color: #fff;
}
.pay-progress li.on {
  color: var(--blue);
  border-color: #bcd2f2;
  background: #f2f7ff;
}
.pay-progress li.on i {
  background: var(--blue);
  color: #fff;
}
.pay-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
  align-items: start;
}
.pay-panel h2 {
  font-size: 17px;
}
.pay-panel > h2 {
  margin-bottom: 12px;
}
.pay-methods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 14px;
}
.pay-method {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}
.pay-method:hover {
  border-color: #bcd2f2;
}
.pay-method.on {
  border-color: var(--blue);
  background: #f6faff;
  box-shadow: 0 0 0 3px #1554c70f;
}
.pm-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  color: #fff;
  font-size: 19px;
  font-weight: 700;
}
.pm-icon.ali {
  background: linear-gradient(135deg, #1677ff, #0b4fd4);
}
.pm-icon.bank {
  background: linear-gradient(135deg, #4a5a70, #27313f);
}
.pm-text strong {
  display: block;
  font-size: 14px;
}
.pm-text small {
  display: block;
  margin-top: 3px;
  color: var(--muted);
  font-size: 11.5px;
}
.pay-method em {
  color: var(--blue);
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
}
.pay-cashier {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 26px;
  margin-top: 16px;
  padding: 24px;
}
.qr-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px;
  border: 1px solid #e3ebf6;
  border-radius: 10px;
  background: linear-gradient(180deg, #f7faff, #fff);
}
.qr-box {
  position: relative;
  padding: 12px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 6px 18px #10233f14;
}
.qr-box svg {
  display: block;
  width: 188px;
  height: 188px;
}
.qr-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid #1677ff;
}
.qr-corner.tl {
  top: 4px;
  left: 4px;
  border-right: 0;
  border-bottom: 0;
}
.qr-corner.tr {
  top: 4px;
  right: 4px;
  border-left: 0;
  border-bottom: 0;
}
.qr-corner.bl {
  bottom: 4px;
  left: 4px;
  border-right: 0;
  border-top: 0;
}
.qr-corner.br {
  bottom: 4px;
  right: 4px;
  border-left: 0;
  border-top: 0;
}
.qr-wrap > small {
  margin-top: 10px;
  color: var(--muted);
  font-size: 12px;
}
.qr-brand {
  margin-top: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #e8f2ff;
  color: #1677ff;
  font-size: 10.5px;
  font-weight: 700;
}
.cashier-amount small {
  color: var(--muted);
  font-size: 12px;
}
.pay-amount {
  margin: 2px 0 8px;
  color: #b4451f;
  font-size: 34px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.5px;
}
.pay-steps {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  border-top: 1px dashed var(--line);
}
.pay-steps li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  color: #41505f;
  font-size: 12.5px;
}
.pay-steps b {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #eef4fd;
  color: var(--blue);
  font-size: 10px;
}
.pay-countdown {
  display: inline-block;
  margin: 10px 0 0;
  padding: 5px 10px;
  border-radius: 6px;
  background: #fff6ec;
  color: #8a5a1f;
  font-size: 12px;
}
.pay-countdown strong {
  color: #b4451f;
  font-variant-numeric: tabular-nums;
}
.pay-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}
.pay-actions .btn.primary {
  min-width: 160px;
}
.pay-note {
  margin-top: 12px;
  color: var(--muted);
  font-size: 11.5px;
  line-height: 1.6;
}
.pay-note a {
  color: var(--blue);
}
.bank-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 14px 0;
}
.bank-grid > div {
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfcfe;
}
.bank-grid small {
  display: block;
  color: var(--muted);
  font-size: 11.5px;
}
.bank-grid strong {
  display: block;
  margin-top: 4px;
  font-size: 13.5px;
}
.pay-security {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
}
.pay-security > div {
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
}
.pay-security b {
  display: block;
  font-size: 13px;
}
.pay-security p {
  margin-top: 5px;
  color: var(--muted);
  font-size: 11.5px;
  line-height: 1.6;
}
.pay-order-no {
  margin-top: 10px;
  color: var(--ink);
  font-size: 12.5px;
  font-weight: 600;
}
.pay-order-time {
  margin-top: 3px;
  color: var(--muted);
  font-size: 11.5px;
}
.pay-goods {
  margin-top: 10px;
  border-top: 1px dashed var(--line);
}
.pay-goods-line {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px dashed var(--line);
  font-size: 12.5px;
}
.pay-goods-line small {
  display: block;
  margin-top: 2px;
  color: var(--muted);
  font-size: 11px;
}
.pay-goods-line strong {
  white-space: nowrap;
}
.pay-sum {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 9px;
  color: var(--muted);
  font-size: 12.5px;
}
.pay-sum b {
  color: var(--ink);
  font-weight: 600;
}
.pay-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--line);
}
.pay-total span {
  font-size: 13px;
  font-weight: 600;
}
.pay-total strong {
  color: #b4451f;
  font-size: 22px;
}
.pay-help {
  margin-top: 14px;
}
.pay-help h2 {
  font-size: 15px;
}
.pay-help p {
  margin-top: 6px;
  color: var(--muted);
  font-size: 11.5px;
  line-height: 1.6;
}
.pay-help-line {
  color: var(--ink) !important;
  font-weight: 600;
}
.pay-help a {
  display: inline-block;
  margin-top: 8px;
  color: var(--blue);
  font-size: 12px;
}
</style>
