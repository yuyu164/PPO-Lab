<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  token: string
  index: number
  isActive: boolean
  advantage?: number
  value?: number
}>()

defineEmits<{ click: [] }>()

const borderColor = computed(() => {
  if (props.advantage === undefined) return 'rgba(148, 163, 184, 0.3)'
  return props.advantage >= 0 ? '#22C55E' : '#EF4444'
})
</script>

<template>
  <div
    :class="['token-chip inline-flex items-center gap-1 px-3 py-1 rounded-lg font-mono text-sm transition-all duration-200 cursor-pointer',
      `token-chip--${index}`,
      isActive ? 'scale-110 shadow-lg' : '']"
    :style="{
      borderColor,
      borderWidth: '2px',
      borderStyle: 'solid',
      backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(30, 41, 59, 0.8)',
      boxShadow: isActive ? `0 0 12px ${borderColor}40` : 'none',
    }"
    @click="$emit('click')"
  >
    <span class="text-text-primary">{{ token }}</span>
    <span v-if="advantage !== undefined" class="text-xs" :style="{ color: borderColor }">
      {{ advantage >= 0 ? '+' : '' }}{{ advantage.toFixed(2) }}
    </span>
  </div>
</template>
