from app.utils.numeric import round4


def calculate_returns(
    advantages: list[float],
    old_values: list[float],
) -> list[float]:
    # 来源：算法D3，知乎文章8.7节
    # R_t = A_t^{GAE} + V_t^{old}
    if len(advantages) != len(old_values):
        raise ValueError("advantages和old_values长度必须相同")

    return [round4(adv + val) for adv, val in zip(advantages, old_values)]
