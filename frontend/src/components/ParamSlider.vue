<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: number
  min: number
  max: number
  step: number
  label: string
  color?: string
}>(), {
  color: '#3B82F6',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const sliderColor = computed(() => props.color)

function onInput(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value)
  emit('update:modelValue', val)
}

const percent = computed(() => ((props.modelValue - props.min) / (props.max - props.min)) * 100)
</script>

<template>
  <div class="param-slider">
    <div class="flex justify-between items-center mb-1">
      <slot name="label">
        <span class="text-sm text-text-secondary">{{ label }}</span>
      </slot>
      <span class="text-sm font-mono text-text-primary">{{ modelValue.toFixed(step < 1 ? 2 : 0) }}</span>
    </div>
    <div class="relative">
      <input
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        @input="onInput"
        class="w-full h-1 rounded-full appearance-none cursor-pointer"
        :style="{
          background: `linear-gradient(to right, ${sliderColor} ${percent}%, rgba(148,163,184,0.2) ${percent}%)`,
          '--slider-color': sliderColor,
        }"
      />
    </div>
  </div>
</template>

<style scoped>
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--slider-color);
  cursor: pointer;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
}
input[type='range']::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--slider-color);
  cursor: pointer;
  border: none;
}
</style>
