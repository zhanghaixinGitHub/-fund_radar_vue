<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { accountDisplayLabel, accountRoleLabel } from '@/utils/accountPresentation'

const authStore = useAuthStore()
</script>

<template>
  <section
    class="admin-page"
    aria-labelledby="admin-dashboard-title"
  >
    <p class="eyebrow">
      ADMIN CONSOLE
    </p>
    <h1 id="admin-dashboard-title">
      后台工作台
    </h1>
    <p class="lead">
      系统级操作与用户端浏览分离。所有高风险动作都由 Java 服务端认证、授权和审计。
    </p>

    <div class="admin-summary-card">
      <span>当前登录</span>
      <strong>{{ accountDisplayLabel(authStore.user) }}</strong>
      <p>{{ authStore.user?.mobileMasked }} · {{ authStore.user ? accountRoleLabel(authStore.user.role) : '' }}</p>
    </div>

    <div class="admin-action-grid">
      <RouterLink
        v-if="authStore.hasPermission('USER_ACCOUNT_READ')"
        class="admin-action-card"
        to="/admin/users"
      >
        <span>账户与归属</span>
        <h2>用户管理</h2>
        <p>查看脱敏账户、调整角色和状态、人工重置密码，并确认历史关注迁移。</p>
      </RouterLink>
      <RouterLink
        v-if="authStore.hasPermission('SYNC_JOB_READ')"
        class="admin-action-card"
        to="/admin/sync"
      >
        <span>数据运营</span>
        <h2>数据同步</h2>
        <p>查看和发起已授权的基金净值同步任务，不涉及交易操作。</p>
      </RouterLink>
      <RouterLink
        v-if="authStore.user?.role === 'SYSTEM_ADMIN'"
        class="admin-action-card"
        to="/admin/analysis"
      >
        <span>模型治理</span>
        <h2>分析运行</h2>
        <p>受控创建滚动回测并查看真实状态；不会自动评分、发布模型或发送提醒。</p>
      </RouterLink>
    </div>
  </section>
</template>
