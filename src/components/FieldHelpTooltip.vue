<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  fieldName: string
  description: string
}>()

const isOpen = ref(false)

/** 点击用于触屏设备，悬停和键盘焦点仍由样式直接展示说明。 */
function toggle(): void {
  isOpen.value = !isOpen.value
}

/** Esc 关闭点击展开状态，方便键盘用户继续浏览字段。 */
function closeOnEscape(event: globalThis.KeyboardEvent): void {
  isOpen.value = false
  const trigger = event.currentTarget as InstanceType<typeof globalThis.HTMLButtonElement>
  trigger.blur()
}
</script>

<template>
  <span
    class="field-help-tooltip"
    :class="{ 'is-open': isOpen }"
  >
    <button
      class="field-help-trigger"
      type="button"
      :aria-expanded="isOpen"
      :aria-label="`查看${fieldName}说明`"
      @click="toggle"
      @keydown.esc.prevent="closeOnEscape"
    >
      <svg
        class="field-help-icon"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <circle
          cx="10"
          cy="10"
          r="7.25"
        />
        <path d="M7.7 7.65a2.45 2.45 0 0 1 4.77.78c0 1.76-2.47 2.08-2.47 3.78" />
        <circle
          class="field-help-dot"
          cx="10"
          cy="14.35"
          r="0.7"
        />
      </svg>
    </button>
    <span
      class="field-help-content"
      role="tooltip"
    >
      {{ description }}
    </span>
  </span>
</template>

<style scoped>
.field-help-tooltip {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.field-help-trigger {
  display: grid;
  width: 22px;
  height: 22px;
  padding: 0;
  place-items: center;
  color: #6b998d;
  cursor: help;
  touch-action: manipulation;
  background: transparent;
  border: 0;
  border-radius: 6px;
}

.field-help-icon {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.45;
}

.field-help-dot {
  fill: currentcolor;
  stroke: none;
}

.field-help-trigger:hover,
.field-help-trigger:focus-visible,
.field-help-tooltip.is-open .field-help-trigger {
  color: #0f766e;
  outline: none;
}

.field-help-trigger:focus-visible {
  outline: 2px solid rgb(15 118 110 / 28%);
  outline-offset: 2px;
}

.field-help-content {
  position: absolute;
  top: 27px;
  right: 0;
  display: none;
  width: min(292px, calc(100vw - 56px));
  padding: 12px;
  color: #294940;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.6;
  background: #fff;
  border: 1px solid #8eb9aa;
  border-radius: 10px;
  box-shadow: 0 10px 24px rgb(20 68 57 / 14%);
}

.field-help-tooltip:hover .field-help-content,
.field-help-tooltip:focus-within .field-help-content,
.field-help-tooltip.is-open .field-help-content {
  display: block;
}

@media (max-width: 680px) {
  .field-help-trigger {
    width: 44px;
    height: 44px;
  }

  .field-help-icon {
    width: 20px;
    height: 20px;
  }

  .field-help-tooltip {
    top: 4px;
    right: 4px;
  }

  .field-help-content {
    top: 44px;
  }
}
</style>
