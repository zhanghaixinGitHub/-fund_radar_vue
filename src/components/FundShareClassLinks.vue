<script setup lang="ts">
import { computed } from 'vue'
import { findVerifiedFundProduct } from '@/data/fundShareClasses'

const props = defineProps<{ fundCode: string }>()
const product = computed(() => findVerifiedFundProduct(props.fundCode))
const otherShares = computed(() => product.value?.shares.filter(share => share.fundCode !== props.fundCode) ?? [])
// 只展示原件已确认的其他份额；当前份额、未核实关系和不存在的类别不占位。
</script>

<template>
  <section
    v-if="product && otherShares.length"
    class="analysis-section share-class-links"
    aria-label="同一基金的其他份额"
  >
    <div class="section-heading">
      <h2>其他份额</h2>
    </div>
    <dl class="detail-grid share-class-grid">
      <div
        v-for="share in otherShares"
        :key="share.fundCode"
      >
        <dt>{{ share.shareClass }}类</dt>
        <dd>{{ share.fundCode }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
/* 沿用基础资料的三列网格和窄屏布局，每个份额各占一格，多于三项时整行续排。 */
.share-class-grid { margin-top: 0; }
.share-class-grid dd { font-variant-numeric: tabular-nums; letter-spacing: .025em; }
</style>
