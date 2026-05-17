from pydantic import BaseModel, Field
from app.models.common import StatusEnum


class KLBetaInterpretation(BaseModel):
    status: StatusEnum = Field(..., description="状态标识")
    title: str = Field(..., description="状态标题")
    description: str = Field(..., description="状态描述")


class CurvePoint(BaseModel):
    x: float
    y: float


class NormalDistribution(BaseModel):
    mean: float = Field(..., description="均值")
    std: float = Field(..., gt=0, description="标准差")
    curve: list[CurvePoint] = Field(..., description="分布曲线采样点")
