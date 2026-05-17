<script setup lang="ts">
defineProps<{
  fromRef: string
  toRef: string
  color: string
  isActive: boolean
  animated: boolean
}>()
</script>

<template>
  <svg class="absolute inset-0 w-full h-full pointer-events-none" style="z-index: 0">
    <line
      x1="50%"
      y1="0"
      x2="50%"
      y2="100%"
      :stroke="color"
      :stroke-opacity="isActive ? 0.8 : 0.2"
      stroke-width="2"
      :stroke-dasharray="animated ? '8 4' : 'none'"
    >
      <animate
        v-if="animated && isActive"
        attributeName="stroke-dashoffset"
        from="24"
        to="0"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </line>
  </svg>
</template>
