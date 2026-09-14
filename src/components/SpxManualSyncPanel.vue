<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { getSpxManualStatus, synchronizeSpxManually } from '@/api/spxManual'
import { useAuthStore } from '@/stores/auth'
import { useSpxManualSync } from '@/composables/useSpxManualSync'

const auth = useAuthStore()
const { status, last, loading, syncing, error, notice, running, cooldownSeconds, elapsedSeconds,
  canSync: serviceCanSync, refresh, synchronize } = useSpxManualSync({
  getStatus: getSpxManualStatus, synchronize: synchronizeSpxManually,
})
const canSync = computed(() => auth.hasPermission('SYNC_JOB_START') && serviceCanSync.value)
const succeeded = computed(() => !!last.value && ['ON_TIME', 'LATE', 'REFERENCE_ONLY'].includes(last.value.state))
const failed = computed(() => !!last.value && ['FAILED', 'INTERRUPTED'].includes(last.value.state))
const steps = ['检查数据源', '获取行情', '校验并保存']
const labels = { ON_TIME: '同步成功 · 8点前已保存', LATE: '同步成功 · 晚到资料', REFERENCE_ONLY: '同步成功 · 资料参考',
  INCOMPLETE: '数据尚未齐全', RUNNING: '正在同步', INTERRUPTED: '上次同步中断', FAILED: '同步失败', EXPIRED: '资料已过期' }
const formatTime = (value: string | null | undefined) => value
  ? new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value))
  : '暂无记录'
const percent = (value: number | null | undefined) => value == null ? '暂无数据' : `${value > 0 ? '+' : ''}${value.toFixed(4)}%`
onMounted(() => { void refresh() })
</script>

