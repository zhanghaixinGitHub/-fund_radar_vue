<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import {
  grantAdminUserWatchlistCredits,
  getAdminUserPortfolio,
  getAdminUsers,
  resetAdminUserPassword,
  transferLegacyWatchlist,
  updateAdminUserRole,
  updateAdminUserStatus,
} from '@/api/adminUsers'
import type { AccountRole } from '@/types/auth'
import type { AdminUser } from '@/types/adminUser'
import type { PortfolioSnapshot } from '@/types/portfolio'
import { ACCOUNT_ROLE_OPTIONS, accountDisplayLabel, accountRoleLabel } from '@/utils/accountPresentation'

const users = ref<AdminUser[]>([])
const total = ref(0)
const page = ref(0)
const pageSize = 20
const loading = ref(false)
const actionUserId = ref<string | null>(null)
const errorMessage = ref('')
const successMessage = ref('')
const resetTarget = ref<AdminUser | null>(null)
const resetPasswordValue = ref('')
const creditTarget = ref<AdminUser | null>(null)
const creditAmount = ref(1)
const creditReason = ref('')
const transferTargetUserId = ref('')
const portfolioUser = ref<AdminUser | null>(null)
const portfolio = ref<PortfolioSnapshot | null>(null)

const roleOptions = ACCOUNT_ROLE_OPTIONS

const activeUsers = computed(() => users.value.filter((user) => !user.legacyRecord && user.status === 'ACTIVE'))
const hasPreviousPage = computed(() => page.value > 0)
const hasNextPage = computed(() => (page.value + 1) * pageSize < total.value)

/** 读取脱敏账户列表；服务端已完成权限和数据范围判断。 */
async function loadUsers(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await getAdminUsers(page.value, pageSize)
    users.value = response.items
    total.value = response.total
  } catch (error) {
    users.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '用户列表暂时不可用。'
  } finally {
    loading.value = false
  }
}

/** 变更角色前由管理员二次确认；目标会话由服务端撤销。 */
async function changeRole(user: AdminUser, role: AccountRole): Promise<void> {
  if (role === user.role) {
    return
  }
  if (!globalThis.confirm(`确认将“${accountDisplayLabel(user)}”调整为“${accountRoleLabel(role)}”吗？该用户需要重新登录。`)) {
    await loadUsers()
    return
  }
  await runUserAction(user.userId, async () => {
    await updateAdminUserRole(user.userId, role)
    successMessage.value = '角色已更新，目标用户的既有会话已失效。'
  })
}

/** 启用或停用前二次确认，避免误操作。 */
async function toggleStatus(user: AdminUser): Promise<void> {
  const targetStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
  if (!globalThis.confirm(`确认${targetStatus === 'ACTIVE' ? '启用' : '停用'}“${accountDisplayLabel(user)}”吗？`)) {
    return
  }
  await runUserAction(user.userId, async () => {
    await updateAdminUserStatus(user.userId, targetStatus)
    successMessage.value = targetStatus === 'ACTIVE' ? '账户已启用。' : '账户已停用，既有会话已失效。'
  })
}

/** 打开人工重置密码表单；密码输入只保留在当前表单，提交后立即清空。 */
function openPasswordReset(user: AdminUser): void {
  resetTarget.value = user
  resetPasswordValue.value = ''
  successMessage.value = ''
}

async function submitPasswordReset(): Promise<void> {
  if (!resetTarget.value) {
    return
  }
  if (!resetPasswordValue.value) {
    errorMessage.value = '请输入新密码。'
    return
  }
  const target = resetTarget.value
  await runUserAction(target.userId, async () => {
    await resetAdminUserPassword(target.userId, resetPasswordValue.value)
    resetPasswordValue.value = ''
    resetTarget.value = null
    successMessage.value = '密码已人工重置，目标用户的既有会话已失效。'
  })
}

/** 打开积分发放表单；积分仅代表额外有效关注名额，发放原因必填且不写入浏览器持久化状态。 */
function openCreditGrant(user: AdminUser): void {
  creditTarget.value = user
  creditAmount.value = 1
  creditReason.value = ''
  successMessage.value = ''
}

