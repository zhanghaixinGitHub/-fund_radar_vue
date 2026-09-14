import { computed, onScopeDispose, ref } from 'vue'
import type { SpxManualStatus } from '../types/spxManual'

interface SyncApi {
  getStatus: () => Promise<SpxManualStatus>
  synchronize: () => Promise<SpxManualStatus>
}

/** 单次POST触发采集；定时器只GET进度，间隔结束后自动核验服务端是否允许再次同步。 */
export function useSpxManualSync(api: SyncApi, tickMs = 1000) {
  const status = ref<SpxManualStatus | null>(null)
  const loading = ref(false)
  const syncing = ref(false)
  const error = ref('')
  const notice = ref('')
  const stateReady = ref(false)
  const localTime = ref(Date.now())
  const serverOffset = ref(0)
  const previousAttemptId = ref<string | null>(null)
  const clickedAt = ref<number | null>(null)
  let disposed = false
  let reading = false
  let revision = 0

  const serverNow = computed(() => localTime.value + serverOffset.value)
  const last = computed(() => {
    const attempt = status.value?.lastAttempt
    // 新请求尚未写入预约时，不能把上一次的成功卡片显示为本次结果。
    return syncing.value && attempt?.attemptId === previousAttemptId.value ? null : attempt
  })
  const running = computed(() => last.value?.state === 'RUNNING'
    || (syncing.value && !last.value) || status.value?.availability === 'RUNNING')
  const cooldownSeconds = computed(() => status.value?.availability === 'COOLDOWN' && status.value.nextAllowedAt
    ? Math.max(0, Math.ceil((Date.parse(status.value.nextAllowedAt) - serverNow.value) / 1000)) : 0)
  const elapsedSeconds = computed(() => Math.max(0, Math.floor((serverNow.value
    - (last.value ? Date.parse(last.value.requestedAt) : clickedAt.value ?? serverNow.value)) / 1000)))
  const canSync = computed(() => stateReady.value && status.value?.canSync
    && !loading.value && !syncing.value && !running.value)

  function receive(value: SpxManualStatus) {
    status.value = value
    serverOffset.value = Date.parse(value.serverTime) - Date.now()
    localTime.value = Date.now()
    stateReady.value = true
  }

  async function refresh(quiet = false) {
    if (disposed || reading) return
    reading = true
    const expectedRevision = revision
    if (!quiet) { loading.value = true; error.value = '' }
    try {
      const value = await api.getStatus()
      if (!disposed && revision === expectedRevision) { receive(value); error.value = '' }
    } catch (cause) {
      if (!disposed && revision === expectedRevision) {
        stateReady.value = false
        error.value = `无法读取同步状态：${cause instanceof Error ? cause.message : '请检查服务连接。'} 刷新状态只查询结果，不会再次采集。`
      }
    } finally {
      reading = false
      if (!disposed) loading.value = false
    }
  }

  async function synchronize() {
    if (!canSync.value) return
    revision++
    previousAttemptId.value = status.value?.lastAttempt?.attemptId ?? null
    clickedAt.value = serverNow.value
    syncing.value = true
    error.value = ''
    notice.value = ''
    try {
      const value = await api.synchronize()
      revision++ // 丢弃比POST结果更早开始的GET，防止完成状态被旧进度覆盖。
      if (!disposed) {
        receive(value)
        error.value = ''
        if (!value.performedNow) notice.value = `未发起新的同步：${value.message} 下方保留最近一次记录。`
      }
    } catch (cause) {
      revision++
      if (!disposed) {
        stateReady.value = false
        error.value = `未能确认本次同步结果：${cause instanceof Error ? cause.message : '连接中断。'} 请刷新状态查看是否已保存。`
      }
    } finally { if (!disposed) syncing.value = false }
  }

  const timer = setInterval(() => {
    localTime.value = Date.now()
    // 已发现的运行任务继续查询；GET失败后等用户刷新，避免无休止报错。
    if (stateReady.value && (running.value || (status.value?.availability === 'COOLDOWN' && !cooldownSeconds.value))) {
      void refresh(true)
    }
  }, tickMs)
  onScopeDispose(() => { disposed = true; clearInterval(timer) })
  return { status, last, loading, syncing, error, notice, stateReady, running, cooldownSeconds, elapsedSeconds, canSync, refresh, synchronize }
}
