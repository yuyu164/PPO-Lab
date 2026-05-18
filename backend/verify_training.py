import sys
sys.path.insert(0, ".")

from app.algorithm.training import ppo_training_step

actor_params = {"mean": 0.5, "std": 1.2}
critic_params = {"mean": 0.3}
ref_params = {"mean": 0.0, "std": 1.0}
hyperparams = {
    "kl_ctl": 0.1,
    "gamma": 0.99,
    "lam": 0.95,
    "clip_range": 0.2,
    "learning_rate": 0.03,
    "ppo_epochs": 3,
    "max_tokens": 6,
}

print(f"{'Epoch':>5} | {'ActorLoss':>10} | {'CriticLoss':>11} | {'KL':>8} | {'Reward':>8} | {'Adv+':>5} | {'Adv-':>5} | {'ActorMean':>10} | {'CriticMean':>11}")
print("-" * 100)

actor_losses = []
critic_losses = []
rewards_list = []

for epoch in range(1, 51):
    result = ppo_training_step(actor_params, critic_params, ref_params, hyperparams, epoch)
    
    adv_pos = sum(1 for a in result["advantages"] if a > 0)
    adv_neg = sum(1 for a in result["advantages"] if a < 0)
    
    actor_losses.append(result["actor_loss"])
    critic_losses.append(result["critic_loss"])
    rewards_list.append(result["reward"])
    
    print(f"{epoch:>5} | {result['actor_loss']:>10.4f} | {result['critic_loss']:>11.4f} | {result['kl_div']:>8.4f} | {result['reward']:>8.4f} | {adv_pos:>5} | {adv_neg:>5} | {actor_params['mean']:>10.4f} | {critic_params['mean']:>11.4f}")

print("\n=== Summary ===")
print(f"Actor Loss:  first5 avg={sum(actor_losses[:5])/5:.4f}  last5 avg={sum(actor_losses[-5:])/5:.4f}  trend={'DOWN' if sum(actor_losses[-5:])/5 < sum(actor_losses[:5])/5 else 'UP/FLAT'}")
print(f"Critic Loss: first5 avg={sum(critic_losses[:5])/5:.4f}  last5 avg={sum(critic_losses[-5:])/5:.4f}  trend={'DOWN' if sum(critic_losses[-5:])/5 < sum(critic_losses[:5])/5 else 'UP/FLAT'}")
print(f"Reward:      first5 avg={sum(rewards_list[:5])/5:.4f}  last5 avg={sum(rewards_list[-5:])/5:.4f}  trend={'UP' if sum(rewards_list[-5:])/5 > sum(rewards_list[:5])/5 else 'DOWN/FLAT'}")
