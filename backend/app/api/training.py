from fastapi import APIRouter
from app.models.common import ApiResponse

router = APIRouter()

PRESETS = {
    "beginner": {
        "label": "新手推荐",
        "params": {
            "kl_ctl": 0.1,
            "gamma": 0.99,
            "lam": 0.95,
            "clip_range": 0.2,
            "learning_rate": 0.01,
            "ppo_epochs": 3,
        },
    },
    "standard": {
        "label": "标准训练",
        "params": {
            "kl_ctl": 0.1,
            "gamma": 0.99,
            "lam": 0.95,
            "clip_range": 0.2,
            "learning_rate": 0.03,
            "ppo_epochs": 3,
        },
    },
    "aggressive": {
        "label": "激进探索",
        "params": {
            "kl_ctl": 0.01,
            "gamma": 0.99,
            "lam": 0.98,
            "clip_range": 0.3,
            "learning_rate": 0.05,
            "ppo_epochs": 5,
        },
    },
}


@router.get("/presets", response_model=ApiResponse)
async def api_get_presets():
    return ApiResponse(success=True, data={"presets": PRESETS})
