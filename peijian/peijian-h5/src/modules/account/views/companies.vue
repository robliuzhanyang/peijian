<!--
  页面：切换企业（companies.vue）
  路由：/companies ｜ 分组：企业与账号
  作用：展示账号下可切换的企业列表及认证状态，当前企业高亮
  数据：accountApi.companies() 取企业列表 [{id,name,taxId,contact,phone,role,status,current}]
-->
<template>
  <div>
    <p class="m-addr-summary">
      共 {{ companies.length }} 个企业身份，可随时切换
    </p>

    <div class="m-co-list">
      <section
        v-for="c in companies"
        :key="c.id"
        class="card m-co-card"
        :class="{ on: c.current }"
      >
        <div class="m-co-head">
          <strong>{{ c.name }}</strong>
          <button v-if="!c.current" class="btn sm" @click="switchTo(c)">
            切换
          </button>
        </div>
        <div class="m-co-badges">
          <span v-if="c.current" class="badge blue">当前企业</span>
          <span class="badge" :class="c.status === '已认证' ? 'green' : 'gold'">{{
            c.status
          }}</span>
          <em class="m-co-role">{{ c.role }}</em>
        </div>
        <p class="m-co-meta">信用代码 {{ c.taxId }}</p>
        <p class="m-co-meta">联系人 {{ c.contact }} · {{ c.phone }}</p>
      </section>
    </div>

    <div v-if="!companies.length" class="empty">暂无可切换的企业身份。</div>

    <router-link class="btn primary block m-co-add" to="/register"
      >＋ 提交新企业认证</router-link
    >
  </div>
</template>

<script>
import { accountApi } from "@/modules/account/api";

export default {
  name: "Page",
  data() {
    return {
      // 企业列表（来自 catalog.json 的 companies）
      companies: [],
    };
  },
  created() {
    this.load();
  },
  methods: {
    async load() {
      try {
        this.companies = await accountApi.companies();
      } catch (e) {
        this.companies = [];
      }
    },
    // 切换企业：更新当前企业并刷新资料与认证状态
    switchTo(c) {
      this.$store.commit("switchCompany", c.id);
      this.$store.commit("setNotice", `已切换至 ${c.name}（${c.status}）`);
    },
  },
};
</script>

<style>
.m-co-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
/* 企业卡片：当前企业浅蓝描边，标题行右侧放切换按钮 */
.m-co-card {
  padding: 13px 13px 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #fff;
}
.m-co-card.on {
  border-color: #bcd6f8;
  background: #f8fbff;
  box-shadow: 0 4px 14px rgba(23, 104, 213, 0.07);
}
.m-co-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.m-co-head strong {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 13.5px;
  line-height: 1.45;
}
.m-co-head .btn {
  flex: 0 0 auto;
  min-height: 28px;
  padding: 3px 12px;
  font-size: 11px;
}
.m-co-badges {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 7px;
}
.m-co-role {
  color: #8b98a9;
  font-size: 10px;
  font-style: normal;
}
.m-co-meta {
  margin: 5px 0 0;
  color: #7d8b9c;
  font-size: 10.5px;
  line-height: 1.5;
}
.m-co-add {
  margin-top: 14px;
}
</style>
