<!--
  页面：账号登录（login.vue）
  路由：/login ｜ 分组：企业与账号
  作用：手机号/邮箱 + 密码登录，支持记住登录、演示账号一键登录；
        登录成功回到来源页（query.redirect）或首页，未注册引导到注册与企业认证。
  说明：演示环境不校验真实密码，提交后置登录态并持久化
-->
<template>
  <div class="login-page">
    <section class="card login-card">
      <!-- 品牌 -->
      <div class="login-brand">
        <span class="logo">鑫戩</span>
        <div>
          <strong>鑫戩配件直销商城</strong>
          <small>INDUSTRIAL PARTS MALL</small>
        </div>
      </div>

      <h1>账号登录</h1>
      <p class="tiny">登录后可查看企业价、生成报价单并在线下单采购</p>

      <!-- 表单：账号 + 密码 -->
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

      <div class="login-row">
        <label class="login-remember">
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

      <p class="login-foot">
        还没有账号？<router-link to="/register">注册并完成企业认证</router-link>
      </p>
    </section>
  </div>
</template>

<script>
import { authApi } from "@/modules/account/api";
import { IS_MOCK, setToken } from "@/config/env";

export default {
  name: "LoginPage",
  data() {
    return {
      account: "",
      password: "",
      remember: true,
      // mock 模式才显示「演示账号一键登录」
      isMock: IS_MOCK,
    };
  },
  methods: {
    // 登录：演示环境只校验是否填写，随后置登录态
    submit() {
      if (!this.account || !this.password) {
        this.$store.commit("setNotice", "请输入账号与密码");
        return;
      }
      this.doLogin();
    },
    // 演示账号一键登录：跳过输入，便于走查
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
  computed: {
    profile() {
      return this.$store.state.profile || {};
    },
  },
};
</script>

<style>
.login-page {
  max-width: 420px;
  margin: 40px auto 30px;
}
.login-card {
  padding: 30px 30px 24px;
}
.login-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}
.login-brand .logo {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--blue);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}
.login-brand strong {
  display: block;
  font-size: 16px;
}
.login-brand small {
  display: block;
  margin-top: 2px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.5px;
}
.login-card h1 {
  margin: 20px 0 6px;
  font-size: 22px;
}
.login-card > .tiny {
  margin: 0 0 16px;
}
.login-card .review-field {
  margin-bottom: 12px;
}
.login-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 16px;
}
.login-remember {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 12px;
  cursor: pointer;
}
.login-remember input {
  width: 14px;
  height: 14px;
  accent-color: var(--blue);
}
.login-card .btn.block {
  width: 100%;
}
.login-card .btn + .btn {
  margin-top: 10px;
}
.login-foot {
  margin: 16px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 12px;
  text-align: center;
}
.login-foot a {
  color: var(--blue);
}
</style>
