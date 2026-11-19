<script setup lang="ts">
import SimulatedPortfolioPage from '@/views/SimulatedPortfolioPage.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <SimulatedPortfolioPage
    :key="String(route.params.fundCode)"
    :fund-code="String(route.params.fundCode)"
  />
</template>
