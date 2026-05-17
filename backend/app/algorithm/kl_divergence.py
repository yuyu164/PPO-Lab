import numpy as np
from app.utils.numeric import round4, check_overflow


def calculate_kl_gaussian(
    mu1: float, sigma1: float,
    mu2: float, sigma2: float,
) -> float:
    # 来源：算法B2
    # KL(N1‖N2) = log(σ2/σ1) + (σ1² + (μ1-μ2)²)/(2·σ2²) - 0.5
    if sigma1 <= 0 or sigma2 <= 0:
        raise ValueError("标准差必须大于0")

    ratio = sigma2 / sigma1
    diff = mu1 - mu2
    kl = np.log(ratio) + (sigma1 ** 2 + diff ** 2) / (2 * sigma2 ** 2) - 0.5
    result = round4(float(kl))

    if check_overflow(result):
        raise ArithmeticError("KL散度计算结果溢出")

    return result


def calculate_kl_per_token(
    log_probs: list[float],
    ref_log_probs: list[float],
) -> list[float]:
    # 来源：算法A2，知乎文章8.6节 PPO-Penalty
    # kl_div = log_prob - ref_log_prob
    if len(log_probs) != len(ref_log_probs):
        raise ValueError("log_probs和ref_log_probs长度必须相同")

    lp = np.array(log_probs)
    rlp = np.array(ref_log_probs)
    return [round4(float(v)) for v in (lp - rlp)]


def interpret_beta(beta: float) -> dict:
    # 来源：算法B1，知乎文章8.6节
    if beta < 0.05:
        return {
            "status": "warning",
            "title": "β值过低",
            "description": "KL惩罚过小，Actor可能偏离Reference过远，导致Reward Hacking",
        }
    elif beta <= 0.2:
        return {
            "status": "optimal",
            "title": "理想状态",
            "description": "Actor在探索与约束之间取得平衡",
        }
    else:
        return {
            "status": "locked",
            "title": "约束过强",
            "description": "KL惩罚过大，Actor被过度压制，难以学习",
        }
