<script setup lang="ts" generic="T extends FundListRow">
import { useRoute, useRouter } from 'vue-router'
import { ref, watch } from 'vue'
import { getSimOverview } from '@/api/simulation'
import type { FundType } from '@/types/fund'
import { changeRateTone, formatChangeRate, fundTypeLabel, fundStatusLabel, shouldDisplayFundStatus } from '@/utils/fundPresentation'

interface FundListRow {
  fundCode: string
  fundName: string
  fundType: FundType
  dayChangeRate: string | number | null
  weekChangeRate: string | number | null
  monthChangeRate: string | number | null
  asOfDate: string | null
  status?: string
  isWatched?: boolean
}
const props = defineProps<{ items: T[]; watched?: boolean; label: string }>()
const emit = defineEmits<{ quick: [code: string] }>()
defineSlots<{
  rating?: (props: { fund: T }) => unknown
  actions?: (props: { fund: T }) => unknown
}>()
const route = useRoute()
const router = useRouter()
const heldFundCodes = ref<Set<string>>(new Set())
let holdingsRequest = 0
// 每次列表刷新时批量读取本人模拟账户，不逐行查询，也不使用历史确认名单。
watch(() => props.items, async () => {
  const request = ++holdingsRequest
  heldFundCodes.value = new Set()
  try {
    const overview = await getSimOverview()
    if (request !== holdingsRequest) return
    heldFundCodes.value = new Set(
      overview.positions.filter(position => Number(position.shares) > 0).map(position => position.fundCode),
    )
  } catch {
    // 无法确认持仓时不显示标签，避免将未知状态当作已持仓。
  }
}, { immediate: true })
function detailTarget(fund: T) {
  return { name: props.watched ? 'watchlist-fund-detail' : 'fund-detail', params: { fundCode: fund.fundCode }, query: { from: route.fullPath } }
}
function openRow(fund: T, event: globalThis.MouseEvent) {
  const target = event.target as globalThis.Element
  if (target.closest('a, button, input, select, textarea, summary, dialog') || globalThis.getSelection()?.toString()) return
  void router.push(detailTarget(fund))
}
</script>

<template>
  <div
    class="fund-table-scroll"
    role="region"
    :aria-label="`${label}，宽表可左右滚动`"
    tabindex="0"
  >
    <table class="fund-data-table">
      <caption class="visually-hidden">
        {{ label }}；涨跌为单位净值变化，不含分红和买卖费用。
      </caption>
      <thead>
        <tr>
          <th
            scope="col"
            class="fund-table-name"
          >
            基金名称 / 代码
          </th>
          <th scope="col" class="fund-table-type">
            类型
          </th>
          <th
            scope="col"
            class="fund-table-number"
          >
            最新净值日涨跌
          </th>
          <th
            scope="col"
            class="fund-table-number"
          >
            近一周
          </th>
          <th
            scope="col"
            class="fund-table-number"
          >
            近一月
          </th>
          <th scope="col" class="fund-table-date-heading">
            资料截至
          </th>
          <th
            v-if="$slots.rating"
            scope="col"
            class="fund-table-rating-heading"
          >
            基金评级
          </th>
          <th
            scope="col"
            class="fund-table-actions-heading"
          >
            操作
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="fund in props.items"
          :key="fund.fundCode"
          @click="openRow(fund, $event)"
        >
          <th
            scope="row"
            class="fund-table-identity"
          >
            <RouterLink :to="detailTarget(fund)">
              <span class="fund-table-title" :title="fund.fundName">{{ fund.fundName }}</span>
              <span class="fund-table-code">{{ fund.fundCode }}</span>
            </RouterLink>
            <span
              v-if="fund.isWatched || heldFundCodes.has(fund.fundCode) || (fund.status && shouldDisplayFundStatus(fund.status))"
              class="fund-table-tags"
            >
              <span v-if="fund.status && shouldDisplayFundStatus(fund.status)">{{ fundStatusLabel(fund.status) }}</span>
              <span v-if="fund.isWatched">已关注</span>
              <span v-if="heldFundCodes.has(fund.fundCode)">已持仓</span>
            </span>
          </th>
          <td>{{ fundTypeLabel(fund.fundType) }}</td>
          <td :class="['fund-table-number', 'change-rate', changeRateTone(fund.dayChangeRate)]">
            {{ formatChangeRate(fund.dayChangeRate) }}
          </td>
          <td :class="['fund-table-number', 'change-rate', changeRateTone(fund.weekChangeRate)]">
            {{ formatChangeRate(fund.weekChangeRate) }}
          </td>
          <td :class="['fund-table-number', 'change-rate', changeRateTone(fund.monthChangeRate)]">
            {{ formatChangeRate(fund.monthChangeRate) }}
          </td>
          <td class="fund-table-date">
            {{ fund.asOfDate || '尚无合规净值同步' }}
          </td>
          <td v-if="$slots.rating">
            <slot
              name="rating"
              :fund="fund"
            />
          </td>
          <td class="fund-table-actions">
            <button
              class="fund-table-quick"
              type="button"
              :aria-label="`快速查看${fund.fundName}`"
              @click="emit('quick', fund.fundCode)"
            >
              快速查看
            </button>
            <slot
              name="actions"
              :fund="fund"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
