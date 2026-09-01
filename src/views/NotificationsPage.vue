<script setup lang="ts">
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
const ruleThresholds = ref<Record<string, number>>({})

const currentPage = computed(() => notificationPage.value?.page ?? 1)
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => {
  const page = notificationPage.value
  return page ? page.page < page.totalPages : false
})

/** 将内部提醒类型转换为用户可理解的资讯提示文案。 */
function ruleTypeLabel(ruleType: AlertRule['ruleType']): string {
  const labels: Record<AlertRule['ruleType'], string> = {
    RISK_LEVEL: '风险等级达到阈值',
    SIGNAL_CHANGE: '评分方向变化',
    EVENT: '已授权关联事件',
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

/** 将 0 到 1 的置信度转换为百分比；缺失数据不补零。 */
function formatPercent(value: number | string | null | undefined): string {
  const numericValue = Number(value)
  return value === null || value === undefined || !Number.isFinite(numericValue)
    ? '—'
    : `${(numericValue * 100).toFixed(1)}%`
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
    ruleThresholds.value = Object.fromEntries(
      rulesResult.value
        .filter((rule) => rule.ruleType === 'RISK_LEVEL')
        .map((rule) => [rule.ruleId, Number(rule.threshold ?? 0.5)]),
    )
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

/** 读取某条风险规则当前编辑值，缺失时使用服务端已存阈值而不是推断风险。 */
function thresholdFor(rule: AlertRule): number {
  return ruleThresholds.value[rule.ruleId] ?? Number(rule.threshold ?? 0.5)
}

/** 更新本地风险阈值草稿，输入非法时让服务端规则保持不变。 */
function updateThreshold(rule: AlertRule, event: globalThis.Event): void {
  const value = Number((event.target as globalThis.HTMLInputElement).value)
  if (Number.isFinite(value)) {
    ruleThresholds.value = { ...ruleThresholds.value, [rule.ruleId]: value }
  }
}

/** 保存一条已存在规则的启用状态或风险阈值；规则类型和基金代码不可在此页隐式改变。 */
async function saveRule(rule: AlertRule, enabled: boolean): Promise<void> {
  const threshold = rule.ruleType === 'RISK_LEVEL' ? thresholdFor(rule) : null
  if (threshold !== null && (threshold < 0 || threshold > 1)) {
    ruleMessage.value = '风险阈值必须在 0 到 1 之间。'
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
    ruleThresholds.value = saved.ruleType === 'RISK_LEVEL'
      ? { ...ruleThresholds.value, [saved.ruleId]: Number(saved.threshold ?? 0.5) }
      : ruleThresholds.value
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
</script>

<template>
  <section
    class="notifications-page"
    aria-labelledby="notifications-title"
  >
    <p class="eyebrow">
      IN-APP NOTICES
    </p>
    <h1 id="notifications-title">
      站内提醒
    </h1>
    <p class="lead">
      这里只展示已发布评分或已授权事件触发的信息提示；不包含交易指令、收益承诺或外部账户入口。
    </p>

    <p
      v-if="loading && !notificationPage"
      class="state-message"
    >
      正在加载你的站内提醒…
    </p>
    <p
      v-else-if="notificationError"
      class="state-message error-message"
      role="alert"
    >
      {{ notificationError }}
    </p>
    <template v-else-if="notificationPage">
      <section
        class="notification-card"
        aria-labelledby="notification-list-title"
      >
        <header class="notification-card-heading">
          <div>
            <p class="eyebrow">
              MY NOTICES
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
                风险 {{ riskLevelLabel(item.payload.riskLevel ?? null) }} · 置信度 {{ formatPercent(item.payload.confidence) }}
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
          暂无站内提醒。当前没有已发布评分命中你的已启用规则，或该规则仍处于冷却期。
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
      class="notification-card"
      aria-labelledby="notification-rule-title"
    >
      <header class="notification-card-heading">
        <div>
          <p class="eyebrow">
            MY RULES
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
            <label v-if="rule.ruleType === 'RISK_LEVEL'">
              风险阈值（0–1）
              <input
                :value="thresholdFor(rule)"
                max="1"
                min="0"
                step="0.01"
                type="number"
                @input="updateThreshold(rule, $event)"
              >
            </label>
            <button
              class="secondary-button"
              :disabled="savingRuleIds.has(rule.ruleId)"
              type="button"
              @click="saveRule(rule, rule.enabled)"
            >
              {{ savingRuleIds.has(rule.ruleId) ? '保存中…' : '保存' }}
            </button>
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
