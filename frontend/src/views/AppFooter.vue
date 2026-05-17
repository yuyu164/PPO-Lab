<script setup lang="ts">
import { ArrowUp } from 'lucide-vue-next'

const emit = defineEmits<{
  scrollToTop: []
}>()

function handleScrollToTop() {
  emit('scrollToTop')
}
</script>

<template>
  <footer class="py-10 px-6 border-t border-border">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <p class="text-sm text-text-weak">
        PPO-Lab &copy; 2024 — 让AI对齐不再神秘
      </p>
      <button
        class="p-2 rounded-lg bg-bg-tertiary hover:bg-bg-secondary border border-border text-text-secondary hover:text-text-primary transition-all duration-200 hover:-translate-y-0.5"
        @click="handleScrollToTop"
      >
        <ArrowUp :size="18" />
      </button>
    </div>
  </footer>
</template>
