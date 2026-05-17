<script setup lang="ts">
import { computed } from 'vue'
import type { TrainingMetrics } from '@/types'
import ActorLossChart from './ActorLossChart.vue'
import CriticLossChart from './CriticLossChart.vue'
import KLDivergenceChart from './KLDivergenceChart.vue'
import RewardChart from './RewardChart.vue'
import ReturnsChart from './ReturnsChart.vue'
import AdvantageDistChart from './AdvantageDistChart.vue'
import QualityHeatmap from './QualityHeatmap.vue'

const props = defineProps<{
  metrics: TrainingMetrics[]
}>()

const actorLossData = computed(() =>
  props.metrics.map(m => ({ epoch: m.epoch, value: m.actor_loss }))
)

const criticLossData = computed(() =>
  props.metrics.map(m => ({ epoch: m.epoch, value: m.critic_loss }))
)

const klDivData = computed(() =>
  props.metrics.map(m => ({ epoch: m.epoch, value: m.kl_div }))
)

const rewardData = computed(() =>
  props.metrics.map(m => ({ epoch: m.epoch, value: m.reward }))
)

const returnsData = computed(() =>
  props.metrics.map(m => ({
    epoch: m.epoch,
    value: m.returns.reduce((a, b) => a + b, 0) / m.returns.length,
  }))
)

const latestAdvantages = computed(() =>
  props.metrics.length > 0 ? props.metrics[props.metrics.length - 1].advantages : []
)

const heatmapData = computed(() => {
  if (props.metrics.length === 0) return []
  return props.metrics.map(m => {
    const row = [...m.returns]
    while (row.length < 5) row.push(0)
    return row.slice(0, 5)
  })
})
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <div class="rounded-xl border border-border bg-bg-secondary/50 p-3">
      <ActorLossChart :data="actorLossData" />
    </div>
    <div class="rounded-xl border border-border bg-bg-secondary/50 p-3">
      <CriticLossChart :data="criticLossData" />
    </div>
    <div class="rounded-xl border border-border bg-bg-secondary/50 p-3">
      <KLDivergenceChart :data="klDivData" />
    </div>
    <div class="rounded-xl border border-border bg-bg-secondary/50 p-3">
      <RewardChart :data="rewardData" />
    </div>
    <div class="rounded-xl border border-border bg-bg-secondary/50 p-3">
      <ReturnsChart :data="returnsData" />
    </div>
    <div class="rounded-xl border border-border bg-bg-secondary/50 p-3">
      <AdvantageDistChart :advantages="latestAdvantages" />
    </div>
    <div class="rounded-xl border border-border bg-bg-secondary/50 p-3 col-span-2">
      <QualityHeatmap :data="heatmapData" />
    </div>
  </div>
</template>
