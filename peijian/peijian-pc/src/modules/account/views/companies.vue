<!--
  页面：切换企业（companies.vue）
  路由：/companies ｜ 分组：企业与账号
  作用：展示账号下可切换的企业列表及认证状态，当前企业高亮
  数据：accountApi.companies() 取企业列表 [{id,name,taxId,contact,phone,role,status,current}]
-->
<template>
  <div>
    <!-- 页头：标题 + 业务说明 -->
    <div class="page-title">
      <h1>切换企业</h1>
      <small>同一账号可管理多个企业身份与采购权限</small>
    </div>

    <!-- 企业列表：当前企业带角标，点击切换当前企业身份 -->
    <section class="card">
      <div v-for="c in companies" :key="c.id" class="order-line">
        <div class="order-info">
          <div class="order-id">
            <strong>{{ c.name }}</strong>
            <span v-if="c.current" class="badge blue">当前企业</span>
            <span
              class="badge"
              :class="c.status === '已认证' ? 'green' : 'gold'"
              >{{ c.status }}</span
            >
          </div>
          <p class="tiny">{{ c.role }} ｜ 信用代码 {{ c.taxId }}</p>
          <p class="tiny">联系人 {{ c.contact }} · {{ c.phone }}</p>
        </div>
        <div>
          <button v-if="!c.current" class="btn sm" @click="switchTo(c)">
            切换
          </button>
        </div>
      </div>

      <div v-if="!companies.length" class="empty">暂无可切换的企业身份。</div>

      <div
        class="action-row"
        style="
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--line);
        "
      >
        <router-link class="btn primary" to="/register"
          >提交新企业认证</router-link
        >
      </div>
    </section>
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
