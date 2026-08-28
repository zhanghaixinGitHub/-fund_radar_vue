<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useAuthStore } from '@/stores/auth'
import { accountDisplayLabel, accountRoleLabel } from '@/utils/accountPresentation'

const authStore = useAuthStore()
const displayName = ref(authStore.user?.displayName ?? '')
const submitting = ref(false)
const localError = ref('')
const successMessage = ref('')
const currentName = computed(() => authStore.user?.displayName ?? '')
const nameUnchanged = computed(() => displayName.value.trim() === currentName.value)

watch(currentName, (name) => {
  if (!submitting.value) {
    displayName.value = name
  }
})

/** 对姓名进行页面级反馈；服务端仍会再次校验并去除首尾空白。 */
function validateDisplayName(): boolean {
  const normalized = displayName.value.trim()
  if (!normalized || normalized.length > 128) {
    localError.value = '请输入 1 至 128 个字符的姓名。'
    return false
  }
  localError.value = ''
  return true
}

/** 仅提交当前会话的姓名，成功后由 Pinia 替换顶栏可见的公开账户资料。 */
async function submit(): Promise<void> {
  successMessage.value = ''
  if (!validateDisplayName() || nameUnchanged.value) {
    return
  }
  submitting.value = true
  try {
    await authStore.updateProfile(displayName.value.trim())
    successMessage.value = '姓名已更新，页面顶部的账户展示已同步刷新。'
  } catch {
    localError.value = authStore.errorMessage || '个人信息暂时无法更新。'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section
    class="profile-page"
    aria-labelledby="profile-title"
  >
    <p class="eyebrow">
      ACCOUNT PROFILE
    </p>
    <h1 id="profile-title">
      个人信息
    </h1>
    <p class="lead profile-lead">
      姓名用于账户展示。手机号是当前登录标识，角色由管理员管理，因此这两项不能在此修改。
    </p>

    <div class="profile-layout">
      <aside
        class="profile-summary-card"
        aria-label="当前账户摘要"
      >
        <p class="card-label">
          当前账户
        </p>
        <strong>{{ accountDisplayLabel(authStore.user) }}</strong>
        <dl>
          <div>
            <dt>角色</dt>
            <dd>{{ authStore.user ? accountRoleLabel(authStore.user.role) : '—' }}</dd>
          </div>
          <div>
            <dt>登录手机号</dt>
            <dd>{{ authStore.user?.mobileMasked ?? '—' }}</dd>
          </div>
        </dl>
      </aside>

      <form
        class="profile-form"
        @submit.prevent="submit"
      >
        <div class="profile-form-heading">
          <h2>修改姓名</h2>
          <p>保存后立即更新本次登录会话中的展示名称。</p>
        </div>

        <label for="profile-display-name">
          姓名 <span aria-label="必填">*</span>
        </label>
        <input
          id="profile-display-name"
          v-model="displayName"
          aria-describedby="profile-name-hint"
          autocomplete="name"
          maxlength="128"
          name="displayName"
          required
          type="text"
          @blur="validateDisplayName"
          @input="localError = ''; successMessage = ''"
        >
        <p
          id="profile-name-hint"
          class="field-hint"
        >
          最多 128 个字符；请填写你希望在基金雷达中显示的姓名。
        </p>

        <p
          v-if="localError"
          class="form-error"
          role="alert"
        >
          {{ localError }}
        </p>
        <p
          v-else-if="successMessage"
          class="form-success"
          aria-live="polite"
        >
          {{ successMessage }}
        </p>

        <button
          class="primary-button profile-submit"
          :aria-busy="submitting"
          :disabled="submitting || nameUnchanged"
          type="submit"
        >
          {{ submitting ? '正在保存…' : '保存姓名' }}
        </button>
      </form>
    </div>
  </section>
</template>
