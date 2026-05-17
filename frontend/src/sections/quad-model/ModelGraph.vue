<script setup lang="ts">
import type { TokenStep } from '@/types'
import ModelNode from '@/components/ModelNode.vue'

defineProps<{
  steps: TokenStep[]
  currentStep: number
  isPlaying: boolean
}>()

defineEmits<{
  modelClick: [name: string]
}>()

const models = [
  { name: 'Actor', role: '演员模型', color: '#3B82F6', description: '生成Token的策略网络' },
  { name: 'Reference', role: '参考模型', color: '#F59E0B', description: '固定的参考策略，用于KL约束' },
  { name: 'Critic', role: '评论家', color: '#A78BFA', description: '预测状态价值函数V(s)' },
  { name: 'Reward', role: '奖励模型', color: '#34D399', description: '评估输出质量，计算即时奖励' },
]
</script>

<template>
  <div class="relative flex flex-wrap justify-center gap-8 py-8">
    <ModelNode
      v-for="model in models"
      :key="model.name"
      :name="model.name"
      :role="model.role"
      :color="model.color"
      :is-active="isPlaying"
      :description="model.description"
      @click="$emit('modelClick', model.name)"
    />
  </div>
</template>
