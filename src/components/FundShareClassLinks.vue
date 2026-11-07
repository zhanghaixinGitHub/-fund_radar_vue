<script setup lang="ts">
import { computed } from 'vue'
import type { FundShareClasses, RelatedFundShare } from '@/types/fund'

const props = defineProps<{
  fundCode: string
  relations: FundShareClasses | null
  loading: boolean
  failed: boolean
}>()
const otherShares = computed(() => props.relations?.shares.filter(share => share.fundCode !== props.fundCode) ?? [])

/** 币种也是份额身份的一部分；名称未明确类别时直接显示来源名称。 */
function shareLabel(share: RelatedFundShare): string {
  if (!share.shareClass) return share.fundName
  return `${share.shareClass}类份额${share.currency ? `（${share.currency}）` : ''}`
}
</script>

<template>
  <!-- 作为基础资料 dl 的末尾字段；各份额占一格，未知与请求失败有明确业务提示。 -->
  <div
    v-for="share in otherShares"
    :key="share.fundCode"
    class="share-class-item"
  >
    <dt>{{ shareLabel(share) }}</dt>
    <dd>{{ share.fundCode }}</dd>
  </div>
  <div
    v-if="!otherShares.length || relations?.status === 'STALE'"
    class="share-class-item"
  >
    <dt>{{ otherShares.length ? '份额资料' : '其他份额' }}</dt>
    <dd v-if="loading">
      正在获取
    </dd>
    <dd v-else-if="failed">
      暂时无法获取
    </dd>
    <dd v-else-if="relations?.status === 'UNVERIFIED'">
      暂未核实
    </dd>
    <dd v-else-if="relations?.status === 'STALE'">
      截至 {{ relations.asOfDate }}，待更新
    </dd>
    <dd v-else>
      截至 {{ relations?.asOfDate }} 未列出其他份额
    </dd>
  </div>
</template>

<style scoped>
/* 网格、分隔线和窄屏换行由基础资料统一控制，仅保留基金代码的等宽数字排版。 */
.share-class-item dd { font-variant-numeric: tabular-nums; letter-spacing: .025em; }
</style>
