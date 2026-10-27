<!--
  页面：我的订单（orders.vue）
  路由：/orders ｜ 分组：交易与履约
  作用：按订单状态筛选展示订单列表，独立订单卡片展示订单号、状态、商品摘要、金额与操作
  数据：读取 Vuex state.orders；状态筛选在前端 computed 内完成
-->
<template>
  <div class="ord-page">
    <!-- 订单状态筛选条：胶囊式 -->
    <div class="ord-tabs">
      <button
        v-for="s in statuses"
        :key="s"
        :class="{ on: status === s }"
        @click="status = s"
      >
        {{ s }}
      </button>
    </div>

    <!-- 订单卡片列表 -->
    <div v-for="o in filtered" :key="o.id" class="ord-card">
      <!-- 卡头：订单号 + 时间，右侧状态徽章 -->
      <div class="ord-card-head">
        <div class="ord-card-id">
          <strong>{{ o.id }}</strong>
          <span class="ord-card-time">{{ o.createdAt || '时间待确认' }}</span>
        </div>
        <span class="ord-status" :class="badgeClass(o.status)">{{ o.status }}</span>
      </div>

      <!-- 卡身：缩略图 + 商品摘要 -->
      <div class="ord-card-body">
        <div class="ord-thumbs">
          <div v-for="(img, i) in thumbs(o).slice(0, 3)" :key="i" class="ord-thumb">
            <img v-if="img" :src="img" alt="" />
            <AppIcon v-else name="box" />
          </div>
          <div v-if="o.items.length > 3" class="ord-thumb ord-thumb-more">
            +{{ o.items.length - 3 }}
          </div>
        </div>
        <p class="ord-goods">{{ summary(o) }}</p>
      </div>

      <!-- 卡底：金额 + 操作 -->
      <div class="ord-card-foot">
        <div class="ord-amount">
          <span>实付</span>
          <strong>{{ money(o.totalFen) }}</strong>
        </div>
        <div class="ord-actions">
          <button v-if="o.status === '待付款'" class="ord-btn ghost" @click="cancel(o.id)">取消订单</button>
          <button v-if="o.status === '待发货'" class="ord-btn ghost" @click="remind(o.id)">催发货</button>
          <button v-if="o.status === '待收货'" class="ord-btn primary" @click="confirm(o.id)">确认收货</button>
          <router-link
            class="ord-btn ghost"
            :to="{ path: '/order-detail', query: { id: o.id } }"
          >查看详情</router-link>
        </div>
      </div>
    </div>

    <!-- 当前筛选状态下无订单的空态 -->
    <div v-if="!filtered.length" class="ord-empty">
      <div class="ord-empty-ico">
        <AppIcon name="box" />
      </div>
      <p>该状态暂无订单</p>
      <router-link to="/goods">去选购</router-link>
    </div>
  </div>
