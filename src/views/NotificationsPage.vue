<script setup lang="ts">
import ListPagination from '@/components/ListPagination.vue'
import HoldingReminderSettings from '@/components/HoldingReminderSettings.vue'
import FollowedReminderSettings from '@/components/FollowedReminderSettings.vue'
import { usePageNavigation } from '@/composables/usePageNavigation'
import { useAuthStore } from '@/stores/auth'
import PredictionHistoryDrawer from '@/components/PredictionHistoryDrawer.vue'
import ReviewNoticePanel from '@/components/ReviewNoticePanel.vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { ApiRequestError } from '@/api/http'
import { getFundDetail, getFunds } from '@/api/funds'
import { getNotificationFeed, getNotificationMatrix, markNotificationRead, markReviewNoticeRead } from '@/api/notifications'
import type { NotificationFeedCell, NotificationFeedItem, NotificationFeedPage, NotificationMatrixPage } from '@/types/notification'
import { riskLevelLabel, signalDirectionLabel } from '@/utils/fundPresentation'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const { section, sectionLabel } = usePageNavigation()
const isMessageSection = computed(() => route.name === 'notifications' && section.value !== 'rules' && section.value !== 'holding-rules')
const isHistory = computed(() => section.value === 'history')
const searchKeyword = ref('')
const searchResults = ref<{ fundCode: string; fundName: string }[]>([])
const searchStatus = ref('')
let searchRequest = 0
const canMarkRead = computed(() => auth.hasPermission('NOTIFICATION_SELF_WRITE'))
const fund = computed(() => {
  const value = route.query.fund
  return typeof value === 'string' && (/^\d{6}$/.test(value) || (isHistory.value && value === 'account')) ? value : ''
})
const unread = ref(true)
const selected = ref<NotificationFeedItem | null>(null)
const categories = [
  { key: 'thresholds', label: '止盈与下跌' },
  { key: 'events', label: '基金事件' },
  { key: 'signals', label: '走势与风险' },
  { key: 'holding-checks', label: '持仓检查' },
] as const
const legacyCategory = computed(() => categories.find(item => item.key === route.query.section))
const category = computed(() => legacyCategory.value?.key ?? 'messages')
const fundNames = ref<Record<string, string>>({})
const activeCell = ref<NotificationFeedCell | null>(null)
const detailCells = ref<NotificationFeedCell[]>([])
const reasonItems = computed(() => categories.map(category => {
  const item = selected.value?.category === category.key ? selected.value
    : detailCells.value.find(cell => cell.latest.category === category.key)?.latest
  return { label: category.label, payload: item && { ...item.payload, explanation: explainReminder(item) } }
}))
const cellPage = ref<NotificationFeedPage | null>(null)
const cellLoading = ref(false)
const cellError = ref('')
const cellSize = ref(10)
let cellRequest = 0
const kindLabels: Record<string, string> = {
  TAKE_PROFIT: '止盈提醒', HOLDING_LOSS: '持仓亏损提醒', DRAWDOWN: '净值回撤提醒',
  EVENT: '基金事件', FUND_PUBLICATION: '基金公告', SIGNAL_CHANGE: '走势判断变化',
  RISK_LEVEL: '风险提醒', REVIEW_DUE: '定期复查', USE_DATE: '预计用款日期提醒',
}
const statusLabels: Record<string, string> = {
  ACTIVE: '待复查', RESOLVED: '条件已解除', RETRACTED: '提醒已撤销', EXPIRED: '观察期已结束',
}
function title(item: NotificationFeedItem) {
  return item.payload.title || kindLabels[item.kind] || '站内提醒'
}
function explainReminder(item: NotificationFeedItem) {
  const explanation = item.payload.explanation ?? ''
  const match = /^当前为 ([+-]?\d+(?:\.\d+)?)%(.*)$/s.exec(explanation)
  const facts: Record<string, [string, string]> = {
    TAKE_PROFIT: ['持仓收益率', '达到止盈条件'],
    HOLDING_LOSS: ['持仓收益率', '达到持仓亏损提醒条件'],
    DRAWDOWN: ['净值回撤', '达到高点回撤提醒条件'],
  }
  const fact = facts[item.kind]
  if (!match || !fact) return explanation
  const value = Number(match[1]) > 0 && !match[1].startsWith('+') ? '+' + match[1] : match[1]
  return `触发时${fact[0]} ${value}%，${fact[1]}${match[2] || '。'}`
}
const readError = ref('')
let messageRequest = 0
const emptyMessages: Partial<Record<string, string>> = {
  thresholds: '暂无止盈与下跌提醒。',
  events: '暂无基金事件消息。',
  signals: '暂无走势与风险消息。',
  'holding-checks': '暂无持仓检查消息。',
}
const emptyMessage = computed(() => isHistory.value ? '暂无符合条件的历史提醒。' : unread.value ? '暂无未读消息。' : emptyMessages[category.value] ?? '今天暂无提醒。')
const canManageHoldingReminders = computed(() => auth.hasPermission('PORTFOLIO_SELF_READ'))
const pageSize = ref(10)
const notificationPage = ref<NotificationMatrixPage | null>(null)
const inboxReturnQuery = ref<{ section: string; fund?: string }>({ section: 'messages' })
const inboxPage = ref(1)
const inboxPageSize = ref(10)
const historyPageSize = ref(10)

