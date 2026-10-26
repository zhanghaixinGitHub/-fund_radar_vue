<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { ManagerFund } from '@/types/fundManager'
import { managerFundTarget, managerRate } from '@/utils/fundManagerNavigation'

const props = defineProps<{ funds: ManagerFund[]; managerId: string }>()
const route = useRoute()
const page = ref(1)
const pageSize = 20
const totalPages = computed(() => Math.ceil(props.funds.length / pageSize))
const visible = computed(() => props.funds.slice((page.value - 1) * pageSize, page.value * pageSize))
watch(() => props.funds, () => { page.value = 1 })
</script>

<template>
  <p
    v-if="!funds.length"
    class="manager-empty"
  >
    暂无已核实的相关任职记录。
  </p>
  <template v-else>
    <div class="manager-table-scroll">
      <table class="manager-table">
        <thead><tr><th>基金 / 份额代码</th><th>任职区间</th><th>管理情况</th><th>任期回报</th></tr></thead>
        <tbody>
          <tr
            v-for="fund in visible"
            :key="fund.tenureVersionId"
          >
            <td>
              <RouterLink :to="managerFundTarget(managerId, fund, route.fullPath)">
                {{ fund.fundName }}
              </RouterLink>
              <small>{{ fund.fundCode }}</small>
            </td>
            <td>{{ fund.beginDate || '起始日期暂缺' }} 至 {{ fund.endDate || '今' }}</td>
            <td>{{ fund.teamStatus === 'CO_MANAGED' ? '含共同管理' : fund.teamStatus === 'SOLO' ? '独立管理' : '共管资料待核对' }}</td>
            <td>
              <template v-if="fund.performance.status === 'AVAILABLE'">
                <strong>{{ managerRate(fund.performance.returnRate) }}</strong>
                <small>{{ fund.performance.startDate }} 至 {{ fund.performance.endDate }}</small>
              </template>
              <template v-else>
                暂缺<small>{{ fund.performance.reason }}</small>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <nav
      v-if="totalPages > 1"
      class="manager-pagination"
      aria-label="基金列表分页"
    >
      <button
        type="button"
        :disabled="page <= 1"
        @click="page--"
      >
        上一页
      </button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button
        type="button"
        :disabled="page >= totalPages"
        @click="page++"
      >
        下一页
      </button>
    </nav>
  </template>
</template>
