<script setup lang="ts">
import { usePageNavigation } from '@/composables/usePageNavigation'
import ReviewNoticePanel from '@/components/ReviewNoticePanel.vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { getAlertRules, upsertAlertRule } from '@/api/alerts'
import { ApiRequestError } from '@/api/http'
import { getNotifications, markNotificationRead } from '@/api/notifications'
import type { AlertRule, UpsertAlertRuleRequest } from '@/types/alert'
import type { NotificationItem, NotificationPage } from '@/types/notification'
import { riskLevelLabel, signalDirectionLabel } from '@/utils/fundPresentation'

const pageSize = 20
const notificationPage = ref<NotificationPage | null>(null)
const alertRules = ref<AlertRule[]>([])
const loading = ref(true)
const notificationError = ref('')
const rulesError = ref('')
const ruleMessage = ref('')
const readingIds = ref<Set<string>>(new Set())
const savingRuleIds = ref<Set<string>>(new Set())

const currentPage = computed(() => notificationPage.value?.page ?? 1)
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => {
  const page = notificationPage.value
  return page ? page.page < page.totalPages : false
})

/** 将内部提醒类型转换为用户可理解的资讯提示文案。 */
function ruleTypeLabel(ruleType: AlertRule['ruleType']): string {
  const labels: Record<AlertRule['ruleType'], string> = {
    RISK_LEVEL: '风险程度达到设定条件',
    SIGNAL_CHANGE: '分析方向变化',
    EVENT: '基金相关事项',
  }
  return labels[ruleType]
}

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
  return error instanceof Error ? error.message : fallback
}

/** 加载本人通知和提醒规则；任一接口失败不阻塞另一块已授权数据展示。 */
async function load(page = 1): Promise<void> {
  loading.value = true
  notificationError.value = ''
  rulesError.value = ''
  const [notificationsResult, rulesResult] = await Promise.allSettled([
    getNotifications(page, pageSize),
    getAlertRules(),
  ])
  if (notificationsResult.status === 'fulfilled') {
    notificationPage.value = notificationsResult.value
  } else {
    notificationPage.value = null
    notificationError.value = displayRequestError(notificationsResult.reason, '站内提醒暂时不可用。')
  }
  if (rulesResult.status === 'fulfilled') {
    alertRules.value = rulesResult.value
  } else {
    alertRules.value = []
    rulesError.value = displayRequestError(rulesResult.reason, '提醒规则暂时不可用。')
  }
  loading.value = false
}

/** 翻页只重新请求通知，不因切页重复写入或修改任何提醒规则。 */
async function changePage(page: number): Promise<void> {
  if (page < 1 || (notificationPage.value && page > notificationPage.value.totalPages)) {
    return
  }
  loading.value = true
  notificationError.value = ''
  try {
    notificationPage.value = await getNotifications(page, pageSize)
  } catch (error) {
    notificationError.value = displayRequestError(error, '站内提醒暂时不可用。')
  } finally {
    loading.value = false
  }
}

/** 幂等标记一条本人未读提醒；本地只替换该条记录，避免重新请求整页。 */
async function markRead(item: NotificationItem): Promise<void> {
  if (item.status === 'READ' || readingIds.value.has(item.notificationId)) {
    return
  }
  readingIds.value = new Set([...readingIds.value, item.notificationId])
  notificationError.value = ''
  try {
    const updated = await markNotificationRead(item.notificationId)
    if (notificationPage.value) {
      notificationPage.value = {
        ...notificationPage.value,
        items: notificationPage.value.items.map((candidate) => (
          candidate.notificationId === updated.notificationId ? updated : candidate
        )),
      }
    }
  } catch (error) {
    notificationError.value = displayRequestError(error, '提醒状态未更新。')
  } finally {
    readingIds.value = new Set(
      [...readingIds.value].filter((notificationId) => notificationId !== item.notificationId),
    )
  }
}

/** 只管理已存在规则的启停，保留其原条件；普通页面不要求用户理解算法分数或补默认值。 */
async function saveRule(rule: AlertRule, enabled: boolean): Promise<void> {
  const threshold = rule.ruleType === 'RISK_LEVEL' ? rule.threshold : null
  if (rule.ruleType === 'RISK_LEVEL' && (threshold === null || !Number.isFinite(Number(threshold)) || Number(threshold) < 0 || Number(threshold) > 1)) {
    ruleMessage.value = '原提醒条件尚未核对，当前设置保持不变。'
    return
  }
  savingRuleIds.value = new Set([...savingRuleIds.value, rule.ruleId])
  ruleMessage.value = ''
  const request: UpsertAlertRuleRequest = {
    fundCode: rule.fundCode,
    ruleType: rule.ruleType,
    threshold,
    enabled,
  }
  try {
    const saved = await upsertAlertRule(request)
    alertRules.value = alertRules.value.map((candidate) => (
      candidate.ruleId === saved.ruleId ? saved : candidate
    ))
    ruleMessage.value = saved.enabled ? '提醒规则已保存。' : '提醒规则已停用。'
  } catch (error) {
    ruleMessage.value = displayRequestError(error, '提醒规则未保存。')
  } finally {
    savingRuleIds.value = new Set([...savingRuleIds.value].filter((ruleId) => ruleId !== rule.ruleId))
  }
}

