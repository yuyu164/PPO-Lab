<script setup lang="ts">
import { computed } from 'vue'
import type { TrainingHyperparams } from '@/types'
import { Play, Pause, RotateCcw, StepForward } from 'lucide-vue-next'
import ParamSlider from '@/components/ParamSlider.vue'

const props = defineProps<{
  hyperparams: TrainingHyperparams
  presets: Record<string, { label: string; params: TrainingHyperparams }> | null
  trainingStatus: 'idle' | 'running' | 'paused' | 'completed' | 'error'
  currentEpoch: number
  maxEpochs: number
}>()

const emit = defineEmits<{
  updateParam: [key: keyof TrainingHyperparams, value: number]
  selectPreset: [key: string]
  start: []
  pause: []
  resume: []
  step: []
  reset: []
}>()

const sliderConfigs = [
  { key: 'kl_ctl' as const, min: 0.001, max: 1.0, step: 0.001, color: '#F59E0B', label: 'KL惩罚系数 β' },
  { key: 'gamma' as const, min: 0.9, max: 1.0, step: 0.01, color: '#3B82F6', label: '折扣因子 γ' },
  { key: 'lam' as const, min: 0.0, max: 1.0, step: 0.01, color: '#A78BFA', label: 'GAE权重 λ' },
  { key: 'clip_range' as const, min: 0.1, max: 0.5, step: 0.01, color: '#EF4444', label: 'PPO裁剪范围 ε' },
  { key: 'learning_rate' as const, min: 0.001, max: 0.1, step: 0.001, color: '#06B6D4', label: '学习率' },
  { key: 'ppo_epochs' as const, min: 1, max: 10, step: 1, color: '#22C55E', label: 'PPO迭代轮数' },
]

const presetKeys = computed(() => {
  if (!props.presets) return []
  return Object.keys(props.presets)
})

const progressPercent = computed(() => {
  if (props.maxEpochs === 0) return 0
  return (props.currentEpoch / props.maxEpochs) * 100
})

function onSliderUpdate(key: keyof TrainingHyperparams, value: number) {
  emit('updateParam', key, value)
}

function isActivePreset(key: string): boolean {
  if (!props.presets || !props.presets[key]) return false
  const presetParams = props.presets[key].params
  return (
    props.hyperparams.kl_ctl === presetParams.kl_ctl &&
    props.hyperparams.gamma === presetParams.gamma &&
    props.hyperparams.lam === presetParams.lam &&
    props.hyperparams.clip_range === presetParams.clip_range &&
    props.hyperparams.learning_rate === presetParams.learning_rate &&
    props.hyperparams.ppo_epochs === presetParams.ppo_epochs
  )
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-3">
      <ParamSlider
        v-for="cfg in sliderConfigs"
        :key="cfg.key"
        :model-value="hyperparams[cfg.key]"
        :min="cfg.min"
        :max="cfg.max"
        :step="cfg.step"
        :color="cfg.color"
        :label="cfg.label"
        @update:model-value="(v: number) => onSliderUpdate(cfg.key, v)"
      />
    </div>

    <div v-if="presets" class="flex gap-2 flex-wrap">
      <button
        v-for="key in presetKeys"
        :key="key"
        @click="emit('selectPreset', key)"
        :class="[
          'px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200',
          isActivePreset(key)
            ? 'border-actor bg-actor/10 text-actor'
            : 'border-border bg-bg-tertiary/50 text-text-secondary hover:border-actor/50 hover:text-text-primary',
        ]"
      >
        {{ presets[key].label }}
      </button>
    </div>

    <div class="flex gap-2 flex-wrap">
      <button
        v-if="trainingStatus === 'idle'"
        @click="emit('start')"
        class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-positive/15 border border-positive/30 text-positive hover:bg-positive/25 transition-all duration-200"
      >
        <Play :size="16" />
        开始训练
      </button>

      <button
        v-if="trainingStatus === 'running'"
        @click="emit('pause')"
        class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-warning/15 border border-warning/30 text-warning hover:bg-warning/25 transition-all duration-200"
      >
        <Pause :size="16" />
        暂停
      </button>

      <button
        v-if="trainingStatus === 'paused'"
        @click="emit('resume')"
        class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-positive/15 border border-positive/30 text-positive hover:bg-positive/25 transition-all duration-200"
      >
        <Play :size="16" />
        继续
      </button>

      <button
        v-if="trainingStatus === 'idle' || trainingStatus === 'paused'"
        @click="emit('step')"
        class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-bg-tertiary/50 text-text-secondary hover:text-text-primary hover:border-actor/50 transition-all duration-200"
      >
        <StepForward :size="16" />
        单步
      </button>

      <button
        v-if="trainingStatus !== 'idle'"
        @click="emit('reset')"
        class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-bg-tertiary/50 text-text-secondary hover:text-negative hover:border-negative/50 transition-all duration-200"
      >
        <RotateCcw :size="16" />
        重置
      </button>
    </div>

    <div v-if="maxEpochs > 0" class="flex flex-col gap-1">
      <div class="flex justify-between text-xs text-text-weak">
        <span>Epoch {{ currentEpoch }} / {{ maxEpochs }}</span>
        <span>{{ progressPercent.toFixed(1) }}%</span>
      </div>
      <div class="w-full h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
        <div
          class="h-full rounded-full bg-actor transition-all duration-300"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
    </div>
  </div>
</template>
