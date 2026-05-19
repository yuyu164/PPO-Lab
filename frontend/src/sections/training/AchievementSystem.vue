<script setup lang="ts">
import { computed } from 'vue'
import type { AchievementUnlock, AchievementType } from '@/types'
import AchievementBadge from '@/components/AchievementBadge.vue'

const ACHIEVEMENT_DEFS = [
  { type: 'first_converge' as AchievementType, name: '初出茅庐', description: 'Actor Loss首次降到0.5以下' },
  { type: 'kl_stable' as AchievementType, name: 'KL守护者', description: 'KL散度连续10个Epoch稳定在[0.1, 0.3]之间' },
  { type: 'continuous_improve' as AchievementType, name: '奖励攀升', description: '平均奖励连续20个Epoch持续上升' },
  { type: 'precise_tuning' as AchievementType, name: '精准微调', description: 'Actor Loss < 0.3 且 KL散度 < 0.2' },
  { type: 'master' as AchievementType, name: 'PPO专家', description: 'Actor Loss < 0.1、KL散度 < 0.2、平均奖励 > 0.8' },
]

const props = defineProps<{
  achievements: AchievementUnlock[]
  allTypes: AchievementType[]
}>()

const unlockedSet = computed(() => new Set(props.achievements.map(a => a.achievement)))

const unlockedCount = computed(() => props.achievements.length)

function getUnlockEpoch(type: AchievementType): number | undefined {
  const match = props.achievements.find(a => a.achievement === type)
  return match ? match.unlocked_at_epoch : undefined
}


</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="text-sm text-text-secondary">
      已解锁 <span class="text-text-primary font-medium">{{ unlockedCount }}</span>/5
    </div>
    <div class="flex flex-wrap gap-4">
      <AchievementBadge
        v-for="def in ACHIEVEMENT_DEFS"
        :key="def.type"
        :type="def.type"
        :unlocked="unlockedSet.has(def.type)"
        :description="def.description"
        :epoch="getUnlockEpoch(def.type)"
      />
    </div>
  </div>
</template>