async function submitCreditGrant(): Promise<void> {
  if (!creditTarget.value) {
    return
  }
  const amount = Number(creditAmount.value)
  const reason = creditReason.value.trim()
  if (!Number.isInteger(amount) || amount < 1 || amount > 10_000) {
    errorMessage.value = '试用关注积分数量必须在 1 至 10000 之间。'
    return
  }
  if (!reason) {
    errorMessage.value = '请填写试用关注积分发放原因。'
    return
  }
  const target = creditTarget.value
  if (!globalThis.confirm(`确认向“${accountDisplayLabel(target)}”发放 ${amount} 个试用关注积分吗？积分只能扩容有效关注名额。`)) {
    return
  }
  await runUserAction(target.userId, async () => {
    await grantAdminUserWatchlistCredits(target.userId, amount, reason)
    creditTarget.value = null
    creditAmount.value = 1
    creditReason.value = ''
    successMessage.value = '试用关注积分已发放，目标账户的有效关注额度已更新。'
  })
}

/** 经浏览器确认后请求迁移历史关注；后端还会校验 confirmed 标志和目标账号状态。 */
async function submitLegacyTransfer(): Promise<void> {
  if (!transferTargetUserId.value) {
    errorMessage.value = '请选择接收历史关注的已启用用户。'
    return
  }
  const target = activeUsers.value.find((user) => user.userId === transferTargetUserId.value)
  if (!target || !globalThis.confirm(`确认将历史本机关注迁移给“${accountDisplayLabel(target)}”吗？提醒和持仓不会被迁移。`)) {
    return
  }
  await runUserAction('legacy-watchlist', async () => {
    const result = await transferLegacyWatchlist(target.userId)
    successMessage.value = `已迁移 ${result.transferredCount} 条历史关注；提醒和持仓保持原归属。`
    transferTargetUserId.value = ''
  })
}

/** 管理员按需查看指定用户的已确认持仓，不把财务数据写入全局状态。 */
async function viewPortfolio(user: AdminUser): Promise<void> {
  actionUserId.value = user.userId
  errorMessage.value = ''
  try {
    portfolioUser.value = user
    portfolio.value = await getAdminUserPortfolio(user.userId)
  } catch (error) {
    portfolioUser.value = null
    portfolio.value = null
    errorMessage.value = error instanceof Error ? error.message : '持仓快照暂时不可用。'
  } finally {
    actionUserId.value = null
  }
}

/** 执行会改变账号或归属的操作，并在成功后刷新列表。 */
async function runUserAction(userId: string, action: () => Promise<void>): Promise<void> {
  actionUserId.value = userId
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await action()
    await loadUsers()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '操作未完成，请稍后重试。'
  } finally {
    actionUserId.value = null
  }
}

