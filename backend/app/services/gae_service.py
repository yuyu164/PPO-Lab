from app.algorithm.gae import compute_gae, compute_gae_step, get_variance_bias_interpretation
from app.models.gae import GAEStep, GAEResult, VarianceBiasResult, StepCalculation


def compute_gae_full(
    tokens: list[str],
    rewards: list[float],
    values: list[float],
    gamma: float = 0.99,
    lam: float = 0.95,
) -> dict:
    if len(tokens) != len(rewards) or len(rewards) != len(values):
        raise ValueError("tokens、rewards、values长度必须相同")

    # 来源：算法C1 — GAE完整计算
    advantages, returns = compute_gae(rewards, values, gamma, lam)

    # 构建步骤列表（从后向前回溯顺序）
    steps = []
    length = len(rewards)
    next_advantage = 0.0
    for t in range(length - 1, -1, -1):
        next_value = values[t + 1] if t < length - 1 else 0.0
        delta = rewards[t] + gamma * next_value - values[t]
        advantage = delta + gamma * lam * next_advantage
        next_advantage = advantage

        steps.append(GAEStep(
            t=t,
            token=tokens[t],
            r_t=round(rewards[t], 4),
            V_t=round(values[t], 4),
            V_next=round(next_value, 4),
            delta=round(delta, 4),
            A_t=round(advantage, 4),
            is_positive=advantage > 0,
        ))

    # 来源：算法C1 — 方差-偏差解读
    vb = get_variance_bias_interpretation(lam)
    variance_bias = VarianceBiasResult(
        bias=vb["bias"],
        variance=vb["variance"],
        description=vb["description"],
    )

    result = GAEResult(
        steps=steps,
        advantages=advantages,
        returns=returns,
        gamma=gamma,
        **{"lambda": lam},
        variance_bias=variance_bias,
    )

    return result.model_dump(by_alias=True)


def step_gae(
    t: int,
    tokens: list[str],
    rewards: list[float],
    values: list[float],
    gamma: float,
    lam: float,
    next_advantage: float = 0.0,
) -> dict:
    # 来源：算法C2 — 单步GAE计算
    delta, advantage, calculation = compute_gae_step(
        t, rewards, values, gamma, lam, next_advantage,
    )

    next_value = values[t + 1] if t < len(values) - 1 else 0.0

    step = GAEStep(
        t=t,
        token=tokens[t],
        r_t=round(rewards[t], 4),
        V_t=round(values[t], 4),
        V_next=round(next_value, 4),
        delta=delta,
        A_t=advantage,
        is_positive=advantage > 0,
    )

    calc = StepCalculation(
        step=t,
        formulas=calculation,
        is_positive=advantage > 0,
    )

    return {
        "step": step.model_dump(),
        "calculation": calc.model_dump(),
    }
