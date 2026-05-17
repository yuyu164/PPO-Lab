import asyncio
from fastapi import WebSocket, WebSocketDisconnect
from app.services.training_service import session, execute_one_epoch


async def handle_training_websocket(websocket: WebSocket):
    await websocket.accept()

    await websocket.send_json({
        "type": "status",
        "data": {
            "state": session.state,
            "epoch": session.current_epoch,
            "max_epochs": session.max_epochs,
        },
    })

    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")

            if action == "start":
                await handle_start(websocket, data.get("params"))
            elif action == "pause":
                await handle_pause(websocket)
            elif action == "resume":
                await handle_resume(websocket)
            elif action == "step":
                await handle_step(websocket)
            elif action == "reset":
                await handle_reset(websocket)
            elif action == "update_params":
                await handle_update_params(websocket, data.get("params"))

    except WebSocketDisconnect:
        session.state = "idle"


async def handle_start(websocket: WebSocket, params: dict | None):
    if params:
        for key, value in params.items():
            if key in session.hyperparams:
                session.hyperparams[key] = value

    session.reset()
    session.state = "running"

    await websocket.send_json({
        "type": "status",
        "data": {"state": "running", "epoch": 0, "max_epochs": session.max_epochs},
    })

    await run_training_loop(websocket)


async def handle_pause(websocket: WebSocket):
    session.state = "paused"
    await websocket.send_json({
        "type": "status",
        "data": {
            "state": "paused",
            "epoch": session.current_epoch,
            "max_epochs": session.max_epochs,
        },
    })


async def handle_resume(websocket: WebSocket):
    session.state = "running"
    await websocket.send_json({
        "type": "status",
        "data": {
            "state": "running",
            "epoch": session.current_epoch,
            "max_epochs": session.max_epochs,
        },
    })
    await run_training_loop(websocket)


async def handle_step(websocket: WebSocket):
    session.state = "running"
    await execute_and_send_epoch(websocket)
    session.state = "paused"
    await websocket.send_json({
        "type": "status",
        "data": {
            "state": "paused",
            "epoch": session.current_epoch,
            "max_epochs": session.max_epochs,
        },
    })


async def handle_reset(websocket: WebSocket):
    session.reset()
    await websocket.send_json({
        "type": "status",
        "data": {"state": "idle", "epoch": 0, "max_epochs": session.max_epochs},
    })


async def handle_update_params(websocket: WebSocket, params: dict | None):
    if params:
        for key, value in params.items():
            if key in session.hyperparams:
                session.hyperparams[key] = value


async def run_training_loop(websocket: WebSocket):
    while session.state == "running" and session.current_epoch < session.max_epochs:
        await execute_and_send_epoch(websocket)
        await asyncio.sleep(0.1)

    if session.current_epoch >= session.max_epochs:
        session.state = "completed"
        await websocket.send_json({
            "type": "status",
            "data": {
                "state": "completed",
                "epoch": session.current_epoch,
                "max_epochs": session.max_epochs,
            },
        })


async def execute_and_send_epoch(websocket: WebSocket):
    try:
        epoch_data, achievements = execute_one_epoch()

        await websocket.send_json({"type": "epoch", "data": epoch_data})

        for ach in achievements:
            await websocket.send_json({"type": "achievement", "data": ach})

    except ArithmeticError as e:
        session.state = "error"
        await websocket.send_json({
            "type": "error",
            "data": {"code": "TRAINING_DIVERGED", "message": str(e)},
        })
