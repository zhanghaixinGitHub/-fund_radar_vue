<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobile = ref('')
const displayName = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const submitting = ref(false)
const localError = ref('')
const redirectPath = computed(() => (
  typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
    ? route.query.redirect
    : '/funds'
))

/** 明确确认手机号与两次密码后注册；账户角色与会话均由 Java 服务端决定。 */
async function submit(): Promise<void> {
  localError.value = ''
  if (!/^1[3-9]\d{9}$/.test(mobile.value)) {
    localError.value = '请输入中国大陆 11 位手机号。'
    return
  }
  if (!displayName.value || displayName.value.length > 128) {
    localError.value = '请输入 1 至 128 个字符的姓名。'
    return
  }
  if (password.value.length < 6 || password.value.length > 20 || password.value.trim().length === 0) {
    localError.value = '密码需为 6 至 20 位，且不能全部为空白字符。'
    return
  }
  if (password.value !== passwordConfirmation.value) {
    localError.value = '两次输入的密码不一致。'
    return
  }
  submitting.value = true
  try {
    await authStore.signUp(mobile.value, password.value, displayName.value)
    await router.replace(redirectPath.value)
  } catch {
    localError.value = authStore.errorMessage || '注册暂时不可用。'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section
      class="login-card"
      aria-labelledby="register-title"
    >
      <p class="eyebrow">
        基金雷达
      </p>
      <h1 id="register-title">
        注册你的基金账号
      </h1>
      <p class="login-lead">
        请确认这是你将用于登录的中国大陆手机号。注册后默认成为“基金用户”，账户将展示为“基金用户+姓名”。
      </p>

      <form
        class="login-form"
        @submit.prevent="submit"
      >
        <label for="register-mobile">手机号</label>
        <input
          id="register-mobile"
          v-model.trim="mobile"
          autocomplete="tel"
          inputmode="numeric"
          maxlength="11"
          name="mobile"
          pattern="^1[3-9]\d{9}$"
          placeholder="请输入 11 位手机号"
          required
          type="tel"
        >
        <p class="field-hint">
          请仔细核对，当前阶段暂未接入短信验证。
        </p>

        <label for="register-display-name">姓名</label>
        <input
          id="register-display-name"
          v-model.trim="displayName"
          autocomplete="name"
          maxlength="128"
          name="displayName"
          placeholder="请输入姓名"
          required
          type="text"
        >
        <p class="field-hint">
          用于账户展示；角色调整后会显示为对应的角色加姓名。
        </p>

        <label for="register-password">设置密码</label>
        <input
          id="register-password"
          v-model="password"
          autocomplete="new-password"
          maxlength="20"
          minlength="6"
          name="password"
          placeholder="请输入 6 至 20 位密码"
          required
          type="password"
        >

        <label for="register-password-confirmation">确认密码</label>
        <input
          id="register-password-confirmation"
          v-model="passwordConfirmation"
          autocomplete="new-password"
          maxlength="20"
          minlength="6"
          name="passwordConfirmation"
          placeholder="请再次输入密码"
          required
          type="password"
        >
        <p class="field-hint">
          密码为 6 至 20 位字符。
        </p>

        <p
          v-if="localError"
          class="form-error"
          role="alert"
        >
          {{ localError }}
        </p>
        <button
          class="primary-button login-submit"
          :aria-busy="submitting"
          :disabled="submitting"
          type="submit"
        >
          {{ submitting ? '正在注册…' : '注册并进入基金雷达' }}
        </button>
      </form>

      <p class="auth-switch">
        已有账号？
        <RouterLink :to="{ name: 'login', query: { redirect: redirectPath } }">
          去登录
        </RouterLink>
      </p>

      <p class="login-note">
        暂未接入短信验证，因此手机号仅作为登录标识；忘记密码请联系管理员人工重置。
      </p>
    </section>
  </main>
</template>
