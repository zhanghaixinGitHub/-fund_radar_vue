<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getManagerRelatedFund } from '@/api/fundManagers'
import { useManagerRefresh } from '@/composables/useManagerRefresh'
import type { ManagerRelatedDetail } from '@/types/fundManager'
import { managerDate } from '@/utils/fundManagerNavigation'

const route = useRoute()
const value = ref<ManagerRelatedDetail | null>(null)
const errorMessage = ref('')
let sequence = 0
async function load(): Promise<void> {
  const current = ++sequence
  try {
    const result = await getManagerRelatedFund(String(route.params.managerId), String(route.params.relatedFundId))
    if (current === sequence) { value.value = result; errorMessage.value = '' }
  } catch (error) { if (current === sequence) errorMessage.value = error instanceof Error ? error.message : '基金资料暂不可用。' }
}
watch(() => `${route.params.managerId}/${route.params.relatedFundId}`, () => { value.value = null; void load() }, { immediate: true })
useManagerRefresh(load)
</script>

<template>
  <p
    v-if="errorMessage"
    class="state-message error-message"
    role="alert"
  >
    {{ errorMessage }}
  </p>
  <section
    v-if="value"
    class="manager-panel"
  >
    <header class="manager-page-heading">
      <div>
        <p class="manager-eyebrow">
          关联基金资料 · {{ value.fund.fundCode }}
        </p><h1>{{ value.fund.fundName }}</h1>
      </div>
    </header>
    <dl class="manager-basic-facts">
      <div><dt>管理公司</dt><dd>{{ value.fund.companyName || '暂缺' }}</dd></div><div>
        <dt>相关经理</dt><dd>
          <RouterLink :to="{ name: 'fund-manager-detail', params: { managerId: value.manager.managerId } }">
            {{ value.manager.managerName }}
          </RouterLink>
        </dd>
      </div><div><dt>资料核对</dt><dd>{{ managerDate(value.manager.checkedAt) }}</dd></div>
    </dl>
    <h2>任职记录</h2><p
      v-for="tenure in value.tenures"
      :key="tenure.tenureVersionId"
    >
      {{ tenure.beginDate || '起始日期暂缺' }} 至 {{ tenure.endDate || '今' }}
    </p>
    <p class="manager-note">
      该份额尚未收录完整净值资料。这里只展示已核实的基础资料与经理任职记录。
    </p>
  </section>
  <p
    v-else-if="!errorMessage"
    class="state-message"
    role="status"
  >
    正在读取基金资料…
  </p>
</template>

<style src="@/styles/fund-managers.css"></style>
