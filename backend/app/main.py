from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select

from .auth import decode_token
from .config import settings
from .database import create_db_and_tables, engine
from .models import DirectMessage, DirectMessageThread, User, UserBlock
from .routers.api import router as api_router, validate_exchange_text
from .services.realtime import thread_connection_manager
from .seed_db import seed_database

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=settings.cors_origin_regex or None,
)

media_dir = Path(settings.uploads_dir)
media_dir.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(media_dir)), name="media")
app.include_router(api_router, prefix="/api")


@app.on_event("startup")
def on_startup() -> None:
    media_dir.mkdir(parents=True, exist_ok=True)
    if settings.startup_db_init_enabled:
        create_db_and_tables()
    if settings.startup_seed_enabled:
        with Session(engine) as session:
            seed_database(session)


@app.websocket("/ws/chat/{thread_id}")
async def websocket_chat(thread_id: int, websocket: WebSocket) -> None:
    token = websocket.query_params.get("token", "")
    try:
        payload = decode_token(token)
        user_id = int(payload.get("sub", 0))
    except Exception:
        await websocket.close(code=4401)
        return
    with Session(engine) as session:
        thread = session.get(DirectMessageThread, thread_id)
        if not thread or user_id not in {thread.participant_a_id, thread.participant_b_id}:
            await websocket.close(code=4403)
            return
        blocked = session.exec(select(UserBlock).where(UserBlock.is_active == True, ((UserBlock.blocker_id == user_id) & (UserBlock.blocked_id == (thread.participant_b_id if thread.participant_a_id == user_id else thread.participant_a_id))) | ((UserBlock.blocked_id == user_id) & (UserBlock.blocker_id == (thread.participant_b_id if thread.participant_a_id == user_id else thread.participant_a_id))))).first()  # noqa: E712
        if blocked:
            await websocket.close(code=4403)
            return
    await thread_connection_manager.connect(thread_id, websocket)
    try:
        while True:
            incoming = await websocket.receive_json()
            message = str(incoming.get("message", "")).strip()
            if not message:
                await websocket.send_json({"type": "error", "detail": "empty message"})
                continue
            try:
                validate_exchange_text(message)
            except Exception as exc:
                await websocket.send_json({"type": "error", "detail": getattr(exc, "detail", "blocked text")})
                continue
            with Session(engine) as session:
                thread = session.get(DirectMessageThread, thread_id)
                if not thread:
                    await websocket.send_json({"type": "error", "detail": "thread not found"})
                    continue
                receiver_id = thread.participant_b_id if thread.participant_a_id == user_id else thread.participant_a_id
                row = DirectMessage(thread_id=thread_id, sender_id=user_id, receiver_id=receiver_id, purpose_code="SUPPORT", message=message)
                thread.updated_at = session.get(DirectMessageThread, thread_id).updated_at = __import__('datetime').datetime.utcnow()
                session.add(thread)
                session.add(row)
                session.commit()
                session.refresh(row)
                sender = session.get(User, user_id)
                payload = {"type": "message", "thread_id": thread_id, "id": row.id, "sender_id": user_id, "sender_name": sender.name if sender else f"user:{user_id}", "receiver_id": receiver_id, "message": row.message, "created_at": row.created_at.isoformat() if row.created_at else ""}
            await thread_connection_manager.broadcast(thread_id, payload)
    except WebSocketDisconnect:
        thread_connection_manager.disconnect(thread_id, websocket)
