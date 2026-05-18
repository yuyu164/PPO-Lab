from app.algorithm.training import ppo_training_step
from app.utils.numeric import check_overflow


class TrainingSession:
    def __init__(self):
        self.state: str = "idle"
        self.current_epoch: int = 0
        self.max_epochs: int = 100
        self.hyperparams: dict = {
            "kl_ctl": 0.1,
            "gamma": 0.99,
            "lam": 0.95,
            "clip_range": 0.2,
            "learning_rate": 0.03,
            "ppo_epochs": 3,
        }
        self.actor_params: dict = {"mean": 0.5, "std": 1.2}
        self.critic_params: dict = {"mean": 0.3, "std": 0.2, "weights": []}
        self.ref_params: dict = {"mean": 0.0, "std": 1.0}
        self.history: list[dict] = []
        self.unlocked_achievements: set[str] = set()

    def reset(self):
        self.state = "idle"
        self.current_epoch = 0
        self.history = []
        self.unlocked_achievements = set()
        self.actor_params = {"mean": 0.5, "std": 1.2}
        self.critic_params = {"mean": 0.3, "std": 0.2, "weights": []}


session = TrainingSession()


def check_achievements(history: list[dict], current: dict) -> list[dict]:
    # 来源：算法D5 — 成就判定
    achievements = []

    if "first_converge" not in session.unlocked_achievements and current["actor_loss"] < 0.5:
        session.unlocked_achievements.add("first_converge")
        achievements.append({
            "achievement": "first_converge",
            "description": "Actor Loss首次降到0.5以下",
            "unlocked_at_epoch": current["epoch"],
        })

    if "kl_stable" not in session.unlocked_achievements and len(history) >= 10:
        recent_kl = [h["kl_div"] for h in history[-10:]]
        if all(0.01 <= kl <= 0.5 for kl in recent_kl):
            session.unlocked_achievements.add("kl_stable")
            achievements.append({
                "achievement": "kl_stable",
                "description": "KL散度连续10个Epoch在合理范围",
                "unlocked_at_epoch": current["epoch"],
            })

    if "continuous_improve" not in session.unlocked_achievements and len(history) >= 5:
        recent_losses = [h["actor_loss"] for h in history[-5:]]
        if all(recent_losses[i] <= recent_losses[i - 1] * 1.05 for i in range(1, len(recent_losses))):
            session.unlocked_achievements.add("continuous_improve")
            achievements.append({
                "achievement": "continuous_improve",
                "description": "Actor Loss连续5个Epoch下降趋势",
                "unlocked_at_epoch": current["epoch"],
            })

    if "precise_tuning" not in session.unlocked_achievements:
        if current["actor_loss"] < 0.3 and current["kl_div"] < 0.5:
            session.unlocked_achievements.add("precise_tuning")
            achievements.append({
                "achievement": "precise_tuning",
                "description": "Actor Loss < 0.3 且 KL散度 < 0.5",
                "unlocked_at_epoch": current["epoch"],
            })

    if "master" not in session.unlocked_achievements:
        if current["actor_loss"] < 0.1 and current["kl_div"] < 0.3 and current["reward"] > 0.5:
            session.unlocked_achievements.add("master")
            achievements.append({
                "achievement": "master",
                "description": "Actor Loss < 0.1 且 KL散度 < 0.3 且 Reward > 0.5",
                "unlocked_at_epoch": current["epoch"],
            })

    return achievements


def execute_one_epoch() -> tuple[dict, list[dict]]:
    session.current_epoch += 1

    metrics = ppo_training_step(
        actor_params=session.actor_params,
        critic_params=session.critic_params,
        ref_params=session.ref_params,
        hyperparams=session.hyperparams,
        epoch=session.current_epoch,
    )

    epoch_data = {
        "epoch": session.current_epoch,
        "actor_loss": metrics["actor_loss"],
        "critic_loss": metrics["critic_loss"],
        "kl_div": metrics["kl_div"],
        "reward": metrics["reward"],
        "advantages": metrics["advantages"],
        "returns": metrics["returns"],
    }
    session.history.append(epoch_data)

    achievements = check_achievements(session.history, epoch_data)

    return epoch_data, achievements
