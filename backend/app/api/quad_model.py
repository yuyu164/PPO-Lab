from fastapi import APIRouter, HTTPException
from app.models.common import ApiResponse
from app.models.request import GenerateEpisodeRequest, StepForwardRequest
from app.services.quad_model_service import generate_episode, step_forward

router = APIRouter()


@router.post("/generate", response_model=ApiResponse)
async def api_generate_episode(request: GenerateEpisodeRequest):
    # 关联算法：A1(Token生成) + A2(KL散度) + A3(Reward计算) + A4(Critic预测) + A5(优势计算)
    try:
        actor_params = request.actor_params.model_dump() if request.actor_params else None
        ref_params = request.ref_params.model_dump() if request.ref_params else None
        episode = generate_episode(
            prompt=request.prompt,
            actor_params=actor_params,
            ref_params=ref_params,
            kl_ctl=request.kl_ctl,
            max_tokens=request.max_tokens,
        )
        return ApiResponse(success=True, data={"episode": episode.model_dump()})
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ArithmeticError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/step", response_model=ApiResponse)
async def api_step_forward(request: StepForwardRequest):
    # 关联算法：A1 + A2 + A4 + A5（单步执行）
    try:
        actor_params = request.actor_params.model_dump() if request.actor_params else None
        ref_params = request.ref_params.model_dump() if request.ref_params else None
        step, is_complete = step_forward(
            prompt=request.prompt,
            current_tokens=request.current_tokens,
            actor_params=actor_params,
            ref_params=ref_params,
            kl_ctl=request.kl_ctl,
        )
        return ApiResponse(success=True, data={"step": step.model_dump(), "is_complete": is_complete})
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
