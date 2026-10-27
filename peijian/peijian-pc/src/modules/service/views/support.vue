<!--
  页面：客户支持（support.vue）
  路由：/support ｜ 分组：内容与服务
  作用：展示客服联系方式、服务时间与支持渠道，聚合产品/订单/售后三个支持入口
  数据：serviceApi.support() 取 {hotline, hours, email, channels}
-->
<template>
  <div>
    <!-- 页头：标题 + 服务范围说明 -->
    <div class="page-title">
      <h1>客户支持</h1>
      <small>报价咨询、产品资料、订单与售后</small>
    </div>

    <!-- 联系方式卡：热线、服务时间、邮箱 -->
    <section class="card">
      <div class="identity-grid">
        <div>
          <small>客服热线</small><strong>{{ info.hotline || "—" }}</strong>
        </div>
        <div>
          <small>服务时间</small><strong>{{ info.hours || "—" }}</strong>
        </div>
        <div>
          <small>支持邮箱</small><strong>{{ info.email || "—" }}</strong>
        </div>
      </div>
    </section>

    <!-- 支持渠道卡片：报价咨询、技术支持、订单与售后 -->
    <div class="three-col" style="margin-top: 15px">
      <router-link class="card" v-for="(ch, i) in links" :key="i" :to="ch.to"
        ><h2>{{ ch.name }}</h2>
        <p>{{ ch.desc }}</p></router-link
      >
    </div>

    <!-- 原有三大快捷入口 -->
    <div class="three-col" style="margin-top: 15px">
      <router-link class="card" to="/goods"
        ><h2>产品咨询</h2>
        <p>核对产品型号、视图与待补充资料</p></router-link
      ><router-link class="card" to="/orders"
        ><h2>订单支持</h2>
        <p>查看履约与物流进度</p></router-link
      ><router-link class="card" to="/aftersales"
        ><h2>售后服务</h2>
        <p>按订单申请售后</p></router-link
      >
    </div>

    <p class="tiny">
      如热线繁忙，可通过订单页申请售后或留言，客服将在服务时间内跟进。
    </p>
  </div>
</template>

<script>
import serviceApi from "@/modules/service/api";

export default {
  name: "Page",
  data() {
    return {
      // 客服联系信息与渠道（来自 catalog.json 的 support）
      info: {},
      links: [],
    };
  },
  created() {
    this.load();
  },
  methods: {
    async load() {
      try {
        const d = await serviceApi.support();
        this.info = d;
        this.links = d.channels || [];
      } catch (e) {
        this.info = {};
        this.links = [];
      }
    },
  },
};
</script>
