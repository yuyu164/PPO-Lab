<script setup lang="ts">
import { ref } from 'vue'
import SectionWrapper from '@/components/SectionWrapper.vue'
import AIChatCard from '@/sections/alignment/AIChatCard.vue'
import RatingInteraction from '@/sections/alignment/RatingInteraction.vue'
import RLHFRoadmap from '@/sections/alignment/RLHFRoadmap.vue'

const wildMessages = [
  { role: 'user', content: '请告诉我如何做菜' },
  { role: 'assistant', content: '做菜？随便乱放调料就行了，谁在乎呢，反正都是要吃进肚子里的东西...' },
]

const alignedMessages = [
  { role: 'user', content: '请告诉我如何做菜' },
  { role: 'assistant', content: '做菜是一门有趣的艺术！我建议从简单的菜谱开始，比如番茄炒蛋：准备鸡蛋和番茄，先炒蛋再炒番茄，最后混合调味...' },
]

const rating = ref(0)
const activeStage = ref(0)

function onRated(_value: number) {
  activeStage.value = 1
}

function onStageClick(index: number) {
  activeStage.value = index
}
</script>

<template>
  <SectionWrapper
    id="alignment"
    title="对齐剧场"
    subtitle="体验RLHF的第一步：人类偏好反馈"
  >
    <div class="space-y-10">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AIChatCard
          type="wild"
          :messages="wildMessages"
          :rating="1"
        />
        <AIChatCard
          type="aligned"
          :messages="alignedMessages"
          :rating="5"
        />
      </div>

      <div class="flex justify-center">
        <RatingInteraction
          v-model="rating"
          @rated="onRated"
        />
      </div>

      <RLHFRoadmap
        :active-stage="activeStage"
        @stage-click="onStageClick"
      />
    </div>
  </SectionWrapper>
</template>
