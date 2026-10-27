<!--
  页面：收货地址（H5）
  路由：/addresses ｜ 分组：企业与账号
  作用：卡片式展示企业常用收货地址，支持设为默认、编辑、删除与新增
  数据：读取 Vuex state.addresses（本地持久化）；新增/编辑/删除走对应 mutation
  后端接入：GET/POST/PUT/DELETE /business/addresses 与 /:id/default，替换本地 mutation
-->
<template>
  <div>
    <p class="m-addr-summary">共 {{ addresses.length }} 个常用收货地址</p>

    <div class="m-addr-list">
      <section
        v-for="a in addresses"
        :key="a.id"
        class="card m-addr-card"
        :class="{ on: a.primary }"
      >
        <div class="m-addr-head">
          <strong>{{ a.name }}</strong>
          <span class="m-addr-phone">{{ a.phone }}</span>
          <em v-if="a.primary" class="m-addr-tag">默认</em>
        </div>
        <p class="m-addr-full">
          <UiIcon name="pin" /><span>{{ a.full }}</span>
        </p>
        <div class="m-addr-actions">
          <button v-if="!a.primary" class="m-addr-link" @click="setDefault(a.id)">
            设为默认
          </button>
          <span v-else class="m-addr-link muted">当前默认地址</span>
          <span class="m-addr-gap"></span>
          <router-link
            class="btn sm"
            :to="{ path: '/address-edit', query: { id: a.id } }"
            >编辑</router-link
          >
          <button class="btn sm m-addr-del" @click="remove(a.id)">删除</button>
        </div>
      </section>

      <!-- 空态 -->
      <div v-if="!addresses.length" class="empty">
        暂无收货地址，请先新增。
      </div>
    </div>

    <router-link class="btn primary block m-addr-add" to="/address-edit"
      >＋ 新增收货地址</router-link
    >
  </div>
</template>
<script>
import UiIcon from "@/components/UiIcon.vue";

export default {
  components: { UiIcon },
  computed: {
    addresses() {
      return this.$store.state.addresses;
    },
  },
  methods: {
    setDefault(id) {
      this.$store.commit("setDefaultAddress", id);
      this.$store.commit("setNotice", "已设为默认收货地址");
    },
    remove(id) {
      if (!confirm("确认删除该收货地址？")) return;
      this.$store.commit("removeAddress", id);
      this.$store.commit("setNotice", "已删除");
    },
  },
};
</script>

<style>
.m-addr-summary {
  margin: 0 2px 8px;
  color: #8b98a9;
  font-size: 10px;
}
.m-addr-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
/* 地址卡片：默认地址浅蓝描边，信息与操作分区 */
.m-addr-card {
  padding: 13px 13px 11px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #fff;
}
.m-addr-card.on {
  border-color: #bcd6f8;
  background: #f8fbff;
  box-shadow: 0 4px 14px rgba(23, 104, 213, 0.07);
}
.m-addr-head {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}
.m-addr-head strong {
  font-size: 13.5px;
}
.m-addr-phone {
  color: var(--ink);
  font-size: 12.5px;
  letter-spacing: 0.3px;
}
.m-addr-tag {
  margin-left: auto;
  padding: 1px 7px;
  border-radius: 9px;
  background: #e8f1fe;
  color: var(--blue);
  font-size: 9px;
  font-style: normal;
}
.m-addr-full {
  display: flex;
  gap: 6px;
  margin: 8px 0 0;
  color: #5c6b7a;
  font-size: 11.5px;
  line-height: 1.55;
}
.m-addr-full .icon {
  width: 14px;
  height: 14px;
  margin-top: 1px;
  flex: 0 0 14px;
  color: #8aa0b8;
}
.m-addr-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 11px;
  padding-top: 9px;
  border-top: 1px dashed #e7edf5;
}
.m-addr-link {
  padding: 0;
  border: 0;
  background: none;
  color: var(--blue);
  font-size: 10.5px;
}
.m-addr-link.muted {
  color: #9aa7b9;
}
.m-addr-gap {
  flex: 1;
}
.m-addr-actions .btn {
  min-height: 28px;
  padding: 3px 12px;
  font-size: 11px;
}
.m-addr-del {
  border-color: #f0cfc8;
  background: #fff7f5;
  color: #d94a2e;
}
.m-addr-add {
  margin-top: 14px;
}
</style>
