import { onBeforeUnmount, onMounted } from 'vue'

/** 可见页面每分钟检查已发布版本；隐藏和卸载立即停止，刷新不调用供应商。 */
export function useManagerRefresh(refresh: () => Promise<void>): void {
  let timer: ReturnType<typeof setInterval> | undefined
  const reset = () => {
    if (timer !== undefined) clearInterval(timer)
    timer = undefined
    if (document.visibilityState === 'visible') timer = setInterval(() => { void refresh() }, 60_000)
  }
  onMounted(() => { reset(); document.addEventListener('visibilitychange', reset) })
  onBeforeUnmount(() => {
    if (timer !== undefined) clearInterval(timer)
    document.removeEventListener('visibilitychange', reset)
  })
}
