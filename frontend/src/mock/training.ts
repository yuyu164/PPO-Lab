import type { TrainingMetrics, TrainingHyperparams } from '@/types'

export function generateTrainingMetrics(epoch: number): TrainingMetrics {
  const noise = () => (Math.random() - 0.5) * 0.06
  const actorLoss = parseFloat((2.0 * Math.exp(-0.15 * epoch) + noise()).toFixed(4))
  const criticLoss = parseFloat((1.5 * Math.exp(-0.12 * epoch) + noise()).toFixed(4))
  const klDiv = parseFloat((0.15 + 0.08 * Math.sin(0.5 * epoch) + noise() * 0.5).toFixed(4))
  const reward = parseFloat((0.3 + 0.5 * (1 - Math.exp(-0.2 * epoch)) + noise() * 0.3).toFixed(4))

  const scale = 1.0 / (1 + 0.15 * (epoch - 1))
  const baseAdvantages = [2.6703, 2.1015, 2.0271, 1.5205, 1.1999, -0.1000]
  const baseValues = [0.4, 0.6, 0.5, 0.3, 0.8, 0.6]

  const advantages = baseAdvantages.map(a =>
    parseFloat((a * scale + noise() * 0.1).toFixed(4))
  )
  const returns = advantages.map((a, i) =>
    parseFloat((a + baseValues[i] * scale).toFixed(4))
  )

  return { epoch, actor_loss: actorLoss, critic_loss: criticLoss, kl_div: klDiv, reward, advantages, returns }
}

export const mockTrainingMetrics: TrainingMetrics[] = Array.from({ length: 10 }, (_, i) =>
  generateTrainingMetrics(i + 1)
)

export const mockTrainingPresets: Record<string, { label: string; params: TrainingHyperparams }> = {
  beginner: {
    label: '新手推荐',
    params: { kl_ctl: 0.1, gamma: 0.99, lam: 0.95, clip_range: 0.2, learning_rate: 0.01, ppo_epochs: 3 },
  },
  standard: {
    label: '标准训练',
    params: { kl_ctl: 0.1, gamma: 0.99, lam: 0.95, clip_range: 0.2, learning_rate: 0.03, ppo_epochs: 3 },
  },
  aggressive: {
    label: '激进探索',
    params: { kl_ctl: 0.01, gamma: 0.99, lam: 0.98, clip_range: 0.3, learning_rate: 0.05, ppo_epochs: 5 },
  },
}

export const mockAchievementDefinitions = [
  { id: 'first_converge', name: '初出茅庐', description: 'Actor Loss首次降到0.5以下', icon: 'Trophy' },
  { id: 'kl_stable', name: 'KL守护者', description: 'KL散度连续10个Epoch稳定在[0.1, 0.3]之间', icon: 'Target' },
  { id: 'continuous_improve', name: '奖励攀升', description: '平均奖励连续20个Epoch持续上升', icon: 'Flame' },
  { id: 'precise_tuning', name: '精准微调', description: 'Actor Loss < 0.3 且 KL散度 < 0.2', icon: 'Award' },
  { id: 'master', name: 'PPO专家', description: 'Actor Loss < 0.1、KL散度 < 0.2、平均奖励 > 0.8', icon: 'Star' },
]
