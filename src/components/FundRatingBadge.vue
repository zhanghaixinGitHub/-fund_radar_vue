<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { RatingSummary } from '@/api/fundRating'
import { ratingLabel } from '@/utils/fundRating'

const props = defineProps<{ value?: RatingSummary; loading: boolean; fundName: string; to: RouteLocationRaw }>()
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
const label = computed(() => ratingLabel(props.value, props.loading, now.value))
</script>

<template>
  <RouterLink
    class="rating-badge"
    :to="to"
    :aria-label="`${fundName}，基金评级：${label}，查看依据`"
  >
    <span>基金评级</span><strong>{{ label }}</strong>
  </RouterLink>
</template>

<style scoped>
.rating-badge { display: flex; align-items: center; gap: 8px; padding: 12px 16px; color: var(--text-secondary, #53616b); text-decoration: none; font-size: 13px; }
.rating-badge strong { padding: 3px 9px; border-radius: 8px; background: #edf0f8; color: #3e4c78; font-weight: 600; }
.rating-badge:hover strong { background: #e1e6f4; }
.rating-badge:focus-visible { outline: 2px solid #536ba5; outline-offset: -3px; border-radius: 8px; }
</style>
