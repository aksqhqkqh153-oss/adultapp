from pathlib import Path
import logging

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select

from .auth import decode_token
from .config import settings
from .database import create_db_and_tables, engine
from .models import DirectMessage, DirectMessageThread, User, UserBlock
from .routers.api import router as api_router, validate_exchange_text
from .services.realtime import thread_connection_manager
from .seed_db import seed_database

logger = logging.getLogger(__name__)
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


def _is_allowed_origin(origin: str | None) -> bool:
    if not origin:
        return False
    allowed = {origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()}
    if origin in allowed:
        return True
    import re
    try:
        return bool(settings.cors_origin_regex and re.fullmatch(settings.cors_origin_regex, origin))
    except re.error:
        return False


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    response.headers.setdefault("Content-Security-Policy", "default-src 'self'; img-src 'self' data: https:; media-src 'self' https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https: wss:; frame-ancestors 'none'")
    if str(settings.app_env).lower() in {"production", "prod"}:
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
    return response


@app.middleware("http")
async def unhandled_exception_to_json(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        origin = request.headers.get("origin")
        headers = {}
        if _is_allowed_origin(origin):
            headers["Access-Control-Allow-Origin"] = origin
            headers["Access-Control-Allow-Credentials"] = "true"
            headers["Vary"] = "Origin"
        return JSONResponse(status_code=500, content={"detail": f"server_error: {exc.__class__.__name__}"}, headers=headers)


@app.on_event("startup")
def on_startup() -> None:
    if str(settings.app_env).lower() in {"production", "prod"} and str(settings.jwt_secret_key).startswith("change-me"):
        raise RuntimeError("jwt secret is not configured for production")
    media_dir.mkdir(parents=True, exist_ok=True)
    if settings.startup_db_init_enabled:
        try:
            create_db_and_tables()
        except Exception as exc:
            logger.exception("startup_db_init_failed: %s", exc)
    if settings.startup_seed_enabled:
        try:
            with Session(engine) as session:
                seed_database(session)
        except Exception as exc:
            logger.exception("startup_seed_failed: %s", exc)


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


@app.get("/shop/checkout/success", response_class=HTMLResponse)
def shop_checkout_success(order_no: str = "") -> str:
    return f"""<!doctype html><html lang='ko'><head><meta charset='utf-8'><title>결제 완료</title><style>body{{font-family:Arial,sans-serif;padding:32px;background:#111827;color:#f9fafb}} .box{{max-width:720px;margin:0 auto;background:#1f2937;border-radius:16px;padding:24px}} a{{color:#93c5fd}}</style></head><body><div class='box'><h1>결제 완료 안내</h1><p>주문번호: <strong>{order_no or '-'}</strong></p><p>Verotel 결제가 완료되면 webhook으로 최종 상태가 반영됩니다.</p><p>앱으로 돌아가 주문 탭에서 최종 승인 상태를 확인하세요.</p><p><a href='/api/health'>API 상태 확인</a></p></div></body></html>"""


@app.get("/shop/checkout/back", response_class=HTMLResponse)
def shop_checkout_back(order_no: str = "") -> str:
    return f"""<!doctype html><html lang='ko'><head><meta charset='utf-8'><title>결제 복귀</title><style>body{{font-family:Arial,sans-serif;padding:32px;background:#111827;color:#f9fafb}} .box{{max-width:720px;margin:0 auto;background:#1f2937;border-radius:16px;padding:24px}} a{{color:#93c5fd}}</style></head><body><div class='box'><h1>결제 페이지에서 돌아왔습니다</h1><p>주문번호: <strong>{order_no or '-'}</strong></p><p>결제 미완료 또는 취소일 수 있습니다. 앱 주문 탭에서 상태를 다시 확인하세요.</p><p><a href='/api/health'>API 상태 확인</a></p></div></body></html>"""
