import numpy as np
from app.utils.numeric import round4


def calculate_rewards(
    kl_divs: list[float],
    kl_ctl: float,
    r_global: float,
    is_last_token: list[bool],
) -> list[float]:
    # 来源：算法A3，报告4.3节（DeepSpeed-Chat实现）
    # 当 t ≠ T: R_t = -kl_ctl × kl_div_t
    # 当 t = T: R_t = -kl_ctl × kl_div_t + R_global
    kl_divs_arr = np.array(kl_divs)
    kl_penalties = -kl_ctl * kl_divs_arr
    rewards = kl_penalties.copy()
    for i, is_last in enumerate(is_last_token):
        if is_last:
            rewards[i] += r_global
    return [round4(float(r)) for r in rewards]
