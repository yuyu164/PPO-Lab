<script setup lang="ts">
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-vue-next'
import ParamSlider from '@/components/ParamSlider.vue'
import type { AnimationSpeed } from '@/types'

const props = defineProps<{
  gamma: number
  lambda: number
  speed: AnimationSpeed
  isPlaying: boolean
  canStart: boolean
  canPause: boolean
  canResume: boolean
  canReset: boolean
}>()

const emit = defineEmits<{
  'update:gamma': [value: number]
  'update:lambda': [value: number]
  'update:speed': [value: AnimationSpeed]
  play: []
  pause: []
  step: []
  reset: []
}>()

const speedOptions: { value: AnimationSpeed; label: string }[] = [
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 4, label: '4x' },
]
</script>

<template>
  <div class="space-y-5 p-4 rounded-xl bg-bg-secondary border border-border">
    <div class="space-y-4">
      <ParamSlider
        :model-value="gamma"
        :min="0.9"
        :max="1.0"
        :step="0.01"
        label="折扣因子 γ"
        color="#3B82F6"
        @update:model-value="emit('update:gamma', $event)"
      />
      <ParamSlider
        :model-value="lambda"
        :min="0.0"
        :max="1.0"
        :step="0.01"
        label="GAE权重 λ"
        color="#A78BFA"
        @update:model-value="emit('update:lambda', $event)"
      />
    </div>

    <div class="h-px bg-border" />

    <div class="space-y-2">
      <p class="text-xs text-text-weak uppercase tracking-wider">动画速度</p>
      <div class="flex gap-2">
        <button
          v-for="opt in speedOptions"
          :key="opt.value"
          :class="[
            'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all',
            speed === opt.value
              ? 'bg-actor/20 text-actor border border-actor/50'
              : 'bg-bg-tertiary text-text-secondary border border-border hover:text-text-primary hover:border-actor/30',
          ]"
          @click="emit('update:speed', opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div class="h-px bg-border" />

    <div class="flex items-center justify-center gap-3">
      <button
        class="p-2.5 rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/80 transition-all disabled:opacity-30"
        :disabled="!canReset"
        @click="emit('reset')"
      >
        <RotateCcw :size="18" />
      </button>

      <button
        v-if="!isPlaying"
        class="p-3 rounded-xl bg-actor text-white hover:bg-actor/80 transition-all shadow-lg shadow-actor/20 disabled:opacity-30"
        :disabled="!canStart && !canResume"
        @click="emit('play')"
      >
        <Play :size="20" />
      </button>
      <button
        v-else
        class="p-3 rounded-xl bg-reference text-white hover:bg-reference/80 transition-all shadow-lg shadow-reference/20"
        @click="emit('pause')"
      >
        <Pause :size="20" />
      </button>

      <button
        class="p-2.5 rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/80 transition-all disabled:opacity-30"
        :disabled="isPlaying"
        @click="emit('step')"
      >
        <SkipForward :size="18" />
      </button>
    </div>
  </div>
</template>
