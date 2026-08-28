<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobile = ref('')
const password = ref('')
const submitting = ref(false)
const localError = ref('')
const redirectPath = computed(() => (
  typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
    ? route.query.redirect
    : '/funds'
))

/** 提交已注册手机号和密码；服务端不会在登录请求中创建账户。 */
async function submit(): Promise<void> {
  localError.value = ''
  if (!/^1[3-9]\d{9}$/.test(mobile.value)) {
    localError.value = '请输入中国大陆 11 位手机号。'
    return
  }
  if (!password.value) {
    localError.value = '请输入密码。'
    return
  }
  submitting.value = true
  try {
    await authStore.signIn(mobile.value, password.value)
    await router.replace(redirectPath.value)
  } catch {
    localError.value = authStore.errorMessage || '手机号或密码错误。'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section
      class="login-card"
      aria-labelledby="login-title"
    >
      <p class="eyebrow">
        基金雷达
      </p>
      <h1 id="login-title">
        登录后查看你的基金关注
      </h1>
      <p class="login-lead">
        使用已注册的中国大陆手机号和密码登录。还没有账号？请先完成注册。
      </p>

      <form
        class="login-form"
        @submit.prevent="submit"
      >
        <label for="mobile">手机号</label>
        <input
          id="mobile"
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

        <label for="password">密码</label>
        <input
          id="password"
          v-model="password"
          autocomplete="current-password"
          maxlength="20"
          minlength="6"
          name="password"
          placeholder="请输入密码"
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
          {{ submitting ? '正在登录…' : '登录并进入基金雷达' }}
        </button>
      </form>

      <p class="auth-switch">
        还没有账号？
        <RouterLink :to="{ name: 'register', query: { redirect: redirectPath } }">
          去注册
        </RouterLink>
      </p>

      <p class="login-note">
        暂未接入短信验证，因此手机号仅作为登录标识；忘记密码请联系管理员人工重置。
      </p>
    </section>
  </main>
</template>
