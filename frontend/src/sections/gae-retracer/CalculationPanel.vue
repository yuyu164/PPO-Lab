<script setup lang="ts">
import { computed } from 'vue'
import FormulaDisplay from '@/components/FormulaDisplay.vue'
import type { GAEStep, StepCalculation } from '@/types'

const props = defineProps<{
  currentStep: GAEStep | null
  calculation: StepCalculation | null
}>()

const tdFormula = computed(() => {
  if (!props.calculation) return ''
  return props.calculation.formulas.td_error.formula
})

const tdSubstitution = computed(() => {
  if (!props.calculation) return ''
  return props.calculation.formulas.td_error.substitution
})

const tdResult = computed(() => {
  if (!props.calculation) return 0
  return props.calculation.formulas.td_error.result
})

const gaeFormula = computed(() => {
  if (!props.calculation) return ''
  return props.calculation.formulas.gae.formula
})

const gaeSubstitution = computed(() => {
  if (!props.calculation) return ''
  return props.calculation.formulas.gae.substitution
})

const gaeResult = computed(() => {
  if (!props.calculation) return 0
  return props.calculation.formulas.gae.result
})

const typewriterLines = computed(() => {
  if (!props.currentStep || !props.calculation) return []
  const s = props.currentStep
  const c = props.calculation
  return [
    `t=${s.t}  Token="${s.token}"`,
    `δ_${s.t} = ${c.formulas.td_error.substitution}`,
    `    = ${c.formulas.td_error.result.toFixed(4)}`,
    `A_${s.t} = ${c.formulas.gae.substitution}`,
    `    = ${c.formulas.gae.result.toFixed(4)}`,
  ]
})

const isPositive = computed(() => {
  if (!props.calculation) return true
  return props.calculation.is_positive
})
</script>

<template>
  <div class="space-y-4 p-4 rounded-xl bg-bg-secondary border border-border">
    <template v-if="currentStep && calculation">
      <div class="space-y-3">
        <div class="space-y-1">
          <p class="text-xs text-text-weak uppercase tracking-wider">TD Error δ_t</p>
          <FormulaDisplay :formula="tdFormula" />
          <div class="text-center text-sm text-text-secondary font-mono">
            = {{ tdSubstitution }}
          </div>
          <div
            class="text-center text-lg font-bold font-mono"
            :class="isPositive ? 'text-positive' : 'text-negative'"
          >
            = {{ tdResult.toFixed(4) }}
          </div>
        </div>

        <div class="h-px bg-border" />

        <div class="space-y-1">
          <p class="text-xs text-text-weak uppercase tracking-wider">GAE A_t</p>
          <FormulaDisplay :formula="gaeFormula" />
          <div class="text-center text-sm text-text-secondary font-mono">
            = {{ gaeSubstitution }}
          </div>
          <div
            class="text-center text-lg font-bold font-mono"
            :class="isPositive ? 'text-positive' : 'text-negative'"
          >
            = {{ gaeResult.toFixed(4) }}
          </div>
        </div>
      </div>

      <div class="h-px bg-border" />

      <pre class="font-mono text-sm text-text-secondary leading-relaxed whitespace-pre-wrap"><template v-for="(line, i) in typewriterLines" :key="i">{{ line }}
</template></pre>
    </template>

    <div v-else class="flex items-center justify-center py-8 text-text-weak text-sm">
      点击 Token 或开始回溯以查看计算过程
    </div>
  </div>
</template>
