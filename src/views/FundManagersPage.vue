<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { getFundManagers } from '@/api/fundManagers'
import type { ManagerPage } from '@/types/fundManager'
import { useManagerRefresh } from '@/composables/useManagerRefresh'
import { managerDate } from '@/utils/fundManagerNavigation'

const route = useRoute()
const router = useRouter()
const keyword = ref('')
const company = ref('')
const state = ref('all')
const fundType = ref('')
const result = ref<ManagerPage | null>(null)
const loading = ref(false)
const errorMessage = ref('')
let request = 0

async function load(quiet = false): Promise<void> {
  const current = ++request
  if (!quiet) loading.value = true
  errorMessage.value = ''
  try {
    const value = await getFundManagers({ keyword: String(route.query.keyword ?? ''), company: String(route.query.company ?? ''),
      state: String(route.query.state ?? 'all'), fundType: String(route.query.fundType ?? ''),
      page: Math.max(1, Number(route.query.page) || 1), pageSize: 20,
      snapshotId: !quiet && route.query.snapshotId ? String(route.query.snapshotId) : undefined })
    if (current === request) result.value = value
  } catch (error) {
    if (current === request) errorMessage.value = error instanceof Error ? error.message : '基金经理资料暂不可用，请稍后重试。'
  } finally { if (current === request) loading.value = false }
}
async function search(): Promise<void> {
  await router.push({ name: 'fund-managers', query: {
    ...(keyword.value.trim() ? { keyword: keyword.value.trim() } : {}),
    ...(company.value.trim() ? { company: company.value.trim() } : {}), ...(state.value !== 'all' ? { state: state.value } : {}),
    ...(fundType.value ? { fundType: fundType.value } : {}),
  } })
}
async function changePage(page: number): Promise<void> {
  await router.push({ query: { ...route.query, page: String(page), snapshotId: result.value?.snapshotId ?? undefined } })
}
watch(() => route.fullPath, () => {
  keyword.value = String(route.query.keyword ?? '')
  company.value = String(route.query.company ?? '')
  state.value = String(route.query.state ?? 'all')
  fundType.value = String(route.query.fundType ?? '')
  void load()
}, { immediate: true })
useManagerRefresh(() => load(true))
</script>

<template>
  <section
    class="manager-panel"
    aria-labelledby="manager-directory-title"
  >
    <header class="manager-page-heading">
      <div>
        <p class="manager-eyebrow">
          基金经理
        </p><h1 id="manager-directory-title">
          查找基金经理
        </h1>
      </div>
      <p>了解任职经历与管理的基金</p>
    </header>
    <form
      class="manager-search"
      @submit.prevent="search"
    >
      <label>经理姓名<input
        v-model="keyword"
        maxlength="128"
        placeholder="输入姓名"
      ></label>
      <label>基金公司<input
        v-model="company"
        maxlength="128"
        placeholder="输入基金公司"
      ></label>
      <label>任职范围<select
        v-model="state"
        aria-label="任职范围"
      ><option value="all">含历史任职</option><option value="current">有在管基金</option><option value="history">有离任记录</option></select></label>
      <label>基金类型<select
        v-model="fundType"
        aria-label="基金类型"
      ><option value="">全部类型</option><option value="STOCK">股票型</option><option value="MIXED">混合型</option><option value="BOND">债券型</option><option value="INDEX">指数型</option><option value="MONEY">货币型</option><option value="QDII">QDII</option><option value="FOF">FOF</option><option value="OTHER">其他</option></select></label>
      <button
        type="submit"
        :disabled="loading"
      >
        查找
      </button>
    </form>
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
    <p
      v-if="loading && !result"
      class="manager-empty"
      role="status"
    >
      正在读取经理资料…
    </p>
    <template v-if="result">
      <p class="manager-note">
        {{ result.notice }}<span v-if="result.stale"> 当前显示上次保存的资料。</span>
      </p>
      <p
        v-if="!result.items.length"
        class="manager-empty"
      >
        暂未收录相关经理，可调整姓名或基金公司查询。
      </p>
      <div
        v-else
        class="manager-table-scroll"
        :aria-busy="loading"
      >
        <table class="manager-table">
          <thead><tr><th>姓名</th><th>关联公司 / 资料涉及基金</th><th>学历</th><th>已收录在管份额</th><th>核对日期</th></tr></thead>
          <tbody>
            <tr
              v-for="manager in result.items"
              :key="manager.managerId"
            >
              <td>
                <RouterLink :to="{ name: 'fund-manager-detail', params: { managerId: manager.managerId }, query: { from: route.fullPath } }">
                  {{ manager.managerName }}
                </RouterLink>
              </td>
              <td>{{ manager.companies.join('、') || '公司暂缺' }}<small>{{ manager.anchorFundName }}</small></td>
              <td>{{ manager.education || '暂缺' }}</td><td>{{ manager.shareCount === null ? '待核对' : `${manager.shareCount} 个` }}</td>
              <td>{{ manager.checkedAt ? managerDate(manager.checkedAt) : '待核对' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav
        v-if="result.totalPages > 1"
        class="manager-pagination"
        aria-label="经理目录分页"
      >
        <span>共 {{ result.totalCount }} 条已收录资料</span>
        <button
          type="button"
          :disabled="loading || result.page <= 1"
          @click="changePage(result.page - 1)"
        >
          上一页
        </button>
        <span>{{ result.page }} / {{ result.totalPages }}</span>
        <button
          type="button"
          :disabled="loading || result.page >= result.totalPages"
          @click="changePage(result.page + 1)"
        >
          下一页
        </button>
      </nav>
    </template>
  </section>
</template>

<style src="@/styles/fund-managers.css"></style>
