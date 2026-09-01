<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import FieldHelpTooltip from '@/components/FieldHelpTooltip.vue'
import FundShareHistoryChart from '@/components/FundShareHistoryChart.vue'
import { getWatchlistFundDetail, getWatchlistFundShareHistory } from '@/api/watchlist'
import type { FundShareHistory, WatchlistFundDetail } from '@/types/fund'
import { dataSourceLabel, fundStatusLabel, fundTypeLabel, netValueStatusLabel } from '@/utils/fundPresentation'

/** 当前用户已关注基金的完整资料页；服务端会在读取前校验本人关注关系。 */
const route = useRoute()
const detail = ref<WatchlistFundDetail | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const shareHistory = ref<FundShareHistory | null>(null)
const shareHistoryLoading = ref(false)
const shareHistoryError = ref('')
const fundCode = computed(() => String(route.params.fundCode ?? ''))
const basic = computed(() => detail.value?.basic ?? null)
const currentManagers = computed(() => (detail.value?.managers ?? [])
  .filter((manager) => !manager.endDate)
  .slice(0, 2))
const currentManagerNames = computed(() => currentManagers.value.map((manager) => manager.managerName).join('、'))
const recentDividend = computed(() => detail.value?.dividends.at(0) ?? null)

/** 不猜测来源单位，仅格式化数值，缺失数据保持为“暂缺”。 */
function formatSourceNumber(value: number | string | null | undefined, maximumFractionDigits = 6): string {
  if (value === null || value === undefined || value === '') {
    return '暂缺'
  }
  const numericValue = Number(value)
  return Number.isFinite(numericValue)
    ? numericValue.toLocaleString('zh-CN', { maximumFractionDigits })
    : '暂缺'
}

/** 净值字段统一展示四位小数，避免将缺失值误显示为 0。 */
function formatNetValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '暂缺'
  }
  const numericValue = Number(value)
  return Number.isFinite(numericValue)
    ? numericValue.toLocaleString('zh-CN', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
    : '暂缺'
}

/** 所有详情区块使用相同的同步状态文案，空列表不等于同步失败。 */
function syncStatusLabel(status: string | null | undefined): string {
  return status === 'SYNCED' ? '已同步' : '尚未同步'
}

/** 将份额规模查询起点限制在服务端允许窗口内，锚定最新已同步日期而非浏览器当前时间。 */
function shareHistoryStartDate(endDate: string): string {
  const [year, month, day] = endDate.split('-').map(Number)
  const anchor = new Date(Date.UTC(year, month - 1, day))
  anchor.setUTCDate(anchor.getUTCDate() - 4_999)
  return anchor.toISOString().slice(0, 10)
}

/** 独立读取已关注基金的份额规模历史；服务端会再次校验本人关注关系。 */
async function loadShareHistory(endDate: string | null): Promise<void> {
  shareHistory.value = null
  shareHistoryError.value = ''
  if (!detail.value || detail.value.latestShareStatus !== 'SYNCED' || !endDate) {
    return
  }
  shareHistoryLoading.value = true
  try {
    shareHistory.value = await getWatchlistFundShareHistory(
      fundCode.value,
      shareHistoryStartDate(endDate),
      endDate,
    )
  } catch (error) {
    shareHistoryError.value = error instanceof Error ? error.message : '基金份额规模历史暂时不可用。'
  } finally {
    shareHistoryLoading.value = false
  }
}

/** 加载服务端已按当前会话授权的完整资料；403 由统一请求层转换为可展示提示。 */
async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  detail.value = null
  shareHistory.value = null
  shareHistoryError.value = ''
  try {
    detail.value = await getWatchlistFundDetail(fundCode.value)
    void loadShareHistory(detail.value.latestShare?.tradeDate ?? detail.value.basic.asOfDate)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '完整关注资料暂时不可用。'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})

watch(fundCode, () => {
  void load()
})
</script>

