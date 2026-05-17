import type { GenerationEpisode } from '@/types'

export const mockGenerationEpisode: GenerationEpisode = {
  prompt: 'Hello',
  steps: [
    { token: 'I', log_prob: -1.2034, ref_log_prob: -1.1024, kl_div: -0.1010, V_t: 0.4523, V_next: 0.5187, r_t: 0.0101, A_t: 0.0713 },
    { token: 'am', log_prob: -0.8921, ref_log_prob: -0.8543, kl_div: -0.0378, V_t: 0.5187, V_next: 0.4834, r_t: 0.0038, A_t: -0.0363 },
    { token: 'an', log_prob: -1.5234, ref_log_prob: -1.4012, kl_div: -0.1222, V_t: 0.4834, V_next: 0.5512, r_t: 0.0122, A_t: 0.0745 },
    { token: 'AI', log_prob: -0.6543, ref_log_prob: -0.7012, kl_div: 0.0469, V_t: 0.5512, V_next: 0.6234, r_t: -0.0047, A_t: 0.0613 },
    { token: 'model', log_prob: -1.1024, ref_log_prob: -1.0534, kl_div: -0.0490, V_t: 0.6234, V_next: 0.5812, r_t: 0.0049, A_t: -0.0431 },
    { token: 'assistant', log_prob: -0.9234, ref_log_prob: -0.8812, kl_div: -0.0422, V_t: 0.5812, V_next: 0.0000, r_t: 0.7565, A_t: 0.1753 },
  ],
  R_global: 0.7523,
}
