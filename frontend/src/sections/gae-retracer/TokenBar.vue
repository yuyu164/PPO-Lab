<script setup lang="ts">
import { computed, ref } from 'vue'
import TokenChip from '@/components/TokenChip.vue'
import type { GAEStep } from '@/types'

const props = defineProps<{
  steps: GAEStep[]
  currentTraceIndex: number
}>()

defineEmits<{
  tokenClick: [index: number]
}>()

const barRef = ref<HTMLElement | null>(null)

const indicatorLeft = computed(() => {
  if (props.currentTraceIndex < 0 || props.steps.length === 0) return '0%'
  return `${(props.currentTraceIndex / props.steps.length) * 100 + (0.5 / props.steps.length) * 100}%`
})
</script>

<template>
  <div class="relative">
    <div ref="barRef" class="flex items-center gap-2 flex-wrap py-2">
      <TokenChip
        v-for="(step, index) in steps"
        :key="index"
        :token="step.token"
        :index="index"
        :is-active="index === currentTraceIndex"
        :advantage="step.A_t"
        @click="$emit('tokenClick', index)"
      />
    </div>
    <div
      v-if="currentTraceIndex >= 0 && steps.length > 0"
      class="absolute -bottom-4 transition-all duration-300 ease-out"
      :style="{ left: indicatorLeft, transform: 'translateX(-50%)' }"
    >
      <div class="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-actor" />
    </div>
  </div>
</template>
