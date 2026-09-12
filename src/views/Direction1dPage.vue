<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getDirection1dCoverage, getDirection1dHistory, getDirection1dMetrics, getDirection1dStatus, setDirection1dSubscription } from '@/api/direction1d'
import type { Direction1dCoverage, Direction1dPage, Direction1dRecord, Direction1dStatus, Direction1dCursor } from '@/types/direction1d'
import { assertDirection1dForecast, direction1dDirection, direction1dReason, direction1dTime } from '@/utils/direction1d'

const status = ref<Direction1dStatus | null>(null)
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
const stratum = ref('ASSET_GROUP')
let sequence = 0
const keyword = ref('')
const busy = ref(false)
const error = ref('')
async function load() {
  const request = ++sequence
  busy.value = true
  error.value = ''
  try {
    const [s, c, h, m] = await Promise.all([getDirection1dStatus(), getDirection1dCoverage(page.value, keyword.value), getDirection1dHistory(historyPage.value, historyFund.value, cursors.value[historyPage.value - 1], { assessment: assessment.value, branch: historyBranch.value, startDate: startDate.value, endDate: endDate.value }), getDirection1dMetrics(labelBasis.value)])
    h.items.forEach(r => { if (!r.status) assertDirection1dForecast(r.forecast) })
    if (request !== sequence) return
    status.value = s; coverage.value = c; history.value = h; metrics.value = m
  } catch (e) { if (request === sequence) error.value = e instanceof Error ? e.message : '读取失败。' }
  finally { if (request === sequence) busy.value = false }
}
async function toggle() {
  if (!status.value) return
  busy.value = true
  try { await setDirection1dSubscription(!status.value.enabled); await load() }
  catch (e) { error.value = e instanceof Error ? e.message : '设置失败。' }
  finally { busy.value = false }
}
function conclusion(record: Direction1dRecord, direction: string | null) {
  if (record.receiptStatus !== 'VERIFIED') return '未满足提前留档条件'
  const answer = record.outcomes[0]
  if (!answer || !direction) return '待到期 / 待公布'
  return (direction === 'UP') === (answer.y === 1) ? '正确' : '错误'
}
onMounted(load)
onBeforeUnmount(() => { sequence++ })
function nextHistory() {
  cursors.value[historyPage.value] = history.value?.nextCursor
  historyPage.value++; void load()
}
function filterHistory() { historyPage.value = 1; cursors.value = [undefined]; void load() }
const percent = (value: number | null | undefined) => value == null ? '尚无有效结果' : `${(Number(value) * 100).toFixed(2)}%`
const branchName = (value: string) => ({ FIXED: '固定模型', WEEKLY: '每周模型', ALWAYS_UP: '恒上涨', ALWAYS_NON_UP: '恒非上涨', INITIAL_MAJORITY: '初始多数类', MOMENTUM: '昨日方向延续' })[value] ?? value
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
      独立一交易日实验 · 未正式发布
    </p>
    <h1>提前预测，公布后核对</h1>
    <p class="lead">
      保留每次真实预测原文，分别观察固定模型与每周更新模型。历史训练成绩不计入这里。
    </p>
    <p
      v-if="error"
      role="alert"
      class="error"
    >
      {{ error }}
    </p>
    <section
      v-if="status"
      class="summary"
    >
      <div><strong>每日实验{{ status.enabled ? '已启用' : '已暂停' }}</strong><p>关闭网页后由本地服务继续；电脑或服务离线时不会补造预测。</p></div>
      <button
        :disabled="busy || !status.backendEnabled"
        @click="toggle"
      >
        {{ status.enabled ? '暂停新预测' : '启用每日实验' }}
      </button>
      <div>本期预测目标 <strong>{{ status.python.window.targetNavDate }}</strong><p>留档截止 {{ direction1dTime(status.python.window.deadlineAt) }}；是否已生成请看下方真实留档。</p></div>
      <div>下一期开始 <strong>{{ direction1dTime(status.python.window.nextWindowOpenAt) }}</strong><p>本期截止前，已训练并登记的模型即可生成预测；生成后保留原文。</p></div>
      <p>{{ status.python.trainingPolicyNote }}</p>
      <p
        v-for="(job, index) in status.python.recentJobs.filter(j => j.kind === 'TRAINING')"
        :key="`training:${index}`"
      >
        最近周更新：{{ direction1dReason(job.state) }} · {{ direction1dReason(job.reason ?? '') }}
      </p>
      <p
        v-for="(health, index) in status.health"
        :key="index"
      >
        后台：{{ direction1dReason(health.state) }} · {{ direction1dTime(health.finished_at) }} · {{ health.message }}
      </p>
    </section>
    <section class="card">
      <h2>全部关注覆盖</h2>
      <p v-if="coverage">
        已检查 {{ coverage.checkedCount }} 只。每只保留结果，暂不适用和缺数据的基金也列在这里。
      </p>
      <div
        v-if="coverage"
        class="counts"
      >
        <span
          v-for="(count, key) in coverage.statusCounts"
          :key="key"
        >{{ direction1dReason(key) }} {{ count }}</span>
      </div>
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
          <thead><tr><th>基金</th><th>资产组</th><th>覆盖结果</th><th>最近净值 / 缺口</th></tr></thead><tbody>
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
                {{ ({ CN_EQUITY: '境内股票', CN_MIXED: '境内混合', CN_BOND: '境内债券' })[fund.groupId ?? ''] ?? '待独立方案' }}<details v-if="fund.groupEvidence">
                  <summary>分组依据</summary><small>{{ fund.groupEvidence.benchmark ?? '来源未提供可核验基准' }}；采用当前公开档案，不证明历年分类均相同。</small>
                </details>
              </td>
              <td>
                {{ direction1dReason(fund.status) }}<small
                  v-for="reason in fund.reasonCodes.filter(r => r !== fund.status)"
                  :key="reason"
                >{{ direction1dReason(reason) }}</small>
              </td>
              <td>{{ fund.latestNavDate ?? '暂无净值' }}<small>完整历史 {{ fund.historyCount }} 条 · 61日窗口缺 {{ fund.missingCount }} 条</small></td>
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
      <h2>真实留档与核对</h2><p>单位净值变化 = 目标净值 ÷ 冻结基准净值 − 1；分红不加回，持平归为非上涨。</p>
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
        <label>预测分支 <select v-model="historyBranch"><option value="">全部</option><option value="FIXED">固定模型</option><option value="WEEKLY">每周模型</option></select></label>
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
          {{ direction1dReason(record.status) }}，已停止展示和计分。记录编号 {{ record.forecastId }}
        </p>
        <template v-else>
          <h3>{{ record.forecast.fundName }} · 目标 {{ record.forecast.targetNavDate }}</h3>
          <p>基准 {{ record.forecast.baseNavDate }} · 生成 {{ direction1dTime(record.forecast.generatedAt) }} · 留档确认 {{ direction1dTime(record.receiptVerifiedAt) }}</p>
          <p
            v-for="branch in record.forecast.branches"
            :key="branch.branchId"
          >
            {{ branch.branchId }}：{{ direction1dDirection(branch.predictedDirection) }} · {{ conclusion(record, branch.predictedDirection) }}
          </p>
          <p v-if="record.outcomes[0]">
            实际 {{ direction1dDirection(record.outcomes[0].actualDirection) }} · {{ record.outcomes[0].baseUnitNav }} → {{ record.outcomes[0].targetUnitNav }} · 变化 {{ record.outcomes[0].navReturn }}
          </p>
          <details>
            <summary>原始证据、模型与后续修订</summary><p>输入摘要 {{ record.forecast.inputHash }} · 输入时间 {{ direction1dTime(record.forecast.input.featureAsOf) }}</p><p
              v-for="branch in record.forecast.branches"
              :key="branch.branchId"
            >
              {{ branch.branchId }} · 模型 {{ branch.modelId }} · 模型分数 {{ branch.score }}（尚未校准）
            </p><pre>{{ record.outcomes }}</pre>
          </details>
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
      <h2>真实观察统计</h2><p v-if="!metrics?.branches.length">
        尚无已核对记录。
      </p><p
        v-for="metric in metrics?.branches"
        :key="metric.branch_id"
      >
        {{ branchName(metric.branch_id) }}：对 {{ metric.correct_count }} / 已核对 {{ metric.assessed_count }} 题 · 待核对 {{ metric.pending_count }} 题 · {{ metric.distinct_target_dates }} 个不同目标日 · 正确率 {{ percent(metric.accuracy) }} · 两类均衡正确率 {{ percent(metric.balanced_accuracy) }} · 家族日期加权 {{ percent(metric.family_date_weighted_accuracy) }} · 持平 {{ metric.flat_count }} 题
      </p><p>{{ metrics?.observationNote }}</p><p>数据和时间不合格的记录不计对错；不会因短期错误自动追加调参。</p>
      <template v-if="metrics">
        <p>检查 {{ metrics.coverage.checked_fund_days }} 个基金目标日，其中适用 {{ metrics.coverage.applicable_fund_days }} 个，提前留档 {{ metrics.coverage.verified_forecast_count }} 个。留档覆盖率 {{ percent(metrics.coverage.applicable_fund_days ? metrics.coverage.verified_forecast_count / metrics.coverage.applicable_fund_days : null) }}；错过截止 {{ metrics.coverage.missed_deadline_count }}，执行失败 {{ metrics.coverage.failed_count }}。</p>
        <p>两模型共同留档 {{ metrics.paired.paired_count }} 题，共同核对 {{ metrics.paired.assessed_pair_count }} 题；每周模型比固定模型多答对 {{ metrics.paired.weekly_extra_correct ?? '待核对' }} 题。仅固定可用 {{ metrics.paired.fixed_only_count }}，仅每周可用 {{ metrics.paired.weekly_only_count }}。</p>
        <details>
          <summary>按基金、资产组、月份、模型和事件查看</summary>
          <label>分层 <select v-model="stratum"><option value="ASSET_GROUP">资产组</option><option value="FUND">基金</option><option value="MONTH">目标月份</option><option value="MODEL">模型版本</option><option value="EVENT">事件状态</option></select></label>
          <div class="table-wrap">
            <table>
              <thead><tr><th>分层</th><th>预测分支</th><th>正确 / 核对</th><th>目标日数</th><th>正确率</th><th>上涨 / 非上涨识别率</th></tr></thead><tbody>
                <tr
                  v-for="row in metrics.strata.filter(r => r.kind === stratum)"
                  :key="`${row.kind}:${row.key}:${row.branch_id}`"
                >
                  <td>{{ direction1dReason(row.key) }}</td><td>{{ branchName(row.branch_id) }}</td><td>{{ row.correct_count }} / {{ row.assessed_count }}</td><td>{{ row.distinct_target_dates }}</td><td>{{ percent(row.accuracy) }}</td><td>{{ percent(row.up_recall) }} / {{ percent(row.non_up_recall) }}</td>
                </tr>
              </tbody>
            </table>
          </div><p v-if="metrics.strataTruncated">
            分层数量超过本次显示上限，请缩小统计日期范围后查询。
          </p>
        </details>
      </template>
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
