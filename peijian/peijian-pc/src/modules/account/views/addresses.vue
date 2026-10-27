<!--
  页面：收货地址（addresses.vue）
  路由：/addresses ｜ 分组：企业与账号
  作用：以卡片列表展示企业常用收货地址，支持设为默认、编辑、删除与新增
  数据：读取 Vuex state.addresses（本地持久化）；新增/编辑/删除走对应 mutation
  后端接入：GET/POST/PUT/DELETE /business/addresses 与 /:id/default，替换本地 mutation
-->
<template>
  <div>
    <div class="page-title">
      <h1>收货地址</h1>
      <small>选择企业常用地址</small>
    </div>
    <!-- 地址卡片：默认地址带角标，操作区固定在卡片底部 -->
    <div class="two-col">
      <section v-for="a in addresses" :key="a.id" class="card">
        <h2>
          {{ a.name }} · {{ a.phone }}
          <span v-if="a.primary" class="badge blue" style="margin-left: 6px">默认</span>
        </h2>
        <p>{{ a.full }}</p>
        <div class="action-row" style="margin-top: 10px">
          <button v-if="!a.primary" class="btn sm" @click="setDefault(a.id)">设为默认</button>
          <router-link class="btn sm" :to="{ path: '/address-edit', query: { id: a.id } }">编辑</router-link>
          <button class="btn sm ghost" @click="remove(a.id)">删除</button>
        </div>
      </section>
    </div>
    <div class="action-row">
      <router-link class="btn primary" to="/address-edit">新增地址</router-link>
    </div>
  </div>
</template>
<script>
export default {
  computed: {
    addresses() {
      return this.$store.state.addresses
    },
  },
  methods: {
    // 设为默认：mutation 内保证全局只有一条 primary
    setDefault(id) {
      this.$store.commit('setDefaultAddress', id)
      this.$store.commit('setNotice', '已设为默认收货地址')
    },
    // 删除地址：二次确认；删除默认地址后 store 会自动补位
    remove(id) {
      if (!confirm('确认删除该收货地址？')) return
      this.$store.commit('removeAddress', id)
      this.$store.commit('setNotice', '已删除')
    },
  },
}
</script>
