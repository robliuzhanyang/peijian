<!--
  页面：账号设置（settings.vue）
  路由：/settings ｜ 分组：企业与账号
  作用：展示个人与企业资料摘要，支持编辑联系人/手机号/邮箱，聚合企业身份与收货地址等入口
  数据：资料来自 Vuex state.profile（可编辑并持久化）；企业认证状态读 Vuex
-->
<template>
  <div>
    <div class="page-title">
      <h1>账号设置</h1>
      <small>个人资料、企业身份与常用地址</small>
    </div>

    <!-- 个人与企业资料摘要：编辑模式时切换为表单 -->
    <section class="card">
      <div class="between">
        <h2>资料摘要</h2>
        <button v-if="!editing" class="btn sm" @click="editing = true">编辑资料</button>
        <template v-else>
          <button class="btn sm primary" @click="save">保存</button>
          <button class="btn sm ghost" @click="reset">取消</button>
        </template>
      </div>
      <div v-if="!editing" class="identity-grid" style="margin-top: 12px">
        <div>
          <small>联系人</small><strong>{{ profile.name || "—" }}</strong>
        </div>
        <div>
          <small>手机号</small><strong>{{ profile.mobile || "—" }}</strong>
        </div>
        <div>
          <small>岗位角色</small><strong>{{ profile.role || "—" }}</strong>
        </div>
        <div>
          <small>所属企业</small>
          ><strong>{{ profile.companyName || "—" }}</strong>
        </div>
        <div>
          <small>认证状态</small><strong>{{ $store.state.authStatus }}</strong>
        </div>
        <div>
          <small>联系邮箱</small><strong>{{ profile.email || "—" }}</strong>
        </div>
      </div>
      <div v-else class="form" style="margin-top: 12px">
        <div class="review-field">
          <label>联系人</label><input v-model.trim="form.name" />
        </div>
        <div class="review-field">
          <label>手机号</label><input v-model.trim="form.mobile" />
        </div>
        <div class="review-field">
          <label>岗位角色</label><input v-model.trim="form.role" />
        </div>
        <div class="review-field">
          <label>联系邮箱</label><input v-model.trim="form.email" type="email" />
        </div>
      </div>
    </section>

    <!-- 设置项卡片：每行含标题、说明与右箭头，点击跳转对应管理页 -->
    <section class="card setting-card">
      <h2>账号管理</h2>
      <router-link
        v-for="item in settingLinks"
        :key="item.to"
        class="setting-row"
        :to="item.to"
      >
        <span class="setting-ico" :class="item.cls" v-text="item.ico"></span>
        <span class="setting-text">
          <strong>{{ item.name }}</strong>
          <small>{{ item.desc }}</small>
        </span>
        <span class="setting-arrow">›</span>
      </router-link>
      <p class="tiny">密码、隐私与通知设置由正式账号接口提供。</p>
    </section>
  </div>
</template>

<script>
export default {
  name: "Page",
  data() {
    return {
      editing: false,
      form: { name: "", mobile: "", role: "", email: "" },
      // 账号管理入口：图标字符 + 标题 + 说明 + 跳转路径
      settingLinks: [
        { ico: "企", cls: "c2", name: "企业资料", desc: "企业信息与认证状态", to: "/auth-status" },
        { ico: "换", cls: "c3", name: "多企业身份", desc: "切换当前采购企业", to: "/companies" },
        { ico: "址", cls: "c4", name: "收货地址", desc: "维护企业收货地址", to: "/addresses" },
      ],
    };
  },
  computed: {
    profile() {
      return this.$store.state.profile;
    },
  },
  methods: {
    save() {
      if (!this.form.name) {
        this.$store.commit("setNotice", "联系人不能为空");
        return;
      }
      this.$store.commit("updateProfile", { ...this.form });
      this.editing = false;
      this.$store.commit("setNotice", "资料已保存");
    },
    reset() {
      this.editing = false;
    },
  },
  watch: {
    editing(v) {
      if (v) {
        const p = this.profile || {};
        this.form = {
          name: p.name || "",
          mobile: p.mobile || "",
          role: p.role || "",
          email: p.email || "",
        };
      }
    },
  },
};
</script>
