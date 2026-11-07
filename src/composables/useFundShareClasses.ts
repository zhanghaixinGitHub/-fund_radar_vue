import { ref, watch, type Ref } from 'vue'
import { getFundShareClasses } from '@/api/funds'
import type { FundShareClasses } from '@/types/fund'

/**
 * 按正在查看的代码读取后台份额关系；空代码表示当前页面不需要此资料。
 * 切换时清空旧数据，连续请求只接受最后一份响应，不把失败当成没有其他份额。
 */
export function useFundShareClasses(code: Ref<string>, fetchRelations = getFundShareClasses) {
  const relations = ref<FundShareClasses | null>(null)
  const loading = ref(false)
  const failed = ref(false)
  let sequence = 0
  watch(code, async current => {
    const ticket = ++sequence
    relations.value = null
    failed.value = false
    loading.value = Boolean(current)
    if (!current) return
    try {
      const result = await fetchRelations(current)
      if (ticket !== sequence) return
      if (result.fundCode !== current
          || (result.status !== 'UNVERIFIED' && !result.shares.some(s => s.fundCode === current))) {
        throw new Error('份额资料不完整')
      }
      relations.value = result
    } catch {
      if (ticket === sequence) failed.value = true
    } finally {
      if (ticket === sequence) loading.value = false
    }
  }, { immediate: true })
  return { relations, loading, failed }
}
