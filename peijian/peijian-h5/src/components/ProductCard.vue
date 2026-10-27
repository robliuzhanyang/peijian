<!--
  组件：商品卡片（ProductCard）
  用途：商品网格中的统一卡片：图片入口、客户资料角标、系列/型号/SKU、价格库存与购买动作
  Props：product 商品对象（必传）
  行为：可售商品直接 addCart；客户资料类商品（无报价）引导查看资料/咨询报价
-->
<template>
  <article class="product-card">
    <!-- 图片区：点击进入详情；客户资料商品显示蓝色角标 -->
    <router-link :to="{ path: '/detail', query: { id: product.id } }" class="image-box"
      ><img :src="asset(product.image)" :alt="product.name" /><span
        v-if="product.sourceType === 'customer'"
        class="badge blue top"
        >客户资料</span
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
        <template v-if="product.series">系列 {{ product.series }}</template>
        <template v-if="product.series && product.model"> · </template>
        <template v-if="product.model">型号 <b>{{ product.model }}</b></template>
      </p>
      <p class="tiny">
        <template v-if="product.skuCode">SKU：{{ product.skuCode }} · </template>
        {{ product.sourceType === 'customer' ? '客户原始资料' : '平台现货' }}
      </p>
      <!-- 价格与库存：空价格显示"待报价"，空库存显示"库存待确认" -->
      <div class="between">
        <strong class="price">{{ money(product.priceFen) }}</strong
        ><span class="tiny">{{
          product.stock == null ? '库存待确认' : '库存 ' + product.stock
        }}</span>
      </div>
      <div class="stockline">
        <span>{{ product.sourceType === 'customer' ? '规格参数待补充' : product.sub }}</span>
      </div>
      <!-- 可售：加入购物车 / 直接购买；资料类商品引导到详情页询价 -->
      <div v-if="product.buyable" class="pc-actions">
        <button class="btn sm" @click="addCart">加入购物车</button>
        <button class="btn primary sm" @click="buyNow">购买</button>
      </div>
      <router-link
        v-else
        class="btn soft sm block"
        :to="{ path: '/detail', query: { id: product.id } }"
        >查看资料 / 咨询报价</router-link
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
  gap: 6px;
  margin-top: 8px;
}
.product-card .pc-actions .btn {
  flex: 1;
  white-space: nowrap;
}
</style>
