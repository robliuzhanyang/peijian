<!--
  页面：物流跟踪（logistics.vue）
  路由：/logistics ｜ 分组：交易与履约
  作用：展示订单的物流公司、运单号与倒序物流轨迹（timeline）；未发货订单保留占位提示，不虚构物流信息
  数据：created 中经 tradeApi.logistics(query.id) 拉取 {company, waybill, nodes}，无数据时为 null
-->
<template>
  <div>
    <!-- 页头：标题 + 订单号 -->
    <div class="page-title">
      <h1>物流跟踪</h1>
      <small>订单 {{ $route.query.id || '待选择' }}</small>
    </div>
    <!-- 已发货：物流公司、运单号、收货提示与物流轨迹 -->
    <template v-if="logistics">
      <section class="card">
        <h2>物流信息</h2>
        <div class="spec-grid">
          <div class="field-row">
            <span>物流公司</span><strong>{{ logistics.company }}</strong>
          </div>
          <div class="field-row">
            <span>运单号</span><strong>{{ logistics.waybill }}</strong>
          </div>
        </div>
        <p class="tiny detail-tip">
          收货提示：请核对商品外观与数量无误后再签收，异常请当场联系客服。
        </p>
      </section>
      <section class="card">
        <h2>物流轨迹</h2>
        <!-- nodes 按时间倒序，首节点即最新节点，:first-child 已有高亮样式 -->
        <div class="timeline">
          <div v-for="(n, i) in logistics.nodes" :key="i" class="timeline-node">
            <strong :class="{ 'field-pending': n.state === 'todo' }">{{ n.title }}</strong>
            <small :class="{ 'field-pending': n.state === 'todo' }">
              {{ n.time }} · {{ n.desc }}
            </small>
          </div>
        </div>
      </section>
      <router-link class="btn ghost block" to="/orders">返回订单</router-link>
    </template>
    <!-- 未发货（接口返回 null）：保留原占位，不生成虚构物流信息 -->
    <section v-else class="card">
      <h2>履约时间线</h2>
      <div class="spec-grid">
        <div class="field-row"><span>订单提交</span><strong>已记录</strong></div>
        <div class="field-row">
          <span>支付 / 核款</span><strong>以订单状态为准</strong>
        </div>
        <div class="field-row">
          <span>备货与出库</span
          ><strong class="field-pending">待物流接口回传</strong>
        </div>
        <div class="field-row">
          <span>运输 / 签收</span
          ><strong class="field-pending">待物流接口回传</strong>
        </div>
      </div>
      <p class="tiny detail-tip">
        物流信息由承运商回传，发货后自动更新运单号与轨迹。
      </p>
      <router-link class="btn ghost block" to="/orders">返回订单</router-link>
    </section>
  </div>
</template>
<script>
// 交易后业务线接口：按订单 id 拉取物流轨迹
import { tradeApi } from '@/modules/trade/api'
export default {
  name: 'Page',
  data() {
    return {
      // 物流数据：{company, waybill, nodes:[{time,title,desc,state}]}；未发货时为 null
      logistics: null,
    }
  },
  async created() {
    this.logistics = await tradeApi.logistics(this.$route.query.id)
  },
}
</script>
