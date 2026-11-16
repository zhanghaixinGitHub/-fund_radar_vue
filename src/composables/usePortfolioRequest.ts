import { onBeforeUnmount, ref, shallowRef } from 'vue'

/** 各区域独立加载、限时和取消；刷新失败保留原值，卸载后不回填。 */
export function usePortfolioRequest<T>(read: (signal: AbortSignal) => Promise<T>, initial: T, failure: string, timeoutMs = 12_000) {
  const data = shallowRef<T>(initial)
  const loading = ref(false)
  const error = ref('')
  const ready = ref(false)
  let alive = true
  let pending: Promise<boolean> | undefined
  let controller: AbortController | undefined

  function load(): Promise<boolean> {
    if (!alive) return Promise.resolve(false)
    if (pending) return pending
    loading.value = true
    error.value = ''
    const request = new AbortController()
    controller = request
    const timer = globalThis.setTimeout(() => request.abort(), timeoutMs)
    // 与取消信号竞速，连未响应取消的读取器也不能让页面一直等待。
    const aborted = new Promise<never>((_, reject) => {
      request.signal.addEventListener('abort', () => reject(new Error('REQUEST_ABORTED')), { once: true })
    })
    pending = Promise.race([Promise.resolve().then(() => read(request.signal)), aborted])
      .then(value => {
        if (!alive) return false
        data.value = value
        ready.value = true
        return true
      })
      .catch(() => {
        if (alive) error.value = failure
        return false
      })
      .finally(() => {
        globalThis.clearTimeout(timer)
        pending = undefined
        if (alive) loading.value = false
      })
    return pending
  }

  onBeforeUnmount(() => { alive = false; controller?.abort() })
  return { data, loading, error, ready, load }
}
