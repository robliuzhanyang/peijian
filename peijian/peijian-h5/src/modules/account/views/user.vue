<!--
  页面：企业工作台（user.vue）
  路由：/user ｜ 分组：企业与账号
  作用：按原型 V1.2 的 H5 我的页组织：企业横幅（认证 / 信用代码 / 联系人 / 业务员 / 积分）
        + 我的订单四统计 + 常用功能菜单 + 退出登录
  数据：企业取 getters.currentCompany，积分取 state.points，订单统计取 state.orders，合同待回传取 state.contracts
-->
<template>
  <div>
    <!-- 未登录：登录引导卡 -->
    <section v-if="!loggedIn" class="card login-guide">
      <div class="login-guide-ico">鑫</div>
      <h2>登录后查看企业采购信息</h2>
      <p>订单、合同、发票、售后与积分等企业采购功能，登录后即可使用。</p>
      <div class="login-guide-actions">
        <router-link
          class="btn primary"
          :to="{ path: '/login', query: { redirect: $route.fullPath } }"
          >登录</router-link
        >
        <router-link class="btn ghost" to="/register">免费注册</router-link>
      </div>
    </section>

    <template v-else>
      <!-- 企业横幅：企业名 + 认证状态、工商与联系人信息、切换 / 注册企业、积分余额 -->
      <section class="card company-banner">
        <div>
          <div class="flex">
            <h2>{{ company.name || "企业采购中心" }}</h2>
            <span class="badge">{{ company.status || authStatus }}</span>
          </div>
          <p>
            统一社会信用代码：{{ company.taxId || "待提供" }}<br />
            联系人：{{ company.contact || profile.name || "待提供" }}　{{
              maskedPhone
            }}　｜　归属业务员：{{ company.salesman || "待分配" }}
          </p>
          <div class="company-tools flex panel-line">
            <router-link class="btn ghost sm" to="/companies"
              >切换企业</router-link
            >
            <router-link
              class="btn ghost sm"
              :to="{ path: '/register', query: { new: 1 } }"
              >注册新企业</router-link
            >
          </div>
        </div>
        <div class="score num">
          {{ pointsText }}<small>配件商城积分</small>
        </div>
      </section>

      <!-- 我的订单：全部 / 待支付 / 待收货 / 已完成 -->
      <section class="card order-summary">
        <div class="card-head">
          <h2>我的订单</h2>
          <router-link class="link tiny" to="/orders">全部订单 →</router-link>
        </div>
        <div class="m-stats">
          <router-link
            v-for="s in stats"
            :key="s.key"
            class="m-stat"
            :to="{ path: '/orders', query: s.key === 'all' ? {} : { status: s.key } }"
          >
            <span class="m-stat-ico" :style="{ background: s.bg, color: s.color }">
              <UiIcon :name="s.icon" />
              <em v-if="s.count" class="m-stat-badge">{{
                s.count > 99 ? "99+" : s.count
              }}</em>
            </span>
            <span class="m-stat-text">
              <strong>{{ s.count }}</strong>
              <small>{{ s.label }}</small>
            </span>
          </router-link>
        </div>
        <!-- 最近订单：展示最新 1 笔，点击进详情 -->
        <router-link
          v-for="o in recentOrders"
          :key="o.id"
          class="m-recent"
          :to="{ path: '/order-detail', query: { id: o.id } }"
        >
          <span class="m-recent-thumb">
            <img v-if="thumb(o)" :src="asset(thumb(o))" :alt="o.id" />
            <UiIcon v-else name="box" />
          </span>
          <span class="m-recent-info">
            <span class="m-recent-title">{{ summary(o) }}</span>
            <span class="m-recent-sub">{{ o.id }} ｜ {{ o.createdAt }}</span>
          </span>
          <span class="m-recent-right">
            <strong>{{ money(o.totalFen) }}</strong>
            <span class="badge" :class="badgeClass(o.status)">{{ o.status }}</span>
          </span>
        </router-link>
        <div v-if="!recentOrders.length" class="empty m-recent-empty">
          暂无订单，<router-link to="/goods">去选购配件 →</router-link>
        </div>
      </section>

      <!-- 常用功能菜单 -->
      <section class="card mobile-menu">
        <router-link v-for="m in menus" :key="m.name" :to="m.to">
          <div class="flex"><UiIcon :name="m.icon" />{{ m.name }}</div>
          <span class="tiny">{{ m.tail }} <UiIcon name="chevron" /></span>
        </router-link>
        <a href="#" @click.prevent="logout">
          <div class="flex"><UiIcon name="close" />退出登录</div>
          <span class="tiny"><UiIcon name="chevron" /></span>
        </a>
      </section>
    </template>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { authApi } from "@/modules/account/api";
import { clearToken } from "@/config/env";
import { money, asset } from "@/domain/productFields";
import UiIcon from "@/components/UiIcon.vue";

