import numpy as np
from app.utils.numeric import round4, check_overflow
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
    epoch: int = 1,
) -> dict:
    kl_ctl = hyperparams.get("kl_ctl", 0.1)
    gamma = hyperparams.get("gamma", 0.99)
    lam = hyperparams.get("lam", 0.95)
    clip_range = hyperparams.get("clip_range", 0.2)
    learning_rate = hyperparams.get("learning_rate", 0.03)
    ppo_epochs = hyperparams.get("ppo_epochs", 3)
    max_tokens = hyperparams.get("max_tokens", 6)

    actor_mean = actor_params["mean"]
    actor_std = actor_params["std"]
    critic_mean = critic_params["mean"]
    ref_mean = ref_params["mean"]
    ref_std = ref_params["std"]

    rng = np.random.default_rng(epoch * 7919 + 31)

    vocab = [
        "I", "am", "an", "AI", "model",
        "assistant", "the", "hello", "world", "deep",
        "learning", "language",
    ]
    vocab_size = len(vocab)

    mean_diff = abs(actor_mean - ref_mean)
    expected_kl = np.log(ref_std / actor_std) + (actor_std**2 + mean_diff**2) / (2 * ref_std**2) - 0.5
    expected_kl = max(0.01, expected_kl)

    kl_divs = []
    for i in range(max_tokens):
        kl_t = expected_kl + rng.normal(0, expected_kl * 0.3)
        kl_t = max(0.001, kl_t)
        kl_divs.append(round4(float(kl_t)))

    avg_kl = round4(sum(kl_divs) / len(kl_divs))

    base_reward = 0.3 + 0.5 * (1 - np.exp(-0.03 * epoch))
    r_global = round4(float(base_reward + rng.normal(0, 0.02)))

    is_last_token = [False] * (max_tokens - 1) + [True]
    rewards = calculate_rewards(kl_divs, kl_ctl, r_global, is_last_token)

    tokens = []
    log_probs = []
    ref_log_probs_list = []
    values = []

    base_logits = rng.normal(0, 1.0, size=(max_tokens, vocab_size))

    rewards_arr = np.array(rewards, dtype=float)
    cum_rewards = np.zeros(max_tokens)
    cum_rewards[-1] = rewards_arr[-1]
    for t in range(max_tokens - 2, -1, -1):
        cum_rewards[t] = rewards_arr[t] + gamma * cum_rewards[t + 1]

    for i in range(max_tokens):
        actor_logits = base_logits[i] * actor_std + actor_mean
        actor_probs = np.exp(actor_logits - np.max(actor_logits))
        actor_probs = actor_probs / actor_probs.sum()
        token_idx = int(rng.choice(vocab_size, p=actor_probs))
        token = vocab[token_idx]
        log_prob = round4(float(np.log(actor_probs[token_idx])))

        ref_log_prob = round4(float(log_prob - kl_divs[i]))

        v_bias = critic_mean - np.mean(cum_rewards)
        v_t = round4(float(cum_rewards[i] + v_bias * 0.3 + rng.normal(0, 0.08)))

        tokens.append(token)
        log_probs.append(log_prob)
        ref_log_probs_list.append(ref_log_prob)
        values.append(v_t)

    old_log_probs = log_probs[:]
    old_values = values[:]

    advantages, returns = compute_gae(rewards, values, gamma, lam)

    current_log_probs = log_probs[:]
    current_values = values[:]

    final_actor_loss = 0.0
    final_critic_loss = 0.0

    for ppo_epoch in range(ppo_epochs):
        actor_loss, ratios, clipped_ratios = calculate_actor_loss(
            current_log_probs, old_log_probs, advantages, clip_range
        )

        critic_loss = calculate_critic_loss(
            current_values, old_values, returns, clip_range
        )

        final_actor_loss = actor_loss
        final_critic_loss = critic_loss

        mean_diff_val = actor_mean - ref_mean
        actor_mean -= mean_diff_val * learning_rate * 0.08
        actor_mean += float(rng.normal(0, 0.003))

        std_diff_val = actor_std - ref_std
        actor_std -= std_diff_val * learning_rate * 0.03
        actor_std = max(0.3, min(2.0, actor_std))

        avg_return = sum(returns) / len(returns) if returns else 0
        critic_diff = critic_mean - avg_return
        critic_mean -= critic_diff * learning_rate * 0.1
        critic_mean += float(rng.normal(0, 0.002))

        lp_shift = -actor_loss * learning_rate * 0.03
        v_shift = -critic_diff * learning_rate * 0.03
        current_log_probs = [
            round4(lp + lp_shift + float(rng.normal(0, learning_rate * 0.003)))
            for lp in current_log_probs
        ]
        current_values = [
            round4(v + v_shift + float(rng.normal(0, learning_rate * 0.002)))
            for v in current_values
        ]

    actor_params["mean"] = round4(actor_mean)
    actor_params["std"] = round4(actor_std)
    critic_params["mean"] = round4(critic_mean)

    avg_reward = round4(sum(rewards) / len(rewards))

    if any(
        check_overflow(v)
        for v in [final_actor_loss, final_critic_loss, avg_kl, avg_reward]
    ):
        raise ArithmeticError("训练计算结果溢出")

    return {
        "actor_loss": final_actor_loss,
        "critic_loss": final_critic_loss,
        "kl_div": avg_kl,
        "reward": avg_reward,
        "advantages": advantages,
        "returns": returns,
    }
