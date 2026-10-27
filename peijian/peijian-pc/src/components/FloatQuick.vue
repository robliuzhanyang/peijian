<!--
  组件：详情页悬浮快捷入口（FloatQuick）
  作用：商品 / 套装 / 积分商品详情页悬浮胶囊条，横向三项固定顺序——
        购物车（最左，带数量角标）→ 企业工作台（第二）→ 个人信息（第三）
  显示：仅在 /detail、/package-detail、/points-detail 三类详情路由出现
  样式：共享 v12.css 的 .float-quick，PC / H5 靠祖先 .pc / .h5 区分位置与尺寸
-->
<template>
  <nav v-if="show" class="float-quick" aria-label="快捷入口">
    <!-- 1. 购物车（最左） -->
    <router-link to="/cart" class="fq-item">
      <span class="fq-ico">
        <svg viewBox="0 0 24 24">
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
          <path
            d="M2.5 3.5h2.2l2.1 11.2a1.5 1.5 0 0 0 1.5 1.3h8.6a1.5 1.5 0 0 0 1.5-1.2L21.5 8H6"
          />
        </svg>
        <em v-if="cartCount" class="fq-badge">{{ cartCount }}</em>
      </span>
      <span class="fq-label">购物车</span>
    </router-link>
    <!-- 2. 企业工作台 -->
    <router-link to="/user" class="fq-item">
      <span class="fq-ico">
        <svg viewBox="0 0 24 24">
          <rect x="3.5" y="7.5" width="17" height="12.5" rx="2" />
          <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" />
          <path d="M3.5 12.5h17" />
        </svg>
      </span>
      <span class="fq-label">工作台</span>
    </router-link>
    <!-- 3. 个人信息 -->
    <router-link to="/settings" class="fq-item">
      <span class="fq-ico">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
        </svg>
      </span>
      <span class="fq-label">个人信息</span>
    </router-link>
  </nav>
</template>

<script>
import { mapGetters } from "vuex";

// 需要展示悬浮入口的详情路由
const DETAIL_PATHS = ["/detail", "/package-detail", "/points-detail"];

export default {
  name: "FloatQuick",
  computed: {
    ...mapGetters(["cartCount"]),
    // 仅三类交易详情页显示
    show() {
      return DETAIL_PATHS.includes(this.$route.path);
    },
  },
};
</script>
