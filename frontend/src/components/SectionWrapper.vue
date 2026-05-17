<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useIntersection } from '@/composables/useIntersection'
import { useAnimation } from '@/composables/useAnimation'

const props = defineProps<{
  id: string
  title: string
  subtitle?: string
}>()

const emit = defineEmits<{
  enter: []
}>()

const sectionRef = ref<HTMLElement | null>(null)
const { isIntersecting } = useIntersection(sectionRef)
const { gsap } = useAnimation()
const hasAnimated = ref(false)

onMounted(() => {
  const check = setInterval(() => {
    if (isIntersecting.value && !hasAnimated.value) {
      hasAnimated.value = true
      emit('enter')
      if (sectionRef.value) {
        gsap.fromTo(sectionRef.value, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      }
      clearInterval(check)
    }
  }, 100)
})
</script>

<template>
  <section :id="id" ref="sectionRef" class="min-h-screen py-16 px-6 opacity-0">
    <div class="max-w-7xl mx-auto">
      <div class="mb-10 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-text-primary mb-3">{{ title }}</h2>
        <p v-if="subtitle" class="text-text-secondary text-lg">{{ subtitle }}</p>
      </div>
      <slot />
    </div>
  </section>
</template>
