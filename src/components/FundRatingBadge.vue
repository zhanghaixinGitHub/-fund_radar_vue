<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { RatingSummary } from '@/api/fundRating'
import { ratingLabel } from '@/utils/fundRating'

/** 列表评级只负责展示；整行的详情跳转由父级链接统一承接，避免出现第二个点击入口。 */
const props = defineProps<{ value?: RatingSummary | null }>()
const now = ref(Date.now())
let timer: ReturnType<typeof globalThis.setTimeout> | undefined
/** 超过浏览器单次定时上限时继续安排下一段；长期打开也不能保留过期等级。 */
function refreshExpiry() {
  globalThis.clearTimeout(timer)
  now.value = Date.now()
  const expiry = props.value?.validUntil
  const delay = expiry ? Date.parse(expiry) - now.value : 0
  if (delay > 0) timer = globalThis.setTimeout(refreshExpiry, Math.min(delay + 1, 2_147_483_647))
}
watch(() => props.value?.validUntil, refreshExpiry, { immediate: true })
onBeforeUnmount(() => globalThis.clearTimeout(timer))
// 列表响应已带回评级；这里只展示结果，并继续在页面停留期间检查有效期。
const label = computed(() => ratingLabel(props.value, false, now.value))
</script>

<template>
  <span class="rating-badge">
    <span>基金评级</span><strong>{{ label }}</strong>
  </span>
</template>

<style scoped>
.rating-badge { display: flex; align-items: center; gap: 8px; color: var(--text-secondary, #53616b); font-size: 13px; }
.rating-badge strong { padding: 3px 9px; border-radius: 8px; background: #edf0f8; color: #3e4c78; font-weight: 600; }
</style>
