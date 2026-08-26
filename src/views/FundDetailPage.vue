<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getAlertRules, upsertAlertRule } from '@/api/alerts'
import { getFundDetail, getFundEvents, getFundSignals } from '@/api/funds'
import { addWatchlistItem, getWatchlist, removeWatchlistItem } from '@/api/watchlist'
import type { AlertRule, UpsertAlertRuleRequest } from '@/types/alert'
import type { FundDetail, FundEventPage, FundSignal, FundSignalPage } from '@/types/fund'
import {
  dataSourceLabel,
  fundStatusLabel,
  fundTypeLabel,
  netValueStatusLabel,
  riskLevelLabel,
  signalDirectionLabel,
} from '@/utils/fundPresentation'

/**
 * 基金详情页面的状态与交互逻辑。
 *
 * 展示基金基本信息、关联事件和评分结果，并提供关注与资讯型提醒规则维护；所有数据均通过 Java 对外接口读取或写入。
 */
const route = useRoute()
const fund = ref<FundDetail | null>(null)
const loading = ref(false)
const changingWatchlist = ref(false)
const errorMessage = ref('')
const actionMessage = ref('')
const analysisMessage = ref('')
const alertMessage = ref('')
const watchedCodes = ref(new Set<string>())
const events = ref<FundEventPage | null>(null)
const signals = ref<FundSignalPage | null>(null)
const alertRules = ref<AlertRule[]>([])
const selectedAlertType = ref<AlertRule['ruleType']>('RISK_LEVEL')
const riskThreshold = ref(0.5)
const alertEnabled = ref(true)
const savingAlert = ref(false)
const fundCode = computed(() => String(route.params.fundCode ?? ''))
const isMock = computed(() => fund.value?.dataSource === 'M0_MOCK')
const isStale = computed(() => fund.value?.stale === true)
const isWatched = computed(() => watchedCodes.value.has(fundCode.value))

/** 将 0 到 1 范围的数值格式化为界面展示的百分比；缺失或非法值显示占位符。 */
function formatPercent(value: number | string | null): string {
  if (value === null) {
    return '—'
  }
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? `${(numericValue * 100).toFixed(1)}%` : '—'
}

/** 将后端评分状态转换为用户可理解的中文说明，不推断任何缺失的方向结论。 */
function signalStatusLabel(signal: FundSignal): string {
  if (signal.scoreStatus === 'DATA_INSUFFICIENT') {
    return '数据不足，暂不评分'
  }
  if (signal.scoreStatus === 'NOT_APPLICABLE') {
    return '该基金类型不适用方向评分'
  }
  if (signal.scoreStatus === 'MODEL_REJECTED') {
    return '模型未通过准入，暂不发布'
  }
  return '已完成评分'
}

/** 用当前基金和提醒类型已有的规则回填提醒表单；不存在时使用安全默认值。 */
function applyCurrentAlertRule(): void {
  const existingRule = alertRules.value.find(
    (rule) => rule.fundCode === fundCode.value && rule.ruleType === selectedAlertType.value,
  )
  alertEnabled.value = existingRule?.enabled ?? true
  riskThreshold.value = existingRule?.threshold === null || existingRule?.threshold === undefined
    ? 0.5
    : Number(existingRule.threshold)
}

/** 用户切换提醒类型时清空提示，并回填该类型的既有规则。 */
function changeAlertType(): void {
  alertMessage.value = ''
  applyCurrentAlertRule()
}

/**
 * 加载详情页所需数据。
 *
 * 基金详情是页面必要数据；事件、信号和提醒规则采用独立降级，某一项失败不会阻止其余可用信息展示。
 */
async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  actionMessage.value = ''
  analysisMessage.value = ''
  alertMessage.value = ''
  events.value = null
  signals.value = null
  try {
    fund.value = await getFundDetail(fundCode.value)
  } catch (error) {
    fund.value = null
    errorMessage.value = error instanceof Error ? error.message : '基金详情暂时不可用。'
    loading.value = false
    return
  }

  const [eventsResult, signalsResult, alertRulesResult] = await Promise.allSettled([
    getFundEvents(fundCode.value),
    getFundSignals(fundCode.value),
    getAlertRules(),
  ])
  if (eventsResult.status === 'fulfilled') {
    events.value = eventsResult.value
  }
  if (signalsResult.status === 'fulfilled') {
    signals.value = signalsResult.value
  }
  if (alertRulesResult.status === 'fulfilled') {
    alertRules.value = alertRulesResult.value
    applyCurrentAlertRule()
  }
  if (eventsResult.status === 'rejected' || signalsResult.status === 'rejected') {
    analysisMessage.value = '事件或信号服务暂不可用；请确认 Java 服务已重启至包含 M2/M3 接口的版本。'
  }
  if (alertRulesResult.status === 'rejected') {
    alertMessage.value = '提醒规则服务暂不可用；请确认 Java 服务已重启至包含 M3 接口的版本。'
  }

  try {
    const watchlist = await getWatchlist()
    watchedCodes.value = new Set(watchlist.map((item) => item.fundCode))
  } catch {
    actionMessage.value = '关注功能需要重启至包含 M1 接口的 Java 服务后使用。'
  } finally {
    loading.value = false
  }
}

