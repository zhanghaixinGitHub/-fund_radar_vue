<script setup lang="ts">
import { usePageNavigation } from '@/composables/usePageNavigation'
import ReviewNoticePanel from '@/components/ReviewNoticePanel.vue'
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import { getAlertAvailability, getAlertRulePage, upsertAlertRule } from '@/api/alerts'
import { ApiRequestError } from '@/api/http'
import { getNotifications, markNotificationRead } from '@/api/notifications'
import type { AlertAvailability, AlertRule, AlertRulePage, UpsertAlertRuleRequest } from '@/types/alert'
import { alertAvailabilityNote, alertDescriptions } from '@/utils/alertPresentation'
import type { NotificationItem, NotificationPage } from '@/types/notification'
import { riskLevelLabel, signalDirectionLabel } from '@/utils/fundPresentation'

const pageSize = 20
const notificationPage = ref<NotificationPage | null>(null)
const rulePageSize = 10
const rulePage = ref<AlertRulePage | null>(null)
const ruleStatus = ref<'all' | 'enabled' | 'disabled'>('all')
const rulesLoading = ref(true)
let rulesRequest = 0
let disposed = false
const availability = ref<AlertAvailability | null>(null)
const loading = ref(true)
const notificationError = ref('')
const rulesError = ref('')
const ruleMessage = ref('')
const readingIds = ref<Set<string>>(new Set())
const savingRuleIds = ref<Set<string>>(new Set())
const currentRulePage = computed(() => rulePage.value?.page ?? 1)
const emptyRulesMessage = computed(() => ruleStatus.value === 'enabled'
  ? '暂无已开启的提醒。'
  : ruleStatus.value === 'disabled'
    ? '暂无已关闭的提醒。'
    : '暂无提醒设置。关注基金后会默认开启两类提醒，你可以随时分别关闭。')

const currentPage = computed(() => notificationPage.value?.page ?? 1)
const hasPreviousPage = computed(() => currentPage.value > 1)
const hasNextPage = computed(() => {
  const page = notificationPage.value
  return page ? page.page < page.totalPages : false
})

/** 将内部提醒类型转换为用户可理解的资讯提示文案。 */
function ruleTypeLabel(ruleType: AlertRule['ruleType']): string {
  return alertDescriptions[ruleType].title
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

/** 加载本人通知和可用范围；提醒规则独立分页，失败不影响其他区域。 */
async function load(page = 1): Promise<void> {
  loading.value = true
  notificationError.value = ''
  const [notificationsResult, abilityResult] = await Promise.allSettled([
    getNotifications(page, pageSize),
    getAlertAvailability(),
  ])
  if (notificationsResult.status === 'fulfilled') {
    notificationPage.value = notificationsResult.value
  } else {
    notificationPage.value = null
    notificationError.value = displayRequestError(notificationsResult.reason, '站内提醒暂时不可用。')
  }
  availability.value = abilityResult.status === 'fulfilled' ? abilityResult.value : null
  loading.value = false
}

/** 筛选和翻页均只读取当前页；序号丢弃较慢的旧响应，防止快速切换后展示错误状态。 */
async function loadRules(page = 1): Promise<void> {
  const request = ++rulesRequest
  rulesLoading.value = true
  rulesError.value = ''
  const enabled = ruleStatus.value === 'all' ? undefined : ruleStatus.value === 'enabled'
  try {
    const result = await getAlertRulePage(page, rulePageSize, enabled)
    if (disposed || request !== rulesRequest) return
    rulePage.value = result
  } catch (error) {
    if (disposed || request !== rulesRequest) return
    rulePage.value = null
    rulesError.value = displayRequestError(error, '提醒规则暂时不可用。')
  } finally {
    if (!disposed && request === rulesRequest) rulesLoading.value = false
  }
}

/** 更换接收状态后从第一页查看，避免沿用旧筛选的页码。 */
watch(ruleStatus, () => {
  ruleMessage.value = ''
  void loadRules(1)
})

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
  if (savingRuleIds.value.has(rule.ruleId)) return
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
    threshold: threshold === null ? null : Number(threshold),
    enabled,
  }
  try {
    const saved = await upsertAlertRule(request)
    if (disposed) return
    ruleMessage.value = saved.enabled ? '已开启接收。' : '已关闭接收，不影响关注这只基金。'
    // 启停后重新读取当前筛选，正确更新总数；最后一页清空时由服务端回退到有效页。
    await loadRules(currentRulePage.value)
  } catch (error) {
    ruleMessage.value = displayRequestError(error, '提醒规则未保存。')
  } finally {
    savingRuleIds.value = new Set([...savingRuleIds.value].filter((ruleId) => ruleId !== rule.ruleId))
  }
}

