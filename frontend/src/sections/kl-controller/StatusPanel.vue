<script setup lang="ts">
import type { KLBetaInterpretation } from '@/types'
import StatusBadge from '@/components/StatusBadge.vue'

defineProps<{
  interpretation: KLBetaInterpretation | null
}>()
</script>

<template>
  <div v-if="interpretation">
    <StatusBadge
      :status="interpretation.status"
      :title="interpretation.title"
      :description="interpretation.description"
    />
  </div>
  <div v-else class="text-center text-text-weak py-4">
    调节β值查看状态解读
  </div>
</template>
