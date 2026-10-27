<!--
  页面：确认积分兑换（points-confirm.vue）
  路由：/points-confirm ｜ 分组：积分与营销
  作用：核对兑换商品、积分价与收货地址，提交兑换并跳转积分明细
  数据：getters.product 按 route.query.id（缺省 'kit'）取商品；state.addresses[0] 为收货地址；state.points 为积分余额
-->
<template>
  <div>
    <!-- 页头：标题 + 积分规则提示 -->
    <div class="page-title">
      <h1>确认积分兑换</h1>
      <small>确认收货地址与兑换商品信息</small>
    </div>
    <!-- 兑换确认卡片：商品、积分明细、收货地址与兑换按钮 -->
    <section v-if="product" class="card">
      <!-- 商品信息：图片 + 名称 + 积分价 -->
      <div class="confirm-item">
        <img :src="asset(product.image)" :alt="product.name" />
        <div>
          <h3>{{ product.name }}</h3>
          <p class="tiny">积分兑换商品</p>
          <strong class="price gold">{{ product.exchange }} 积分</strong>
        </div>
      </div>

      <!-- 积分核对：当前余额、兑换消耗与兑换后余额 -->
      <div class="spec-grid points-summary">
        <div class="field-row">
          <span>当前积分</span
          ><strong>{{ $store.state.points }} 积分</strong>
        </div>
        <div class="field-row">
          <span>兑换消耗</span
          ><strong class="gold">-{{ product.exchange }} 积分</strong>
        </div>
        <div v-if="$store.state.points >= product.exchange" class="field-row">
          <span>兑换后余额</span
          ><strong
            >{{ $store.state.points - product.exchange }} 积分</strong
          >
        </div>
      </div>

      <!-- 收货地址：无地址时提示先添加 -->
      <div class="confirm-addr">
        <small>收货地址</small>
        <p v-if="address">
          {{ address.name }} {{ address.phone }}<br />{{ address.full }}
        </p>
        <p v-else>请先添加收货地址</p>
        <router-link class="link tiny" to="/addresses">管理收货地址 ›</router-link>
      </div>

      <p class="tiny">
        提交兑换后立即扣减积分，并生成一条积分支出记录；兑换成功后不可撤销。
      </p>
      <!-- 无地址或积分余额不足时按钮禁用 -->
      <button
        class="btn gold block"
        :disabled="!address || $store.state.points < product.exchange"
        @click="confirm"
      >
        确认兑换
      </button>
    </section>
    <!-- 找不到商品时的空态 -->
    <div v-else class="empty">积分商品不存在</div>
  </div>
</template>
<script>
// 静态资源路径工具
import { asset } from "@/domain/productFields";

export default {
  computed: {
    // 待兑换商品：按路由 query.id 查找，未传 id 时默认 'kit'
    product() {
      return this.$store.getters.product(this.$route.query.id || "kit");
    },
    // 收货地址：取地址列表第一条（无记录时为 undefined，提示先添加地址）
    address() {
      return this.$store.state.addresses[0];
    },
  },
  methods: {
    asset,
    // 提交兑换：扣减积分、写入积分流水与站内消息，随后跳转积分明细
    confirm() {
      const row = this.$store.commit("exchangePoints", {
        productId: this.product.id,
        name: this.product.name,
        points: this.product.exchange,
      });
      if (!row) return;
      this.$store.commit(
        "setNotice",
        `兑换申请已提交，已扣减 ${this.product.exchange} 积分`
      );
      this.$router.push("/points-ledger");
    },
  },
};
</script>
