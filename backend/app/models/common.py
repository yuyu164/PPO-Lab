from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class StatusEnum(str, Enum):
    WARNING = "warning"
    OPTIMAL = "optimal"
    LOCKED = "locked"


class ErrorResponse(BaseModel):
    code: str
    message: str


class ApiResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[ErrorResponse] = None
