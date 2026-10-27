<!--
  页面：工作台总览（user-overview.vue）
  路由：/user（企业工作台的默认子页面）
  作用：展示我的订单统计与最近订单、合同与发票概览、售后与技术支持入口；
        企业横幅由父级工作台统一展示，本页只负责总览内容
  数据：Vuex state.orders / contracts / invoices；客服热线与时间读取 catalog.support
-->
<template>
  <div class="ov-root">
    <!-- 我的订单：左侧状态统计 + 右侧最近订单与待办动作 -->
    <section class="card ov-card">
      <div class="card-head ov-head">
        <div class="ov-head-text">
          <h2>我的订单</h2>
          <p>跟踪订单状态，及时处理付款与收货待办</p>
        </div>
        <router-link class="ov-head-more" to="/user/orders">
          查看全部订单
          <AppIcon name="chevron" />
        </router-link>
      </div>
      <div class="ov-orders">
        <!-- 顶部：横向紧凑状态统计条，点击直达对应筛选 -->
        <div class="ov-stats">
          <router-link
            v-for="s in stats"
            :key="s.label"
            class="ov-stat"
            :to="{ path: '/user/orders', query: { status: s.status } }"
          >
            <span class="ov-stat-ico" :style="{ background: s.bg, color: s.color }">
              <AppIcon :name="s.icon" />
              <em v-if="s.n" class="ov-stat-badge">{{ s.n > 99 ? "99+" : s.n }}</em>
            </span>
            <span class="ov-stat-text">
              <strong>{{ s.n }}</strong>
              <small>{{ s.label }}</small>
            </span>
            <AppIcon name="chevron" class="ov-stat-arrow" />
          </router-link>
        </div>
        <!-- 下方：最近订单列表 -->
        <div class="ov-recent">
          <div class="ov-recent-head">
            <span>最近订单</span>
            <router-link class="link tiny" to="/user/orders">查看全部 →</router-link>
          </div>
          <router-link
            v-for="o in recentOrders"
            :key="o.id"
            class="ov-order"
            :to="{ path: '/order-detail', query: { id: o.id } }"
          >
            <span class="ov-order-thumb">
              <img v-if="thumb(o)" :src="asset(thumb(o))" :alt="o.id" />
              <AppIcon v-else name="box" />
            </span>
            <span class="ov-order-info">
              <span class="ov-order-title">{{ summary(o) }}</span>
              <span class="ov-order-sub">{{ o.id }} ｜ {{ o.createdAt }}</span>
            </span>
            <span class="ov-order-right">
              <strong>{{ money(o.totalFen) }}</strong>
              <span class="badge" :class="badgeClass(o.status)">{{ o.status }}</span>
            </span>
          </router-link>
          <div v-if="!recentOrders.length" class="empty ov-recent-empty">
            暂无订单，<router-link to="/goods">去选购配件 →</router-link>
          </div>
          <!-- 待办快捷动作行 -->
          <div v-if="quickActions.length" class="ov-quick">
            <router-link
              v-for="q in quickActions"
              :key="q.text"
              class="ov-quick-item"
              :to="q.to"
            >
              <AppIcon :name="q.icon" />
              <span>{{ q.text }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 合同与发票：待回传合同与处理中发票 -->
    <section class="card">
      <div class="card-head">
        <h2>合同与发票</h2>
        <router-link class="link tiny" to="/invoice-apply"
          >逐单申请开票 →</router-link
        >
      </div>
      <div class="flex contracts-row">
        <div class="grow">
          <p class="muted">采购合同</p>
          <h2 style="margin: 8px 0">
            {{ pendingContracts }} <small class="muted">份待回传</small>
          </h2>
          <router-link class="blue" to="/user/contracts">去回传合同 →</router-link>
        </div>
        <div class="grow">
          <p class="muted">电子发票</p>
          <h2 style="margin: 8px 0">
            {{ pendingInvoices }} <small class="muted">笔审核中</small>
          </h2>
          <router-link class="blue" to="/user/invoices"
            >查看开票状态 →</router-link
          >
        </div>
      </div>
      <div class="notice panel-line">
        订单付款后开放合同；盖章回传与发货独立，正式开票需已确认收货。
      </div>
    </section>

    <!-- 售后与技术支持 -->
    <section class="card">
      <div class="card-head"><h2>售后与技术支持</h2></div>
      <div class="service-grid">
        <div class="card service-card">
          <AppIcon name="message" />
          <h3>企微客服</h3>
          <p>在线选型答疑</p>
          <router-link class="btn sm" to="/user/support">立即联系</router-link>
        </div>
        <div class="card service-card">
          <AppIcon name="phone" />
          <h3>服务热线</h3>
          <p>{{ hotline }}<br />{{ hours }}</p>
          <a class="btn sm" :href="'tel:' + hotline">立即联系</a>
        </div>
        <div class="card service-card">
          <AppIcon name="file" />
          <h3>技术留言</h3>
          <p>留下问题，我们跟进</p>
          <router-link class="btn sm" to="/user/support">提交留言</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from "vuex";
import AppIcon from "@/components/AppIcon.vue";
import { money, asset } from "@/domain/productFields";
import catalog from "@/mock/catalog.json";

export default {
  components: { AppIcon },
  computed: {
    ...mapState(["orders", "contracts", "invoices"]),
    // 订单统计：全部 / 待支付 / 待收货（运输中 + 待收货）/ 已完成
    stats() {
      return [
        {
          label: "全部",
          status: "全部",
          n: this.orders.length,
          icon: "box",
          color: "#1f5fcf",
          bg: "#eef4ff",
        },
        {
          label: "待支付",
          status: "待付款",
          n: this.orders.filter((o) => ["待付款", "待核款"].includes(o.status))
            .length,
          icon: "wallet",
          color: "#d48806",
          bg: "#fff7e6",
        },
        {
          label: "待收货",
          status: "待收货",
          n: this.orders.filter((o) => ["运输中", "待收货"].includes(o.status))
            .length,
          icon: "truck",
          color: "#1f5fcf",
          bg: "#eaf3ff",
        },
        {
          label: "已完成",
          status: "已完成",
          n: this.orders.filter((o) => o.status === "已完成").length,
          icon: "check",
          color: "#2f9e63",
          bg: "#ebf7f0",
        },
      ];
    },
    // 最近 3 笔订单（按数组顺序，mock 已按时间倒序）
    recentOrders() {
      return this.orders.slice(0, 3);
    },
    // 待办快捷动作：有待付款 / 待收货订单时出现
    quickActions() {
      const list = [];
      const unpaid = this.orders.filter((o) => o.status === "待付款").length;
      const receiving = this.orders.filter((o) =>
        ["运输中", "待收货"].includes(o.status)
      ).length;
      const afterSale = this.orders.filter((o) => o.status === "售后中").length;
      if (unpaid)
        list.push({
          text: `${unpaid} 笔订单待付款，去支付`,
          icon: "wallet",
          to: { path: "/user/orders", query: { status: "待付款" } },
        });
      if (receiving)
        list.push({
          text: `${receiving} 笔订单待收货，查看物流`,
          icon: "truck",
          to: { path: "/user/orders", query: { status: "待收货" } },
        });
      if (afterSale)
        list.push({
          text: `${afterSale} 笔售后处理中`,
          icon: "tool",
          to: { path: "/user/orders", query: { status: "售后中" } },
        });
      return list;
    },
    // 待买方回传的合同数
    pendingContracts() {
      return this.contracts.filter((c) => c.status === "待买方签署").length;
    },
    // 审核中的开票申请数
    pendingInvoices() {
      return this.invoices.filter((i) => i.status === "审核中").length;
    },
    // 客服热线与工作时间
    hotline() {
      return catalog.support.hotline;
    },
    hours() {
      return catalog.support.hours;
    },
  },
  methods: {
    money,
    asset,
    // 订单首件商品的图片
    thumb(o) {
      const first = o.items && o.items[0];
      if (!first) return null;
      const p = this.$store.getters.product(first.productId);
      return p ? p.image : null;
    },
    // 订单商品摘要：商品名 ×数量，最多 2 项
    summary(o) {
      const names = o.items.map((l) => {
        const p = this.$store.getters.product(l.productId);
        const n = l.name || (p ? p.name : l.skuCode);
        return n + " ×" + l.quantity;
      });
      return names.slice(0, 2).join("、") + (o.items.length > 2 ? " 等" : "");
    },
    // 订单状态徽章配色
    badgeClass(status) {
      if (status === "已完成") return "green";
      if (status === "售后中") return "gold";
      if (status === "已取消") return "red";
      if (status === "待付款" || status === "待核款") return "orange";
      return "blue";
    },
  },
};
</script>

<style scoped>
/* 统一加大本页卡片的内边距，增加呼吸感 */
.ov-root > .card {
  padding: 30px 32px;
}
.ov-root > .card + .card {
  margin-top: 20px;
}
/* 订单卡标题区：标题 + 副标题 + 描边按钮，消化右侧空白 */
.ov-head {
  align-items: flex-start;
  margin-bottom: 26px;
  padding-bottom: 22px;
  border-bottom: 1px solid #f0f2f5;
}
.ov-head-text h2 {
  margin: 0;
  font-size: 18px;
}
.ov-head-text p {
  margin: 7px 0 0;
  font-size: 13px;
  color: #8b94a3;
}
.ov-head-more {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
  margin-top: 2px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #d6e0f2;
  background: #f7faff;
  color: #1f5fcf;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.18s;
}
.ov-head-more:hover {
  background: #1f5fcf;
  border-color: #1f5fcf;
  color: #fff;
}
.ov-head-more .icon {
  width: 14px;
  height: 14px;
}
/* 订单概览：顶部统计条 + 下方最近订单 */
.ov-orders {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
/* 顶部：横向状态统计条 */
.ov-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eef1f5;
}
.ov-stat {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px;
  border-radius: 12px;
  background: #fafbfd;
  border: 1px solid #f0f2f5;
  overflow: hidden;
  transition: all 0.18s;
}
.ov-stat::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: transparent;
  transition: background 0.18s;
}
.ov-stat:hover {
  background: #f4f8ff;
  border-color: #d6e4fb;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(31, 95, 207, 0.1);
}
.ov-stat:hover::before {
  background: #1f5fcf;
}
.ov-stat-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ov-stat strong {
  font-size: 22px;
  line-height: 1.15;
  color: #1c2430;
}
.ov-stat small {
  font-size: 12px;
  color: #7a8493;
}
.ov-stat-ico {
  position: relative;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
}
.ov-stat-ico .icon {
  width: 22px;
  height: 22px;
}
.ov-stat-arrow {
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
  color: #c2cad6;
  transition: all 0.18s;
}
.ov-stat:hover .ov-stat-arrow {
  color: #1f5fcf;
  transform: translateX(2px);
}
.ov-stat-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #f04438;
  color: #fff;
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 0 0 2px #fff;
}
/* 下方：最近订单 */
.ov-recent {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.ov-recent-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  color: #1c2430;
  margin-bottom: 8px;
}
.ov-order {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 14px;
  border-radius: 12px;
  transition: background 0.16s;
}
.ov-order + .ov-order {
  border-top: 1px dashed #eef1f5;
}
.ov-order:hover {
  background: #f6f9ff;
}
.ov-order-thumb {
  flex: 0 0 52px;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(160deg, #f4f7fc, #e9eef6);
  overflow: hidden;
}
.ov-order-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.ov-order-thumb .icon {
  width: 24px;
  height: 24px;
  color: #9aa6b8;
}
.ov-order-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ov-order-title {
  font-size: 13px;
  color: #2a3340;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ov-order-sub {
  font-size: 12px;
  color: #9aa3ad;
}
.ov-order-right {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 7px;
}
.ov-order-right strong {
  font-size: 15px;
  color: #1c2430;
}
.ov-recent-empty {
  padding: 32px 0;
}
/* 待办快捷动作 */
.ov-quick {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
  padding-top: 18px;
  border-top: 1px solid #f0f2f5;
}
.ov-quick-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 18px;
  background: #eef4ff;
  color: #1f5fcf;
  font-size: 12px;
  transition: all 0.16s;
}
.ov-quick-item:hover {
  background: #1f5fcf;
  color: #fff;
}
.ov-quick-item .icon {
  width: 15px;
  height: 15px;
}
/* 合同与发票：两栏间距更舒展 */
.ov-root .contracts-row {
  gap: 28px;
}
/* 售后支持卡区间距 */
.ov-root .service-grid {
  gap: 20px;
}
.ov-root .service-card {
  padding: 32px 18px;
}
@media (max-width: 1100px) {
  .ov-stats {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
