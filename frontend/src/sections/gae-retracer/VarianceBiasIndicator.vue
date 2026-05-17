<script setup lang="ts">
import { computed } from 'vue'
import type { VarianceBiasResult } from '@/types'

const props = defineProps<{
  lambda: number
  result: VarianceBiasResult
}>()

const dotLeft = computed(() => `${props.lambda * 100}%`)

const biasLabel = computed(() => props.result.bias)
const varianceLabel = computed(() => props.result.variance)
</script>

<template>
  <div class="space-y-3 p-4 rounded-xl bg-bg-secondary border border-border">
    <p class="text-xs text-text-weak uppercase tracking-wider">方差-偏差平衡</p>

    <div class="relative h-8">
      <div class="absolute top-1/2 -translate-y-1/2 w-full h-1.5 rounded-full bg-gradient-to-r from-actor via-critic to-negative" />

      <div
        class="absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-out"
        :style="{ left: dotLeft, transform: 'translateX(-50%) translateY(-50%)' }"
      >
        <div class="w-5 h-5 rounded-full bg-critic border-2 border-white shadow-lg shadow-critic/40" />
      </div>

      <span class="absolute left-0 top-7 text-xs text-text-weak">高偏差 (λ≈0)</span>
      <span class="absolute right-0 top-7 text-xs text-text-weak">高方差 (λ≈1)</span>
    </div>

    <div class="flex justify-between items-center pt-4 text-xs">
      <span class="text-actor font-mono">{{ biasLabel }}</span>
      <span class="text-negative font-mono">{{ varianceLabel }}</span>
    </div>

    <p class="text-sm text-text-secondary leading-relaxed">
      {{ result.description }}
    </p>
  </div>
</template>
