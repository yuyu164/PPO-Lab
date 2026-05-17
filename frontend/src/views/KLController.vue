<script setup lang="ts">
import { onMounted } from 'vue'
import SectionWrapper from '@/components/SectionWrapper.vue'
import DistributionChart from '@/sections/kl-controller/DistributionChart.vue'
import BetaSlider from '@/sections/kl-controller/BetaSlider.vue'
import StatusPanel from '@/sections/kl-controller/StatusPanel.vue'
import FormulaPanel from '@/sections/kl-controller/FormulaPanel.vue'
import { useKlController } from '@/composables/useKlController'

const {
  onBetaChange,
  applyPreset,
} = useKlController()

import { useKlStore } from '@/stores/kl'
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
          @update:model-value="onBetaChange($event, false)"
          @preset-select="applyPreset($event)"
        />
        <StatusPanel :interpretation="klStore.interpretation" />
      </div>
    </div>
  </SectionWrapper>
</template>
