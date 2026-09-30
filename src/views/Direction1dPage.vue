<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getDirection1dCoverage, getDirection1dHistory, getDirection1dMetrics } from '@/api/direction1d'
import type { Direction1dCoverage, Direction1dPage, Direction1dRecord, Direction1dCursor } from '@/types/direction1d'
import { assertDirection1dForecast, direction1dDirection, direction1dSummary, direction1dTime } from '@/utils/direction1d'

const coverage = ref<(Direction1dPage<Direction1dCoverage> & { checkedCount: number; statusCounts: Record<string, number> }) | null>(null)
const history = ref<Direction1dPage<Direction1dRecord> | null>(null)
const metrics = ref<Awaited<ReturnType<typeof getDirection1dMetrics>> | null>(null)
const page = ref(1)
const historyPage = ref(1)
const cursors = ref<(Direction1dCursor | undefined)[]>([undefined])
const historyFund = ref('')
const assessment = ref('')
const historyBranch = ref('')
const startDate = ref('2021-01-01')
const endDate = ref('2026-12-31')
const labelBasis = ref('FIRST_OBSERVED')
const predictionBasis = ref('LAST_VALID')
let sequence = 0
const keyword = ref('')
const busy = ref(false)
const error = ref('')
async function load() {
  const request = ++sequence
  busy.value = true
  error.value = ''
  try {
    const [c, h, m] = await Promise.all([getDirection1dCoverage(page.value, keyword.value), getDirection1dHistory(historyPage.value, historyFund.value, cursors.value[historyPage.value - 1], { assessment: assessment.value, branch: historyBranch.value, startDate: startDate.value, endDate: endDate.value }), getDirection1dMetrics(labelBasis.value, predictionBasis.value)])
    h.items.forEach(r => { if (!r.status) assertDirection1dForecast(r.forecast) })
    if (request !== sequence) return
    coverage.value = c; history.value = h; metrics.value = m
  } catch { if (request === sequence) error.value = '预测记录暂时无法读取，请稍后重试。' }
  finally { if (request === sequence) busy.value = false }
}
/** 只对同次判断方向一致且已经提前保存的记录核对，分歧不强行择优。 */
function conclusion(record: Direction1dRecord) {
  if (record.receiptStatus !== 'VERIFIED') return '提前保存状态待核对'
  const directions = new Set(record.forecast.branches.filter(b => b.status === 'AVAILABLE').map(b => b.predictedDirection))
  if (directions.size !== 1) return '当时方向不明确'
  const predicted = [...directions][0]
  const answer = record.outcomes[0]
  if (!answer || !predicted) return '等待官方净值'
  const correct = predicted === 'NON_UP' ? answer.actualDirection !== 'UP' : predicted === answer.actualDirection
  return correct ? '与实际方向一致' : '与实际方向不一致'
}
function availability(fund: Direction1dCoverage) {
  if (fund.status === 'READY_EXPERIMENTAL') return '可查看走势判断'
  if (fund.missingCount > 0) return '历史净值待补齐'
  if (['NAV_CURRENT_NOT_READY', 'NAV_LATEST_NOT_READY', 'DATA_PENDING', 'WAITING_DATA'].includes(fund.status)) return '等待所需净值'
  return '当前资料尚不足以给出走势判断'
}
onMounted(load)
onBeforeUnmount(() => { sequence++ })
function nextHistory() {
  cursors.value[historyPage.value] = history.value?.nextCursor
  historyPage.value++; void load()
}
function filterHistory() { historyPage.value = 1; cursors.value = [undefined]; void load() }
const percent = (value: number | null | undefined) => value == null ? '尚无有效结果' : `${(Number(value) * 100).toFixed(2)}%`
</script>

