<script setup lang="ts">
import ListPagination from '@/components/ListPagination.vue'
import HoldingReminderSettings from '@/components/HoldingReminderSettings.vue'
import FollowedReminderSettings from '@/components/FollowedReminderSettings.vue'
import { usePageNavigation } from '@/composables/usePageNavigation'
import { useAuthStore } from '@/stores/auth'
import ReviewNoticePanel from '@/components/ReviewNoticePanel.vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { ApiRequestError } from '@/api/http'
import { getNotificationFeed, markNotificationRead } from '@/api/notifications'
import type { NotificationFeedItem, NotificationFeedPage } from '@/types/notification'
import { riskLevelLabel, signalDirectionLabel } from '@/utils/fundPresentation'

const auth = useAuthStore()
const route = useRoute()
const { section, sectionLabel } = usePageNavigation()
const isMessageSection = computed(() => route.name === 'notifications' && section.value !== 'rules' && section.value !== 'holding-rules')
const canMarkRead = computed(() => auth.hasPermission('NOTIFICATION_SELF_WRITE'))
const fund = computed(() => typeof route.query.fund === 'string' && /^\d{6}$/.test(route.query.fund) ? route.query.fund : '')
const unread = ref(false)
const readError = ref('')
let messageRequest = 0
const emptyMessages: Partial<Record<string, string>> = {
  thresholds: '止盈与下跌条件可在持仓提醒设置中管理，站内消息暂未接入。',
  events: '暂无基金事件消息。',
  signals: '暂无走势与风险消息。',
  'holding-checks': '暂无持仓检查消息。',
}
const emptyMessage = computed(() => unread.value ? '暂无未读消息。' : emptyMessages[section.value] ?? '暂无站内消息。')
const canManageHoldingReminders = computed(() => auth.hasPermission('PORTFOLIO_SELF_READ'))
const pageSize = ref(10)
const notificationPage = ref<NotificationFeedPage | null>(null)
const loading = ref(true)
const notificationError = ref('')
const readingIds = ref<Set<string>>(new Set())
const currentPage = computed(() => notificationPage.value?.page ?? 1)

/** 格式化服务端时间；不可解析时保留原值，避免用本地当前时间伪造事件时间。 */
function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '暂缺'
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleString('zh-CN', { hour12: false })
}

/** 统一将接口失败映射为页面可区分的权限或服务状态，不暴露内部连接信息。 */
function displayRequestError(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError && error.status === 403) {
    return '当前账户没有查看或维护本站内提醒的权限。'
  }
  if (error instanceof ApiRequestError && error.status === 401) {
    return '登录状态已失效，请重新登录。'
  }
  if (error instanceof ApiRequestError && error.status === 503) {
    return '提醒服务暂时不可用，请稍后重试。'
  }
  return fallback
}

async function loadMessages(page = 1): Promise<void> {
  const request = ++messageRequest
  loading.value = true
  notificationError.value = ''
  try {
    const result = await getNotificationFeed(section.value, fund.value, unread.value, page, pageSize.value)
    if (request === messageRequest) notificationPage.value = result
  } catch (error) {
    if (request === messageRequest) notificationError.value = displayRequestError(error, '站内提醒暂时无法读取，请重试。')
  } finally {
    if (request === messageRequest) loading.value = false
  }
}

async function markRead(item: NotificationFeedItem): Promise<void> {
  if (item.read || readingIds.value.has(item.id)) return
  readingIds.value.add(item.id)
  readError.value = ''
  try {
    await markNotificationRead(item.id)
    if (isMessageSection.value) await loadMessages(currentPage.value)
  } catch (error) {
    readError.value = displayRequestError(error, '已读状态暂未保存，请重试。')
  } finally {
    readingIds.value.delete(item.id)
  }
}

