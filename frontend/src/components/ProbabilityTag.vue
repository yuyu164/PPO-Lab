<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  tag: string
  description: string
  defaultExpanded?: boolean
}>(), {
  defaultExpanded: false,
})

const expanded = ref(props.defaultExpanded)
</script>

<template>
  <div class="inline-flex flex-col">
    <button
      class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all duration-200 hover:bg-purple-500/15"
      :class="expanded ? 'bg-purple-500/15 border-purple-500/30' : 'bg-purple-500/10 border-purple-500/20'"
      style="color: #c084fc"
      @click="expanded = !expanded"
    >
      <span>🎲</span>
      <span>概率论：{{ tag }}</span>
      <svg
        class="w-3 h-3 transition-transform duration-200"
        :class="expanded ? 'rotate-180' : ''"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 max-h-0 mt-0"
      enter-to-class="opacity-100 max-h-40 mt-2"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 max-h-40 mt-2"
      leave-to-class="opacity-0 max-h-0 mt-0"
    >
      <div
        v-if="expanded"
        class="overflow-hidden rounded-lg border border-purple-500/15 px-4 py-2.5 text-sm leading-relaxed"
        style="background: rgba(168, 85, 247, 0.05); color: #d8b4fe"
      >
        {{ description }}
      </div>
    </Transition>
  </div>
</template>
