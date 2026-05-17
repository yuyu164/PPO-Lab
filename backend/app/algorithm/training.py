import numpy as np
from app.utils.numeric import round4, check_overflow
from app.algorithm.token_generation import generate_token_log_probs, generate_ref_log_prob
from app.algorithm.kl_divergence import calculate_kl_per_token
from app.algorithm.reward import calculate_rewards
from app.algorithm.gae import compute_gae
from app.algorithm.ppo_clip import calculate_actor_loss
from app.algorithm.critic_loss import calculate_critic_loss


def ppo_training_step(
    actor_params: dict,
    critic_params: dict,
    ref_params: dict,
    hyperparams: dict,
) -> dict:
    # 来源：算法D4，知乎文章第8节
    kl_ctl = hyperparams.get("kl_ctl", 0.1)
    gamma = hyperparams.get("gamma", 0.99)
    lam = hyperparams.get("lam", 0.95)
    clip_range = hyperparams.get("clip_range", 0.2)
    learning_rate = hyperparams.get("learning_rate", 0.03)
    ppo_epochs = hyperparams.get("ppo_epochs", 3)
    max_tokens = hyperparams.get("max_tokens", 6)

    # 1. 生成经验
    tokens = []
    log_probs = []
    ref_log_probs_list = []
    values = []
    r_global = round4(float(np.random.uniform(0.5, 1.0)))

    for i in range(max_tokens):
        token, log_prob = generate_token_log_probs(tokens, actor_params)
        ref_log_prob = generate_ref_log_prob(token, ref_params)

        v_t = round4(
            critic_params.get("mean", 0.5)
            + float(np.random.normal(0, 0.1))
        )

        tokens.append(token)
        log_probs.append(log_prob)
        ref_log_probs_list.append(ref_log_prob)
        values.append(v_t)

    # 2. 保存old值（来源：知乎文章8.2节重要性采样）
    old_log_probs = log_probs[:]
    old_values = values[:]

    # 3. 计算KL散度
    kl_divs = calculate_kl_per_token(log_probs, ref_log_probs_list)
    avg_kl = round4(sum(kl_divs) / len(kl_divs))

    # 4. 计算Reward
    is_last_token = [False] * (max_tokens - 1) + [True]
    rewards = calculate_rewards(kl_divs, kl_ctl, r_global, is_last_token)

    # 5. GAE计算
    advantages, returns = compute_gae(rewards, values, gamma, lam)

    # 6. PPO多轮更新
    current_log_probs = log_probs[:]
    current_values = values[:]

    for epoch in range(ppo_epochs):
        actor_loss, ratios, clipped_ratios = calculate_actor_loss(
            current_log_probs, old_log_probs, advantages, clip_range
        )
        critic_loss = calculate_critic_loss(
            current_values, old_values, returns, clip_range
        )

        # 来源：算法D5 — 参数更新（简化模拟）
        actor_params["mean"] -= actor_loss * learning_rate * 0.01
        actor_params["std"] = max(0.1, actor_params["std"] - abs(actor_loss) * learning_rate * 0.001)

        current_log_probs = [
            round4(lp + float(np.random.normal(0, learning_rate * 0.5)))
            for lp in current_log_probs
        ]
        current_values = [
            round4(v + float(np.random.normal(0, learning_rate * 0.3)))
            for v in current_values
        ]

    # 7. 计算平均Reward
    avg_reward = round4(sum(rewards) / len(rewards))

    if any(check_overflow(v) for v in [actor_loss, critic_loss, avg_kl, avg_reward]):
        raise ArithmeticError("训练计算结果溢出")

    return {
        "actor_loss": actor_loss,
        "critic_loss": critic_loss,
        "kl_div": avg_kl,
        "reward": avg_reward,
        "advantages": advantages,
        "returns": returns,
    }