function historyTarget(item: NotificationFeedItem) {
  return { name: 'notifications', query: { section: 'history', fund: item.fundCode ?? 'account', fromInbox: '1' } }
}

function saveInboxLocation() {
  inboxReturnQuery.value = { section: category.value, ...(fund.value ? { fund: fund.value } : {}) }
  inboxPage.value = currentPage.value
  inboxPageSize.value = pageSize.value
}

function setHistoryFund(code = '') {
  searchRequest++
  searchResults.value = []
  searchStatus.value = ''
  searchKeyword.value = code === 'account' ? '' : code
  void router.push({ name: 'notifications', query: { ...route.query, section: 'history', fund: code || undefined } })
}

async function searchHistory() {
  const term = searchKeyword.value.trim()
  if (!term || /^\d{6}$/.test(term)) {
    setHistoryFund(term)
    return
  }
  const request = ++searchRequest
  searchResults.value = []
  searchStatus.value = '正在查找基金…'
  try {
    const result = await getFunds({ keyword: term, pageSize: 20 })
    if (request !== searchRequest) return
    searchResults.value = result.items
    searchStatus.value = result.items.length ? '' : '没有找到符合条件的基金。'
  } catch (error) {
    if (request === searchRequest) searchStatus.value = displayRequestError(error, '基金暂时无法搜索，请重试。')
  }
}
const rows = computed(() => {
  if (isHistory.value) return (notificationPage.value?.cells ?? []).map(cell => ({
    key: cell.latest.id,
    code: cell.latest.fundCode,
    cells: { [cell.latest.category]: cell } as Record<string, NotificationFeedCell>,
    hasUnread: false,
    sentAt: cell.latest.occurredAt,
  }))
  const grouped = new Map<string | null, Record<string, NotificationFeedCell>>()
  for (const cell of notificationPage.value?.cells ?? []) {
    const { fundCode, category } = cell.latest
    const cells = grouped.get(fundCode) ?? {}
    cells[category] = cell
    grouped.set(fundCode, cells)
  }
  return [...grouped].map(([code, cells]) => ({
    key: code ?? 'account',
    code,
    cells,
    sentAt: null,
    hasUnread: Object.values(cells).some(cell => cell.unreadCount > 0),
  }))
})
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
    let result: NotificationMatrixPage
    if (isHistory.value) {
      const history = await getNotificationFeed('messages', fund.value, false, page, pageSize.value, true)
      result = { page: history.page, totalCount: history.totalCount, cells: history.items.map(latest => ({
        latest, unreadCount: latest.read ? 0 : 1, messageCount: 1,
      })) }
    } else {
      result = await getNotificationMatrix(category.value, fund.value, unread.value, page, pageSize.value)
    }
    if (request !== messageRequest) return
    notificationPage.value = result
    const codes = new Set(result.cells.map(cell => cell.latest.fundCode))
    for (const code of codes) {
      if (code && !fundNames.value[code]) {
        void getFundDetail(code).then(detail => {
          if (detail.fundCode === code && detail.fundName) fundNames.value[code] = detail.fundName
        }).catch(() => { /* 基金名称暂缺时保留可识别的代码。 */ })
      }
    }
  } catch (error) {
    if (request === messageRequest) notificationError.value = displayRequestError(error, '站内提醒暂时无法读取，请重试。')
  } finally {
    if (request === messageRequest) loading.value = false
  }
}

