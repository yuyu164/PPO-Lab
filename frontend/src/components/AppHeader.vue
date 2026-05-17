<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useScrollTo } from '@/composables/useScrollTo'

const router = useRouter()
const appStore = useAppStore()
const { scrollTo } = useScrollTo()

const navItems = [
  { id: 'alignment', label: '对齐剧场' },
  { id: 'quad-model', label: '四模演武' },
  { id: 'kl-controller', label: 'KL调节器' },
  { id: 'gae-retracer', label: 'GAE回溯' },
  { id: 'training-simulator', label: '训练模拟' },
]

const sectionIds = ['alignment', 'quad-model', 'kl-controller', 'gae-retracer', 'training-simulator']

function handleNavClick(sectionId: string) {
  scrollTo(sectionId)
  router.replace({ name: sectionId })
}

function handleScroll() {
  appStore.setNavScrolled(window.scrollY > 50)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const isScrolled = computed(() => appStore.isNavScrolled)
</script>

<template>
  <header
    :class="['fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'bg-glass backdrop-blur-xl border-b border-border' : 'bg-transparent']"
  >
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xl font-bold bg-gradient-to-r from-actor to-critic bg-clip-text text-transparent">
          PPO-Lab
        </span>
      </div>

      <nav class="hidden md:flex items-center gap-6">
        <button
          v-for="item in navItems"
          :key="item.id"
          :class="['text-sm transition-colors duration-200 relative pb-1',
            appStore.currentSection === item.id ? 'text-actor' : 'text-text-secondary hover:text-text-primary']"
          @click="handleNavClick(item.id)"
        >
          {{ item.label }}
          <span
            v-if="appStore.currentSection === item.id"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-actor rounded-full"
          />
        </button>
      </nav>

      <div class="flex items-center gap-2">
        <div
          v-for="(id, i) in sectionIds"
          :key="id"
          :class="['w-2 h-2 rounded-full transition-all duration-300',
            appStore.sectionProgress[i] >= 1 ? 'bg-positive' :
            appStore.currentSection === id ? 'bg-actor animate-pulse' : 'bg-text-weak']"
        />
      </div>
    </div>
  </header>
</template>
