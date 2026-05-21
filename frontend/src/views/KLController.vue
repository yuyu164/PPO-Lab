<script setup lang="ts">
import { onMounted } from 'vue'
import SectionWrapper from '@/components/SectionWrapper.vue'
import DistributionChart from '@/sections/kl-controller/DistributionChart.vue'
import BetaSlider from '@/sections/kl-controller/BetaSlider.vue'
import StatusPanel from '@/sections/kl-controller/StatusPanel.vue'
import FormulaPanel from '@/sections/kl-controller/FormulaPanel.vue'
import ProbabilityTag from '@/components/ProbabilityTag.vue'
import { useKlController } from '@/composables/useKlController'
import { useKlStore } from '@/stores/kl'

const { onBetaChange, applyPreset } = useKlController()
const klStore = useKlStore()

onMounted(async () => {
  await klStore.calculateKL()
})
</script>

<template>
  <SectionWrapper
    id="kl-controller"
    title="KL散度调节器"
    subtitle="调节β值，理解KL约束对模型行为的影响"
  >
    <div class="grid md:grid-cols-2 gap-8">
      <div class="space-y-6">
        <div class="flex flex-wrap gap-3">
          <ProbabilityTag
            tag="KL散度"
            description="D_KL(P‖Q) = ∫P(x)log(P(x)/Q(x))dx，衡量两个概率分布的距离，是信息论与概率论的核心概念。KL散度非负且不对称。"
          />
          <ProbabilityTag
            tag="正态分布"
            description="Actor和Reference均建模为高斯分布 N(μ,σ²)，其PDF为 f(x) = (1/σ√2π)exp(-(x-μ)²/2σ²)，是概率论中最重要的连续分布。"
          />
          <ProbabilityTag
            tag="期望"
            description="KL散度本质是期望：E_P[log(P/Q)]，即在对数似然比下对分布P取期望，是概率论中期望运算的典型应用。"
          />
        </div>
        <DistributionChart
          :ref-curve="klStore.refCurve"
          :actor-curve="klStore.actorCurve"
          :kl-divergence="klStore.klDivergence"
          :overlap-area="klStore.overlapArea"
        />
        <FormulaPanel
          :beta="klStore.beta"
          :formula="klStore.formula"
        />
      </div>

      <div class="space-y-6">
        <BetaSlider
          :model-value="klStore.beta"
          @update:model-value="onBetaChange($event)"
          @preset-select="applyPreset($event)"
        />
        <StatusPanel :interpretation="klStore.interpretation" />
      </div>
    </div>
  </SectionWrapper>
</template>
