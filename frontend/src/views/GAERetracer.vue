<script setup lang="ts">
import SectionWrapper from '@/components/SectionWrapper.vue'
import TokenBar from '@/sections/gae-retracer/TokenBar.vue'
import AdvantageChart from '@/sections/gae-retracer/AdvantageChart.vue'
import CalculationPanel from '@/sections/gae-retracer/CalculationPanel.vue'
import ParamControls from '@/sections/gae-retracer/ParamControls.vue'
import VarianceBiasIndicator from '@/sections/gae-retracer/VarianceBiasIndicator.vue'
import { useGaeStore } from '@/stores/gae'
import { useGaeTracer } from '@/composables/useGaeTracer'

const store = useGaeStore()
const tracer = useGaeTracer()
</script>

<template>
  <SectionWrapper
    id="gae-retracer"
    title="GAE回溯器"
    subtitle="从后向前回溯：广义优势估计的动态规划过程"
  >
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div class="lg:col-span-3 space-y-6">
        <TokenBar
          :steps="store.result?.steps || []"
          :current-trace-index="store.currentTraceIndex"
          @token-click="() => {}"
        />
        <AdvantageChart
          :steps="store.result?.steps || []"
          :current-trace-index="store.currentTraceIndex"
        />
        <CalculationPanel
          :current-step="tracer.currentTraceStep"
          :calculation="store.currentStepCalc"
        />
      </div>

      <div class="lg:col-span-2 space-y-6">
        <ParamControls
          :gamma="store.gamma"
          :lambda="store.lambda"
          :speed="tracer.speed"
          :is-playing="tracer.traceState === 'tracing'"
          :can-start="tracer.canStart"
          :can-pause="tracer.canPause"
          :can-resume="tracer.canResume"
          :can-reset="tracer.canReset"
          @update:gamma="store.setGamma"
          @update:lambda="store.setLambda"
          @update:speed="tracer.setSpeed"
          @play="tracer.startTrace"
          @pause="tracer.pause"
          @step="tracer.stepOnce"
          @reset="tracer.reset"
        />
        <VarianceBiasIndicator
          v-if="store.result?.variance_bias"
          :lambda="store.lambda"
          :result="store.result.variance_bias"
        />
      </div>
    </div>
  </SectionWrapper>
</template>