<template>
  <section
    class="sync-task-card"
    aria-labelledby="spx-manual-title"
    :aria-busy="running || syncing || loading"
  >
    <div class="sync-task-heading">
      <div>
        <p class="eyebrow">
          按需获取 · 一日模型研究资料
        </p>
        <h2 id="spx-manual-title">
          美国标普500（SPX）
        </h2>
        <p>获取标普500最近已收盘的日线行情，也可使用“一键同步全部”。当前用于研究记录，尚未接入在用的一日预测模型。</p>
      </div>
      <span class="sync-status">{{ running ? '正在同步' : last ? labels[last.state] : '尚无手动同步记录' }}</span>
    </div>
    <p class="sync-progress-note">
      点击后会自动显示进度与结果。这项操作只同步行情，不训练模型或生成基金预测。
    </p>
    <div class="sync-task-actions">
      <button
        v-if="auth.hasPermission('SYNC_JOB_START')"
        class="primary-button"
        type="button"
        :disabled="!canSync"
        @click="synchronize"
      >
        {{ running || syncing ? '正在同步标普500…' : cooldownSeconds ? `${cooldownSeconds}秒后可再次同步` : '手动同步标普500' }}
      </button>
      <button
        class="secondary-button"
        type="button"
        :disabled="loading"
        @click="refresh()"
      >
        {{ loading ? '正在读取…' : '刷新状态' }}
      </button>
    </div>
    <p
      v-if="notice"
      class="state-message warning-message"
      role="status"
    >
      {{ notice }}
    </p>
    <p
      v-if="error"
      class="state-message error-message"
      role="alert"
    >
      {{ error }}
    </p>
    <div
      v-if="running || last"
      class="spx-result"
      :class="{ 'is-success': succeeded && !running, 'is-error': failed && !running }"
      aria-live="polite"
      aria-atomic="true"
    >
      <strong>{{ running ? (last?.stageLabel ?? '等待服务受理') : succeeded ? '最近一次同步成功' : last ? labels[last.state] : '' }}</strong>
      <p v-if="running">
        已等待 {{ elapsedSeconds }} 秒，进度自动更新，请勿重复点击。
      </p>
      <p v-else-if="last">
        {{ last.message }}
      </p>
      <ol
        class="spx-steps"
        aria-label="同步阶段"
      >
        <li
          v-for="(step, index) in steps"
          :key="step"
          :class="{ done: index < (last?.completedSteps ?? 0), active: running && index === (last?.completedSteps ?? 0) }"
        >
          {{ index < (last?.completedSteps ?? 0) ? '✓' : index + 1 }} {{ step }}
        </li>
      </ol>
      <p
        v-if="last?.errorCode"
        class="spx-error-code"
      >
        原因编号：{{ last.errorCode }} · 记录：{{ last.attemptId }}
      </p>
      <p v-if="succeeded && !running">
        已保存 {{ last?.rowCount }} 条行情 · {{ formatTime(last?.persistedAt) }}
      </p>
    </div>
    <div
      v-if="status"
      class="spx-availability"
      aria-live="polite"
    >
      <p v-if="status.availability === 'COOLDOWN' && !running">
        {{ cooldownSeconds ? `防连点间隔：${cooldownSeconds}秒后可再次同步，按钮会自动恢复。` : '间隔已结束，正在确认可同步状态…' }}
      </p>
      <p v-else-if="!running">
        {{ status.message }}
      </p>
      <p>今日已尝试 {{ status.attemptsToday }} 次。无每日4次限制；每次只请求一次，失败不会自动重试。</p>
      <p
        v-if="status.errorCode"
        class="spx-error-code"
      >
        原因编号：{{ status.errorCode }}
      </p>
    </div>
    <dl
      v-if="last"
      class="sync-summary-grid"
    >
      <div><dt>美股行情日期</dt><dd>{{ last.latestUsDate ?? '暂无数据' }}（美国交易日）</dd></div>
      <div><dt>收盘点位</dt><dd>{{ last.close ?? '暂无数据' }}</dd></div>
      <div><dt>当日涨跌幅</dt><dd>{{ percent(last.dailyChangePct) }}</dd></div>
      <div><dt>一日研究目标日</dt><dd>{{ last.targetDate ?? '非交易日资料参考' }}</dd></div>
      <div><dt>隔夜累计变化</dt><dd>{{ percent(last.overnightChangePct) }}</dd></div>
      <div><dt>已取得行情</dt><dd>{{ last.rowCount }} 条</dd></div>
      <div><dt>开始同步（北京时间）</dt><dd>{{ formatTime(last.requestedAt) }}</dd></div>
      <div><dt>实际接收（北京时间）</dt><dd>{{ formatTime(last.receivedAt) }}</dd></div>
      <div><dt>保存完成（北京时间）</dt><dd>{{ formatTime(last.persistedAt) }}</dd></div>
    </dl>
    <p
      v-if="last?.missingUsDates.length"
      class="state-message warning-message"
    >
      尚缺美股日期：{{ last.missingUsDates.join('、') }}。缺失值不会补成0。
    </p>
    <p class="sync-progress-note">
      单独按钮与“一键同步全部”共用60秒间隔；同一时间只执行一次。服务关闭期间不会采集，重新启动也不会补造过去的获取时间。
    </p>
    <details class="spx-help">
      <summary>标普500、SPX和早上8点分别是什么意思？</summary>
      <p>标普500是反映美国约500家大型上市公司整体股价表现的指数；SPX是数据接口中标识这个指数的代码。</p>
      <p>采集它，是为了研究美国市场隔夜变化是否有助于判断下一交易日的基金涨跌。已有历史对照没有显示改善，所以目前没有接入预测；早上8点前同步也不会自动让它参与预测。</p>
      <p>8点是北京时间的研究取数截止，给8:30前完成预测留档留出处理时间。交易日8点前收到并保存，才算当天提前取得；8点及以后仍能同步，只记为晚到资料。非交易日仅作资料参考。</p>
    </details>
  </section>
</template>

<style scoped>
.spx-result { margin-top: 18px; padding: 18px; border: 1px solid #c6d9d5; border-radius: 10px; background: #f4f8f7; }
.spx-result.is-success { border-left: 4px solid #087f75; }
.spx-result.is-error { border-left: 4px solid #b42318; background: #fff5f3; }
.spx-result strong { font-size: 17px; }
.spx-result p, .spx-availability p { margin: 8px 0 0; }
.spx-steps { display: flex; flex-wrap: wrap; gap: 10px 24px; padding: 0; list-style: none; font-size: 13px; }
.spx-steps li { color: #62716e; }
.spx-steps li.done, .spx-steps li.active { color: #006b62; font-weight: 600; }
.spx-steps li.active { text-decoration: underline; text-underline-offset: 4px; }
.spx-error-code { overflow-wrap: anywhere; font-size: 12px; }
.spx-availability { margin: 14px 0; font-size: 13px; color: #526b66; }
.spx-help { margin-top: 18px; padding-top: 16px; border-top: 1px solid #dce7e4; }
.spx-help summary { cursor: pointer; color: #006b62; font-weight: 600; }
.spx-help p { line-height: 1.7; }
</style>
