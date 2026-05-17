<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import HeroSection from '@/views/HeroSection.vue'
import AlignmentTheater from '@/views/AlignmentTheater.vue'
import QuadModelArena from '@/views/QuadModelArena.vue'
import KLController from '@/views/KLController.vue'
import GAERetracer from '@/views/GAERetracer.vue'
import TrainingSimulator from '@/views/TrainingSimulator.vue'
import AppFooter from '@/views/AppFooter.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

function handleScrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleSectionEnter(sectionId: string) {
  appStore.setCurrentSection(sectionId)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  appStore.isNavScrolled = window.scrollY > 50
}
</script>

<template>
  <div class="min-h-screen bg-bg-primary text-text-primary">
    <AppHeader />
    <main>
      <HeroSection />
      <AlignmentTheater @enter="handleSectionEnter('alignment')" />
      <QuadModelArena @enter="handleSectionEnter('quad-model')" />
      <KLController @enter="handleSectionEnter('kl-controller')" />
      <GAERetracer @enter="handleSectionEnter('gae-retracer')" />
      <TrainingSimulator @enter="handleSectionEnter('training-simulator')" />
    </main>
    <AppFooter @scroll-to-top="handleScrollToTop" />
  </div>
</template>
