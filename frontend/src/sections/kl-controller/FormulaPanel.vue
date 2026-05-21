<script setup lang="ts">
import FormulaDisplay from '@/components/FormulaDisplay.vue'

defineProps<{
  beta: number
  formula: { expression: string; highlight: string; beta_value: number }
}>()

const formulaTex = 'R_t = -\\beta \\cdot (\\log P_{\\text{actor}} - \\log P_{\\text{ref}})'
const highlightTex = '\\beta'
</script>

<template>
  <div class="bg-bg-secondary/50 rounded-xl border border-border p-6">
    <h4 class="text-sm font-medium text-text-secondary mb-3">PPO-Penalty 奖励公式</h4>
    <FormulaDisplay
      :formula="formulaTex"
      :highlight="highlightTex"
      :highlight-value="beta.toFixed(2)"
    />
    <p class="text-xs text-text-weak mt-3 text-center">
      当前 β = <span class="text-actor font-mono">{{ beta.toFixed(2) }}</span>
    </p>
  </div>
</template>
