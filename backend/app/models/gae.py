from pydantic import BaseModel, Field


class GAEStep(BaseModel):
    t: int = Field(..., ge=0, description="时刻索引")
    token: str = Field(..., description="Token文本")
    r_t: float = Field(..., description="即时奖励")
    V_t: float = Field(..., description="预测价值")
    V_next: float = Field(..., description="下一时刻价值")
    delta: float = Field(..., description="TD error")
    A_t: float = Field(..., description="优势值")
    is_positive: bool = Field(..., description="优势值是否为正")


class VarianceBiasResult(BaseModel):
    bias: str = Field(..., description="偏差等级")
    variance: str = Field(..., description="方差等级")
    description: str = Field(..., description="说明文字")


class GAEResult(BaseModel):
    steps: list[GAEStep] = Field(..., description="GAE步骤列表")
    advantages: list[float] = Field(..., description="优势函数数组")
    returns: list[float] = Field(..., description="实际收益数组")
    gamma: float = Field(..., description="折扣因子")
    lambda_: float = Field(..., alias="lambda", description="GAE权衡因子")
    variance_bias: VarianceBiasResult = Field(..., description="方差-偏差解读")

    model_config = {"populate_by_name": True}


class StepCalculation(BaseModel):
    step: int = Field(..., description="当前时刻")
    formulas: dict = Field(..., description="公式计算详情")
    is_positive: bool = Field(..., description="优势值是否为正")
