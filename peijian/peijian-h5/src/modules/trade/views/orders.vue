<!--
  页面：我的订单（orders.vue）
  路由：/orders ｜ 分组：交易与履约
  作用：按订单状态筛选展示卡片式订单列表，含商品缩略图、金额与履约操作
  数据：读取 Vuex state.orders；状态筛选在前端 computed 内完成
-->
<template>
  <div class="ord-page">
    <!-- 订单状态筛选条：横向滚动胶囊 -->
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

    <!-- 订单卡片 -->
    <div v-for="o in filtered" :key="o.id" class="ord-card">
      <div class="ord-card-head">
        <div class="ord-card-id">
          <strong>{{ o.id }}</strong>
          <span class="ord-card-time">{{ o.createdAt || '时间待确认' }}</span>
        </div>
        <span class="ord-status" :class="badgeClass(o.status)">{{ o.status }}</span>
      </div>
      <div class="ord-card-body">
        <div class="ord-thumbs">
          <div v-for="(img, i) in thumbs(o).slice(0, 3)" :key="i" class="ord-thumb">
            <img v-if="img" :src="img" alt="" />
            <UiIcon v-else name="box" />
          </div>
          <div v-if="o.items.length > 3" class="ord-thumb ord-thumb-more">
            +{{ o.items.length - 3 }}
          </div>
        </div>
        <p class="ord-goods">{{ summary(o) }}</p>
      </div>
      <div class="ord-card-amount">
        <span>实付</span>
        <strong>{{ money(o.totalFen) }}</strong>
      </div>
      <div class="ord-card-foot">
        <button v-if="o.status === '待付款'" class="ord-btn ghost" @click="cancel(o.id)">取消订单</button>
        <button v-if="o.status === '待发货'" class="ord-btn ghost" @click="remind(o.id)">催发货</button>
        <button v-if="o.status === '待收货'" class="ord-btn primary" @click="confirm(o.id)">确认收货</button>
        <router-link
          class="ord-btn ghost"
          :to="{ path: '/order-detail', query: { id: o.id } }"
          >查看详情</router-link
        >
      </div>
    </div>

    <!-- 当前筛选状态下无订单的空态 -->
    <div v-if="!filtered.length" class="ord-empty">
      <div class="ord-empty-ico"><UiIcon name="box" /></div>
      <p>该状态暂无订单</p>
      <router-link to="/goods">去选购</router-link>
    </div>
  </div>
</template>
<script>
import { money, asset } from '@/domain/productFields'
import UiIcon from '@/components/UiIcon.vue'

export default {
  components: { UiIcon },
  data() {
    return {
      // 当前选中的状态筛选项（支持我的页带 status 查询参数直达）
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
    // 订单商品图片快照（最多由模板截取前 3 张）
    thumbs(o) {
      return o.items.map((l) => {
        const p = this.$store.getters.product(l.productId)
        return p ? this.asset(p.image) : null
      })
    },
    // 订单行商品摘要：从商品库反查名称，拼接数量，最多展示 2 项
    summary(o) {
      const names = o.items.map((l) => {
        const p = this.$store.getters.product(l.productId)
        const n = l.name || (p ? p.name : l.skuCode)
        return n + ' ×' + l.quantity
      })
      return names.slice(0, 2).join('、') + (o.items.length > 2 ? ' 等' : '')
    },
    // 订单状态对应的徽章配色（返回卡片式状态类名）
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
  gap: 12px;
}
/* 胶囊筛选条：横向滚动不换行 */
.ord-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 2px 6px;
  -webkit-overflow-scrolling: touch;
}
.ord-tabs::-webkit-scrollbar {
  display: none;
}
.ord-tabs button {
  flex: 0 0 auto;
  height: 32px;
  padding: 0 16px;
  border-radius: 16px;
  border: 1px solid #e3e8f0;
  background: #fff;
  color: #5a6472;
  font-size: 13px;
  transition: all 0.18s;
}
.ord-tabs button.on {
  background: #1f5fcf;
  border-color: #1f5fcf;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(31, 95, 207, 0.25);
}
/* 订单卡片 */
.ord-card {
  border-radius: 14px;
  background: #fff;
  border: 1px solid #edf0f5;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(28, 36, 48, 0.04);
}
.ord-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  background: #f8fafd;
  border-bottom: 1px solid #f0f2f6;
}
.ord-card-id {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.ord-card-id strong {
  font-size: 13px;
  color: #1c2430;
}
.ord-card-time {
  font-size: 11px;
  color: #9aa3ad;
}
/* 卡片状态标签 */
.ord-status {
  flex: 0 0 auto;
  padding: 4px 10px;
  border-radius: 11px;
  font-size: 11px;
  font-weight: 600;
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
/* 卡身：缩略图 + 摘要 */
.ord-card-body {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
}
.ord-thumbs {
  flex: 0 0 auto;
  display: flex;
  gap: 6px;
}
.ord-thumb {
  width: 50px;
  height: 50px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: linear-gradient(160deg, #f4f7fc, #e9eef6);
  overflow: hidden;
}
.ord-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.ord-thumb .icon {
  width: 22px;
  height: 22px;
  color: #9aa6b8;
}
.ord-thumb-more {
  background: #eef2f8;
  font-size: 12px;
  font-weight: 600;
  color: #7a8493;
}
.ord-goods {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #2a3340;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
/* 金额行 */
.ord-card-amount {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 6px;
  padding: 0 14px;
}
.ord-card-amount span {
  font-size: 12px;
  color: #8b94a3;
}
.ord-card-amount strong {
  font-size: 19px;
  font-weight: 800;
  color: #e23d28;
}
/* 卡底操作 */
.ord-card-foot {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 14px 14px;
}
.ord-btn {
  height: 32px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 12px;
  transition: all 0.16s;
}
.ord-btn.ghost {
  background: #fff;
  border: 1px solid #d9dfe8;
  color: #5a6472;
}
.ord-btn.ghost:active {
  background: #f4f6fa;
}
.ord-btn.primary {
  background: #1f5fcf;
  border: 1px solid #1f5fcf;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(31, 95, 207, 0.22);
}
/* 空态 */
.ord-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 0;
  color: #8b94a3;
}
.ord-empty-ico {
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f2f5fa;
  margin-bottom: 14px;
}
.ord-empty-ico .icon {
  width: 30px;
  height: 30px;
  color: #a9b3c2;
}
.ord-empty p {
  margin: 0 0 12px;
  font-size: 13px;
}
.ord-empty a {
  font-size: 13px;
  color: #1f5fcf;
  font-weight: 600;
}
</style>
