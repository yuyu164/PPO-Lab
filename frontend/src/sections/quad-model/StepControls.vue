<script setup lang="ts">
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-vue-next'

defineProps<{
  isPlaying: boolean
  isComplete: boolean
  currentStep: number
  totalSteps: number
}>()

defineEmits<{
  play: []
  pause: []
  stepForward: []
  reset: []
}>()
</script>

<template>
  <div class="flex items-center justify-center gap-4">
    <button
      class="p-3 rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/80 transition-all disabled:opacity-30"
      :disabled="isComplete"
      @click="$emit('reset')"
    >
      <RotateCcw :size="20" />
    </button>

    <button
      v-if="!isPlaying"
      class="p-4 rounded-xl bg-actor text-white hover:bg-actor/80 transition-all shadow-lg shadow-actor/20"
      :disabled="isComplete"
      @click="$emit('play')"
    >
      <Play :size="24" />
    </button>
    <button
      v-else
      class="p-4 rounded-xl bg-reference text-white hover:bg-reference/80 transition-all shadow-lg shadow-reference/20"
      @click="$emit('pause')"
    >
      <Pause :size="24" />
    </button>

    <button
      class="p-3 rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/80 transition-all disabled:opacity-30"
      :disabled="isComplete"
      @click="$emit('stepForward')"
    >
      <SkipForward :size="20" />
    </button>

    <span class="text-sm text-text-weak ml-4">
      {{ currentStep }} / {{ totalSteps }}
    </span>
  </div>
</template>
