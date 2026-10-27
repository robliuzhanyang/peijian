<!--
  页面：消息通知（messages.vue）
  路由：/messages ｜ 分组：内容与服务
  作用：展示接口返回的消息列表（订单/售后/发票/合同/系统），顶部显示未读数，
        未读消息标题前有红点，点击整条消息在本地标记已读（不调接口、不持久化）
  数据：accountApi.messages()（读取 catalog.json，数组已按时间倒序）
-->
<template>
  <div>
    <!-- 页头：标题 + 消息范围说明 -->
    <div class="page-title">
      <h1>消息通知</h1>
      <small>订单、售后、发票、合同和系统提醒</small>
    </div>
    <!-- 消息列表 -->
    <section class="card">
      <!-- 列表头：未读数与一键全部已读；全部已读时仅显示状态 -->
      <div class="between">
        <strong>全部消息</strong>
        <span v-if="unreadCount" style="display: inline-flex; align-items: center; gap: 6px">
          <span class="badge red">{{ unreadCount }} 条未读</span>
          <button
            class="btn sm"
            type="button"
            @click="$store.commit('markAllMessagesRead')"
          >
            全部已读
          </button>
        </span>
        <small v-else class="tiny">已全部阅读</small>
      </div>
      <!-- 单条消息：点击后本地置为已读 -->
      <div
        v-for="m in messages"
        :key="m.id"
        class="message"
        style="cursor: pointer"
        @click="markRead(m)"
      >
        <!-- 图标块：放消息类型两字汉字 -->
        <div class="message-icon">{{ typeLabel(m.type) }}</div>
        <div style="flex: 1; min-width: 0">
          <!-- 标题 + 右对齐时间；未读标题前显示小红点 -->
          <div class="between">
            <h3 style="margin: 0">
              <span
                v-if="!m.read"
                style="
                  display: inline-block;
                  width: 7px;
                  height: 7px;
                  border-radius: 50%;
                  background: #c93930;
                  margin-right: 5px;
                  vertical-align: middle;
                "
              ></span>
              {{ m.title }}
            </h3>
            <small class="tiny">{{ m.time }}</small>
          </div>
          <p>{{ m.content }}</p>
        </div>
      </div>
      <!-- 无消息空态 -->
      <div v-if="!messages.length" class="empty">暂无消息。</div>
    </section>
  </div>
</template>
<script>
// 交易后业务线接口：消息通知列表
import { accountApi } from '@/modules/account/api'

export default {
  name: 'Page',
  data() {
    return {
      // 消息列表（created 时由接口异步拉取；已读状态仅在本地 data 维护）
      messages: [],
    }
  },
  computed: {
    // 未读消息条数
    unreadCount() {
      return this.messages.filter((m) => !m.read).length
    },
  },
  created() {
    this.loadMessages()
  },
  methods: {
    // 拉取消息列表并写入 data
    async loadMessages() {
      this.messages = await accountApi.messages()
    },
    // 消息类型映射为图标块内的两个汉字
    typeLabel(type) {
      return (
        {
          order: '订单',
          aftersale: '售后',
          invoice: '发票',
          contract: '合同',
          system: '系统',
        }[type] || '系统'
      )
    },
    // 点击消息：标记已读并持久化
    markRead(m) {
      this.$store.commit('markMessageRead', m.id)
    },
  },
}
</script>