/** 在“加入关注”和“取消关注”之间切换，并防止同一时刻重复提交。 */
async function toggleWatchlist(): Promise<void> {
  changingWatchlist.value = true
  actionMessage.value = ''
  try {
    if (isWatched.value) {
      await removeWatchlistItem(fundCode.value)
      watchedCodes.value.delete(fundCode.value)
      actionMessage.value = '已取消关注。'
    } else {
      await addWatchlistItem(fundCode.value)
      watchedCodes.value.add(fundCode.value)
      actionMessage.value = '已加入关注列表。'
    }
    watchedCodes.value = new Set(watchedCodes.value)
  } catch (error) {
    actionMessage.value = error instanceof Error ? error.message : '关注操作未完成。'
  } finally {
    changingWatchlist.value = false
  }
}

/** 根据当前表单组装合法的提醒规则请求并保存到 Java 核心服务。 */
async function saveAlertRule(): Promise<void> {
  savingAlert.value = true
  alertMessage.value = ''
  const request: UpsertAlertRuleRequest = {
    fundCode: fundCode.value,
    ruleType: selectedAlertType.value,
    threshold: selectedAlertType.value === 'RISK_LEVEL' ? riskThreshold.value : null,
    enabled: alertEnabled.value,
  }
  try {
    const savedRule = await upsertAlertRule(request)
    alertRules.value = [
      ...alertRules.value.filter(
        (rule) => !(rule.fundCode === savedRule.fundCode && rule.ruleType === savedRule.ruleType),
      ),
      savedRule,
    ]
    alertMessage.value = savedRule.enabled ? '提醒规则已保存。' : '提醒规则已停用。'
  } catch (error) {
    alertMessage.value = error instanceof Error ? error.message : '提醒规则未保存。'
  } finally {
    savingAlert.value = false
  }
}

/** 首次进入基金详情时加载数据。 */
onMounted(() => {
  void load()
})

/** 地址栏基金代码变化时重新加载，避免复用上一个基金的状态。 */
watch(fundCode, () => {
  void load()
})
</script>