<template>
  <section
    class="d1-page"
    :aria-busy="busy"
  >
    <RouterLink :to="{ name: 'watchlist' }">
      ← 我的关注
    </RouterLink>
    <p class="eyebrow">
      一日走势与回看
    </p>
    <h1>提前预测，公布后核对</h1>
    <p class="lead">
      查看关注基金的走势判断和已公布结果。每天的判断按实际保存时间保留，尚未公布的结果不计对错。
    </p>
    <p
      v-if="error"
      role="alert"
      class="error"
    >
      {{ error }}
    </p>
    <section class="card">
      <h2>全部关注覆盖</h2>
      <p v-if="coverage">
        已检查 {{ coverage.checkedCount }} 只。每只保留结果，暂不适用和缺数据的基金也列在这里。
      </p>
      <form @submit.prevent="page = 1; load()">
        <label for="d1-search">基金代码或名称</label><input
          id="d1-search"
          v-model="keyword"
        ><button :disabled="busy">
          筛选
        </button>
      </form>
      <div class="table-wrap">
        <table>
          <thead><tr><th>基金</th><th>基金类型</th><th>资料状态</th><th>最近净值</th></tr></thead><tbody>
            <tr
              v-for="fund in coverage?.items"
              :key="fund.fundCode"
            >
              <td>
                <RouterLink :to="{ name: 'watchlist-fund-detail', params: { fundCode: fund.fundCode }, query: { section: 'research' } }">
                  {{ fund.fundName }}
                </RouterLink><small>{{ fund.fundCode }} · {{ fund.shareClass }}</small>
              </td>
              <td>
                {{ ({ CN_EQUITY: '境内股票', CN_MIXED: '境内混合', CN_BOND: '境内债券' })[fund.groupId ?? ''] ?? '暂未适配' }}
              </td>
              <td>
                {{ availability(fund) }}
              </td>
              <td>{{ fund.latestNavDate ?? '暂无净值' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">
        <button
          :disabled="busy || page === 1"
          @click="page--; load()"
        >
          上一页
        </button><span>第 {{ page }} 页 · {{ coverage?.totalCount ?? 0 }} 只</span><button
          :disabled="busy || page * 20 >= (coverage?.totalCount ?? 0)"
          @click="page++; load()"
        >
          下一页
        </button>
      </div>
    </section>
    <section class="card">
      <h2>历史判断与实际结果</h2><p>核对单位净值的涨跌；分红不加回，不能当作持有收益。旧记录中的“下跌或持平”保留当时含义。</p>
      <form @submit.prevent="filterHistory">
        <label>基金代码 <input
          v-model="historyFund"
          maxlength="6"
        ></label>
        <label>起始目标日 <input
          v-model="startDate"
          type="date"
        ></label>
        <label>结束目标日 <input
          v-model="endDate"
          type="date"
        ></label>
        <label>核对状态 <select v-model="assessment"><option value="">全部</option><option value="PENDING">待公布</option><option value="ASSESSED">已核对</option></select></label>

        <button :disabled="busy">
          筛选历史
        </button>
      </form>
      <p
        v-if="!history?.items.length"
        class="empty"
      >
        尚无本人真实提前留档。未来答案尚未公布时不会展示正确率。
      </p>
      <article
        v-for="record in history?.items"
        :key="record.forecastId"
        class="record"
      >
        <p
          v-if="record.status"
          role="alert"
        >
          这条历史判断的依据暂时无法核实，已停止展示和计入结果。
        </p>
        <template v-else>
          <h3>{{ record.forecast.fundName }} · 目标 {{ record.forecast.targetNavDate }}</h3>
          <p>资料截至 {{ record.forecast.baseNavDate }} · 判断时间 {{ direction1dTime(record.forecast.generatedAt) }}</p>
          <p><strong>{{ direction1dSummary(record.forecast).direction }}</strong> · {{ conclusion(record) }}</p>
          <p>{{ direction1dSummary(record.forecast).history }}</p>
          <RouterLink :to="{ name: 'watchlist-fund-detail', params: { fundCode: record.forecast.fundCode }, query: { section: 'prediction-history' } }">
            查看当时依据与相反证据
          </RouterLink>
          <p v-if="record.outcomes[0]">
            实际 {{ direction1dDirection(record.outcomes[0].actualDirection) }} · {{ record.outcomes[0].baseUnitNav }} → {{ record.outcomes[0].targetUnitNav }} · 变化 {{ percent(Number(record.outcomes[0].navReturn)) }}
          </p>
        </template>
      </article>
      <div class="pager">
        <button
          :disabled="busy || historyPage === 1"
          @click="historyPage--; load()"
        >
          上一页
        </button><span>第 {{ historyPage }} 页</span><button
          :disabled="busy || historyPage * 20 >= (history?.totalCount ?? 0)"
          @click="nextHistory"
        >
          下一页
        </button>
      </div>
    </section>
    <section class="card">
      <label>核对统计口径 <select
        v-model="labelBasis"
        :disabled="busy"
        @change="load"
      ><option value="FIRST_OBSERVED">首次核对（默认）</option><option value="LATEST_REVISION">最新修订（单独观察）</option></select></label>
      <label>判断时间 <select
        v-model="predictionBasis"
        @change="load"
      ><option value="LAST_VALID">截止前最后一次</option><option value="FIRST_VALID">首次判断</option></select></label>
      <h2>提前保存情况</h2>
      <p v-if="metrics">
        当前口径覆盖 {{ metrics.coverage.checked_fund_days }} 个基金目标日；其中 {{ metrics.coverage.verified_forecast_count }} 条满足提前保存条件，{{ metrics.coverage.missed_deadline_count }} 条错过截止。每只基金的实际结果见上方记录。
      </p>
      <p>同一基金、同一目标日只计一次；短期结果不能证明长期有效。</p>
    </section>
  </section>
</template>

<style scoped>
.d1-page { max-width: 1200px; margin: auto; padding: 24px; color: #24374b; }.eyebrow { margin-top: 28px; color: #836017; font-size: 13px; }h1 { font-size: 32px; margin: 12px 0; }.lead { color: #576a7f; line-height: 1.8; }
.summary,.card { padding: 24px; margin: 24px 0; border: 1px solid #dce4ec; border-radius: 14px; background: #fff; }.summary { display: flex; flex-wrap: wrap; gap: 20px 36px; background: #f2f7fb; }.summary p { margin: 8px 0; }.summary > p { width: 100%; }.counts { display: flex; gap: 10px; flex-wrap: wrap; }.counts span { padding: 7px 10px; background: #f0f4f8; border-radius: 6px; font-size: 13px; }
button,input { padding: 9px 12px; border: 1px solid #c2cdda; border-radius: 7px; background: white; }button { cursor: pointer; }button:disabled { opacity: .45; cursor: default; }form { display: flex; align-items: center; gap: 12px; margin: 20px 0; }input { min-width: 220px; }.table-wrap { overflow: auto; }table { border-collapse: collapse; width: 100%; }th,td { padding: 15px 10px; text-align: left; border-bottom: 1px solid #e4eaf0; }th { background: #f7f9fc; font-size: 13px; }small { display: block; color: #62758a; margin-top: 6px; }.pager { display: flex; align-items: center; gap: 18px; margin-top: 20px; }.record { border-top: 1px solid #dce4ec; padding: 16px 0; }.empty { padding: 28px; background: #f7f9fc; }.error { color: #ac2d36; }p { line-height: 1.7; }pre { white-space: pre-wrap; overflow-wrap: anywhere; }@media(max-width:650px) { .d1-page { padding: 12px; }.card,.summary { padding: 16px; }form { flex-wrap: wrap; }th,td { min-width: 130px; }h1 { font-size: 26px; } }
</style>

<style scoped>
form { flex-wrap: wrap; } select { padding: 9px; border: 1px solid #c2cdda; border-radius: 7px; background: white; } form input { min-width: 120px; max-width: 180px; }
</style>
