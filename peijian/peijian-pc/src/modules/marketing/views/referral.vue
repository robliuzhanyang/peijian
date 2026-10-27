<!--
  页面：推荐有礼（referral.vue）
  路由：/referral ｜ 分组：积分与营销
  作用：展示接口返回的邀请码（支持一键复制）、活动规则、已到账/待结算奖励统计与邀请记录明细表
  数据：marketingApi.referral()（读取 catalog.json：code/rule/totalReward/pendingReward/invited）
-->
<template>
  <div>
    <!-- 页头：标题 + 活动说明 -->
    <div class="page-title">
      <h1>推荐有礼</h1>
      <small>推荐企业加入，赢取积分奖励</small>
    </div>
    <!-- 活动数据：接口返回后渲染 -->
    <section v-if="referral" class="card">
      <!-- 邀请码深色卡片：复用 price-panel，内联深色渐变极小补充 -->
      <div
        class="price-panel"
        style="
          background: linear-gradient(125deg, #102c54, #1a4b84);
          border: 0;
          color: #fff;
        "
      >
        <small style="color: #bdd2e9">邀请码</small>
        <div
          class="price"
          style="color: #fff; font-size: 30px; letter-spacing: 2px"
        >
          {{ referral.code }}
        </div>
      </div>
      <!-- 复制邀请码：Clipboard API 优先，失败回退 textarea + execCommand -->
      <button class="btn" @click="copyCode">复制邀请码</button>

      <!-- 规则文案 -->
      <p class="alert">{{ referral.rule }}</p>

      <!-- 奖励统计：已到账 green、待结算 tiny/gold -->
      <div class="order-line">
        <strong>已到账奖励</strong
        ><strong class="green">{{ referral.totalReward }} 积分</strong>
      </div>
      <div class="order-line">
        <strong>待结算奖励</strong>
        <span class="tiny gold">{{ referral.pendingReward }} 积分</span>
      </div>

      <!-- 邀请记录表：窄屏由外层容器横向滚动，不挤压页面 -->
      <h2>邀请记录</h2>
      <div class="table-scroll">
        <table class="item-table">
          <thead>
            <tr>
              <th>企业名称</th>
              <th>时间</th>
              <th>状态</th>
              <th>奖励</th>
              <th>到账</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in referral.invited" :key="i">
              <td>{{ item.company }}</td>
              <td>{{ item.time }}</td>
              <!-- 状态 badge：已签约 green、已注册 gold、已浏览默认 badge -->
              <td>
                <span class="badge" :class="statusClass(item.status)">{{
                  item.status
                }}</span>
              </td>
              <!-- 奖励为 0 显示待发放 -->
              <td>{{ item.reward ? item.reward + " 积分" : "待发放" }}</td>
              <td>{{ item.settled ? "已到账" : "待结算" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 无邀请记录空态 -->
      <div v-if="!referral.invited.length" class="empty">暂无邀请记录。</div>
    </section>
  </div>
</template>
<script>
// 交易后业务线接口：推荐有礼（邀请码、规则、统计与邀请记录）
import marketingApi from "@/modules/marketing/api";

export default {
  name: "Page",
  data() {
    return {
      // 推荐数据：接口返回前为 null
      referral: null,
    };
  },
  created() {
    this.loadReferral();
  },
  methods: {
    // 拉取推荐有礼数据并写入 data
    async loadReferral() {
      this.referral = await marketingApi.referral();
    },
    // 邀请状态映射 badge 配色：已签约 green、已注册 gold、已浏览用默认灰色 badge
    statusClass(status) {
      return (
        {
          已签约: "green",
          已注册: "gold",
        }[status] || ""
      );
    },
    // 复制邀请码：优先 navigator.clipboard，失败或非安全上下文时走 execCommand 兜底
    async copyCode() {
      const code = this.referral.code;
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(code);
          this.$store.commit("setNotice", "邀请码已复制");
          return;
        } catch (e) {
          // Clipboard API 异常时继续走兜底复制
        }
      }
      this.fallbackCopy(code);
    },
    // 兜底复制：临时 textarea 选中后 execCommand('copy')；仍失败则直接提示邀请码
    fallbackCopy(text) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        ok = false;
      }
      document.body.removeChild(textarea);
      this.$store.commit("setNotice", ok ? "邀请码已复制" : "邀请码：" + text);
    },
  },
};
</script>
