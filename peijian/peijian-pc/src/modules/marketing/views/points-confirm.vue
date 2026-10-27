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
    <!-- 兑换确认卡片：商品名、积分价、收货地址与兑换按钮 -->
    <section v-if="product" class="card">
      <h2>{{ product.name }}</h2>
      <p class="price gold">{{ product.exchange }} 积分</p>
      <p>当前积分：{{ $store.state.points }} 积分</p>
      <p>收货地址：{{ address ? address.full : "请先添加地址" }}</p>
      <p class="tiny">
        提交后立即扣减积分，并生成一条积分支出记录；兑换成功后不可撤销。
      </p>
      <!-- 无地址或积分余额不足时按钮禁用 -->
      <button
        class="btn gold"
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
export default {
  computed: {
    // 待兑换商品：按路由 query.id 查找，未传 id 时默认 'kit'
    product() {
      return this.$store.getters.product(this.$route.query.id || "kit");
    },
    // 收货地址：优先使用默认地址，无默认时回退第一条
    address() {
      const list = this.$store.state.addresses;
      return list.find((a) => a.primary) || list[0];
    },
  },
  methods: {
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
