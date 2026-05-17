<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useAnimation } from '@/composables/useAnimation'

const props = defineProps<{
  type: 'wild' | 'aligned'
  messages: Array<{ role: string; content: string }>
  rating: number
}>()

const { gsap, createTimeline } = useAnimation()

const displayedTexts = ref<string[]>(props.messages.map(() => ''))
const typingComplete = ref(false)

const borderColor = props.type === 'wild' ? 'border-reference' : 'border-positive'
const titleText = props.type === 'wild' ? '野生AI' : '对齐AI'
const titleColor = props.type === 'wild' ? 'text-reference' : 'text-positive'
const bgAccent = props.type === 'wild' ? 'bg-reference/5' : 'bg-positive/5'

async function startTypewriter() {
  const tl = createTimeline()

  for (let i = 0; i < props.messages.length; i++) {
    const msg = props.messages[i]
    const fullText = msg.content
    const chars = fullText.split('')

    for (let j = 0; j < chars.length; j++) {
      const charIndex = j
      tl.to({}, {
        duration: 0.02,
        onUpdate() {
          displayedTexts.value[i] = fullText.slice(0, charIndex + 1)
        },
      })
    }

    tl.to({}, { duration: 0.3 })
  }

  tl.call(() => {
    typingComplete.value = true
  })
}

onMounted(() => {
  nextTick(() => {
    startTypewriter()
  })
})
</script>

<template>
  <div :class="['rounded-xl border-2 p-5 transition-all duration-300', borderColor, bgAccent]">
    <div class="flex items-center gap-2 mb-4">
      <div
        :class="['w-3 h-3 rounded-full', type === 'wild' ? 'bg-reference' : 'bg-positive']"
      />
      <span :class="['font-semibold text-lg', titleColor]">{{ titleText }}</span>
    </div>

    <div class="space-y-3">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="['rounded-lg p-3', msg.role === 'user' ? 'bg-bg-tertiary/50' : 'bg-bg-secondary']"
      >
        <div class="text-xs text-text-weak mb-1">{{ msg.role === 'user' ? '用户' : 'AI' }}</div>
        <div class="text-sm text-text-primary whitespace-pre-wrap">
          <template v-if="msg.role === 'user'">{{ msg.content }}</template>
          <template v-else>
            {{ displayedTexts[i] }}<span v-if="!typingComplete && displayedTexts[i].length < msg.content.length" class="animate-pulse">|</span>
          </template>
        </div>
      </div>
    </div>

    <div v-if="typingComplete" class="mt-4 flex items-center gap-1">
      <span class="text-xs text-text-weak mr-2">评分:</span>
      <span
        v-for="star in 5"
        :key="star"
        :class="['text-lg', star <= rating ? 'text-reference' : 'text-text-weak/30']"
      >
        ★
      </span>
    </div>
  </div>
</template>
