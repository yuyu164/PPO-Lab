<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useScrollTo } from '@/composables/useScrollTo'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { scrollTo } = useScrollTo()
let animationId: number | null = null

const TOKEN_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-=*/<>{}[]()'

interface Particle {
  x: number
  y: number
  char: string
  speed: number
  opacity: number
  size: number
}

const particles = ref<Particle[]>([])

function initParticles() {
  const canvas = canvasRef.value
  if (!canvas) return
  const count = Math.floor((canvas.width * canvas.height) / 15000)
  particles.value = Array.from({ length: count }, () => createParticle())
}

function createParticle(): Particle {
  const canvas = canvasRef.value
  return {
    x: Math.random() * (canvas?.width || 800),
    y: Math.random() * (canvas?.height || 600),
    char: TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)],
    speed: 0.2 + Math.random() * 0.5,
    opacity: 0.1 + Math.random() * 0.3,
    size: 10 + Math.random() * 6,
  }
}

function animate() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = '14px JetBrains Mono, monospace'

  for (const p of particles.value) {
    p.y -= p.speed
    if (p.y < -20) {
      p.y = canvas.height + 20
      p.x = Math.random() * canvas.width
      p.char = TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)]
    }
    ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`
    ctx.font = `${p.size}px JetBrains Mono, monospace`
    ctx.fillText(p.char, p.x, p.y)
  }

  animationId = requestAnimationFrame(animate)
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
  initParticles()
}

onMounted(() => {
  resizeCanvas()
  animate()
  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resizeCanvas)
})

function scrollToAlignment() {
  scrollTo('alignment')
}
</script>

<template>
  <section id="hero" class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full" />
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/30 to-bg-primary" />
    <div class="relative z-10 text-center px-6 max-w-4xl mx-auto">
      <h1 class="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-actor via-critic to-reward bg-clip-text text-transparent">
        PPO-Lab
      </h1>
      <p class="text-xl md:text-2xl text-text-secondary mb-4">
        AI驯化实验室
      </p>
      <p class="text-base md:text-lg text-text-weak mb-10 max-w-2xl mx-auto">
        通过交互式可视化，深入理解RLHF与PPO算法的核心机制。从对齐剧场到训练模拟，亲手驯化AI。
      </p>
      <button
        class="px-8 py-3 rounded-xl bg-actor hover:bg-actor/80 text-white font-semibold text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-actor/20"
        @click="scrollToAlignment"
      >
        开始探索
      </button>
    </div>
  </section>
</template>
