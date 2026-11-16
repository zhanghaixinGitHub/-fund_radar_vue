<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getFundManager } from '@/api/fundManagers'
import ManagerFundTable from '@/components/ManagerFundTable.vue'
import { usePageNavigation } from '@/composables/usePageNavigation'
import { useManagerRefresh } from '@/composables/useManagerRefresh'
import type { ManagerDetail } from '@/types/fundManager'
import { managerDate, managerRate } from '@/utils/fundManagerNavigation'

const route = useRoute()
const { section } = usePageNavigation()
const detail = ref<ManagerDetail | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const selectedTenure = ref('')
const phase = ref('tenure')
let request = 0
const currentFunds = computed(() => detail.value?.funds.filter(fund => fund.state === 'CURRENT') ?? [])
const historyFunds = computed(() => detail.value?.funds.filter(fund => fund.state === 'HISTORY') ?? [])
const selected = computed(() => detail.value?.funds.find(fund => fund.tenureVersionId === selectedTenure.value))
const selectedPerformance = computed(() => phase.value === 'solo' ? selected.value?.soloPerformance : selected.value?.performance)

async function load(quiet = false): Promise<void> {
  const current = ++request
  if (!quiet) { loading.value = true; detail.value = null }
  try {
    const value = await getFundManager(String(route.params.managerId))
    if (current !== request) return
    detail.value = value
    errorMessage.value = ''
    if (!value.funds.some(fund => fund.tenureVersionId === selectedTenure.value)) selectedTenure.value = value.funds[0]?.tenureVersionId ?? ''
  } catch (error) {
    if (current === request) errorMessage.value = error instanceof Error ? error.message : '基金经理资料暂不可用，请稍后重试。'
  } finally { if (current === request) loading.value = false }
}
watch(() => route.params.managerId, () => { void load() }, { immediate: true })
useManagerRefresh(() => load(true))
</script>

<template>
  <p
    v-if="loading"
    class="state-message"
    role="status"
  >
    正在读取经理资料…
  </p>
  <p
    v-if="errorMessage"
    class="state-message error-message"
    role="alert"
  >
    {{ errorMessage }} <button
      type="button"
      @click="load()"
    >
      重试
    </button>
  </p>
  <section
    v-if="detail"
    class="manager-panel"
    aria-labelledby="manager-detail-title"
  >
    <header class="manager-page-heading">
      <div>
        <p class="manager-eyebrow">
          基金经理
        </p><h1 id="manager-detail-title">
          {{ detail.managerName }}
        </h1>
      </div>
      <p>{{ detail.checkedAt ? `资料核对 ${managerDate(detail.checkedAt)}` : '任职资料待核对' }}</p>
    </header>
    <div class="manager-meta">
      <span>{{ detail.companies.join('、') || '关联公司暂缺' }}</span><span>学历：{{ detail.education || '暂缺' }}</span><span>已收录在管份额：{{ detail.shareCount ?? '待核对' }}</span>
    </div>
    <p class="manager-note">
      {{ detail.coverage.notice }}<span v-if="detail.stale"> 当前资料可能已有变化。</span>
    </p>
    <section
      v-if="section === 'funds'"
      class="manager-section"
      aria-labelledby="manager-funds-title"
    >
      <h2 id="manager-funds-title">
        在管基金
      </h2>
      <ManagerFundTable
        :funds="currentFunds"
        :manager-id="detail.managerId"
      />
    </section>
    <section
      v-else-if="section === 'history'"
      class="manager-section"
      aria-labelledby="manager-history-title"
    >
      <h2 id="manager-history-title">
        历史任职
      </h2><ManagerFundTable
        :funds="historyFunds"
        :manager-id="detail.managerId"
      />
    </section>
    <section
      v-else-if="section === 'profile'"
      class="manager-section"
      aria-labelledby="manager-profile-title"
    >
      <h2 id="manager-profile-title">
        职业履历
      </h2>
      <p
        v-if="detail.professionalResume"
        class="manager-resume"
      >
        {{ detail.professionalResume }}
      </p>
      <p
        v-else
        class="manager-empty"
      >
        暂缺可核对的完整职业履历。
      </p>
      <p class="manager-note">
        本基金任职时间不等于完整从业年限。
      </p>
    </section>
    <section
      v-else-if="section === 'performance'"
      class="manager-section"
      aria-labelledby="manager-performance-title"
    >
      <h2 id="manager-performance-title">
        任期表现
      </h2>
      <label class="manager-select">选择基金与任期<select v-model="selectedTenure"><option
        v-for="fund in detail.funds"
        :key="fund.tenureVersionId"
        :value="fund.tenureVersionId"
      >{{ fund.fundName }} · {{ fund.beginDate || '起始日期暂缺' }} 至 {{ fund.endDate || '今' }}</option></select></label>
      <label class="manager-select">查看阶段<select v-model="phase"><option value="tenure">完整任期</option><option value="solo">任期内最近独立管理阶段</option></select></label>
      <template v-if="selected">
        <p
          v-if="!selectedPerformance || selectedPerformance.status !== 'AVAILABLE'"
          class="manager-empty"
        >
          {{ selectedPerformance?.reason || '暂缺可核对的独立管理阶段表现。' }}
        </p>
        <template v-else>
          <dl class="manager-performance-facts">
            <div><dt>{{ phase === 'solo' ? '独立管理阶段回报' : '任期回报' }}</dt><dd>{{ managerRate(selectedPerformance.returnRate) }}</dd></div>
            <div><dt>最大回撤</dt><dd>{{ managerRate(selectedPerformance.maxDrawdownRate) }}</dd></div>
            <div v-if="selectedPerformance.annualizedRate !== null">
              <dt>年化回报</dt><dd>{{ managerRate(selectedPerformance.annualizedRate) }}</dd>
            </div>
          </dl>
          <p class="manager-note">
            计算区间：{{ selectedPerformance.startDate }} 至 {{ selectedPerformance.endDate }}。{{ selectedPerformance.includesCoManagement ? '任期包含共同管理，不能将全部业绩归于个人。' : '' }}基金净值表现不等于个人账户实际收益。
          </p>
        </template>
      </template>
    </section>
    <section
      v-else-if="section === 'disclosures'"
      class="manager-section"
      aria-labelledby="manager-disclosures-title"
    >
      <h2 id="manager-disclosures-title">
        相关披露
      </h2>
      <p
        v-if="!detail.disclosures.length"
        class="manager-empty"
      >
        暂未整理出可展示的相关披露。
      </p>
      <ul
        v-else
        class="manager-source-list"
      >
        <li
          v-for="source in detail.disclosures"
          :key="source.url"
        >
          <a
            :href="source.url"
            target="_blank"
            rel="noopener noreferrer"
          >{{ source.title }}</a><small>{{ source.publishedDate || '公开日期暂缺' }}</small>
        </li>
      </ul>
    </section>
  </section>
</template>

<style src="@/styles/fund-managers.css"></style>