async function markRead(item: NotificationFeedItem): Promise<void> {
  if (!canMarkRead.value || item.read) return
  const key = item.id + ':' + item.revision
  if (readingIds.value.has(key)) return
  readingIds.value.add(key)
  readError.value = ''
  try {
    const confirmed = item.revision === null
      ? (await markNotificationRead(item.id)).status === 'READ'
      : (await markReviewNoticeRead(item.id, item.revision)).read
    if (confirmed) await refreshAfterRead(item)
    else if (isMessageSection.value) await loadMessages(currentPage.value)
  } catch (error) {
    if (selected.value?.id === item.id && selected.value.revision === item.revision) {
      readError.value = displayRequestError(error, '已读状态暂未保存，请重新打开详情。')
    }
  } finally {
    readingIds.value.delete(key)
  }
}

function closeDetail() {
  cellRequest++
  activeCell.value = null
  detailCells.value = []
  selected.value = null
  readError.value = ''
}

function openRow(cells: Record<string, NotificationFeedCell>, initial?: NotificationFeedCell) {
  detailCells.value = categories.flatMap(category => cells[category.key] ? [cells[category.key]] : [])
  const first = initial ?? detailCells.value.find(cell => cell.unreadCount > 0) ?? detailCells.value[0]
  if (first) openCell(first)
}

function openCell(cell: NotificationFeedCell) {
  cellRequest++
  cellLoading.value = false
  activeCell.value = cell
  selected.value = cell.latest
  cellPage.value = null
  cellError.value = ''
  cellSize.value = 10
  readError.value = ''
  if (cell.messageCount > 1) void loadCell()
}

async function loadCell(page = 1) {
  const cell = activeCell.value
  if (!cell) return
  const request = ++cellRequest
  cellLoading.value = true
  cellError.value = ''
  try {
    const result = await getNotificationFeed(cell.latest.category, cell.latest.fundCode ?? 'account', false, page, cellSize.value, false, !isHistory.value)
    if (request !== cellRequest) return
    cellPage.value = result
    const current = selected.value
    if (current) selected.value = result.items.find(item => item.id === current.id) ?? current
  } catch (error) {
    if (request === cellRequest) cellError.value = displayRequestError(error, '这组提醒暂时无法读取。')
  } finally {
    if (request === cellRequest) cellLoading.value = false
  }
}

async function refreshAfterRead(item: NotificationFeedItem) {
  if (selected.value?.id === item.id && selected.value.revision === item.revision) {
    selected.value = { ...selected.value, read: true }
  }
  detailCells.value = detailCells.value.map(cell =>
    cell.latest.id === item.id && cell.latest.revision === item.revision
      ? { ...cell, latest: { ...cell.latest, read: true }, unreadCount: Math.max(0, cell.unreadCount - 1) }
      : cell)
  if (activeCell.value && (cellPage.value || cellLoading.value)) void loadCell(cellPage.value?.page)
  if (isMessageSection.value) await loadMessages(currentPage.value)
}

watch(() => [selected.value?.id, selected.value?.revision], () => {
  readError.value = ''
  if (selected.value) void markRead(selected.value)
}, { flush: 'post' })

watch([section, category, fund], closeDetail)

watch([section, category, fund, unread], ([nextSection], [previousSection] = []) => {
  const changedMode = nextSection !== previousSection
  if (changedMode) {
    searchRequest++
    searchResults.value = []
    searchStatus.value = ''
    searchKeyword.value = isHistory.value && fund.value !== 'account' ? fund.value : ''
    pageSize.value = isHistory.value ? historyPageSize.value : inboxPageSize.value
  }
  const returning = changedMode && previousSection === 'history' && nextSection === 'messages'

  messageRequest++
  notificationPage.value = null
  readError.value = ''
  if (isMessageSection.value) {
    void loadMessages(returning ? inboxPage.value : 1)
  }
}, { immediate: true })

