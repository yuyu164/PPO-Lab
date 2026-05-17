from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from app.api import quad_model, kl, gae, training, ws_training

app = FastAPI(title="PPO-Lab API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

app.include_router(quad_model.router, prefix="/api/quad-model", tags=["四模演武场"])
app.include_router(kl.router, prefix="/api/kl", tags=["KL散度调节器"])
app.include_router(gae.router, prefix="/api/gae", tags=["GAE回溯器"])
app.include_router(training.router, prefix="/api/training", tags=["训练模拟器"])


@app.websocket("/ws/training")
async def training_websocket(websocket: WebSocket):
    await ws_training.handle_training_websocket(websocket)


@app.get("/")
async def root():
    return {"message": "PPO-Lab API is running", "version": "1.0"}