<template>
  <section
    class="market-page watchlist-detail-page"
    aria-labelledby="watchlist-fund-detail-title"
  >
    <RouterLink
      class="back-link"
      to="/watchlist"
    >
      ← 返回我的关注
    </RouterLink>
    <p
      v-if="loading"
      class="state-message"
      role="status"
    >
      正在加载完整关注资料…
    </p>
    <p
      v-else-if="errorMessage"
      class="state-message error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <template v-else-if="basic && detail">
      <p class="eyebrow">
        我的关注 · 完整资料
      </p>
      <h1 id="watchlist-fund-detail-title">
        {{ basic.fundName }}
      </h1>
      <p class="lead">
        {{ basic.fundCode }} · {{ fundTypeLabel(basic.fundType) }} · {{ fundStatusLabel(basic.status) }}
      </p>
      <p
        v-if="detail.stale"
        class="notice-banner"
        role="status"
      >
        分析服务暂不可用，当前展示缓存资料（缓存时间：{{ detail.cachedAt || '未知' }}）。
      </p>
      <section
        class="watchlist-summary"
        aria-labelledby="watchlist-summary-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              关注资料速览
            </p>
            <h2 id="watchlist-summary-title">
              已同步资料摘要
            </h2>
          </div>
          <span class="section-note">完整记录见下方</span>
        </div>
        <div class="watchlist-summary-grid">
          <article class="detail-overview-card">
            <p class="detail-overview-label">
              在任基金经理
            </p>
            <strong class="detail-overview-value">
              {{ detail.managersStatus === 'SYNCED' ? (currentManagerNames || '暂缺') : '尚未同步' }}
            </strong>
            <p class="detail-overview-meta">
              {{ detail.managersStatus !== 'SYNCED'
                ? '基金经理资料尚未同步。'
                : currentManagers.length > 0
                  ? `当前展示 ${currentManagers.length} 条仍在任记录。`
                  : '来源暂未提供仍在任的基金经理记录。' }}
            </p>
          </article>
          <article class="detail-overview-card">
            <p class="detail-overview-label">
              最新基金份额
            </p>
            <strong class="detail-overview-value">
              {{ detail.latestShareStatus === 'SYNCED' && detail.latestShare
                ? `${formatSourceNumber(detail.latestShare.fundShare, 4)} 万份`
                : detail.latestShareStatus === 'SYNCED' ? '暂缺' : '尚未同步' }}
            </strong>
            <p class="detail-overview-meta">
              {{ detail.latestShareStatus !== 'SYNCED'
                ? '基金份额规模尚未同步。'
                : detail.latestShare
                  ? `变动日期：${detail.latestShare.tradeDate} · ${dataSourceLabel(detail.latestShare.dataSource)}`
                  : '来源暂未提供可展示的基金份额规模记录。' }}
            </p>
          </article>
          <article class="detail-overview-card">
            <p class="detail-overview-label">
              最近分红记录
            </p>
            <strong class="detail-overview-value">
              {{ detail.dividendsStatus === 'SYNCED' && recentDividend
                ? `每份 ${formatSourceNumber(recentDividend.cashDividend, 6)}`
                : detail.dividendsStatus === 'SYNCED' ? '暂缺' : '尚未同步' }}
            </strong>
            <p class="detail-overview-meta">
              {{ detail.dividendsStatus !== 'SYNCED'
                ? '分红记录尚未同步。'
                : recentDividend
                  ? `公告日期：${recentDividend.annDate || '暂缺'} · ${dataSourceLabel(recentDividend.dataSource)}`
                  : '来源暂未提供可展示的分红事件。' }}
            </p>
          </article>
        </div>
      </section>

      <section
        class="analysis-section"
        aria-labelledby="watchlist-profile-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              产品资料
            </p>
            <h2 id="watchlist-profile-title">
              完整基础资料
            </h2>
          </div>
          <span class="section-note">{{ syncStatusLabel(basic.profileStatus) }}</span>
        </div>
        <p
          v-if="basic.profileStatus !== 'SYNCED'"
          class="empty-analysis"
        >
          基础资料尚未完成同步，后续同步完成后会显示；不会用估算值补齐。
        </p>
        <dl
          v-else
          class="detail-grid full-detail-grid"
        >
          <div>
            <dt>基金管理人</dt><dd>{{ basic.managementCompanyName || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="基金管理人"
              description="负责基金投资运作和日常管理的机构。可用于识别管理主体；不能单独判断基金业绩或风险。"
            />
          </div>
          <div>
            <dt>基金托管人</dt><dd>{{ basic.custodianName || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="基金托管人"
              description="负责保管基金资产并履行监督职责的机构。可用于了解资产保管安排；不代表投资收益保障。"
            />
          </div>
          <div>
            <dt>成立日期</dt><dd>{{ basic.foundDate || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="成立日期"
              description="基金合同生效、产品正式成立的日期。可用于了解基金存续时间；不等同于上市或当前可申购日期。"
            />
          </div>
          <div>
            <dt>上市日期</dt><dd>{{ basic.listDate || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="上市日期"
              description="基金在交易所上市交易的日期。部分场外或未上市基金可能暂缺；它不等同于成立日期。"
            />
          </div>
          <div>
            <dt>发行日期</dt><dd>{{ basic.issueDate || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="发行日期"
              description="基金首次向投资者发行的日期。可用于了解产品发行时点；不表示当前仍可认购。"
            />
          </div>
          <div>
            <dt>到期日期</dt><dd>{{ basic.dueDate || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="到期日期"
              description="合同约定的产品到期日期。开放式基金通常可能没有固定到期日，暂缺不代表数据异常。"
            />
          </div>
          <div>
            <dt>投资类型</dt><dd>{{ basic.investType || basic.sourceFundType || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="投资类型"
              description="来源给出的投资策略或产品分类。可帮助理解产品定位；不能替代风险评级或投资建议。"
            />
          </div>
          <div>
            <dt>业绩比较基准</dt><dd>{{ basic.benchmark || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="业绩比较基准"
              description="用于评估基金相对表现的参考组合或指数。可用于回顾比较；不构成收益目标或收益承诺。"
            />
          </div>
          <div>
            <dt>受托人</dt><dd>{{ basic.trusteeName || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="受托人"
              description="来源披露的基金受托相关机构信息。可用于核对产品资料；具体职责以基金合同和来源说明为准。"
            />
          </div>
          <div>
            <dt>管理费率（来源值）</dt><dd>{{ formatSourceNumber(basic.managementFee) }}</dd>
            <FieldHelpTooltip
              field-name="管理费率"
              description="来源原始管理费率数值。可用于了解持续费用项目；系统不擅自换算单位或计算总成本，应以基金合同为准。"
            />
          </div>
          <div>
            <dt>托管费率（来源值）</dt><dd>{{ formatSourceNumber(basic.custodianFee) }}</dd>
            <FieldHelpTooltip
              field-name="托管费率"
              description="来源原始托管费率数值。可用于了解持续费用项目；系统不擅自换算单位或计算总成本，应以基金合同为准。"
            />
          </div>
          <div>
            <dt>最低认购额（来源值）</dt><dd>{{ formatSourceNumber(basic.minPurchaseAmount) }}</dd>
            <FieldHelpTooltip
              field-name="最低认购额"
              description="来源披露的首次认购最低金额。可用于了解发行期门槛；实际规则可能调整，应以当前销售公告为准。"
            />
          </div>
          <div>
            <dt>发行份额（来源值）</dt><dd>{{ formatSourceNumber(basic.issueAmount) }}</dd>
            <FieldHelpTooltip
              field-name="发行份额"
              description="来源披露的发行期份额数。可用于了解发行规模；不等同于当前基金份额或当前资产规模。"
            />
          </div>
          <div>
            <dt>面值（来源值）</dt><dd>{{ formatSourceNumber(basic.parValue) }}</dd>
            <FieldHelpTooltip
              field-name="面值"
              description="来源披露的每份面值。可用于区分合同面值和净值；不能将它当作当前单位净值。"
            />
          </div>
          <div>
            <dt>存续年限（来源值）</dt><dd>{{ formatSourceNumber(basic.durationYear) }}</dd>
            <FieldHelpTooltip
              field-name="存续年限"
              description="来源披露的合同约定存续期限。可用于了解产品期限安排；开放式基金可能没有固定年限。"
            />
          </div>
          <div>
            <dt>认购起始日</dt><dd>{{ basic.purchaseStartDate || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="认购起始日"
              description="来源披露的认购开始日期。可用于回顾发行安排；不表示当前一定处于可认购状态。"
            />
          </div>
          <div>
            <dt>赎回起始日</dt><dd>{{ basic.redemptionStartDate || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="赎回起始日"
              description="来源披露的赎回开始日期。可用于了解合同安排；实际赎回状态仍应以当前公告为准。"
            />
          </div>
          <div>
            <dt>资料来源</dt><dd>{{ basic.profileDataSource ? dataSourceLabel(basic.profileDataSource) : '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="资料来源"
              description="本卡片资料的已登记来源。可用于追溯信息出处；来源与业务日期不代表实时更新或完整覆盖。"
            />
          </div>
        </dl>
      </section>

      <section
        class="analysis-section"
        aria-labelledby="watchlist-nav-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              净值快照
            </p>
            <h2 id="watchlist-nav-title">
              最新已落库净值
            </h2>
          </div>
          <span class="section-note">{{ netValueStatusLabel(basic.navStatus) }}</span>
        </div>
        <dl class="detail-grid full-detail-grid">
          <div>
            <dt>单位净值</dt><dd>{{ formatNetValue(basic.unitNav) }}</dd>
            <FieldHelpTooltip
              field-name="单位净值"
              description="基金在该净值日期每一份的净资产价值。可用于查看当日估值水平；单日数值不能单独代表长期表现。"
            />
          </div>
          <div>
            <dt>累计净值</dt><dd>{{ formatNetValue(basic.accumulatedNav) }}</dd>
            <FieldHelpTooltip
              field-name="累计净值"
              description="按来源口径累计反映历史分红再投资影响后的净值指标。可用于回顾历史表现；具体计算口径以数据来源为准。"
            />
          </div>
          <div>
            <dt>复权单位净值</dt><dd>{{ formatNetValue(basic.adjustedNav) }}</dd>
            <FieldHelpTooltip
              field-name="复权单位净值"
              description="按来源复权口径处理分红等因素后的单位净值。可用于同一基金的历史走势比较；不等同于实际交易成交价。"
            />
          </div>
          <div>
            <dt>净值日期</dt><dd>{{ basic.asOfDate || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="净值日期"
              description="这组净值对应的业务日期。可用于判断数据时点；不是页面访问时间，也不代表实时行情。"
            />
          </div>
          <div>
            <dt>公告日期</dt><dd>{{ basic.navAnnDate || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="公告日期"
              description="来源披露或公告该净值信息的日期。可用于识别披露滞后；可能晚于净值日期。"
            />
          </div>
          <div>
            <dt>累计分红</dt><dd>{{ formatNetValue(basic.accumulatedDividend) }}</dd>
            <FieldHelpTooltip
              field-name="累计分红"
              description="来源累计记录的每份现金分红相关数值。可用于回顾历史分配情况；不代表未来会继续分红。"
            />
          </div>
          <div>
            <dt>净资产（来源值）</dt><dd>{{ formatSourceNumber(basic.netAsset, 4) }}</dd>
            <FieldHelpTooltip
              field-name="净资产"
              description="来源提供的净资产原始数值。可辅助了解资产规模；系统不擅自换算单位或将其作为基金排名依据。"
            />
          </div>
          <div>
            <dt>合计净资产（来源值）</dt><dd>{{ formatSourceNumber(basic.totalNetAsset, 4) }}</dd>
            <FieldHelpTooltip
              field-name="合计净资产"
              description="来源提供的合计净资产原始数值。可用于核对来源规模信息；具体范围、币种和单位以来源口径为准。"
            />
          </div>
          <div>
            <dt>数据来源</dt><dd>{{ dataSourceLabel(basic.dataSource) }}</dd>
            <FieldHelpTooltip
              field-name="净值数据来源"
              description="本组净值字段的已登记数据来源。可用于追溯信息出处；来源和业务日期不代表实时更新或完整覆盖。"
            />
          </div>
        </dl>
      </section>

      <section
        class="analysis-section"
        aria-labelledby="watchlist-manager-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              基金经理
            </p>
            <h2 id="watchlist-manager-title">
              任职记录
            </h2>
          </div>
          <span class="section-note">{{ syncStatusLabel(detail.managersStatus) }}</span>
        </div>
        <p
          v-if="detail.managersStatus !== 'SYNCED'"
          class="empty-analysis"
        >
          基金经理资料尚未同步。
        </p>
        <p
          v-else-if="detail.managers.length === 0"
          class="empty-analysis"
        >
          来源暂未提供可展示的基金经理任职记录。
        </p>
        <ul
          v-else
          class="fund-timeline"
        >
          <li
            v-for="manager in detail.managers"
            :key="`${manager.managerName}-${manager.beginDate || manager.annDate || 'unknown'}`"
          >
            <strong>{{ manager.managerName }}</strong>
            <span class="timeline-status">{{ manager.endDate ? '已离任' : '在任' }}</span>
            <span>任职：{{ manager.beginDate || '暂缺' }} 至 {{ manager.endDate || '至今' }}</span>
            <span>学历：{{ manager.education || '暂缺' }}</span>
            <span>来源：{{ dataSourceLabel(manager.dataSource) }}</span>
          </li>
        </ul>
      </section>

      <section
        class="analysis-section"
        aria-labelledby="watchlist-share-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              规模快照
            </p>
            <h2 id="watchlist-share-title">
              基金份额规模趋势
            </h2>
          </div>
          <span class="section-note">{{ syncStatusLabel(detail.latestShareStatus) }}</span>
        </div>
        <p
          v-if="detail.latestShareStatus !== 'SYNCED'"
          class="empty-analysis"
        >
          基金份额规模尚未同步。
        </p>
        <template v-else>
          <dl
            v-if="detail.latestShare"
            class="detail-grid"
          >
            <div><dt>最新变动日期</dt><dd>{{ detail.latestShare.tradeDate }}</dd></div>
            <div><dt>最新基金份额（万份）</dt><dd>{{ formatSourceNumber(detail.latestShare.fundShare, 4) }}</dd></div>
            <div><dt>数据来源</dt><dd>{{ dataSourceLabel(detail.latestShare.dataSource) }}</dd></div>
          </dl>
          <p
            v-else
            class="empty-analysis"
          >
            来源暂未提供最新基金份额规模记录；下方仅在存在已同步历史时展示趋势。
          </p>
          <FundShareHistoryChart
            :error-message="shareHistoryError"
            :loading="shareHistoryLoading"
            :points="shareHistory?.items ?? []"
            :status="shareHistory?.status ?? detail.latestShareStatus"
          />
        </template>
      </section>

      <section
        class="analysis-section"
        aria-labelledby="watchlist-dividend-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              分红记录
            </p>
            <h2 id="watchlist-dividend-title">
              结构化分红事件
            </h2>
          </div>
          <span class="section-note">{{ syncStatusLabel(detail.dividendsStatus) }}</span>
        </div>
        <p
          v-if="detail.dividendsStatus !== 'SYNCED'"
          class="empty-analysis"
        >
          分红记录尚未同步。
        </p>
        <p
          v-else-if="detail.dividends.length === 0"
          class="empty-analysis"
        >
          来源暂未提供可展示的分红事件。
        </p>
        <ul
          v-else
          class="fund-timeline"
        >
          <li
            v-for="dividend in detail.dividends"
            :key="`${dividend.annDate || 'unknown'}-${dividend.exDate || 'unknown'}-${dividend.baseYear || ''}`"
          >
            <strong>公告日期：{{ dividend.annDate || '暂缺' }}</strong>
            <span class="timeline-status">{{ dividend.processStatus || '状态暂缺' }}</span>
            <span>除息日：{{ dividend.exDate || '暂缺' }} · 派息日：{{ dividend.payDate || '暂缺' }}</span>
            <span>现金分红（来源值）：{{ formatSourceNumber(dividend.cashDividend, 6) }}</span>
            <span>状态：{{ dividend.processStatus || '暂缺' }} · 来源：{{ dataSourceLabel(dividend.dataSource) }}</span>
          </li>
        </ul>
      </section>
      <p class="risk-disclaimer">
        完整资料来自已授权并已落库的结构化数据，不代表实时估值、未来收益或投资建议。
      </p>
    </template>
  </section>
</template>