<template>
  <section
    class="market-page"
    aria-labelledby="fund-detail-title"
  >
    <RouterLink
      class="back-link"
      to="/funds"
    >
      ← 返回基金市场
    </RouterLink>
    <p
      v-if="loading"
      class="state-message"
    >
      正在加载基金详情…
    </p>
    <p
      v-else-if="errorMessage"
      class="state-message error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <template v-else-if="fund">
      <p class="eyebrow">
        基金详情
      </p>
      <h1 id="fund-detail-title">
        {{ fund.fundName }}
      </h1>
      <p class="lead">
        {{ fund.fundCode }} · {{ fundTypeLabel(fund.fundType) }} · {{ fundStatusLabel(fund.status) }}
      </p>
      <p
        v-if="isMock"
        class="notice-banner"
      >
        当前为 M0 Mock 数据，不代表真实净值、收益或投资分析。
      </p>
      <p
        v-if="isStale"
        class="notice-banner"
        role="status"
      >
        分析服务暂不可用，当前展示缓存读模型（缓存时间：{{ fund.cachedAt || '未知' }}）。
      </p>
      <dl class="detail-grid">
        <div><dt>数据截至</dt><dd>{{ fund.asOfDate || '暂无有效净值' }}</dd></div>
        <div><dt>净值状态</dt><dd>{{ netValueStatusLabel(fund.navStatus) }}</dd></div>
        <div><dt>数据来源</dt><dd>{{ dataSourceLabel(fund.dataSource) }}</dd></div>
      </dl>
      <button
        class="primary-button"
        :disabled="changingWatchlist"
        type="button"
        @click="toggleWatchlist"
      >
        {{ changingWatchlist ? '处理中…' : isWatched ? '取消关注' : '加入关注' }}
      </button>
      <p
        v-if="actionMessage"
        class="state-message"
        aria-live="polite"
      >
        {{ actionMessage }}
      </p>
      <p class="risk-disclaimer">
        本页面仅提供信息与关注管理，不构成投资建议，也不提供交易功能。
      </p>
      <section
        class="analysis-section"
        aria-labelledby="event-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              事件追踪
            </p>
            <h2 id="event-title">
              关联事件
            </h2>
          </div>
          <span class="section-note">关联不代表因果</span>
        </div>
        <p
          v-if="analysisMessage"
          class="state-message"
          role="status"
        >
          {{ analysisMessage }}
        </p>
        <p
          v-else-if="events?.stale"
          class="notice-banner"
          role="status"
        >
          事件服务暂不可用，当前展示缓存内容（缓存时间：{{ events.cachedAt || '未知' }}）。
        </p>
        <ul
          v-if="events && events.items.length > 0"
          class="event-list"
        >
          <li
            v-for="event in events.items"
            :key="event.eventId"
          >
            <a
              :href="event.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
            >{{ event.summary }}</a>
            <p>{{ event.sourceName }} · {{ event.publishedAt }}</p>
            <p>可信度 {{ formatPercent(event.confidence) }} · 相关性 {{ formatPercent(event.relevanceScore) }}</p>
            <p>关联依据：{{ event.relationReason }}</p>
          </li>
        </ul>
        <p
          v-else-if="!analysisMessage"
          class="empty-analysis"
        >
          暂无已审核且仍在授权保留期内的关联事件。
        </p>
      </section>
      <section
        class="analysis-section"
        aria-labelledby="signal-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              评分与分析
            </p>
            <h2 id="signal-title">
              风险与分析状态
            </h2>
          </div>
          <span class="section-note">分析提示，不构成交易指令</span>
        </div>
        <p
          v-if="signals?.stale"
          class="notice-banner"
          role="status"
        >
          信号服务暂不可用，当前展示缓存内容（缓存时间：{{ signals.cachedAt || '未知' }}）。
        </p>
        <ul
          v-if="signals && signals.items.length > 0"
          class="signal-list"
        >
          <li
            v-for="signal in signals.items"
            :key="signal.forecastId"
          >
            <strong>{{ signalStatusLabel(signal) }}</strong>
            <p>数据截至 {{ signal.asOfDate }} · 模型 {{ signal.modelVersion }} · 特征 {{ signal.featureVersion }}</p>
            <p v-if="signal.scoreStatus === 'SCORED'">
              方向 {{ signalDirectionLabel(signal.direction) }} · 概率 {{ formatPercent(signal.directionalProbability) }} · 置信度 {{ formatPercent(signal.confidence) }} · 风险 {{ riskLevelLabel(signal.riskLevel) }}
            </p>
            <p>依据：{{ signal.explanation }}</p>
          </li>
        </ul>
        <p
          v-else-if="!analysisMessage"
          class="empty-analysis"
        >
          暂无可展示的评分结果；在取得足够且合规的数据前不会生成方向性结论。
        </p>
      </section>
      <section
        class="analysis-section"
        aria-labelledby="alert-rule-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              提醒设置
            </p>
            <h2 id="alert-rule-title">
              信息提醒规则
            </h2>
          </div>
          <span class="section-note">仅生成站内信息提醒</span>
        </div>
        <form
          class="alert-rule-form"
          @submit.prevent="saveAlertRule"
        >
          <label>
            提醒类型
            <select
              v-model="selectedAlertType"
              @change="changeAlertType"
            >
              <option value="RISK_LEVEL">
                风险等级达到阈值
              </option>
              <option value="SIGNAL_CHANGE">
                信号状态变化
              </option>
              <option value="EVENT">
                重大关联事件
              </option>
            </select>
          </label>
          <label v-if="selectedAlertType === 'RISK_LEVEL'">
            风险阈值（0–1）
            <input
              v-model.number="riskThreshold"
              type="number"
              min="0"
              max="1"
              step="0.01"
              required
            >
          </label>
          <label class="toggle-label">
            <input
              v-model="alertEnabled"
              type="checkbox"
            >
            启用该规则
          </label>
          <button
            class="secondary-button"
            :disabled="savingAlert"
            type="submit"
          >
            {{ savingAlert ? '保存中…' : '保存提醒规则' }}
          </button>
        </form>
        <p
          v-if="alertMessage"
          class="state-message"
          aria-live="polite"
        >
          {{ alertMessage }}
        </p>
      </section>
    </template>
  </section>
</template>