</template>
<script>
// 领域工具：金额分转元、静态资源路径
import { money, asset } from '@/domain/productFields'
import AppIcon from '@/components/AppIcon.vue'
export default {
  components: { AppIcon },
  data() {
    return {
      // 当前选中的状态筛选项（支持总览页带 status 查询参数直达）
      status: this.$route.query.status || '全部',
      // 状态筛选项全集（与订单生命周期状态一一对应）
      statuses: [
        '全部',
        '待付款',
        '待核款',
        '已付款',
        '待发货',
        '运输中',
        '待收货',
        '已完成',
        '已取消',
        '售后中',
      ],
    }
  },
  computed: {
    // 按选中状态过滤后的订单列表（"全部"时不过滤）
    filtered() {
      return this.$store.state.orders.filter(
        (o) => this.status === '全部' || o.status === this.status
      )
    },
  },
  methods: {
    money,
    asset,
    cancel(id) {
      if (!confirm('确认取消该订单？')) return
      this.$store.commit('cancelOrder', { id })
      this.$store.commit('setNotice', '订单已取消')
    },
    remind(id) {
      this.$store.commit('remindShip', id)
      this.$store.commit('setNotice', '已提醒商家尽快发货')
    },
    confirm(id) {
      if (!confirm('确认已收到货物？')) return
      this.$store.commit('confirmReceipt', id)
      this.$store.commit('setNotice', '已确认收货')
    },
    // 订单商品缩略图：从商品库反查图片
    thumbs(o) {
      return o.items.map((l) => {
        const p = this.$store.getters.product(l.productId)
        return p ? this.asset(p.image) : null
      })
    },
    // 订单行商品摘要：从商品库反查名称，拼接数量，最多展示 2 项
    summary(o) {
      const names = o.items
        .map((l) => {
          const p = this.$store.getters.product(l.productId)
          const n = l.name || (p ? p.name : l.skuCode)
          return n + ' ×' + l.quantity
        })
        .slice(0, 2)
      const more = o.items.length > 2 ? ' 等 ' + o.items.length + ' 类商品' : ''
      return names.join('、') + more
    },
    // 订单状态对应的徽章配色
    badgeClass(status) {
      if (status === '已完成') return 'green'
      if (status === '售后中') return 'gold'
      if (status === '已取消') return 'red'
      if (status === '待付款' || status === '待核款') return 'orange'
      return 'blue'
    },
  },
}
</script>
<style scoped>
.ord-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
/* 筛选胶囊条 */
.ord-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0 2px;
}
.ord-tabs button {
  padding: 7px 16px;
  border: 1px solid #e3e8f0;
  border-radius: 17px;
  background: #fff;
  color: #5a6675;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.16s;
}
.ord-tabs button:hover {
  border-color: #b9ccf0;
  color: #1f5fcf;
}
.ord-tabs button.on {
  background: #1f5fcf;
  border-color: #1f5fcf;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(31, 95, 207, 0.24);
}
/* 订单卡片 */
.ord-card {
  border: 1px solid #e9edf3;
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
  transition: box-shadow 0.18s, border-color 0.18s;
}
.ord-card:hover {
  border-color: #d3dff2;
  box-shadow: 0 10px 28px rgba(20, 48, 92, 0.08);
}
/* 卡头 */
.ord-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #f8fafd;
  border-bottom: 1px solid #eef1f6;
}
.ord-card-id {
  display: flex;
  align-items: baseline;
  gap: 14px;
}
.ord-card-id strong {
  font-size: 14px;
  color: #1c2430;
}
.ord-card-time {
  font-size: 12px;
  color: #97a1b0;
}
/* 状态徽章 */
.ord-status {
  padding: 4px 11px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.3;
}
.ord-status.blue {
  background: #eaf1fe;
  color: #1f5fcf;
}
.ord-status.orange {
  background: #fff3e3;
  color: #d4760a;
}
.ord-status.green {
  background: #e7f6ee;
  color: #1f9254;
}
.ord-status.gold {
  background: #fdf2dd;
  color: #b97c12;
}
.ord-status.red {
  background: #fdeae8;
  color: #d83b27;
}
/* 卡身 */
.ord-card-body {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 20px;
}
.ord-thumbs {
  flex: 0 0 auto;
  display: flex;
  gap: 8px;
}
.ord-thumb {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(160deg, #f4f7fc, #e9eef6);
  overflow: hidden;
}
.ord-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.ord-thumb .icon {
  width: 24px;
  height: 24px;
  color: #9aa6b8;
}
.ord-thumb-more {
  color: #6d7d92;
  font-size: 14px;
  font-weight: 700;
}
.ord-goods {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  color: #3a4656;
  font-size: 13px;
  line-height: 1.6;
}
/* 卡底 */
.ord-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  border-top: 1px solid #eef1f6;
}
.ord-amount {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.ord-amount span {
  font-size: 13px;
  color: #8b94a3;
}
.ord-amount strong {
  color: #e23d28;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.3px;
}
/* 操作按钮 */
.ord-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ord-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 18px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.16s;
}
.ord-btn.ghost {
  border: 1px solid #d5deeb;
  background: #fff;
  color: #4a5a70;
}
.ord-btn.ghost:hover {
  border-color: #1f5fcf;
  color: #1f5fcf;
  background: #f5f8ff;
}
.ord-btn.primary {
  border: 1px solid #1f5fcf;
  background: #1f5fcf;
  color: #fff;
  box-shadow: 0 4px 12px rgba(31, 95, 207, 0.24);
}
.ord-btn.primary:hover {
  background: #1850b4;
}
/* 空态 */
.ord-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px 0;
}
.ord-empty-ico {
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f2f5fa;
}
.ord-empty-ico .icon {
  width: 30px;
  height: 30px;
  color: #a9b4c4;
}
.ord-empty p {
  margin: 4px 0 0;
  color: #8b94a3;
  font-size: 14px;
}
.ord-empty a {
  margin-top: 4px;
  color: #1f5fcf;
  font-size: 13px;
  font-weight: 600;
}
</style>
