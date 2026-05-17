<script setup lang="ts">
import { ref } from 'vue'
import { Star } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue: number
  maxRating?: number
}>(), {
  maxRating: 5,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  rated: [value: number]
}>()

const hoveredIndex = ref(-1)
const showExplanation = ref(false)

function onStarClick(index: number) {
  const rating = index + 1
  emit('update:modelValue', rating)
  emit('rated', rating)
  showExplanation.value = true
  setTimeout(() => {
    showExplanation.value = false
  }, 3000)
}

function onStarHover(index: number) {
  hoveredIndex.value = index
}

function onStarLeave() {
  hoveredIndex.value = -1
}

function isFilled(index: number) {
  return index < props.modelValue
}

function isHovered(index: number) {
  return index <= hoveredIndex.value
}
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div class="flex items-center gap-2" @mouseleave="onStarLeave">
      <button
        v-for="i in maxRating"
        :key="i"
        class="transition-all duration-200 p-1 focus:outline-none"
        :class="isHovered(i - 1) ? 'scale-125' : 'scale-100'"
        :style="{
          filter: isHovered(i - 1) ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))' : 'none',
        }"
        @mouseenter="onStarHover(i - 1)"
        @click="onStarClick(i - 1)"
      >
        <Star
          :size="28"
          :class="[
            'transition-colors duration-200',
            isFilled(i - 1) || isHovered(i - 1) ? 'text-reference fill-reference' : 'text-text-weak/30'
          ]"
        />
      </button>
    </div>

    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="showExplanation"
        class="px-5 py-3 rounded-xl bg-reference/10 border border-reference/30 text-center"
      >
        <p class="text-sm text-reference font-medium">
          恭喜！你刚刚扮演了 Reward Model 的角色！
        </p>
      </div>
    </Transition>
  </div>
</template>
