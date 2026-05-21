<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import SectionWrapper from '@/components/SectionWrapper.vue'
import ChartGrid from '@/sections/training/ChartGrid.vue'
import ParamConsole from '@/sections/training/ParamConsole.vue'
import AchievementSystem from '@/sections/training/AchievementSystem.vue'
import ProbabilityTag from '@/components/ProbabilityTag.vue'
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
        <div class="flex flex-wrap gap-3 mb-4">
          <ProbabilityTag
            tag="重要性采样"
            description="PPO的ratio = π_θ(a|s)/π_old(a|s) 是重要性采样权重，用旧策略下的样本来估计新策略的期望，是概率论中重要性采样的典型应用。"
          />
          <ProbabilityTag
            tag="随机梯度下降"
            description="训练使用SGD/Adam优化器，本质是对期望损失函数的随机近似，每次用小批量样本估计梯度，是概率论中蒙特卡洛方法的思想。"
          />
          <ProbabilityTag
            tag="大数定律"
            description="训练收敛的理论保证：当样本量足够大时，经验损失趋近于真实期望损失，这是概率论大数定律在优化中的体现。"
          />
        </div>
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