export default {
  components: { UiIcon },
  computed: {
    ...mapState(["loggedIn", "profile", "points", "authStatus"]),
    // 当前企业（按 currentCompanyId 取）
    company() {
      return this.$store.getters.currentCompany || {};
    },
    // 联系电话脱敏：138****0000
    maskedPhone() {
      return String(this.company.phone || "").replace(
        /^(\d{3})\d{4}(\d{4})$/,
        "$1****$2"
      );
    },
    // 积分余额（千分位）
    pointsText() {
      return Number(this.points || 0).toLocaleString("zh-CN");
    },
    // 订单四统计：全部 / 待支付（待付款+待核款）/ 待收货 / 已完成
    stats() {
      const list = this.$store.state.orders;
      return [
        {
          key: "all",
          label: "全部",
          icon: "box",
          count: list.length,
          color: "#1f5fcf",
          bg: "#eef4ff",
        },
        {
          key: "待付款",
          label: "待支付",
          icon: "wallet",
          count: list.filter((o) => ["待付款", "待核款"].includes(o.status))
            .length,
          color: "#d48806",
          bg: "#fff7e6",
        },
        {
          key: "待收货",
          label: "待收货",
          icon: "truck",
          count: list.filter((o) => ["运输中", "待收货"].includes(o.status))
            .length,
          color: "#1f5fcf",
          bg: "#eaf3ff",
        },
        {
          key: "已完成",
          label: "已完成",
          icon: "check",
          count: list.filter((o) => o.status === "已完成").length,
          color: "#2f9e63",
          bg: "#ebf7f0",
        },
      ];
    },
    // 最近 1 笔订单
    recentOrders() {
      return this.$store.state.orders.slice(0, 1);
    },
    // 菜单行：采购合同待回传数量取合同中「待买方签署」的条数；消息行显示未读数
    menus() {
      const back = this.$store.state.contracts.filter(
        (c) => c.status === "待买方签署"
      ).length;
      const unread = this.$store.state.messages.filter((m) => !m.read).length;
      return [
        {
          name: "采购合同",
          icon: "file",
          to: "/contracts",
          tail: back ? `待回传 ${back}` : "",
        },
        { name: "发票管理", icon: "file", to: "/invoices", tail: "一单一票" },
        { name: "收货地址", icon: "pin", to: "/addresses", tail: "" },
        { name: "积分明细", icon: "coin", to: "/points-ledger", tail: "" },
        { name: "售后 / 退款", icon: "tool", to: "/aftersales", tail: "" },
        {
          name: "消息通知",
          icon: "bell",
          to: "/messages",
          tail: unread ? `${unread} 条未读` : "",
        },
        { name: "推荐有礼", icon: "gift", to: "/referral", tail: "" },
        { name: "常用套装", icon: "grid", to: "/favorites", tail: "" },
        { name: "企业认证", icon: "check", to: "/auth-status", tail: "" },
        { name: "账号设置", icon: "settings", to: "/settings", tail: "" },
        { name: "客户支持", icon: "service", to: "/support", tail: "" },
      ];
    },
  },
  methods: {
    money,
    asset,
    // 订单首件商品图片
    thumb(o) {
      const first = o.items && o.items[0];
      if (!first) return null;
      const p = this.$store.getters.product(first.productId);
      return p ? p.image : null;
    },
    // 订单商品摘要
    summary(o) {
      const names = o.items.map((l) => {
        const p = this.$store.getters.product(l.productId);
        const n = l.name || (p ? p.name : l.skuCode);
        return n + " ×" + l.quantity;
      });
      return names.slice(0, 2).join("、") + (o.items.length > 2 ? " 等" : "");
    },
    // 状态徽章配色
    badgeClass(status) {
      if (status === "已完成") return "green";
      if (status === "售后中") return "gold";
      if (status === "已取消") return "red";
      if (status === "待付款" || status === "待核款") return "orange";
      return "blue";
    },
    // 退出登录：通知后端、清除 token、置未登录态（页面自动切换为引导卡）
    async logout() {
      try {
        await authApi.logout();
      } catch (e) {
        // 后端退出失败不阻塞前端清理
      }
      clearToken();
      this.$store.commit("logout");
      this.$store.commit("setNotice", "已退出登录");
    },
  },
};
</script>

<style scoped>
/* 订单卡：加大内边距，避免拥挤 */
.order-summary {
  padding: 20px 16px;
}
/* 订单四统计：2×2 横向紧凑卡，图标在左数字在右 */
.m-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.m-stat {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 12px;
  border-radius: 12px;
  background: #fafbfd;
  border: 1px solid #f0f2f5;
}
.m-stat:active {
  background: #f4f8ff;
  border-color: #d6e4fb;
}
.m-stat-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.m-stat strong {
  font-size: 19px;
  line-height: 1.15;
  color: #1c2430;
}
.m-stat small {
  font-size: 11px;
  color: #7a8493;
}
.m-stat-ico {
  position: relative;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 11px;
}
.m-stat-ico .icon {
  width: 20px;
  height: 20px;
}
.m-stat-badge {
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
  font-size: 9px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 0 0 2px #fff;
}
/* 最近订单行 */
.m-recent {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 15px;
  padding: 13px 12px;
  border-radius: 13px;
  background: #f8fafd;
  border: 1px solid #eef1f5;
}
.m-recent-thumb {
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: linear-gradient(160deg, #f4f7fc, #e9eef6);
  overflow: hidden;
}
.m-recent-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.m-recent-thumb .icon {
  width: 21px;
  height: 21px;
  color: #9aa6b8;
}
.m-recent-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.m-recent-title {
  font-size: 13px;
  color: #2a3340;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.m-recent-sub {
  font-size: 11px;
  color: #9aa3ad;
}
.m-recent-right {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}
.m-recent-right strong {
  font-size: 14px;
  color: #1c2430;
}
.m-recent-empty {
  margin-top: 12px;
  padding: 20px 0;
}
</style>
