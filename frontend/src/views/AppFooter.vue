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
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <p class="text-sm text-text-weak text-center sm:text-left leading-relaxed">
        &copy; 2026 PPO-Lab 课程项目. 课程展示用途，仅作学习交流使用。<br>
        算法介绍参考自公开论文及知乎社区内容，版权归原作者所有。
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
