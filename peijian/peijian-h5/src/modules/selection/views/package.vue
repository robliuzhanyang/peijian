<!-- 历史兼容入口：原“套装直购”已合并至“一站式选购”。 -->
<template>
  <section class="card" style="padding: 28px; text-align: center">
    <h2>正在进入一站式选购</h2>
    <p class="tiny">原套装直购与分步选配已合并。</p>
    <router-link class="btn primary" to="/diy">立即进入</router-link>
  </section>
</template>

<script>
export default {
  name: "LegacyPackageRedirectH5",
  created() {
    this.$router.replace({ path: "/diy", query: { entry: "package" } });
  },
};
</script>
