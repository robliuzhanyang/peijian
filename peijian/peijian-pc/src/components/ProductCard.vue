<!--
  组件：商品卡片（ProductCard）
  用途：商品网格中的统一卡片：图片入口、热销/客户资料角标、系列与型号、价格库存与购买动作
  Props：product 商品对象（必传）
  行为：可售商品直接 addCart；客户资料类商品（无报价）引导查看资料/咨询报价
-->
<template>
  <article class="product-card">
    <!-- 图片区：点击进入详情；热销或客户资料商品显示蓝色角标 -->
    <router-link
      :to="{ path: '/detail', query: { id: product.id } }"
      class="image-box"
      ><img :src="asset(product.image)" :alt="product.name" /><span
        v-if="product.hot || product.sourceType === 'customer'"
        class="badge blue top"
        >{{ product.hot ? '热销配件' : '客户资料' }}</span
      ></router-link
    >
    <div class="prod-info">
      <h3>
        <router-link :to="{ path: '/detail', query: { id: product.id } }">{{
          product.name
        }}</router-link>
      </h3>
      <!-- 系列与型号：仅展示已录入项，避免「待补充」占位 -->
      <p v-if="product.series || product.model" class="catalog-model">
        <template v-if="product.series">系列：{{ product.series }}</template>
        <template v-if="product.series && product.model">　</template>
        <template v-if="product.model">型号：<b>{{ product.model }}</b></template>
      </p>
      <p class="tiny">{{ product.sub }}</p>
      <!-- 价格：可售展示金额；资料类商品显示"待报价" -->
      <strong v-if="product.buyable" class="price">{{
        money(product.priceFen)
      }}</strong
      ><span v-else class="badge blue">待报价</span>
      <!-- 库存与积分：数据完整时展示现货与可得积分 -->
      <div class="stockline">
        <template v-if="product.buyable && product.stock != null">
          <span class="green"
            >现货 {{ product.stock }}{{ product.cat === 'laser' ? ' 台' : ' 件'
            }}</span
          >
          <span class="muted">得 {{ product.points }} 积分</span>
        </template>
        <span v-else class="muted">库存与积分待客户提供</span>
      </div>
      <!-- 可售：加入购物车 / 直接购买；资料类商品引导到详情页询价 -->
      <div v-if="product.buyable" class="pc-actions">
        <button class="btn sm" @click="addCart">加入购物车</button>
        <button class="btn sm primary" @click="buyNow">购买</button>
      </div>
      <router-link
        v-else
        class="btn sm block"
        :to="{ path: '/detail', query: { id: product.id } }"
        >查看资料 / 咨询</router-link
      >
    </div>
  </article>
</template>

<script>
import { money, asset } from '@/domain/productFields'

export default {
  props: { product: { type: Object, required: true } },
  methods: {
    money,
    asset,
    // 加入购物车：库存与可售校验统一在 store.addCart 内
    addCart() {
      this.$store.commit('addCart', { product: this.product })
    },
    // 购买：加入购物车后直接进入结算
    buyNow() {
      this.$store.commit('addCart', { product: this.product })
      this.$router.push('/checkout')
    },
  },
}
</script>

<style>
/* 卡片底部两个动作并排：加入购物车（次）+ 购买（主） */
.product-card .pc-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.product-card .pc-actions .btn {
  flex: 1;
  white-space: nowrap;
}
</style>