onMounted(() => {
  void load()
})
const { section, sectionLabel } = usePageNavigation()
</script>

<template>
  <section
    class="notifications-page"
    aria-labelledby="notifications-title"
  >
    <p class="eyebrow">
      站内提醒
    </p>
    <h1 id="notifications-title">
      {{ sectionLabel }}
    </h1>
    <p class="lead">
      查看基金事项与本人条件变化，并按保存的依据复查。
    </p>

    <ReviewNoticePanel v-if="section === 'messages'" />

    <p
      v-if="section === 'messages' && loading && !notificationPage"
      class="state-message"
    >
      正在加载你的站内提醒…
    </p>
    <p
      v-else-if="section === 'messages' && notificationError"
      class="state-message error-message"
      role="alert"
    >
      {{ notificationError }}
    </p>
    <template v-else-if="section === 'messages' && notificationPage">
      <section
        class="notification-card"
        aria-labelledby="notification-list-title"
      >
        <header class="notification-card-heading">
          <div>
            <p class="eyebrow">
              基金分析
            </p>
            <h2 id="notification-list-title">
              已触发提醒
            </h2>
          </div>
          <span>{{ notificationPage.totalCount }} 条</span>
        </header>
        <ul
          v-if="notificationPage.items.length > 0"
          class="notification-list"
        >
          <li
            v-for="item in notificationPage.items"
            :key="item.notificationId"
            :class="{ 'is-read': item.status === 'READ' }"
          >
            <div class="notification-content">
              <div class="notification-title-row">
                <RouterLink :to="{ name: 'fund-detail', params: { fundCode: item.fundCode } }">
                  基金 {{ item.fundCode }}
                </RouterLink>
                <span>{{ ruleTypeLabel(item.ruleType) }}</span>
                <span>{{ item.status === 'READ' ? '已读' : '未读' }}</span>
              </div>
              <p>
                数据截至 {{ item.payload.asOfDate || '暂缺' }} · 方向 {{ signalDirectionLabel(item.payload.direction ?? null) }} ·
                风险 {{ riskLevelLabel(item.payload.riskLevel ?? null) }}
              </p>
              <p>{{ item.payload.explanation || '暂无附加解释。' }}</p>
              <small>触发时间：{{ formatDateTime(item.createdAt) }}</small>
            </div>
            <button
              v-if="item.status === 'UNREAD'"
              class="text-button"
              :disabled="readingIds.has(item.notificationId)"
              type="button"
              @click="markRead(item)"
            >
              {{ readingIds.has(item.notificationId) ? '处理中…' : '标记已读' }}
            </button>
          </li>
        </ul>
        <p
          v-else
          class="empty-analysis"
        >
          暂无已有基金分析提醒。这不代表没有风险。
        </p>
        <nav
          v-if="notificationPage.totalPages > 1"
          class="pagination"
          aria-label="提醒分页"
        >
          <button
            class="secondary-button"
            :disabled="loading || !hasPreviousPage"
            type="button"
            @click="changePage(currentPage - 1)"
          >
            上一页
          </button>
          <span>第 {{ currentPage }} / {{ notificationPage.totalPages }} 页</span>
          <button
            class="secondary-button"
            :disabled="loading || !hasNextPage"
            type="button"
            @click="changePage(currentPage + 1)"
          >
            下一页
          </button>
        </nav>
      </section>
    </template>

    <section
      v-if="section === 'rules'"
      class="notification-card"
      aria-labelledby="notification-rule-title"
    >
      <header class="notification-card-heading">
        <div>
          <p class="eyebrow">
            本人设置
          </p>
          <h2 id="notification-rule-title">
            提醒规则
          </h2>
        </div>
        <RouterLink
          class="text-button"
          to="/watchlist"
        >
          前往我的关注
        </RouterLink>
      </header>
      <p
        v-if="rulesError"
        class="state-message error-message"
        role="alert"
      >
        {{ rulesError }}
      </p>
      <template v-else>
        <p
          v-if="ruleMessage"
          class="state-message"
          aria-live="polite"
        >
          {{ ruleMessage }}
        </p>
        <ul
          v-if="alertRules.length > 0"
          class="notification-rule-list"
        >
          <li
            v-for="rule in alertRules"
            :key="rule.ruleId"
          >
            <div>
              <strong>基金 {{ rule.fundCode }} · {{ ruleTypeLabel(rule.ruleType) }}</strong>
              <p>更新于 {{ formatDateTime(rule.updatedAt) }}</p>
            </div>
            <span v-if="rule.ruleType === 'RISK_LEVEL'">沿用已保存的风险提醒条件</span>
            <button
              class="text-button"
              :disabled="savingRuleIds.has(rule.ruleId)"
              type="button"
              @click="saveRule(rule, !rule.enabled)"
            >
              {{ rule.enabled ? '停用' : '启用' }}
            </button>
          </li>
        </ul>
        <p
          v-else-if="!loading"
          class="empty-analysis"
        >
          暂无提醒规则。请先在已关注基金的详情页创建信息提醒规则。
        </p>
      </template>
    </section>
  </section>
</template>
