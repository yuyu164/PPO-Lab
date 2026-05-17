<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, CheckCircle, Lock } from 'lucide-vue-next'

const props = defineProps<{
  status: 'warning' | 'optimal' | 'locked'
  title: string
  description: string
}>()

const config = computed(() => {
  const map = {
    warning: { icon: AlertTriangle, bg: 'rgba(245,158,11,0.1)', border: '#F59E0B', textColor: '#F59E0B' },
    optimal: { icon: CheckCircle, bg: 'rgba(34,197,94,0.1)', border: '#22C55E', textColor: '#22C55E' },
    locked: { icon: Lock, bg: 'rgba(148,163,184,0.1)', border: '#94A3B8', textColor: '#94A3B8' },
  }
  return map[props.status]
})
</script>

<template>
  <div
    class="rounded-xl p-4 border"
    :style="{ backgroundColor: config.bg, borderColor: config.border }"
  >
    <div class="flex items-center gap-2 mb-2">
      <component :is="config.icon" :size="20" :color="config.textColor" />
      <span class="font-semibold" :style="{ color: config.textColor }">{{ title }}</span>
    </div>
    <p class="text-sm text-text-secondary">{{ description }}</p>
  </div>
</template>
