from fastapi import APIRouter, HTTPException
from app.models.common import ApiResponse
from app.models.request import CalculateKLRequest
from app.services.kl_service import calculate_kl

router = APIRouter()


@router.post("/calculate", response_model=ApiResponse)
async def api_calculate_kl(request: CalculateKLRequest):
    # 关联算法：B1(PPO-Penalty解读) + B2(KL高斯计算) + B3(分布曲线生成)
    try:
        ref_dist = request.ref_distribution.model_dump() if request.ref_distribution else None
        actor_dist = request.actor_distribution.model_dump() if request.actor_distribution else None
        result = calculate_kl(
            beta=request.beta,
            ref_distribution=ref_dist,
            actor_distribution=actor_dist,
            x_range=request.x_range,
            num_points=request.num_points,
        )
        return ApiResponse(success=True, data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
