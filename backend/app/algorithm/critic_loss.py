import numpy as np
from app.utils.numeric import round4, check_overflow


def calculate_critic_loss(
    values: list[float],
    old_values: list[float],
    returns: list[float],
    clip_range_value: float = 0.2,
) -> float:
    # 来源：算法D2，知乎文章8.7节
    # V_t^{CLIP} = clip(V_t^{new}, V_t^{old} - ε, V_t^{old} + ε)
    # L(V_φ) = E_t[max[(V_t^{new} - R_t)², (V_t^{CLIP} - R_t)²]] × 0.5
    if not (len(values) == len(old_values) == len(returns)):
        raise ValueError("values、old_values、returns长度必须相同")

    v = np.array(values)
    ov = np.array(old_values)
    ret = np.array(returns)

    values_clipped = np.clip(v, ov - clip_range_value, ov + clip_range_value)

    vf_loss1 = (v - ret) ** 2
    vf_loss2 = (values_clipped - ret) ** 2

    vf_loss = np.maximum(vf_loss1, vf_loss2)
    critic_loss = round4(float(np.mean(vf_loss) * 0.5))

    if check_overflow(critic_loss):
        raise ArithmeticError("Critic Loss计算结果溢出")

    return critic_loss
