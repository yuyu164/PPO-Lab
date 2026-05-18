<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import SectionWrapper from '@/components/SectionWrapper.vue'
import ChartGrid from '@/sections/training/ChartGrid.vue'
import ParamConsole from '@/sections/training/ParamConsole.vue'
import AchievementSystem from '@/sections/training/AchievementSystem.vue'
import { useTrainingStore } from '@/stores/training'
import { useTrainingController } from '@/composables/useTrainingController'
import { generateTrainingMetrics } from '@/mock/training'
import type { AchievementType } from '@/types'

const store = useTrainingStore()
const controller = useTrainingController()

const allAchievementTypes: AchievementType[] = [
  'first_converge',
  'kl_stable',
  'continuous_improve',
  'precise_tuning',
  'master',
]

let intervalId: ReturnType<typeof setInterval> | null = null

function startSimulation() {
  if (intervalId) return
  store.startTraining()
  intervalId = setInterval(() => {
    if (store.trainingStatus !== 'running') return
    if (store.currentEpoch >= store.maxEpochs) {
      stopSimulation()
      store.trainingStatus = 'completed'
      return
    }
    const epoch = store.currentEpoch + 1
    const metrics = generateTrainingMetrics(epoch)
    store.handleEpochData(metrics)
  }, 500)
}

function stopSimulation() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function handleStart() {
  store.connect()
  startSimulation()
}

function handlePause() {
  store.pauseTraining()
}

function handleResume() {
  store.resumeTraining()
  startSimulation()
}

function handleStep() {
  if (store.currentEpoch >= store.maxEpochs) return
  const epoch = store.currentEpoch + 1
  const metrics = generateTrainingMetrics(epoch)
  store.handleEpochData(metrics)
}

function handleReset() {
  stopSimulation()
  store.resetTraining()
}

onMounted(() => {
  store.loadPresets()
})

onUnmounted(() => {
  stopSimulation()
})
</script>

<template>
  <SectionWrapper
    id="training-simulator"
    title="训练模拟器"
    subtitle="操控完整RLHF-PPO训练过程，观察算法实时行为"
  >
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div class="lg:col-span-3">
        <ChartGrid :metrics="store.history" />
      </div>

      <div class="lg:col-span-2 flex flex-col gap-6">
        <ParamConsole
          :hyperparams="store.hyperparams"
          :presets="store.presets"
          :training-status="store.trainingStatus"
          :current-epoch="store.currentEpoch"
          :max-epochs="store.maxEpochs"
          @update-param="controller.updateParam"
          @select-preset="controller.applyPreset"
          @start="handleStart"
          @pause="handlePause"
          @resume="handleResume"
          @step="handleStep"
          @reset="handleReset"
        />

        <AchievementSystem
          :achievements="store.achievements"
          :all-types="allAchievementTypes"
        />
      </div>
    </div>
  </SectionWrapper>
</template>
