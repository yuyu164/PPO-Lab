import numpy as np
from app.utils.numeric import round4
from app.algorithm.token_generation import generate_token_log_probs, generate_ref_log_prob
from app.algorithm.kl_divergence import calculate_kl_per_token
from app.algorithm.reward import calculate_rewards
from app.models.quad_model import TokenStep, GenerationEpisode


def generate_episode(
    prompt: str,
    actor_params: dict | None = None,
    ref_params: dict | None = None,
    kl_ctl: float = 0.1,
    max_tokens: int = 6,
    gamma: float = 0.99,
) -> GenerationEpisode:
    if actor_params is None:
        actor_params = {"mean": 0.0, "std": 1.0}
    if ref_params is None:
        ref_params = {"mean": 0.0, "std": 1.0}

    tokens = []
    log_probs = []
    ref_log_probs_list = []
    values = []
    r_global = round4(float(np.random.uniform(0.5, 1.0)))

    for i in range(max_tokens):
        token, log_prob = generate_token_log_probs(tokens, actor_params)
        ref_log_prob = generate_ref_log_prob(token, ref_params)

        v_t = round4(0.5 + float(np.random.normal(0, 0.1)))
        v_next = round4(0.5 + float(np.random.normal(0, 0.1))) if i < max_tokens - 1 else 0.0

        tokens.append(token)
        log_probs.append(log_prob)
        ref_log_probs_list.append(ref_log_prob)
        values.append(v_t)

    # 来源：算法A2 — KL散度计算
    kl_divs = calculate_kl_per_token(log_probs, ref_log_probs_list)

    # 来源：算法A3 — Reward计算
    is_last_token = [False] * (max_tokens - 1) + [True]
    rewards = calculate_rewards(kl_divs, kl_ctl, r_global, is_last_token)

    # 来源：算法A5 — 优势函数计算
    steps = []
    for i in range(max_tokens):
        v_next = values[i + 1] if i < max_tokens - 1 else 0.0
        td_error = rewards[i] + gamma * v_next - values[i]
        advantage = round4(td_error)

        steps.append(TokenStep(
            token=tokens[i],
            log_prob=log_probs[i],
            ref_log_prob=ref_log_probs_list[i],
            kl_div=kl_divs[i],
            V_t=values[i],
            V_next=v_next,
            r_t=rewards[i],
            A_t=advantage,
        ))

    return GenerationEpisode(prompt=prompt, steps=steps, R_global=r_global)


def step_forward(
    prompt: str,
    current_tokens: list[str] | None = None,
    actor_params: dict | None = None,
    ref_params: dict | None = None,
    kl_ctl: float = 0.1,
    gamma: float = 0.99,
    max_tokens: int = 6,
) -> tuple[TokenStep, bool]:
    if current_tokens is None:
        current_tokens = []
    if actor_params is None:
        actor_params = {"mean": 0.0, "std": 1.0}
    if ref_params is None:
        ref_params = {"mean": 0.0, "std": 1.0}

    # 来源：算法A1 — Token生成
    token, log_prob = generate_token_log_probs(current_tokens, actor_params)
    ref_log_prob = generate_ref_log_prob(token, ref_params)

    # 来源：算法A2 — KL散度
    kl_divs = calculate_kl_per_token([log_prob], [ref_log_prob])
    kl_div = kl_divs[0]

    # 来源：算法A4 — Critic预测
    v_t = round4(0.5 + float(np.random.normal(0, 0.1)))
    v_next = round4(0.5 + float(np.random.normal(0, 0.1)))

    is_last = len(current_tokens) >= max_tokens - 1
    r_global = round4(float(np.random.uniform(0.5, 1.0))) if is_last else 0.0

    # 来源：算法A3 — Reward
    rewards = calculate_rewards([kl_div], kl_ctl, r_global, [is_last])
    r_t = rewards[0]

    # 来源：算法A5 — 优势
    advantage = round4(r_t + gamma * v_next - v_t)

    step = TokenStep(
        token=token,
        log_prob=log_prob,
        ref_log_prob=ref_log_prob,
        kl_div=kl_div,
        V_t=v_t,
        V_next=v_next,
        r_t=r_t,
        A_t=advantage,
    )

    return step, is_last
