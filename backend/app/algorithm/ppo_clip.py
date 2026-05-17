import numpy as np
from app.utils.numeric import round4, check_overflow


def calculate_actor_loss(
    log_probs: list[float],
    old_log_probs: list[float],
    advantages: list[float],
    clip_range: float = 0.2,
) -> tuple[float, list[float], list[float]]:
    # 来源：算法D1，知乎文章8.5节
    # ratio = exp(log_probs - old_log_probs)
    # unclipped = ratio · A
    # clipped = clip(ratio, 1-ε, 1+ε) · A
    # loss = -mean(min(unclipped, clipped))
    if not (len(log_probs) == len(old_log_probs) == len(advantages)):
        raise ValueError("log_probs、old_log_probs、advantages长度必须相同")

    lp = np.array(log_probs)
    olp = np.array(old_log_probs)
    adv = np.array(advantages)

    ratios = np.exp(lp - olp)
    clipped_ratios = np.clip(ratios, 1 - clip_range, 1 + clip_range)

    unclipped_objectives = ratios * adv
    clipped_objectives = clipped_ratios * adv

    losses = -np.minimum(unclipped_objectives, clipped_objectives)
    actor_loss = round4(float(np.mean(losses)))

    ratios_list = [round4(float(r)) for r in ratios]
    clipped_list = [round4(float(r)) for r in clipped_ratios]

    if check_overflow(actor_loss):
        raise ArithmeticError("Actor Loss计算结果溢出")

    return actor_loss, ratios_list, clipped_list
