<script setup lang="ts">
defineProps<{
  name: string
  role: string
  color: string
  isActive: boolean
  description: string
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    :class="['model-node flex flex-col items-center gap-2 cursor-pointer transition-all duration-300',
      `model-node--${name.toLowerCase()}`,
      isActive ? 'opacity-100 scale-110' : 'opacity-50 scale-100']"
    :style="{ '--node-color': color }"
    @click="$emit('click')"
  >
    <div
      class="w-20 h-20 rounded-full border-3 flex items-center justify-center transition-all duration-300"
      :style="{
        borderColor: color,
        boxShadow: isActive ? `0 0 20px ${color}80` : 'none',
      }"
    >
      <slot>
        <span class="text-xs font-bold text-text-primary">{{ name }}</span>
      </slot>
    </div>
    <span class="text-xs text-text-secondary">{{ role }}</span>
    <div
      v-if="isActive"
      class="absolute -bottom-8 text-xs text-text-weak max-w-32 text-center opacity-0 hover:opacity-100 transition-opacity"
    >
      {{ description }}
    </div>
  </div>
</template>
