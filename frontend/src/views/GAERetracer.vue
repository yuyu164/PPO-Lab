<script setup lang="ts">
import SectionWrapper from '@/components/SectionWrapper.vue'
import TokenBar from '@/sections/gae-retracer/TokenBar.vue'
import AdvantageChart from '@/sections/gae-retracer/AdvantageChart.vue'
import CalculationPanel from '@/sections/gae-retracer/CalculationPanel.vue'
import ParamControls from '@/sections/gae-retracer/ParamControls.vue'
import VarianceBiasIndicator from '@/sections/gae-retracer/VarianceBiasIndicator.vue'
import ProbabilityTag from '@/components/ProbabilityTag.vue'
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
          :current-step="tracer.currentTraceStep.value"
          :calculation="store.currentStepCalc"
        />
      </div>

      <div class="lg:col-span-2 space-y-6">
        <ParamControls
          :gamma="store.gamma"
          :lambda="store.lambda"
          :speed="tracer.speed.value"
          :is-playing="tracer.traceState.value === 'tracing'"
          :can-start="tracer.canStart.value"
          :can-pause="tracer.canPause.value"
          :can-resume="tracer.canResume.value"
          :can-reset="tracer.canReset.value"
          @update:gamma="store.setGamma"
          @update:lambda="store.setLambda"
          @update:speed="tracer.setSpeed"
          @play="tracer.startTrace"
          @pause="tracer.pause"
          @step="tracer.stepOnce"
          @reset="tracer.reset"
        />
        <div class="flex flex-wrap gap-3">
          <ProbabilityTag
            tag="偏差-方差权衡"
            description="GAE中λ控制偏差与方差的平衡：λ→0高偏差低方差（类似TD），λ→1低偏差高方差（类似MC），这是概率论中估计量的核心性质。"
          />
          <ProbabilityTag
            tag="马尔可夫性"
            description="GAE依赖马尔可夫假设：未来状态只依赖当前状态，与历史无关，即 P(s₊₁|sₜ,aₜ,...) = P(s₊₁|sₜ,aₜ)。"
          />
          <ProbabilityTag
            tag="递推期望"
            description="GAE递推公式 Aₜ = δₜ + γλAₜ₊₁ 本质是条件期望的递推计算，利用动态规划求解，是概率论中递推思想的体现。"
          />
        </div>
        <VarianceBiasIndicator
          v-if="store.result?.variance_bias"
          :lambda="store.lambda"
          :result="store.result.variance_bias"
        />
      </div>
    </div>
  </SectionWrapper>
</template>
