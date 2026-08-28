<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getWatchlistFundDetail } from '@/api/watchlist'
import type { WatchlistFundDetail } from '@/types/fund'
import { dataSourceLabel, fundStatusLabel, fundTypeLabel, netValueStatusLabel } from '@/utils/fundPresentation'

/** 当前用户已关注基金的完整资料页；服务端会在读取前校验本人关注关系。 */
const route = useRoute()
const detail = ref<WatchlistFundDetail | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const fundCode = computed(() => String(route.params.fundCode ?? ''))
const basic = computed(() => detail.value?.basic ?? null)

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

/** 加载服务端已按当前会话授权的完整资料；403 由统一请求层转换为可展示提示。 */
async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  detail.value = null
  try {
    detail.value = await getWatchlistFundDetail(fundCode.value)
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
          <div><dt>基金管理人</dt><dd>{{ basic.managementCompanyName || '暂缺' }}</dd></div>
          <div><dt>基金托管人</dt><dd>{{ basic.custodianName || '暂缺' }}</dd></div>
          <div><dt>成立日期</dt><dd>{{ basic.foundDate || '暂缺' }}</dd></div>
          <div><dt>上市日期</dt><dd>{{ basic.listDate || '暂缺' }}</dd></div>
          <div><dt>发行日期</dt><dd>{{ basic.issueDate || '暂缺' }}</dd></div>
          <div><dt>到期日期</dt><dd>{{ basic.dueDate || '暂缺' }}</dd></div>
          <div><dt>投资类型</dt><dd>{{ basic.investType || basic.sourceFundType || '暂缺' }}</dd></div>
          <div><dt>业绩比较基准</dt><dd>{{ basic.benchmark || '暂缺' }}</dd></div>
          <div><dt>受托人</dt><dd>{{ basic.trusteeName || '暂缺' }}</dd></div>
          <div><dt>管理费率（来源值）</dt><dd>{{ formatSourceNumber(basic.managementFee) }}</dd></div>
          <div><dt>托管费率（来源值）</dt><dd>{{ formatSourceNumber(basic.custodianFee) }}</dd></div>
          <div><dt>最低认购额（来源值）</dt><dd>{{ formatSourceNumber(basic.minPurchaseAmount) }}</dd></div>
          <div><dt>发行份额（来源值）</dt><dd>{{ formatSourceNumber(basic.issueAmount) }}</dd></div>
          <div><dt>面值（来源值）</dt><dd>{{ formatSourceNumber(basic.parValue) }}</dd></div>
          <div><dt>存续年限（来源值）</dt><dd>{{ formatSourceNumber(basic.durationYear) }}</dd></div>
          <div><dt>认购起始日</dt><dd>{{ basic.purchaseStartDate || '暂缺' }}</dd></div>
          <div><dt>赎回起始日</dt><dd>{{ basic.redemptionStartDate || '暂缺' }}</dd></div>
          <div><dt>资料来源</dt><dd>{{ basic.profileDataSource ? dataSourceLabel(basic.profileDataSource) : '暂缺' }}</dd></div>
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
          <div><dt>单位净值</dt><dd>{{ formatNetValue(basic.unitNav) }}</dd></div>
          <div><dt>累计净值</dt><dd>{{ formatNetValue(basic.accumulatedNav) }}</dd></div>
          <div><dt>复权单位净值</dt><dd>{{ formatNetValue(basic.adjustedNav) }}</dd></div>
          <div><dt>净值日期</dt><dd>{{ basic.asOfDate || '暂缺' }}</dd></div>
          <div><dt>公告日期</dt><dd>{{ basic.navAnnDate || '暂缺' }}</dd></div>
          <div><dt>累计分红</dt><dd>{{ formatNetValue(basic.accumulatedDividend) }}</dd></div>
          <div><dt>净资产（来源值）</dt><dd>{{ formatSourceNumber(basic.netAsset, 4) }}</dd></div>
          <div><dt>合计净资产（来源值）</dt><dd>{{ formatSourceNumber(basic.totalNetAsset, 4) }}</dd></div>
          <div><dt>数据来源</dt><dd>{{ dataSourceLabel(basic.dataSource) }}</dd></div>
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
          class="full-detail-list"
        >
          <li
            v-for="manager in detail.managers"
            :key="`${manager.managerName}-${manager.beginDate || manager.annDate || 'unknown'}`"
          >
            <strong>{{ manager.managerName }}</strong>
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
              最新基金份额
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
        <dl
          v-else-if="detail.latestShare"
          class="detail-grid"
        >
          <div><dt>变动日期</dt><dd>{{ detail.latestShare.tradeDate }}</dd></div>
          <div><dt>基金份额（万份）</dt><dd>{{ formatSourceNumber(detail.latestShare.fundShare, 4) }}</dd></div>
          <div><dt>数据来源</dt><dd>{{ dataSourceLabel(detail.latestShare.dataSource) }}</dd></div>
        </dl>
        <p
          v-else
          class="empty-analysis"
        >
          来源暂未提供可展示的基金份额规模记录。
        </p>
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
          class="full-detail-list"
        >
          <li
            v-for="dividend in detail.dividends"
            :key="`${dividend.annDate || 'unknown'}-${dividend.exDate || 'unknown'}-${dividend.baseYear || ''}`"
          >
            <strong>公告日期：{{ dividend.annDate || '暂缺' }}</strong>
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
