from pydantic import BaseModel, Field
from enum import Enum


class TrainingHyperparams(BaseModel):
    kl_ctl: float = Field(0.1, ge=0.01, le=1.0, description="KL惩罚系数β")
    gamma: float = Field(0.99, ge=0.9, le=1.0, description="折扣因子")
    lam: float = Field(0.95, ge=0.0, le=1.0, description="GAE权衡因子λ")
    clip_range: float = Field(0.2, ge=0.05, le=0.5, description="PPO clip范围ε")
    learning_rate: float = Field(0.03, gt=0, le=0.1, description="学习率")
    ppo_epochs: int = Field(3, ge=1, le=10, description="PPO迭代轮数")


class TrainingMetrics(BaseModel):
    epoch: int = Field(..., ge=0, description="当前Epoch")
    actor_loss: float = Field(..., description="Actor Loss")
    critic_loss: float = Field(..., description="Critic Loss")
    kl_div: float = Field(..., ge=0, description="平均KL散度")
    reward: float = Field(..., description="平均奖励")
    advantages: list[float] = Field(..., description="优势函数数组")
    returns: list[float] = Field(..., description="Returns数组")


class AchievementType(str, Enum):
    FIRST_CONVERGE = "first_converge"
    KL_STABLE = "kl_stable"
    CONTINUOUS_IMPROVE = "continuous_improve"
    PRECISE_TUNING = "precise_tuning"
    MASTER = "master"


class AchievementUnlock(BaseModel):
    achievement: AchievementType
    description: str
    unlocked_at_epoch: int


class PresetEnum(str, Enum):
    BEGINNER = "beginner"
    STANDARD = "standard"
    AGGRESSIVE = "aggressive"
