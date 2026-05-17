<script setup lang="ts">
import type { TokenStep } from '@/types'
import TokenChip from '@/components/TokenChip.vue'

defineProps<{
  steps: TokenStep[]
  currentStep: number
}>()

defineEmits<{
  tokenClick: [index: number]
}>()
</script>

<template>
  <div class="flex flex-wrap gap-2 justify-center py-4">
    <TokenChip
      v-for="(step, i) in steps"
      :key="i"
      :token="step.token"
      :index="i"
      :is-active="i === currentStep - 1"
      :advantage="step.A_t"
      :value="step.V_t"
      @click="$emit('tokenClick', i)"
    />
  </div>
</template>
