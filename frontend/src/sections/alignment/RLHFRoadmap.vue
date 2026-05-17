<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  activeStage: number
}>(), {
  activeStage: 0,
})

const emit = defineEmits<{
  stageClick: [index: number]
}>()

const expandedStage = ref<number | null>(null)

const stages = [
  {
    label: 'SFT',
    title: '监督微调',
    description: '使用高质量的人工标注数据，通过监督学习对预训练语言模型进行微调，使其学会遵循指令并生成符合人类期望的回答。这是RLHF流程的起点。',
    color: '#3B82F6',
  },
  {
    label: 'RM',
    title: '奖励模型',
    description: '收集人类对模型输出的偏好排序数据，训练一个奖励模型来预测人类偏好。奖励模型将文本映射为标量分数，作为强化学习的奖励信号来源。',
    color: '#F59E0B',
  },
  {
    label: 'PPO',
    title: '强化学习',
    description: '以奖励模型的评分作为奖励信号，使用PPO算法对SFT模型进行强化学习优化。通过KL散度约束防止模型偏离参考策略过远，平衡奖励最大化与策略稳定性。',
    color: '#22C55E',
  },
]

function onNodeClick(index: number) {
  emit('stageClick', index)
  expandedStage.value = expandedStage.value === index ? null : index
}

const expandedDescription = computed(() => {
  if (expandedStage.value === null) return null
  return stages[expandedStage.value]
})
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <div class="flex items-center gap-0">
      <template v-for="(stage, i) in stages" :key="i">
        <button
          class="flex flex-col items-center gap-2 px-6 py-4 rounded-xl transition-all duration-300 cursor-pointer"
          :class="[
            i === activeStage ? 'opacity-100' : 'opacity-50',
            expandedStage === i ? 'ring-2' : '',
          ]"
          :style="{
            '--tw-ring-color': stage.color,
            borderColor: expandedStage === i ? stage.color : 'transparent',
            borderWidth: '2px',
            borderStyle: 'solid',
            backgroundColor: expandedStage === i ? `${stage.color}10` : 'transparent',
          }"
          @click="onNodeClick(i)"
        >
          <div
            class="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300"
            :style="{
              backgroundColor: i === activeStage ? stage.color : `${stage.color}30`,
              color: i === activeStage ? '#fff' : stage.color,
              boxShadow: i === activeStage ? `0 0 20px ${stage.color}40` : 'none',
            }"
          >
            {{ stage.label }}
          </div>
          <span class="text-sm font-medium text-text-primary">{{ stage.title }}</span>
        </button>

        <ChevronRight
          v-if="i < stages.length - 1"
          :size="24"
          class="text-text-weak mx-2"
        />
      </template>
    </div>

    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-40"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-40"
      leave-to-class="opacity-0 max-h-0"
    >
      <div
        v-if="expandedDescription"
        class="w-full max-w-2xl overflow-hidden rounded-xl border border-border p-5"
        :style="{ backgroundColor: `${expandedDescription.color}08`, borderColor: `${expandedDescription.color}30` }"
      >
        <div class="flex items-center gap-2 mb-2">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            :style="{ backgroundColor: expandedDescription.color, color: '#fff' }"
          >
            {{ expandedDescription.label }}
          </div>
          <span class="font-semibold text-text-primary">{{ expandedDescription.title }}</span>
        </div>
        <p class="text-sm text-text-secondary leading-relaxed">
          {{ expandedDescription.description }}
        </p>
      </div>
    </Transition>
  </div>
</template>