/** 从 Vue 事件中安全读取下拉选项，避免组件逻辑直接依赖浏览器 DOM 类型。 */
function changeRoleFromEvent(user: AdminUser, event: unknown): void {
  const candidate = event as { target?: { value?: string } }
  const role = candidate.target?.value
  if (role === 'FUND_USER' || role === 'DATA_OPERATOR' || role === 'SYSTEM_ADMIN') {
    void changeRole(user, role)
  }
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function formatAmount(value: number | string): string {
  const numeric = typeof value === 'number' ? value : Number(value)
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', currencyDisplay: 'narrowSymbol' })
    .format(Number.isFinite(numeric) ? numeric : 0)
}

function closePortfolio(): void {
  portfolioUser.value = null
  portfolio.value = null
}

function previousPage(): void {
  if (hasPreviousPage.value) {
    page.value -= 1
    void loadUsers()
  }
}

function nextPage(): void {
  if (hasNextPage.value) {
    page.value += 1
    void loadUsers()
  }
}

onMounted(() => {
  void loadUsers()
})
</script>

<template>
  <section
    class="admin-page admin-users-page"
    aria-labelledby="admin-users-title"
  >
    <p class="eyebrow">
      ACCOUNT GOVERNANCE
    </p>
    <h1 id="admin-users-title">
      用户管理
    </h1>
    <p class="lead">
      手机号在页面中始终脱敏。重置密码、调整角色、启停账户、历史关注迁移和试用关注积分发放均由管理员二次确认并由服务端审计。
    </p>

    <p
      v-if="errorMessage"
      class="form-error"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <p
      v-else-if="successMessage"
      class="form-success"
      aria-live="polite"
    >
      {{ successMessage }}
    </p>

    <section
      class="admin-operation-card"
      aria-labelledby="legacy-transfer-title"
    >
      <div>
        <h2 id="legacy-transfer-title">
          迁移待归属的历史关注
        </h2>
        <p>仅迁移旧本机账户的关注列表；提醒规则和个人持仓不会被自动迁移。</p>
      </div>
      <div class="admin-inline-form">
        <label for="legacy-target">接收用户</label>
        <select
          id="legacy-target"
          v-model="transferTargetUserId"
        >
          <option value="">
            请选择已启用用户
          </option>
          <option
            v-for="user in activeUsers"
            :key="user.userId"
            :value="user.userId"
          >
            {{ accountDisplayLabel(user) }}（{{ user.mobileMasked }}）
          </option>
        </select>
        <button
          class="secondary-button"
          :disabled="actionUserId === 'legacy-watchlist'"
          type="button"
          @click="submitLegacyTransfer"
        >
          {{ actionUserId === 'legacy-watchlist' ? '正在迁移…' : '确认并迁移' }}
        </button>
      </div>
    </section>

    <section
      v-if="resetTarget"
      class="admin-operation-card password-reset-card"
      aria-labelledby="password-reset-title"
    >
      <div>
        <h2 id="password-reset-title">
          人工重置密码
        </h2>
        <p>目标：{{ accountDisplayLabel(resetTarget) }}（{{ resetTarget.mobileMasked }}）。提交后其全部既有会话会立即失效。</p>
      </div>
      <form
        class="admin-inline-form"
        @submit.prevent="submitPasswordReset"
      >
        <label for="reset-password">新密码</label>
        <input
          id="reset-password"
          v-model="resetPasswordValue"
          autocomplete="new-password"
          maxlength="128"
          required
          type="password"
        >
        <button
          class="primary-button"
          :disabled="actionUserId === resetTarget.userId"
          type="submit"
        >
          {{ actionUserId === resetTarget.userId ? '正在重置…' : '提交重置' }}
        </button>
        <button
          class="text-button"
          type="button"
          @click="resetTarget = null"
        >
          取消
        </button>
      </form>
    </section>

    <section
      v-if="creditTarget"
      class="admin-operation-card credit-grant-card"
      aria-labelledby="credit-grant-title"
    >
      <div>
        <h2 id="credit-grant-title">
          发放试用关注积分
        </h2>
        <p>目标：{{ accountDisplayLabel(creditTarget) }}（{{ creditTarget.mobileMasked }}）。积分仅增加可同时关注的基金数量，不可充值、转赠、提现或兑换交易建议。</p>
      </div>
      <form
        class="admin-inline-form"
        @submit.prevent="submitCreditGrant"
      >
        <label for="credit-amount">积分数量</label>
        <input
          id="credit-amount"
          v-model.number="creditAmount"
          inputmode="numeric"
          min="1"
          max="10000"
          required
          step="1"
          type="number"
        >
        <label for="credit-reason">发放原因</label>
        <input
          id="credit-reason"
          v-model="creditReason"
          maxlength="256"
          required
          type="text"
        >
        <button
          class="primary-button"
          :disabled="actionUserId === creditTarget.userId"
          type="submit"
        >
          {{ actionUserId === creditTarget.userId ? '正在发放…' : '确认发放' }}
        </button>
        <button
          class="text-button"
          type="button"
          @click="creditTarget = null"
        >
          取消
        </button>
      </form>
    </section>

    <section
      class="admin-table-card"
      aria-labelledby="user-list-title"
    >
      <header class="admin-table-header">
        <div>
          <h2 id="user-list-title">
            账户列表
          </h2>
          <p>共 {{ total }} 个账户</p>
        </div>
        <button
          class="secondary-button"
          :disabled="loading"
          type="button"
          @click="loadUsers"
        >
          刷新
        </button>
      </header>

      <p
        v-if="loading"
        class="state-message"
        role="status"
      >
        正在读取账户列表…
      </p>
      <div
        v-else
        class="admin-table-wrap"
      >
        <table>
          <thead>
            <tr>
              <th>账户</th>
              <th>角色</th>
              <th>状态</th>
              <th>关注额度</th>
              <th>试用积分</th>
              <th>创建时间</th>
              <th>管理操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.userId"
              :class="{ 'is-legacy-row': user.legacyRecord }"
            >
              <td>
                <strong>{{ accountDisplayLabel(user) }}</strong>
                <span>{{ user.mobileMasked }}{{ user.legacyRecord ? ' · 待归属历史账户' : '' }}</span>
              </td>
              <td>
                <select
                  :disabled="user.legacyRecord || actionUserId === user.userId"
                  :value="user.role"
                  :aria-label="`${accountDisplayLabel(user)}的角色`"
                  @change="changeRoleFromEvent(user, $event)"
                >
                  <option
                    v-for="option in roleOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </td>
              <td><span :class="`account-status is-${user.status.toLowerCase()}`">{{ user.status === 'ACTIVE' ? '已启用' : '已停用' }}</span></td>
              <td>{{ user.watchlistCount }} / {{ 5 + user.trialCreditTotal }}</td>
              <td>可用 {{ user.trialCreditAvailable }} · 锁定 {{ user.trialCreditLocked }}</td>
              <td>{{ formatTime(user.createdAt) }}</td>
              <td>
                <div class="admin-row-actions">
                  <button
                    class="text-button"
                    :disabled="user.legacyRecord || actionUserId === user.userId"
                    type="button"
                    @click="toggleStatus(user)"
                  >
                    {{ user.status === 'ACTIVE' ? '停用' : '启用' }}
                  </button>
                  <button
                    class="text-button"
                    :disabled="user.legacyRecord || actionUserId === user.userId"
                    type="button"
                    @click="openPasswordReset(user)"
                  >
                    重置密码
                  </button>
                  <button
                    class="text-button"
                    :disabled="user.legacyRecord || user.status !== 'ACTIVE' || actionUserId === user.userId"
                    type="button"
                    @click="openCreditGrant(user)"
                  >
                    发放积分
                  </button>
                  <button
                    class="text-button"
                    :disabled="actionUserId === user.userId"
                    type="button"
                    @click="viewPortfolio(user)"
                  >
                    查看持仓
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="admin-pagination">
        <button
          class="secondary-button"
          :disabled="!hasPreviousPage || loading"
          type="button"
          @click="previousPage"
        >
          上一页
        </button>
        <span>第 {{ page + 1 }} 页</span>
        <button
          class="secondary-button"
          :disabled="!hasNextPage || loading"
          type="button"
          @click="nextPage"
        >
          下一页
        </button>
      </footer>
    </section>

    <section
      v-if="portfolioUser"
      class="admin-portfolio-card"
      aria-labelledby="admin-portfolio-title"
    >
      <header>
        <div>
          <h2 id="admin-portfolio-title">
            {{ accountDisplayLabel(portfolioUser) }} 的确认持仓
          </h2>
          <p>仅展示该用户已确认并入库的快照；不是实时资产，也不会修改原数据。</p>
        </div>
        <button
          class="text-button"
          type="button"
          @click="closePortfolio"
        >
          关闭
        </button>
      </header>
      <p
        v-if="!portfolio?.available"
        class="state-message"
      >
        该用户尚无可展示的确认持仓快照。
      </p>
      <div
        v-else
        class="admin-table-wrap"
      >
        <table>
          <thead><tr><th>基金</th><th>截图金额</th><th>占比</th><th>日收益</th><th>持有收益</th></tr></thead>
          <tbody>
            <tr
              v-for="holding in portfolio?.holdings"
              :key="holding.fundCode"
            >
              <td><strong>{{ holding.fundName }}</strong><span>{{ holding.fundCode }}</span></td>
              <td>{{ formatAmount(holding.reportedAmount) }}</td>
              <td>{{ holding.reportedWeightPct }}%</td>
              <td>{{ formatAmount(holding.reportedDailyGainAmount) }}</td>
              <td>{{ formatAmount(holding.reportedHoldingGainAmount) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>
