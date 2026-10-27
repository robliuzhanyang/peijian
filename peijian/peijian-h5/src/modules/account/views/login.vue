<!--
  页面：账号登录（H5）
  路由：/login ｜ 分组：企业与账号
  作用：手机号/邮箱 + 密码登录，支持演示账号一键登录；
        登录成功回到来源页（query.redirect）或首页。
  数据：当前为演示登录（store.login + localStorage），接后端时改为 POST /auth/login 并保存 token。
-->
<template>
  <div class="m-login">
    <section class="card m-login-card">
      <div class="m-login-brand">
        <span class="logo">鑫戩</span>
        <div>
          <strong>鑫戩配件商城</strong>
          <small>工业配件一站式直采</small>
        </div>
      </div>

      <h1>账号登录</h1>
      <p class="tiny">登录后查看企业价、生成报价单并下单采购</p>

      <div class="review-field">
        <label>手机号 / 邮箱</label>
        <input
          v-model.trim="account"
          placeholder="请输入手机号或邮箱"
          @keyup.enter="submit"
        />
      </div>
      <div class="review-field">
        <label>登录密码</label>
        <input
          v-model.trim="password"
          type="password"
          placeholder="请输入密码"
          @keyup.enter="submit"
        />
      </div>

      <div class="m-login-row">
        <label class="m-login-remember">
          <input v-model="remember" type="checkbox" /> 记住登录
        </label>
        <router-link class="link tiny" to="/support">忘记密码？联系客服</router-link>
      </div>

      <button class="btn primary block" type="button" @click="submit">
        登录
      </button>
      <button
        v-if="isMock"
        class="btn block"
        type="button"
        @click="demoLogin"
      >
        演示账号一键登录
      </button>

      <p class="m-login-foot">
        还没有账号？<router-link to="/register">注册并完成企业认证</router-link>
      </p>
    </section>
  </div>
</template>

<script>
import { authApi } from "@/modules/account/api";
import { IS_MOCK, setToken } from "@/config/env";

export default {
  name: "LoginPageH5",
  data() {
    return {
      account: "",
      password: "",
      remember: true,
      // mock 模式才显示「演示账号一键登录」
      isMock: IS_MOCK,
    };
  },
  computed: {
    profile() {
      return this.$store.state.profile || {};
    },
  },
  methods: {
    // 表单登录：演示环境只校验非空；接后端后在此调用登录接口
    submit() {
      if (!this.account || !this.password) {
        this.$store.commit("setNotice", "请输入账号与密码");
        return;
      }
      this.doLogin();
    },
    // 一键演示登录：跳过表单校验，便于评审与联调
    demoLogin() {
      this.doLogin("已使用演示账号登录");
    },
    // 统一登录落地：请求后端 → 保存 token 与资料 → 回到 redirect 或首页
    async doLogin(message) {
      try {
        const res = await authApi.login({
          account: this.account,
          password: this.password,
        });
        if (res && res.token) setToken(res.token);
        if (res && res.profile) {
          this.$store.commit("updateProfile", res.profile);
        }
        this.$store.commit("login");
        const name = (res && res.profile && res.profile.name) || this.profile.name;
        this.$store.commit(
          "setNotice",
          message || `登录成功，欢迎回来${name ? "，" + name : ""}`
        );
        const redirect = this.$route.query.redirect;
        this.$router.replace(
          typeof redirect === "string" && redirect ? redirect : "/home"
        );
      } catch (e) {
        this.$store.commit("setNotice", e.message || "登录失败，请稍后重试");
      }
    },
  },
};
</script>

<style>
.m-login {
  padding-top: 18px;
}
.m-login-card {
  padding: 20px 18px 18px;
}
.m-login-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--line);
}
.m-login-brand .logo {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 7px;
  background: var(--blue);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}
.m-login-brand strong {
  display: block;
  font-size: 14px;
}
.m-login-brand small {
  display: block;
  margin-top: 2px;
  color: var(--muted);
  font-size: 9px;
}
.m-login-card h1 {
  margin: 16px 0 4px;
  font-size: 19px;
}
.m-login-card > .tiny {
  margin: 0 0 14px;
}
.m-login-card .review-field {
  margin-bottom: 10px;
}
.m-login-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2px 0 14px;
}
.m-login-remember {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--muted);
  font-size: 11px;
}
.m-login-remember input {
  width: 13px;
  height: 13px;
  accent-color: var(--blue);
}
.m-login-card .btn + .btn {
  margin-top: 9px;
}
.m-login-foot {
  margin: 14px 0 0;
  padding-top: 12px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 11px;
  text-align: center;
}
.m-login-foot a {
  color: var(--blue);
}
</style>
