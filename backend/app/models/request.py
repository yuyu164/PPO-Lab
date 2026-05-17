from pydantic import BaseModel, Field
from typing import Optional


class ModelParams(BaseModel):
    mean: float = Field(0.0, description="均值")
    std: float = Field(1.0, gt=0, description="标准差")


class GenerateEpisodeRequest(BaseModel):
    prompt: str = Field(..., description="输入提示词")
    actor_params: Optional[ModelParams] = Field(default_factory=lambda: ModelParams())
    ref_params: Optional[ModelParams] = Field(default_factory=lambda: ModelParams())
    kl_ctl: float = Field(0.1, ge=0.01, le=1.0, description="KL惩罚系数β")
    max_tokens: int = Field(6, ge=1, le=20, description="最大生成Token数")


class StepForwardRequest(BaseModel):
    prompt: str = Field(..., description="原始提示词")
    current_tokens: list[str] = Field(default_factory=list, description="已生成的Token序列")
    actor_params: Optional[ModelParams] = Field(default_factory=lambda: ModelParams())
    ref_params: Optional[ModelParams] = Field(default_factory=lambda: ModelParams())
    kl_ctl: float = Field(0.1, ge=0.01, le=1.0, description="KL惩罚系数β")


class DistributionParams(BaseModel):
    mean: float = Field(0.0, description="均值")
    std: float = Field(1.0, gt=0, description="标准差")


class CalculateKLRequest(BaseModel):
    beta: float = Field(..., ge=0.01, le=1.0, description="KL惩罚系数β")
    ref_distribution: Optional[DistributionParams] = Field(default_factory=lambda: DistributionParams())
    actor_distribution: Optional[DistributionParams] = Field(default_factory=lambda: DistributionParams())
    x_range: list[float] = Field(default=[-4.0, 4.0], description="x轴范围")
    num_points: int = Field(200, ge=50, le=500, description="曲线采样点数")


class ComputeGAERequest(BaseModel):
    tokens: list[str] = Field(..., min_length=2, description="Token文本数组")
    rewards: list[float] = Field(..., min_length=2, description="即时奖励数组")
    values: list[float] = Field(..., min_length=2, description="Critic预测价值数组")
    gamma: float = Field(0.99, ge=0.9, le=1.0, description="折扣因子")
    lambda_: float = Field(0.95, ge=0.0, le=1.0, alias="lambda", description="GAE权衡因子")

    model_config = {"populate_by_name": True}


class StepGAERequest(BaseModel):
    t: int = Field(..., ge=0, description="当前回溯时刻")
    tokens: list[str] = Field(..., min_length=2, description="Token文本数组")
    rewards: list[float] = Field(..., min_length=2, description="即时奖励数组")
    values: list[float] = Field(..., min_length=2, description="Critic预测价值数组")
    gamma: float = Field(0.99, ge=0.9, le=1.0, description="折扣因子")
    lambda_: float = Field(0.95, ge=0.0, le=1.0, alias="lambda", description="GAE权衡因子")
    next_advantage: float = Field(0.0, description="下一时刻已计算的优势值")

    model_config = {"populate_by_name": True}