onMounted(() => {
  void load()
  void loadRules()
})
onBeforeUnmount(() => {
  disposed = true
  rulesRequest++
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
      {{ section === 'rules' ? '可在“我的关注 → 基金详情 → 我的提醒”中设置提醒，也可以在这里直接开启或关闭。' : '查看基金事项与本人条件变化，并按保存的依据复查。' }}
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
      aria-label="提醒规则列表"
    >
      <div class="rule-filter-row">
        <label for="rule-status">提醒状态</label>
        <select
          id="rule-status"
          v-model="ruleStatus"
        >
          <option value="all">
            全部
          </option>
          <option value="enabled">
            已开启
          </option>
          <option value="disabled">
            已关闭
          </option>
        </select>
        <span v-if="!rulesLoading && !rulesError && rulePage">共 {{ rulePage.totalCount }} 条</span>
      </div>
      <p
        v-if="rulesLoading"
        class="state-message"
        role="status"
      >
        正在加载提醒设置…
      </p>
      <p
        v-else-if="rulesError"
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
          v-if="rulePage && rulePage.items.length > 0"
          class="notification-rule-list"
        >
          <li
            v-for="rule in rulePage.items"
            :key="rule.ruleId"
          >
            <div>
              <strong>基金 {{ rule.fundCode }} · {{ ruleTypeLabel(rule.ruleType) }}</strong>
              <p>{{ alertDescriptions[rule.ruleType].description }}</p>
              <p>{{ alertAvailabilityNote(rule.ruleType, rule.fundCode, availability) }}</p>
              <span>{{ rule.enabled ? '接收已开启' : '接收已关闭' }}</span>
              <p>更新于 {{ formatDateTime(rule.updatedAt) }}</p>
              <span v-if="rule.ruleType === 'RISK_LEVEL'">沿用已保存的风险提醒条件</span>
            </div>
            <button
              class="text-button"
              :disabled="savingRuleIds.has(rule.ruleId)"
              type="button"
              @click="saveRule(rule, !rule.enabled)"
            >
              {{ savingRuleIds.has(rule.ruleId) ? '保存中…' : rule.enabled ? '关闭提醒' : '开启提醒' }}
            </button>
          </li>
        </ul>
        <p
          v-else
          class="empty-analysis"
        >
          {{ emptyRulesMessage }}
        </p>
        <nav
          v-if="rulePage && rulePage.totalCount > 0"
          class="pagination rule-pagination"
          aria-label="提醒规则分页"
        >
          <span>每页 {{ rulePageSize }} 条</span>
          <button
            class="secondary-button"
            :disabled="currentRulePage <= 1"
            type="button"
            @click="loadRules(currentRulePage - 1)"
          >
            上一页
          </button>
          <span>第 {{ currentRulePage }} / {{ rulePage.totalPages }} 页</span>
          <button
            class="secondary-button"
            :disabled="currentRulePage >= rulePage.totalPages"
            type="button"
            @click="loadRules(currentRulePage + 1)"
          >
            下一页
          </button>
        </nav>
      </template>
    </section>
  </section>
</template>

<style scoped>
.rule-filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgb(20 68 57 / 14%);
}
.rule-filter-row label { font-weight: 700; }
.rule-filter-row select {
  min-width: 160px;
  min-height: 44px;
  padding: 8px 12px;
  border: 1px solid #b8cbc5;
  border-radius: 8px;
  background: white;
  color: inherit;
  font: inherit;
}
.rule-filter-row select:focus-visible { outline: 2px solid #0f766e; outline-offset: 3px; }
.rule-filter-row > span { margin-left: auto; color: #587068; }
.notification-rule-list li { grid-template-columns: minmax(0, 1fr) auto; align-items: center; }
.rule-pagination { flex-wrap: wrap; }
@media (max-width: 600px) {
  .notification-rule-list li { grid-template-columns: minmax(0, 1fr); }
  .rule-pagination > span:first-child { flex-basis: 100%; }
}
</style>
