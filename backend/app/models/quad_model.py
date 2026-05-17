from pydantic import BaseModel, Field


class TokenStep(BaseModel):
    token: str = Field(..., description="Token文本")
    log_prob: float = Field(..., description="Actor log概率")
    ref_log_prob: float = Field(..., description="Reference log概率")
    kl_div: float = Field(..., description="KL散度值")
    V_t: float = Field(..., description="Critic预测状态价值")
    V_next: float = Field(..., description="下一状态价值")
    r_t: float = Field(..., description="即时奖励")
    A_t: float = Field(..., description="优势值（TD error）")


class GenerationEpisode(BaseModel):
    prompt: str = Field(..., description="输入提示词")
    steps: list[TokenStep] = Field(..., description="Token步骤列表")
    R_global: float = Field(..., description="全局奖励")
