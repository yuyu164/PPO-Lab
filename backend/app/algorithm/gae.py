import numpy as np
from app.utils.numeric import round4, check_overflow


def compute_gae(
    rewards: list[float],
    values: list[float],
    gamma: float = 0.99,
    lam: float = 0.95,
) -> tuple[list[float], list[float]]:
    # 来源：算法C1，知乎文章8.3节
    # δ_t = r_t + γ·V_{t+1} - V_t
    # A_t = δ_t + γ·λ·A_{t+1}
    if len(rewards) != len(values):
        raise ValueError("rewards和values长度必须相同")
    if len(rewards) < 2:
        raise ValueError("序列长度必须≥2")

    rewards_arr = np.array(rewards)
    values_arr = np.array(values)
    length = len(rewards)

    next_values = np.zeros(length)
    next_values[:length - 1] = values_arr[1:]

    deltas = rewards_arr + gamma * next_values - values_arr

    advantages = np.zeros(length)
    last_gae_lam = 0.0
    for t in range(length - 1, -1, -1):
        last_gae_lam = deltas[t] + gamma * lam * last_gae_lam
        advantages[t] = last_gae_lam

    returns_arr = advantages + values_arr

    advantages_list = [round4(float(a)) for a in advantages]
    returns_list = [round4(float(r)) for r in returns_arr]

    if any(check_overflow(a) for a in advantages_list):
        raise ArithmeticError("GAE计算结果溢出")

    return advantages_list, returns_list


def compute_gae_step(
    t: int,
    rewards: list[float],
    values: list[float],
    gamma: float,
    lam: float,
    next_advantage: float = 0.0,
) -> tuple[float, float, dict]:
    # 来源：算法C2
    if t < 0 or t >= len(rewards):
        raise ValueError(f"t={t}超出有效范围[0, {len(rewards)-1}]")

    next_value = values[t + 1] if t < len(values) - 1 else 0.0

    delta = rewards[t] + gamma * next_value - values[t]
    advantage = delta + gamma * lam * next_advantage

    calculation = {
        "td_error": {
            "formula": "δ_t = r_t + γ·V_{t+1} - V_t",
            "substitution": f"δ_{t} = {rewards[t]:.4f} + {gamma}×{next_value:.4f} - {values[t]:.4f}",
            "result": round4(delta),
        },
        "gae": {
            "formula": "A_t = δ_t + γ·λ·A_{t+1}",
            "substitution": f"A_{t} = {delta:.4f} + {gamma}×{lam}×{next_advantage:.4f}",
            "result": round4(advantage),
        },
    }

    return round4(delta), round4(advantage), calculation


def get_variance_bias_interpretation(lam: float) -> dict:
    # 来源：算法C1，知乎文章8.3节
    if lam < 0.3:
        return {
            "bias": "高偏差",
            "variance": "低方差",
            "description": "更信任Critic的估计，采样负担小，但可能引入系统性偏差",
        }
    elif lam <= 0.7:
        return {
            "bias": "中等偏差",
            "variance": "中等方差",
            "description": "在偏差和方差之间取得平衡",
        }
    else:
        return {
            "bias": "低偏差",
            "variance": "高方差",
            "description": "更信任实际采样结果，偏差小但需要更多采样",
        }
