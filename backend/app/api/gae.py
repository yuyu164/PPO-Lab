from fastapi import APIRouter, HTTPException
from app.models.common import ApiResponse
from app.models.request import ComputeGAERequest, StepGAERequest
from app.services.gae_service import compute_gae_full, step_gae

router = APIRouter()


@router.post("/compute", response_model=ApiResponse)
async def api_compute_gae(request: ComputeGAERequest):
    # 关联算法：C1(GAE完整计算) + 方差-偏差解读
    try:
        result = compute_gae_full(
            tokens=request.tokens,
            rewards=request.rewards,
            values=request.values,
            gamma=request.gamma,
            lam=request.lambda_,
        )
        return ApiResponse(success=True, data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ArithmeticError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/step", response_model=ApiResponse)
async def api_step_gae(request: StepGAERequest):
    # 关联算法：C2(单步GAE计算)
    try:
        result = step_gae(
            t=request.t,
            tokens=request.tokens,
            rewards=request.rewards,
            values=request.values,
            gamma=request.gamma,
            lam=request.lambda_,
            next_advantage=request.next_advantage,
        )
        return ApiResponse(success=True, data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
