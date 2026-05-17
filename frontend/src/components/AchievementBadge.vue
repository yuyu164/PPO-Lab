<script setup lang="ts">
import { computed } from 'vue'
import { Trophy, Target, Flame, Award, Star } from 'lucide-vue-next'

const props = defineProps<{
  type: string
  unlocked: boolean
  description: string
  epoch?: number
}>()

const iconMap: Record<string, ReturnType<typeof Trophy>> = {
  first_converge: Trophy,
  kl_stable: Target,
  continuous_improve: Flame,
  precise_tuning: Award,
  master: Star,
}

const icon = computed(() => iconMap[props.type] || Trophy)
</script>

<template>
  <div
    :class="['achievement-badge flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300',
      `achievement-badge--${type}`,
      unlocked ? 'border-positive/30 bg-positive/5' : 'border-border bg-bg-tertiary/50 opacity-50']"
  >
    <div
      class="w-12 h-12 rounded-full flex items-center justify-center"
      :style="{
        backgroundColor: unlocked ? 'rgba(34,197,94,0.15)' : 'rgba(100,116,139,0.15)',
      }"
    >
      <component
        :is="icon"
        :size="24"
        :color="unlocked ? '#22C55E' : '#64748B'"
        :class="{ 'filter grayscale': !unlocked }"
      />
    </div>
    <span class="text-xs font-medium" :class="unlocked ? 'text-text-primary' : 'text-text-weak'">
      {{ description }}
    </span>
    <span v-if="unlocked && epoch" class="text-xs text-text-weak">Epoch {{ epoch }}</span>
  </div>
</template>
