<!--
  页面：注册与企业认证（register.vue）
  路由：/register ｜ 分组：企业与账号
  作用：填写企业名称、统一社会信用代码、联系人与电话，提交企业认证申请
  数据：表单数据仅存于组件 data；提交走 Vuex mutation setAuth 写入认证状态
-->
<template>
  <div>
    <!-- 页头：标题 + 业务说明 -->
    <div class="page-title">
      <h1>注册与企业认证</h1>
      <small>企业认证资料</small>
    </div>
    <!-- 企业资料表单卡片 -->
    <section class="card form">
      <!-- 企业名称：须与营业执照一致 -->
      <div class="review-field">
        <label>企业名称</label
        ><input v-model.trim="company" placeholder="营业执照上的企业名称" />
      </div>
      <!-- 统一社会信用代码：18 位 -->
      <div class="review-field">
        <label>统一社会信用代码</label
        ><input v-model.trim="credit" placeholder="18 位代码" />
      </div>
      <!-- 联系人姓名 -->
      <div class="review-field">
        <label>联系人</label
        ><input v-model.trim="contact" placeholder="联系人姓名" />
      </div>
      <!-- 联系电话：手机号 -->
      <div class="review-field">
        <label>联系电话</label
        ><input v-model.trim="phone" placeholder="手机号" />
      </div>
      <!-- 提交按钮：四项资料齐全后写入"审核中"并跳转认证进度页 -->
      <button class="btn primary block" @click="submit">提交认证申请</button>
      <p class="tiny form-hint">营业执照附件、审核结果和企业身份由正式认证接口管理。</p>
      <!-- 账号入口：已有账号去登录，已提交可查看认证进度 -->
      <div class="form-links">
        <router-link to="/login">已有账号？去登录</router-link>
        <router-link to="/auth-status">查看认证进度</router-link>
      </div>
    </section>
  </div>
</template>
<script>
import { authApi } from "@/modules/account/api";
import { IS_MOCK, setToken } from "@/config/env";

export default {
  data() {
    // company：企业名称；credit：统一社会信用代码；contact：联系人；phone：联系电话（均经 v-model.trim 去空格）
    return { company: "", credit: "", contact: "", phone: "" };
  },
  methods: {
    // 提交认证申请：mock 写入本地企业列表；api 模式提交后端并保存 token
    async submit() {
      // 必填校验：企业名称、信用代码、联系人、联系电话缺一即提示
      if (!this.company || !this.credit || !this.contact || !this.phone) {
        this.$store.commit("setNotice", "请补齐企业资料");
        return;
      }
      const payload = {
        name: this.company,
        taxId: this.credit,
        contact: this.contact,
        phone: this.phone,
      };
      try {
        if (IS_MOCK) {
          this.$store.commit("registerCompany", payload);
        } else {
          const res = await authApi.register(payload);
          if (res && res.token) setToken(res.token);
          if (res && res.profile) {
            this.$store.commit("updateProfile", res.profile);
          }
          this.$store.commit("login");
        }
        this.$store.commit("setNotice", "认证申请已提交，等待平台审核");
        this.$router.push("/auth-status");
      } catch (e) {
        this.$store.commit("setNotice", e.message || "提交失败，请稍后重试");
      }
    },
  },
};
</script>
