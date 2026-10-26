<script setup lang="ts">
import { computed } from 'vue'
import { findVerifiedFundProduct } from '@/data/fundShareClasses'

const props = defineProps<{ fundCode: string }>()
const product = computed(() => findVerifiedFundProduct(props.fundCode))
const otherShares = computed(() => product.value?.shares.filter(share => share.fundCode !== props.fundCode) ?? [])
// 只展示原件已确认的其他份额；当前份额、未核实关系和不存在的类别不占位。
</script>

<template>
  <!-- 直接作为基础资料 dl 的末尾字段：每种份额占一格，空列表不生成容器或占位。 -->
  <div
    v-for="share in otherShares"
    :key="share.fundCode"
    class="share-class-item"
  >
    <dt>{{ share.shareClass }}类份额</dt>
    <dd>{{ share.fundCode }}</dd>
  </div>
</template>

<style scoped>
/* 网格、分隔线和窄屏换行由基础资料统一控制，仅保留基金代码的等宽数字排版。 */
.share-class-item dd { font-variant-numeric: tabular-nums; letter-spacing: .025em; }
</style>
