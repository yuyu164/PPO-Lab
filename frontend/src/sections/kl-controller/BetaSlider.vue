<script setup lang="ts">
import ParamSlider from '@/components/ParamSlider.vue'

defineProps<{
  modelValue: number
}>()

defineEmits<{
  'update:modelValue': [value: number]
  presetSelect: [key: string]
}>()

const presets = [
  { key: 'free', label: '自由模式', beta: 0.01 },
  { key: 'standard', label: '标准模式', beta: 0.1 },
  { key: 'strict', label: '严格模式', beta: 0.5 },
]
</script>

<template>
  <div class="space-y-4">
    <ParamSlider
      :model-value="modelValue"
      :min="0.01"
      :max="1.0"
      :step="0.01"
      label="β (KL惩罚系数)"
      color="#F59E0B"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <div class="flex gap-2">
      <button
        v-for="preset in presets"
        :key="preset.key"
        class="flex-1 px-3 py-2 rounded-lg text-xs font-medium border border-border bg-bg-tertiary text-text-secondary hover:text-text-primary hover:border-reference/50 transition-all"
        @click="$emit('presetSelect', preset.key)"
      >
        {{ preset.label }}
        <span class="ml-1 font-mono text-reference">β={{ preset.beta }}</span>
      </button>
    </div>
  </div>
</template>
