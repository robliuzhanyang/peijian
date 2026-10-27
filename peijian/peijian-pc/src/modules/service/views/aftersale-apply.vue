<!--
  页面：申请售后（aftersale-apply.vue）
  路由：/aftersale-apply ｜ 分组：内容与服务
  作用：填写售后申请表单（申请类型、问题描述、本地附件名），校验后携带订单 id 与类型跳转售后详情
  数据：route.query.id 为来源订单 id；表单数据仅存于本页 data，不提交服务端
-->
<template>
  <div>
    <!-- 页头：标题 + 来源订单号（未携带时显示"未选择"） -->
    <div class="page-title">
      <h1>申请售后</h1>
      <small>订单 {{ $route.query.id || "未选择" }}</small>
    </div>
    <!-- 售后表单：申请类型、问题描述、附件选择 -->
    <section class="card form">
      <!-- 申请类型：下拉选择，默认退货退款 -->
      <div class="review-field">
        <label>申请类型</label
        ><select v-model="type">
          <option>退货退款</option>
          <option>仅退款</option>
          <option>维修换货</option>
        </select>
      </div>
      <!-- 问题描述：必填，v-model.trim 自动去除首尾空白 -->
      <div class="review-field">
        <label>问题描述</label
        ><textarea
          v-model.trim="reason"
          placeholder="描述产品和问题"
        ></textarea>
      </div>
      <!-- 附件：选择问题照片或凭证文件 -->
      <div class="review-field">
        <label>附件（问题照片/凭证）</label
        ><input
          type="file"
          @change="
            filename = $event.target.files[0] && $event.target.files[0].name
          "
        /><small>{{ filename }}</small>
      </div>
      <!-- 提交按钮：问题描述为空时拦截并提示 -->
      <button class="btn primary" @click="submit">提交申请</button>
    </section>
  </div>
</template>
<script>
export default {
  data() {
    // 表单数据：type 申请类型（默认退货退款）、reason 问题描述（提交前必填）、filename 本地附件名（仅展示）
    return { type: "退货退款", reason: "", filename: "" };
  },
  methods: {
    // 保存售后申请：描述为空时提示并中断；否则写入 store 并跳转售后详情页
    submit() {
      if (!this.reason) {
        this.$store.commit("setNotice", "请填写问题描述");
        return;
      }
      const a = this.$store.commit("createAftersale", {
        orderId: this.$route.query.id,
        type: this.type,
        reason: this.reason,
      });
      this.$store.commit("setNotice", "售后申请已提交，等待客服审核");
      this.$router.push({ path: "/aftersale-detail", query: { id: a.id } });
    },
  },
};
</script>