onBeforeUnmount(() => {
  messageRequest++
  cellRequest++
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
        <div>
          <h2 id="notification-list-title">{{ sectionLabel }}</h2>
          <p class="notification-description">{{ isHistory ? '按发送时间查看已读和未读提醒，可按基金名称或代码查找。' : '查看北京时间今天发出的提醒，点击「查看详情」可查看原因。' }}</p>
        </div>
        <span v-if="notificationPage && !notificationError">{{ notificationPage.totalCount }} {{ isHistory ? '条' : '项' }}</span>
      </header>
      <div v-if="isHistory" class="history-toolbar">
        <RouterLink v-if="route.query.fromInbox === '1'" class="secondary-button" :to="{ name: 'notifications', query: inboxReturnQuery }">返回今日提醒</RouterLink>
        <form class="fund-filter-toolbar history-search" @submit.prevent="searchHistory">
          <div class="fund-filter-search">
            <label class="visually-hidden" for="history-fund-search">基金名称或代码</label>
            <svg class="fund-filter-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" />
            </svg>
            <input id="history-fund-search" v-model="searchKeyword" type="search" maxlength="50" placeholder="基金代码或名称，例如：000001">
          </div>
          <button type="submit" class="secondary-button">搜索</button>
          <button v-if="fund || searchKeyword || searchStatus || searchResults.length" type="button" class="secondary-button" @click="setHistoryFund()">清除</button>
        </form>
        <span v-if="fund" class="history-current-filter">{{ fund === 'account' ? '我的持仓' : (fundNames[fund] ? fundNames[fund] + ' / ' + fund : fund) }}</span>
        <p v-if="searchStatus" role="status">{{ searchStatus }}</p>
        <ul v-if="searchResults.length" class="history-search-results" aria-label="匹配基金">
          <li v-for="result in searchResults" :key="result.fundCode">
            <button type="button" class="text-button" @click="setHistoryFund(result.fundCode)">{{ result.fundName }} / {{ result.fundCode }}</button>
          </li>
        </ul>
      </div>
      <div v-else class="rule-filter-row">
        <label for="message-unread">
          <input id="message-unread" v-model="unread" type="checkbox">
          只看未读
        </label>
        <RouterLink v-if="legacyCategory" :to="{ name: 'notifications', query: { ...route.query, section: 'messages' } }">
          {{ legacyCategory.label }} · 查看全部类型
        </RouterLink>
        <RouterLink v-if="fund" :to="{ name: 'notifications', query: { section: category } }">
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
        <div v-if="rows.length" class="inbox-table-wrap">
          <table class="fund-data-table inbox-table" :aria-busy="loading">
            <caption class="visually-hidden">{{ sectionLabel }}</caption>
            <thead>
              <tr>
                <th scope="col">基金名称 / 代码</th>
                <th v-for="column in categories" :key="column.key" scope="col">{{ column.label }}</th>
                <th scope="col" class="inbox-action-heading">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.key">
                <th scope="row" class="fund-table-identity">
                  <div class="inbox-fund-name">
                    <span v-if="row.hasUnread" class="inbox-unread-dot" role="img" aria-label="有未读提醒"></span>
                    <strong :title="row.code ? fundNames[row.code] : undefined">{{ row.code ? (fundNames[row.code] || row.code) : '我的持仓' }}</strong>
                  </div>
                  <small v-if="row.code && fundNames[row.code]">{{ row.code }}</small>
                  <small v-else-if="!row.code">账户级提醒</small>
                  <small v-if="row.sentAt"><time :datetime="row.sentAt">{{ formatDateTime(row.sentAt) }}</time></small>
                </th>
                <td v-for="column in categories" :key="column.key">
                  <template v-if="row.cells[column.key]">
                    <button type="button" class="inbox-cell-button" aria-haspopup="dialog"
                      :aria-label="(row.code || '我的持仓') + '，' + column.label + '，' + title(row.cells[column.key].latest)"
                      @click="openRow(row.cells, row.cells[column.key])">
                      <span>{{ title(row.cells[column.key].latest) }}</span>
                    </button>
                  </template>
                  <span v-else class="inbox-empty-cell" aria-label="暂无消息">—</span>
                </td>
                <td class="inbox-row-action">
                  <button type="button" class="fund-table-quick" aria-haspopup="dialog"
                    :aria-label="'查看详情：' + (row.code ? (fundNames[row.code] || row.code) : '我的持仓')"
                    @click="openRow(row.cells)">查看详情</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="empty-analysis">{{ emptyMessage }}</p>
        <ListPagination
          v-if="notificationPage.totalCount"
          :page="currentPage"
          :page-size="pageSize"
          :total="notificationPage.totalCount"
          :loading="loading"
          label="站内提醒分页"
          @change="(value, size) => { pageSize = size; if (isHistory) historyPageSize = size; else inboxPageSize = size; loadMessages(value) }"
        />
      </template>
    </section>

    <PredictionHistoryDrawer v-if="selected" :title="title(selected)" close-label="关闭提醒详情" @close="closeDetail">
      <p v-if="cellLoading" role="status">正在读取同类提醒…</p>
      <p v-if="cellError" role="alert">{{ cellError }} <button type="button" class="text-button" @click="loadCell()">重试</button></p>
      <div v-if="cellPage && activeCell && activeCell.messageCount > 1" class="inbox-cell-history">
        <p class="inbox-cell-history-label">同类提醒</p>
        <ul class="inbox-cell-history-items">
          <li v-for="item in cellPage.items" :key="item.id">
            <button type="button" class="text-button" :aria-pressed="item.id === selected.id"
              @click="selected = item">{{ title(item) }} · {{ formatDateTime(item.occurredAt) }}</button>
          </li>
        </ul>
        <ListPagination v-if="cellPage.totalCount > cellSize" :page="cellPage.page" :page-size="cellSize" :total="cellPage.totalCount"
          :loading="cellLoading" label="同类提醒分页" @change="(page, size) => { cellSize = size; loadCell(page) }" />
      </div>
      <p v-if="readError" role="alert">{{ readError }}</p>
      <ReviewNoticePanel
        v-if="selected.revision !== null && selected.lifecycle"
        :key="selected.id"
        :reasons="reasonItems"
        :history-mode="isHistory"
        :fund-name="selected.fundCode ? fundNames[selected.fundCode] : undefined"
        :item="{ noticeId: selected.id, category: selected.category, fundCode: selected.fundCode, revision: selected.revision, lifecycle: selected.lifecycle, payload: { ...selected.payload, title: title(selected), explanation: selected.payload.explanation || '' }, updatedAt: selected.occurredAt, read: selected.read }"
      >
        <template #actions>
          <RouterLink v-if="!isHistory" class="text-button inbox-history-link" :to="historyTarget(selected)" @click="saveInboxLocation">查看历史提醒</RouterLink>
        </template>
      </ReviewNoticePanel>
      <div v-else class="inbox-legacy-detail">
              <div class="notification-content">
                <div class="notification-title-row">
                  <RouterLink v-if="selected.fundCode" class="inbox-legacy-fund" :to="{ name: 'fund-detail', params: { fundCode: selected.fundCode }, query: selected.kind === 'EVENT' ? { section: 'documents' } : {} }">
                    <span v-if="fundNames[selected.fundCode]" :title="fundNames[selected.fundCode]">{{ fundNames[selected.fundCode] }}</span>
                    <span v-if="fundNames[selected.fundCode]">/</span>
                    <span>{{ selected.fundCode }}</span>
                  </RouterLink>
                  <span>{{ kindLabels[selected.kind] || '站内提醒' }}</span>
                  <span>{{ selected.read ? '已读' : '未读' }}</span>
                </div>
                <p v-if="selected.payload.asOfDate || selected.payload.direction || selected.payload.riskLevel">
                  <span v-if="selected.payload.asOfDate"> 数据截至 {{ selected.payload.asOfDate }} </span>
                  <span v-if="selected.payload.direction"> · 方向 {{ signalDirectionLabel(selected.payload.direction) }} </span>
                  <span v-if="selected.payload.riskLevel"> · 风险 {{ riskLevelLabel(selected.payload.riskLevel) }} </span>
                </p>
                <section class="legacy-reasons">
                  <h3>提醒原因</h3>
                  <dl>
                    <div v-for="reason in reasonItems" :key="reason.label">
                      <dt>{{ reason.label }}</dt>
                      <dd>{{ reason.payload ? (reason.payload.explanation || '这条提醒暂缺详细说明。') : '—' }}</dd>
                    </div>
                  </dl>
                </section>
                <small>触发于 {{ formatDateTime(selected.occurredAt) }}</small>
              </div>
        <RouterLink v-if="!isHistory" class="text-button inbox-history-link" :to="historyTarget(selected)" @click="saveInboxLocation">查看历史提醒</RouterLink>
      </div>

    </PredictionHistoryDrawer>

    <HoldingReminderSettings v-if="section === 'holding-rules' && canManageHoldingReminders" />
    <p v-else-if="section === 'holding-rules'" class="state-message">当前账户没有查看持仓提醒设置的权限。</p>
    <FollowedReminderSettings v-if="section === 'rules'" />
  </section>
</template>

<style scoped>
.notification-description { margin: 6px 0 0; color: var(--ui-muted); line-height: 1.6; }
.rule-filter-row:has(#message-unread) { padding-block: 12px; }
.inbox-table-wrap { margin-top: 4px; border-radius: 7px; }
.inbox-table.fund-data-table { min-width: 0; }
.inbox-table tbody tr { cursor: default; }
.inbox-table thead th:first-child { width: 25%; }
.inbox-table thead .inbox-action-heading { width: 88px; }
.inbox-table thead th { white-space: normal; overflow-wrap: anywhere; }
.inbox-table thead th:first-child { position: static; }
.inbox-table .inbox-action-heading, .inbox-row-action { text-align: center; }
.inbox-fund-name { display: flex; align-items: center; gap: 6px; min-width: 0; }
.inbox-fund-name strong { display: block; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.inbox-unread-dot { width: 7px; height: 7px; flex: 0 0 7px; border-radius: 50%; background: var(--ui-rise); }
.fund-table-identity small { display: block; margin-top: 4px; color: var(--ui-muted); font-size: 12px; }
.inbox-cell-button { display: block; width: 100%; min-height: 44px; padding: 0; border: 0; background: transparent; color: var(--ui-primary); text-align: start; overflow-wrap: anywhere; cursor: pointer; }
.inbox-cell-button:hover > span { text-decoration: underline; text-underline-offset: 3px; }
.inbox-cell-button:focus-visible { outline: 2px solid var(--ui-primary); outline-offset: 3px; }
@media (max-width: 720px) {
  .inbox-table.fund-data-table :is(th, td) { padding-inline: 5px; }
  .inbox-table thead .inbox-action-heading { width: 64px; }
  .inbox-table.fund-data-table .fund-table-quick { font-size: 12px; }
}
.inbox-empty-cell { color: var(--ui-muted); }
.inbox-cell-history { display: grid; gap: 8px; padding: 16px 0; border-bottom: 1px solid var(--ui-line); }
.inbox-cell-history-label { margin: 0; font-weight: 600; }
.inbox-cell-history-items { margin: 0; padding: 0; list-style: none; }
.inbox-cell-history-items button { min-height: 40px; text-align: start; }
.inbox-cell-history-items button[aria-pressed="true"] { text-decoration: underline; }
.inbox-legacy-fund { display: inline-flex; gap: 6px; min-width: 0; }
.inbox-legacy-fund span[title] { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.inbox-legacy-fund span:last-child { flex: none; }
.history-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin: 12px 0 16px; }
.history-toolbar .history-search { display: flex; flex: 1 1 520px; max-width: 640px; flex-wrap: nowrap; gap: 8px; margin: 0; }
.history-search .fund-filter-search { flex: 1 1 0; min-width: 0; }
.history-current-filter { overflow-wrap: anywhere; color: var(--ui-muted); }
.history-search-results { flex-basis: 100%; max-height: 14rem; margin: 0; padding: 4px 0; overflow-y: auto; list-style: none; }
.history-search-results button { min-height: 38px; text-align: start; }
.inbox-history-link { display: inline-flex; min-height: 40px; align-items: center; white-space: nowrap; }
.inbox-legacy-detail { padding-block: 20px; }
.legacy-reasons dl { margin: 0; }
.legacy-reasons dl > div { padding-block: 8px; border-bottom: 1px solid var(--ui-line); }
.legacy-reasons dt { font-weight: 600; }
.legacy-reasons dd { margin: 4px 0 0; white-space: pre-line; }
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
.rule-filter-row label { font-weight: 700; white-space: nowrap; }
</style>
