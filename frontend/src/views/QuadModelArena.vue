<script setup lang="ts">
import { computed } from 'vue'
import SectionWrapper from '@/components/SectionWrapper.vue'
import ModelGraph from '@/sections/quad-model/ModelGraph.vue'
import TokenSequence from '@/sections/quad-model/TokenSequence.vue'
import StepExplanation from '@/sections/quad-model/StepExplanation.vue'
import StepControls from '@/sections/quad-model/StepControls.vue'
import { useQuadModelStateMachine } from '@/composables/useQuadModelStateMachine'

const {
  state,
  currentTokenIndex,
  currentSubStep,
  canStart,
  canPause,
  canReset,
  canStepForward,
  hasMoreSteps,
  currentStepData,
  subSteps,
  startGeneration,
  pause,
  resume,
  stepForward,
  reset,
} = useQuadModelStateMachine()

const isPlaying = computed(() => state.value === 'generating')
const isComplete = computed(() => state.value === 'complete')
const steps = computed(() => {
  if (!currentStepData.value) return []
  const store = useQuadModelStateMachine()
  return []
})

import { useQuadModelStore } from '@/stores/quadModel'
const store = useQuadModelStore()
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