watch([section, fund, unread], () => {
  messageRequest++
  notificationPage.value = null
  readError.value = ''
  if (isMessageSection.value) {
    void loadMessages()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  messageRequest++
})
</script>

<template>
  <section
    class="notifications-page"
    aria-labelledby="notifications-title"
  >
    <h1
      id="notifications-title"
      class="visually-hidden"
    >
      {{ sectionLabel }}
    </h1>

    <section v-if="isMessageSection" class="notification-card" aria-labelledby="notification-list-title">
      <header class="notification-card-heading">
        <h2 id="notification-list-title">{{ sectionLabel }}</h2>
        <span v-if="notificationPage && !notificationError">{{ notificationPage.totalCount }} 条</span>
      </header>
      <div class="rule-filter-row">
        <label for="message-unread">
          <input id="message-unread" v-model="unread" type="checkbox">
          只看未读
        </label>
        <RouterLink v-if="fund" :to="{ name: 'notifications', query: { section } }">
          基金 {{ fund }} · 查看所有基金
        </RouterLink>
      </div>
      <p v-if="readError" class="state-message error-message" role="alert">{{ readError }}</p>
      <p v-if="loading && !notificationPage" class="state-message" role="status">正在加载提醒…</p>
      <p v-else-if="notificationError" class="state-message error-message" role="alert">
        {{ notificationError }}
        <button type="button" class="text-button" @click="loadMessages(currentPage)">重试</button>
      </p>
      <template v-else-if="notificationPage">
        <ul v-if="notificationPage.items.length" class="notification-list message-list" :aria-busy="loading">
          <li v-for="item in notificationPage.items" :key="`${item.category}:${item.revision == null ? 'message' : 'review'}:${item.id}`" :class="{ 'is-read': item.read }">
            <ReviewNoticePanel
              v-if="item.revision !== null && item.lifecycle"
              :can-mark-read="canMarkRead"
              :item="{ noticeId: item.id, category: item.category, fundCode: item.fundCode, revision: item.revision, lifecycle: item.lifecycle, payload: { ...item.payload, title: item.payload.title || '复查提醒', explanation: item.payload.explanation || '' }, updatedAt: item.occurredAt, read: item.read }"
              @read="loadMessages(currentPage)"
            />
            <template v-else>
              <div class="notification-content">
                <div class="notification-title-row">
                  <RouterLink v-if="item.fundCode" :to="{ name: 'fund-detail', params: { fundCode: item.fundCode }, query: item.kind === 'EVENT' ? { section: 'documents' } : {} }">
                    基金 {{ item.fundCode }}
                  </RouterLink>
                  <span>{{ item.kind === 'EVENT' ? '基金事件' : item.kind === 'SIGNAL_CHANGE' ? '走势判断变化' : '风险提醒' }}</span>
                  <span>{{ item.read ? '已读' : '未读' }}</span>
                </div>
                <p v-if="item.payload.asOfDate || item.payload.direction || item.payload.riskLevel">
                  <span v-if="item.payload.asOfDate"> 数据截至 {{ item.payload.asOfDate }} </span>
                  <span v-if="item.payload.direction"> · 方向 {{ signalDirectionLabel(item.payload.direction) }} </span>
                  <span v-if="item.payload.riskLevel"> · 风险 {{ riskLevelLabel(item.payload.riskLevel) }} </span>
                </p>
                <p v-if="item.payload.explanation">{{ item.payload.explanation }}</p>
                <small>触发于 {{ formatDateTime(item.occurredAt) }}</small>
              </div>
              <button v-if="!item.read && canMarkRead" class="text-button" :disabled="readingIds.has(item.id)" type="button" @click="markRead(item)">
                {{ readingIds.has(item.id) ? '处理中…' : '标记已读' }}
              </button>
            </template>
          </li>
        </ul>
        <p v-else class="empty-analysis">{{ emptyMessage }}</p>
        <ListPagination
          v-if="notificationPage.totalCount"
          :page="currentPage"
          :page-size="pageSize"
          :total="notificationPage.totalCount"
          :loading="loading"
          label="站内提醒分页"
          @change="(value, size) => { pageSize = size; loadMessages(value) }"
        />
      </template>
    </section>

    <HoldingReminderSettings v-if="section === 'holding-rules' && canManageHoldingReminders" />
    <p v-else-if="section === 'holding-rules'" class="state-message">当前账户没有查看持仓提醒设置的权限。</p>
    <FollowedReminderSettings v-if="section === 'rules'" />
  </section>
</template>

<style scoped>
.message-list { gap: 0; margin-top: 0; }
.message-list > li {
  padding: 16px 0;
  border: 0;
  border-bottom: 1px solid var(--color-border);
  border-radius: 0;
  background: var(--color-surface);
  overflow-wrap: anywhere;
}
.message-list > li.is-read { opacity: 1; }
.message-list > li:last-child { border-bottom: 0; }
.rule-filter-row:has(#message-unread) { padding-block: 12px; }
#message-unread { accent-color: var(--color-primary); }
#message-unread:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 3px; }
.rule-filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}
.rule-filter-row label { font-weight: 700; }
</style>
