<!--
  页面：单笔订单开票（invoice-apply.vue）
  路由：/invoice-apply ｜ 分组：合同与发票
  作用：填写发票类型、企业抬头、统一社会信用代码与接收邮箱，必填校验通过后跳转发票详情页
  数据：读取路由 query.id；表单数据保存在页面本地 data，校验提示走 mutation setNotice
-->
<template>
  <div>
    <!-- 页头：标题 + 关联订单号 -->
    <div class="page-title">
      <h1>单笔订单开票</h1>
      <small>订单 {{ $route.query.id || "未选择" }}</small>
    </div>
    <!-- 开票申请表单 -->
    <section class="card form">
      <!-- 发票类型：普票/专票二选一 -->
      <div class="review-field">
        <label>发票类型</label
        ><select v-model="type">
          <option>增值税普通发票</option>
          <option>增值税专用发票</option>
        </select>
      </div>
      <!-- 企业抬头 -->
      <div class="review-field">
        <label>企业抬头</label
        ><input v-model.trim="title" placeholder="填写完整企业名称" />
      </div>
      <!-- 统一社会信用代码（纳税人识别号） -->
      <div class="review-field">
        <label>统一社会信用代码</label
        ><input v-model.trim="taxId" placeholder="填写纳税人识别号" />
      </div>
      <!-- 电子发票接收邮箱 -->
      <div class="review-field">
        <label>接收邮箱</label
        ><input
          v-model.trim="email"
          type="email"
          placeholder="电子发票接收邮箱"
        />
      </div>
      <p class="tiny">开票资格、税率和金额由订单与发票接口校验。</p>
      <button class="btn primary" @click="submit">提交开票申请</button>
    </section>
  </div>
</template>
<script>
export default {
  data() {
    // type 发票类型；title 企业抬头；taxId 统一社会信用代码；email 电子发票接收邮箱
    return { type: "增值税普通发票", title: "", taxId: "", email: "" };
  },
  computed: {
    // 当前订单：按路由 query.id 匹配，用于回填开票金额
    order() {
      return this.$store.state.orders.find(
        (o) => o.id === this.$route.query.id,
      );
    },
  },
  created() {
    // 已存在发票（如被驳回）时回填原信息，便于修改重提
    const exist = this.$store.state.invoices.find(
      (v) => v.orderId === this.$route.query.id,
    );
    if (exist) {
      this.type = exist.type;
      this.title = exist.title;
      this.taxId = exist.taxId;
      this.email = exist.email;
    }
  },
  methods: {
    // 保存开票申请：必填项缺失时提示；通过后写入 store 并跳转发票详情
    submit() {
      if (!this.title || !this.taxId || !this.email) {
        this.$store.commit("setNotice", "请填写企业抬头、税号和邮箱");
        return;
      }
      const v = this.$store.commit("createInvoice", {
        orderId: this.$route.query.id,
        type: this.type,
        title: this.title,
        taxId: this.taxId,
        email: this.email,
        amountFen: this.order ? this.order.totalFen : 0,
      });
      this.$store.commit("setNotice", "开票申请已提交，等待审核");
      this.$router.push({ path: "/invoice-detail", query: { id: v.id } });
    },
  },
};
</script>
