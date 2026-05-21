<script setup lang="ts">
import { computed } from 'vue'
import SectionWrapper from '@/components/SectionWrapper.vue'
import ModelGraph from '@/sections/quad-model/ModelGraph.vue'
import TokenSequence from '@/sections/quad-model/TokenSequence.vue'
import StepExplanation from '@/sections/quad-model/StepExplanation.vue'
import StepControls from '@/sections/quad-model/StepControls.vue'
import ProbabilityTag from '@/components/ProbabilityTag.vue'
import { useQuadModelStateMachine } from '@/composables/useQuadModelStateMachine'
import { useQuadModelStore } from '@/stores/quadModel'

const {
  state,
  currentTokenIndex,
  currentSubStep,
  currentStepData,
  subSteps,
  startGeneration,
  pause,
  stepForward,
  reset,
} = useQuadModelStateMachine()

const store = useQuadModelStore()

const isPlaying = computed(() => state.value === 'generating')
const isComplete = computed(() => state.value === 'complete')
const displaySteps = computed(() => store.steps.slice(0, currentTokenIndex.value))
</script>

<template>
  <SectionWrapper
    id="quad-model"
    title="四模演武场"
    subtitle="Actor、Reference、Critic、Reward 四模型协作生成"
  >
    <div class="space-y-8">
      <ModelGraph
        :steps="store.steps"
        :current-step="currentTokenIndex"
        :is-playing="isPlaying"
      />

      <div v-if="currentSubStep >= 0 && isPlaying" class="text-center">
        <span
          class="inline-block px-4 py-1 rounded-full text-sm font-medium"
          :style="{ backgroundColor: subSteps[currentSubStep]?.color + '20', color: subSteps[currentSubStep]?.color }"
        >
          {{ subSteps[currentSubStep]?.label }}
        </span>
      </div>

      <TokenSequence
        :steps="displaySteps"
        :current-step="currentTokenIndex"
      />

      <StepExplanation
        :current-step="currentTokenIndex"
        :total-steps="store.steps.length"
        :step-data="currentStepData"
      />

      <div class="flex flex-wrap gap-3 justify-center">
        <ProbabilityTag
          tag="条件概率与采样"
          description="Token生成是从条件概率分布 P(aₜ|sₜ) 中采样，每个token是随机变量的一次实现，采样过程本身就是概率论的核心操作。"
        />
        <ProbabilityTag
          tag="对数概率"
          description="使用 log P(aₜ|sₜ) 代替 P(aₜ|sₜ)，避免连乘下溢，且将乘法变加法便于优化，这是概率计算中的常用技巧。"
        />
      </div>

      <StepControls
        :is-playing="isPlaying"
        :is-complete="isComplete"
        :current-step="currentTokenIndex"
        :total-steps="store.steps.length"
        @play="startGeneration"
        @pause="pause"
        @step-forward="stepForward"
        @reset="reset"
      />
    </div>
  </SectionWrapper>
</template>
