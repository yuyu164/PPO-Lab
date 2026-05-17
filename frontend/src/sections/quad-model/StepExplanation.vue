<script setup lang="ts">
import type { TokenStep } from '@/types'
import FormulaDisplay from '@/components/FormulaDisplay.vue'
import { formatNumber } from '@/utils/format'

defineProps<{
  currentStep: number
  totalSteps: number
  stepData: TokenStep | null
}>()
</script>

<template>
  <div class="bg-bg-secondary/50 rounded-xl border border-border p-6">
    <div v-if="stepData" class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="text-sm text-text-weak">步骤 {{ currentStep }}/{{ totalSteps }}</span>
        <span class="text-lg font-mono text-text-primary">Token: "{{ stepData.token }}"</span>
      </div>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-text-weak">KL散度</span>
          <span class="ml-2 font-mono" :class="stepData.kl_div >= 0 ? 'text-negative' : 'text-positive'">
            {{ formatNumber(stepData.kl_div) }}
          </span>
        </div>
        <div>
          <span class="text-text-weak">奖励 r_t</span>
          <span class="ml-2 font-mono text-reference">{{ formatNumber(stepData.r_t) }}</span>
        </div>
        <div>
          <span class="text-text-weak">V_t</span>
          <span class="ml-2 font-mono text-critic">{{ formatNumber(stepData.V_t) }}</span>
        </div>
        <div>
          <span class="text-text-weak">优势 A_t</span>
          <span class="ml-2 font-mono" :class="stepData.A_t >= 0 ? 'text-positive' : 'text-negative'">
            {{ formatNumber(stepData.A_t) }}
          </span>
        </div>
      </div>

      <FormulaDisplay
        formula="A_t = r_t + \gamma V_{t+1} - V_t"
        highlight="\gamma"
        :highlightValue="0.99"
      />
    </div>
    <div v-else class="text-center text-text-weak py-8">
      点击"开始生成"查看步骤详情
    </div>
  </div>
</template>
