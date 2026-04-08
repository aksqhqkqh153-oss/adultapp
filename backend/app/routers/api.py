from __future__ import annotations

from datetime import datetime, timedelta
import csv
import re
import hashlib
import io
import json
from pathlib import Path
from typing import Any

import pyotp
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, Response
from sqlmodel import Session, select

from ..auth import (
    authenticate_refresh_token,
    build_totp_uri,
    assert_admin_ip_allowed,
    check_ip_rate_limit,
    consume_login_challenge,
    consume_password_reset_token,
    create_access_token,
    create_device_session,
    create_password_reset_token,
    deliver_password_reset_token,
    create_refresh_token,
    generate_backup_codes,
    get_current_user,
    hash_password,
    issue_login_challenge,
    require_grade,
    revoke_device_session,
    revoke_refresh_token,
    verify_backup_code,
    verify_password,
    verify_totp,
    utcnow,
)
from ..config import settings
from ..database import get_session
from ..models import (
    AdminActionLog,
    AppAsset,
    AppealCase,
    CommunityPost,
    ContentItem,
    DirectMessage,
    DirectMessageThread,
    DeviceSession,
    LaunchGate,
    MemberGrade,
    ModerationReport,
    Order,
    OrderItem,
    Product,
    ProductMedia,
    RefundCase,
    SlaEvent,
    SellerPenalty,
    SellerProfile,
    User,
)
from ..schemas import (
    AppReviewSettings,
    BackupCodeResponse,
    ChangePasswordRequest,
    CommunityPostCreate,
    ContentUpsertRequest,
    DirectMessageCreate,
    DirectMessageThreadCreate,
    DeviceSessionRevokeRequest,
    LoginRequest,
    PasswordResetConfirmRequest,
    PasswordResetRequest,
    ProductMediaAttachRequest,
    ProductUpsertRequest,
    RefreshTokenRequest,
    RefundTransitionRequest,
    SellerActivationChecklist,
    SimpleReportCreate,
    TokenResponse,
    TwoFactorCompleteRequest,
    TwoFASetupResponse,
    VerifyOTPRequest,
    OrderCreateRequest,
    ReportResolveRequest,
)
from ..services.seed_loader import load_project_status, load_seed

router = APIRouter()

REFUND_TRANSITIONS = {
    "requested": ["seller_notified"],
    "seller_notified": ["pickup_requested", "rejected"],
    "pickup_requested": ["inspecting"],
    "inspecting": ["approved", "rejected"],
    "approved": ["pg_cancelled", "cancel_failed"],
    "rejected": [],
    "pg_cancelled": ["restocked", "discarded"],
    "cancel_failed": ["approved"],
    "restocked": [],
    "discarded": [],
}

APPROVAL_QUEUE = [
    {"id": 1, "action_type": "정산 보류 해제", "target": "seller:24", "requester": "sub-admin-02", "required_approver_grade": "1", "status": "pending"},
    {"id": 2, "action_type": "안전모드 해제", "target": "app-review-mode", "requester": "manager-03", "required_approver_grade": "1", "status": "pending"},
]

SCREENSHOT_ASSETS = [
    {"name": "android_home_safe.png", "device": "Android 6.7", "status": "prepared", "path": "assets/store/android_home_safe.png"},
    {"name": "android_video_safe.png", "device": "Android 6.7", "status": "prepared", "path": "assets/store/android_video_safe.png"},
    {"name": "ios_shop_safe.png", "device": "iPhone 6.7", "status": "prepared", "path": "assets/store/ios_shop_safe.png"},
    {"name": "ios_profile_safe.png", "device": "iPhone 6.7", "status": "prepared", "path": "assets/store/ios_profile_safe.png"},
]

CATEGORY_GROUPS = [
    {"group": "공개 쇼핑", "items": ["위생/보관", "입문 액세서리", "브랜드관", "기획전"]},
    {"group": "운영 콘텐츠", "items": ["가이드", "FAQ", "이벤트", "앱심사 안전노출"]},
    {"group": "판매자센터", "items": ["상품등록", "사진/영상 첨부", "SKU 관리", "재고/상태 변경"]},
]


ALLOWED_UPLOAD_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".mp4", ".mov", ".webm"}
MAX_UPLOAD_BYTES = 25 * 1024 * 1024
SAFE_COMMUNITY_BLOCKLIST = ["만남", "조건만남", "오프라인", "카카오톡", "카톡", "텔레그램", "텔레", "라인", "whatsapp", "wechat", "숙소", "010-"]
PHONE_RE = re.compile(r"01[016789][-\s]?\d{3,4}[-\s]?\d{4}")
HANDLE_RE = re.compile(r"(?:@|https?://)(?:t\.me|open\.kakao|instagram\.com|line\.me|discord\.gg)", re.IGNORECASE)


def validate_exchange_text(text_value: str) -> None:
    lowered = (text_value or "").lower()
    for token in SAFE_COMMUNITY_BLOCKLIST:
        if token.lower() in lowered:
            raise HTTPException(status_code=400, detail=f"blocked community/dm token: {token}")
    if PHONE_RE.search(text_value or ""):
        raise HTTPException(status_code=400, detail="phone/contact exchange is not allowed in this starter")
    if HANDLE_RE.search(text_value or ""):
        raise HTTPException(status_code=400, detail="external contact/share link is not allowed in this starter")


def _message_counterparty(thread: DirectMessageThread, user_id: int) -> int:
    return thread.participant_b_id if thread.participant_a_id == user_id else thread.participant_a_id


def _ensure_thread_member(thread: DirectMessageThread, user_id: int) -> None:
    if user_id not in {thread.participant_a_id, thread.participant_b_id}:
        raise HTTPException(status_code=403, detail="not a thread participant")


def _role_name(grade: Any) -> str:
    return grade.value if hasattr(grade, "value") else str(grade)


def _ensure_dm_policy(user: User, purpose_code: str) -> None:
    if purpose_code not in {"INFO_EXCHANGE", "PRODUCT_QA", "SUPPORT", "FEED_REPLY"}:
        raise HTTPException(status_code=400, detail="unsupported purpose code")
    if str(_role_name(user.grade)) == "6" and purpose_code not in {"SUPPORT", "PRODUCT_QA", "FEED_REPLY"}:
        raise HTTPException(status_code=400, detail="general users can only use support/product/feed reply dm in this starter")


def _ensure_post_visibility(user: User, visibility: str) -> None:
    if not user.adult_verified and visibility != "safe":
        raise HTTPException(status_code=400, detail="adult verification required for non-safe visibility")


def _community_author(session: Session, user_id: int) -> dict[str, Any]:
    user = session.get(User, user_id)
    return {"author_name": user.name if user else f"user:{user_id}", "author_grade": _role_name(user.grade) if user else "7"}


def _ensure_upload_file(upload: UploadFile) -> tuple[str, str]:
    suffix = Path(upload.filename or "").suffix.lower()
    if suffix not in ALLOWED_UPLOAD_SUFFIXES:
        raise HTTPException(status_code=400, detail=f"unsupported file type: {suffix or 'unknown'}")
    media_type = "video" if suffix in {".mp4", ".mov", ".webm"} else "image"
    return suffix, media_type


def write_admin_log(session: Session, user: User | None, action_type: str, target_type: str, target_id: str, reason: str, before_state: str | None = None, after_state: str | None = None, ip: str | None = None, device: str | None = None) -> None:
    if not user:
        return
    prev = session.exec(select(AdminActionLog).order_by(AdminActionLog.id.desc())).first()
    prev_hash = prev.chain_hash if prev and getattr(prev, "chain_hash", None) else None
    now = datetime.utcnow()
    payload = "|".join([str(user.id or 0), str(user.grade.value if hasattr(user.grade, "value") else user.grade), action_type, target_type, target_id, reason, before_state or "", after_state or "", ip or "", device or "", now.isoformat(), prev_hash or ""])
    chain_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest() if settings.audit_log_hash_chain else None
    session.add(AdminActionLog(admin_id=user.id or 0, admin_grade=str(user.grade.value if hasattr(user.grade, "value") else user.grade), action_type=action_type, target_type=target_type, target_id=target_id, reason=reason, before_state=before_state, after_state=after_state, ip=ip, device=device, chain_prev_hash=prev_hash, chain_hash=chain_hash, created_at=now))
    session.commit()


def mask(value: str) -> str:
    if not value:
        return "-"
    if len(value) <= 6:
        return "*" * len(value)
    return value[:3] + "*" * max(0, len(value) - 6) + value[-3:]


def enforce_admin_ip(user: User, request: Request) -> None:
    client_ip = request.client.host if request.client else "127.0.0.1"
    assert_admin_ip_allowed(user, client_ip)


def ensure_sla_event(session: Session, event_type: str, target_type: str, target_id: str, owner_id: int | None = None, hours: int = 24) -> None:
    item = SlaEvent(event_type=event_type, target_type=target_type, target_id=target_id, owner_id=owner_id, due_at=datetime.utcnow() + timedelta(hours=hours))
    session.add(item)
    session.commit()



def build_token_response(user: User, session: Session, device_session: DeviceSession | None = None) -> TokenResponse:
    access_token = create_access_token(user, device_session.id if device_session else None)
    refresh_token = create_refresh_token(user, session, device_session)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        role=user.grade,
        user_id=user.id or 0,
        two_factor_required=False,
    )


def register_login_failure(user: User, session: Session) -> None:
    now = utcnow()
    user.failed_login_count = (user.failed_login_count or 0) + 1
    user.last_failed_login_at = now
    if user.failed_login_count >= settings.login_max_failures:
        user.locked_until = now + timedelta(minutes=settings.login_lock_minutes)
        user.failed_login_count = 0
    session.add(user)
    session.commit()



def clear_login_failures(user: User, session: Session) -> None:
    user.failed_login_count = 0
    user.locked_until = None
    user.last_login_at = utcnow()
    session.add(user)
    session.commit()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/seed")
def read_seed() -> dict[str, Any]:
    return load_seed()


@router.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, session: Session = Depends(get_session)) -> TokenResponse:
    client_ip = request.client.host if request.client else "127.0.0.1"
    check_ip_rate_limit(client_ip, "auth_login", session)
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user:
        raise HTTPException(status_code=401, detail="invalid credentials")
    if user.locked_until and user.locked_until > utcnow():
        raise HTTPException(status_code=423, detail=f"account locked until {user.locked_until.isoformat()}")
    if not verify_password(payload.password, user.password_hash):
        register_login_failure(user, session)
        raise HTTPException(status_code=401, detail="invalid credentials")
    clear_login_failures(user, session)
    device_session = create_device_session(user, session, payload.device_name, request.headers.get("user-agent"), client_ip)
    if user.grade == MemberGrade.ADMIN and settings.admin_2fa_enabled and user.admin_2fa_confirmed:
        challenge = issue_login_challenge(user, session, device_session)
        return TokenResponse(access_token="", refresh_token="", role=user.grade, user_id=user.id or 0, two_factor_required=True, challenge_token=challenge.challenge_token)
    return build_token_response(user, session, device_session)


@router.post("/auth/2fa/complete", response_model=TokenResponse)
def complete_two_factor(payload: TwoFactorCompleteRequest, session: Session = Depends(get_session)) -> TokenResponse:
    user, device_session = consume_login_challenge(payload.challenge_token, session)
    otp_ok = bool(payload.otp_code and user.admin_2fa_secret and verify_totp(user.admin_2fa_secret, payload.otp_code))
    backup_ok = bool(payload.backup_code and verify_backup_code(user, payload.backup_code, session))
    if not otp_ok and not backup_ok:
        raise HTTPException(status_code=401, detail="invalid otp or backup code")
    clear_login_failures(user, session)
    return build_token_response(user, session, device_session)


@router.post("/auth/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshTokenRequest, session: Session = Depends(get_session)) -> TokenResponse:
    user, device_session = authenticate_refresh_token(payload.refresh_token, session)
    return build_token_response(user, session, device_session)


@router.post("/auth/logout")
def logout(payload: RefreshTokenRequest, session: Session = Depends(get_session)):
    revoke_refresh_token(payload.refresh_token, session)
    return {"ok": True}


@router.post("/auth/password/change")
def change_password(payload: ChangePasswordRequest, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="current password mismatch")
    user.password_hash = hash_password(payload.new_password)
    user.password_changed_at = utcnow()
    user.reset_required = False
    session.add(user)
    session.commit()
    return {"ok": True, "changed_at": user.password_changed_at.isoformat()}


@router.post("/auth/password/reset/request")
def request_password_reset(payload: PasswordResetRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user:
        return {"ok": True, "message": "If account exists, reset queued."}
    reset_token = create_password_reset_token(user, session)
    delivery = deliver_password_reset_token(user, reset_token)
    return {"ok": True, "reset_token": reset_token, **delivery, "note": "파일 outbox 기반 전달. 운영에서는 메일/SMS 공급사로 전환."}


@router.post("/auth/password/reset/confirm")
def confirm_password_reset(payload: PasswordResetConfirmRequest, session: Session = Depends(get_session)):
    user = consume_password_reset_token(payload.reset_token, session)
    user.password_hash = hash_password(payload.new_password)
    user.password_changed_at = utcnow()
    user.reset_required = False
    session.add(user)
    session.commit()
    return {"ok": True, "email": user.email}


@router.get("/auth/me")
def auth_me(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    backup_count = len([x for x in (user.admin_backup_codes or "").split(",") if x])
    sessions = session.exec(select(DeviceSession).where(DeviceSession.user_id == user.id).order_by(DeviceSession.created_at.desc())).all()
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "grade": user.grade,
        "adult_verified": user.adult_verified,
        "admin_2fa_confirmed": user.admin_2fa_confirmed,
        "backup_codes_remaining": backup_count,
        "locked_until": user.locked_until.isoformat() if user.locked_until else "",
        "failed_login_count": user.failed_login_count,
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else "",
        "password_changed_at": user.password_changed_at.isoformat() if user.password_changed_at else "",
        "session_count": len(sessions),
    }


@router.get("/auth/rbac-map")
def auth_rbac_map():
    return {
        "1": ["all", "final_approval", "audit_log_download", "2fa_manage", "backup_code_regenerate", "session_revoke"],
        "2": ["ops_manage", "ticket_manage", "refund_supervise"],
        "3": ["report_review", "temporary_action"],
        "4": ["seller_center", "refund_approve_reject", "evidence_upload", "product_edit"],
        "5": ["order", "refund_request", "receipt_request"],
        "6": ["browse_limited"],
        "7": ["hold_or_pending"],
    }


@router.get("/auth/sessions")
def auth_sessions(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    rows = session.exec(select(DeviceSession).where(DeviceSession.user_id == user.id).order_by(DeviceSession.created_at.desc())).all()
    return {"items": rows}


@router.post("/auth/sessions/revoke")
def auth_sessions_revoke(payload: DeviceSessionRevokeRequest, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    device = session.get(DeviceSession, payload.session_id)
    if not device or device.user_id != user.id:
        raise HTTPException(status_code=404, detail="session not found")
    revoke_device_session(payload.session_id, session)
    return {"ok": True}


@router.get("/security/2fa/setup", response_model=TwoFASetupResponse)
def setup_2fa(request: Request, user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    enforce_admin_ip(user, request)
    secret = pyotp.random_base32()
    user.admin_2fa_secret = secret
    user.admin_2fa_confirmed = False
    session.add(user)
    session.commit()
    return TwoFASetupResponse(secret=secret, otp_auth_url=build_totp_uri(secret, user.email), issuer=settings.admin_2fa_issuer, account_name=user.email)


@router.post("/security/2fa/verify")
def verify_2fa(payload: VerifyOTPRequest, request: Request, user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    enforce_admin_ip(user, request)
    if not user.admin_2fa_secret:
        raise HTTPException(status_code=400, detail="2fa secret not initialized")
    if not verify_totp(user.admin_2fa_secret, payload.otp_code):
        raise HTTPException(status_code=400, detail="invalid otp")
    user.admin_2fa_confirmed = True
    session.add(user)
    session.commit()
    return {"ok": True, "confirmed": True}


@router.post("/security/2fa/backup-codes/regenerate", response_model=BackupCodeResponse)
def regenerate_backup_codes(request: Request, user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    enforce_admin_ip(user, request)
    plain_codes, hashed_codes = generate_backup_codes(10)
    user.admin_backup_codes = ",".join(hashed_codes)
    session.add(user)
    session.commit()
    return BackupCodeResponse(codes=plain_codes, remaining=len(plain_codes))


@router.get("/security/admin-controls")
def security_admin_controls(session: Session = Depends(get_session)):
    items = session.exec(select(AdminActionLog).order_by(AdminActionLog.created_at.desc())).all()
    return {
        "admin_2fa_enabled": settings.admin_2fa_enabled,
        "admin_ip_allowlist": settings.admin_ip_allowlist,
        "dual_approval_enabled": settings.dual_approval_enabled,
        "audit_log_hash_chain": settings.audit_log_hash_chain,
        "latest_logs": items[:5],
        "rate_limit": {
            "window_minutes": settings.ip_rate_limit_window_minutes,
            "max_requests": settings.ip_rate_limit_max_requests,
            "block_minutes": settings.ip_rate_limit_block_minutes,
        },
    }


@router.get("/security/approval-queue")
def security_approval_queue():
    return {"items": APPROVAL_QUEUE}


@router.post("/security/approval-queue/{queue_id}/approve")
def security_approval_queue_approve(queue_id: int, request: Request, user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    enforce_admin_ip(user, request)
    for item in APPROVAL_QUEUE:
        if item["id"] == queue_id:
            item["status"] = "approved"
            write_admin_log(session, user, "queue_approve", "approval_queue", str(queue_id), "UI approve", after_state="approved", ip=request.client.host if request.client else "127.0.0.1", device="web")
            return {"ok": True, "item": item}
    raise HTTPException(status_code=404, detail="queue item not found")


@router.get("/project-status")
def project_status() -> dict[str, Any]:
    return load_project_status()


@router.get("/project-update-needs")
def project_update_needs() -> dict[str, Any]:
    status = load_project_status()
    return {
        "overall": status.get("overall", {}),
        "recommended_updates": status.get("recommended_updates", []),
        "items": status.get("items", []),
    }


@router.get("/dashboard")
def dashboard(session: Session = Depends(get_session)) -> dict[str, Any]:
    users = session.exec(select(User)).all()
    refunds = session.exec(select(RefundCase)).all()
    reports = session.exec(select(ModerationReport)).all()
    seller_profiles = session.exec(select(SellerProfile)).all()
    products = session.exec(select(Product)).all()
    contents = session.exec(select(ContentItem)).all()
    sessions = session.exec(select(DeviceSession)).all()
    posts = session.exec(select(CommunityPost)).all()
    dm_threads = session.exec(select(DirectMessageThread)).all()
    return {
        "metrics": [
            {"key": "users", "label": "회원 수", "value": len(users)},
            {"key": "refunds", "label": "환불 케이스", "value": len(refunds)},
            {"key": "reports", "label": "신고 건수", "value": len(reports)},
            {"key": "sellers", "label": "판매자 프로필", "value": len(seller_profiles)},
            {"key": "products", "label": "상품 수", "value": len(products)},
            {"key": "contents", "label": "콘텐츠 수", "value": len(contents)},
            {"key": "community_posts", "label": "커뮤니티 피드", "value": len(posts)},
            {"key": "dm_threads", "label": "정보 DM 스레드", "value": len(dm_threads)},
            {"key": "sessions", "label": "기기 세션", "value": len(sessions)},
            {"key": "security", "label": "보안 단계", "value": "Argon2 + Refresh + 2FA + RateLimit"},
        ],
        "launch_gates": load_seed().get("launch_gates", []),
    }


@router.get("/review-mode", response_model=AppReviewSettings)
def get_review_mode() -> AppReviewSettings:
    return AppReviewSettings(app_review_mode=settings.app_review_mode, home_block_level="safe", video_tab_enabled=True, search_suggestion_mode="safe", mobile_web_fallback_url=settings.mobile_web_fallback_url, hidden_category_ids=["CAT-RISK-B", "CAT-RISK-C"])


@router.get("/seller/{user_id}/activation-checklist", response_model=SellerActivationChecklist)
def seller_activation_checklist(user_id: int, session: Session = Depends(get_session)) -> SellerActivationChecklist:
    user = session.get(User, user_id)
    profile = session.exec(select(SellerProfile).where(SellerProfile.user_id == user_id)).first()
    if not user or not profile:
        raise HTTPException(status_code=404, detail="seller not found")
    return SellerActivationChecklist(
        adult_verified=bool(user.adult_verified),
        business_reviewed=bool(profile.business_number),
        settlement_account_verified=profile.settlement_account_verified,
        return_address_done=bool(profile.return_address),
        cs_contact_done=bool(profile.cs_contact),
        seller_contract_agreed=profile.seller_contract_agreed,
        eligible=all([user.adult_verified, bool(profile.business_number), profile.settlement_account_verified, bool(profile.return_address), bool(profile.cs_contact), profile.seller_contract_agreed]),
    )


@router.get("/refunds")
def list_refunds(session: Session = Depends(get_session)):
    return session.exec(select(RefundCase)).all()


@router.post("/refunds/{refund_id}/transition")
def transition_refund(refund_id: int, payload: RefundTransitionRequest, session: Session = Depends(get_session)):
    refund = session.get(RefundCase, refund_id)
    if not refund:
        raise HTTPException(status_code=404, detail="refund not found")
    current_status = str(refund.status)
    allowed = REFUND_TRANSITIONS.get(current_status, [])
    if payload.status not in allowed:
        raise HTTPException(status_code=400, detail=f"invalid transition: {current_status} -> {payload.status}")
    if payload.status == "rejected" and not payload.reject_reason_code:
        raise HTTPException(status_code=400, detail="reject_reason_code is required for rejected state")
    refund.status = payload.status
    refund.reject_reason_code = payload.reject_reason_code
    refund.reject_reason_detail = payload.reject_reason_detail
    refund.evidence_photo_set_id = payload.evidence_photo_set_id
    refund.pickup_carrier = payload.pickup_carrier
    refund.pickup_tracking_no = payload.pickup_tracking_no
    refund.updated_at = datetime.utcnow()
    session.add(refund)
    session.commit()
    session.refresh(refund)
    return {"ok": True, "refund": refund, "allowed_next": REFUND_TRANSITIONS.get(payload.status, [])}


@router.get("/seller-penalties")
def list_seller_penalties(session: Session = Depends(get_session)):
    return session.exec(select(SellerPenalty)).all()


@router.get("/launch-gates")
def list_launch_gates(session: Session = Depends(get_session)):
    items = session.exec(select(LaunchGate)).all()
    return items or load_seed().get("launch_gates", [])


@router.get("/assets")
def list_assets(session: Session = Depends(get_session)):
    return session.exec(select(AppAsset)).all()


@router.get("/assets/screenshots")
def list_screenshots():
    return {"items": SCREENSHOT_ASSETS}


@router.get("/pg/providers")
def pg_providers():
    return {"providers": [{"provider": settings.pg_primary_provider, "merchant_id": mask(settings.pg_primary_merchant_id), "configured": settings.pg_primary_merchant_id != "change-me"}, {"provider": settings.pg_secondary_provider, "merchant_id": mask(settings.pg_secondary_merchant_id), "configured": settings.pg_secondary_merchant_id != "change-me"}]}


@router.get("/adult-verification/providers")
def adult_verification_providers():
    return {"providers": [{"provider": settings.adult_verification_provider, "client_id": mask(settings.adult_verification_client_id), "configured": settings.adult_verification_client_id != "change-me", "callback_web": settings.adult_verification_callback_web}]}


@router.get("/tax/dashboard")
def tax_dashboard():
    return {
        "receipt_status": [{"type": "현금영수증", "status": "queue_ready", "count": 3}, {"type": "세금계산서", "status": "queue_ready", "count": 2}],
        "jobs": [{"job_name": "PG webhook intake", "frequency": "real-time", "status": "prepared", "target": "승인/취소 동기화"}, {"job_name": "month close", "frequency": "monthly", "status": "prepared", "target": "월마감 PDF/CSV"}],
    }


@router.get("/integrations/overview")
def integrations_overview():
    return {
        "security": {"argon2": True, "refresh_token": True, "backup_code_2fa": True, "ip_rate_limit": True, "db_migration": True},
        "pg": {"primary_provider": settings.pg_primary_provider, "primary_merchant_id": mask(settings.pg_primary_merchant_id), "secondary_provider": settings.pg_secondary_provider},
        "adult_verification": {"provider": settings.adult_verification_provider, "client_id": mask(settings.adult_verification_client_id), "test_mode": settings.adult_verification_test_mode},
    }


@router.get("/sku-policy")
def sku_policy() -> dict[str, Any]:
    return {
        "payment_method_mapping": [{"risk_grade": "A", "payment_scope": "card_transfer", "display_scope": "app_web"}, {"risk_grade": "B", "payment_scope": "transfer_only", "display_scope": "web_only"}, {"risk_grade": "C", "payment_scope": "hold", "display_scope": "hidden"}],
        "forbidden_product_rules": [{"rule": "미성년자 관련 표현 금지", "action": "등록차단"}, {"rule": "외설적 노출 카피 금지", "action": "검수보류"}],
        "refund_reject_codes": [{"code": "RJ01", "description": "개봉/사용 흔적 확인"}, {"code": "RJ02", "description": "구성품 누락·훼손"}, {"code": "RJ03", "description": "반품기한 초과"}, {"code": "RJ04", "description": "증빙 부족"}],
    }


@router.get("/ui/category-groups")
def ui_category_groups():
    return {"items": CATEGORY_GROUPS}


@router.get("/products")
def list_products(session: Session = Depends(get_session)):
    return session.exec(select(Product).order_by(Product.created_at.desc())).all()


@router.post("/products")
def upsert_product(payload: ProductUpsertRequest, session: Session = Depends(get_session)):
    if payload.id:
        product = session.get(Product, payload.id)
        if not product:
            raise HTTPException(status_code=404, detail="product not found")
    else:
        product = Product(seller_id=payload.seller_id, name=payload.name, sku_code=payload.sku_code, category=payload.category)
    for field, value in payload.model_dump().items():
        if field != "id":
            setattr(product, field, value)
    product.updated_at = utcnow()
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.post("/products/{product_id}/delete")
def delete_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="product not found")
    medias = session.exec(select(ProductMedia).where(ProductMedia.product_id == product_id)).all()
    for media in medias:
        session.delete(media)
    session.delete(product)
    session.commit()
    return {"ok": True}


@router.get("/products/{product_id}/media")
def list_product_media(product_id: int, session: Session = Depends(get_session)):
    return session.exec(select(ProductMedia).where(ProductMedia.product_id == product_id).order_by(ProductMedia.sort_order)).all()


@router.post("/products/media")
def attach_product_media(payload: ProductMediaAttachRequest, session: Session = Depends(get_session)):
    media = ProductMedia(**payload.model_dump())
    session.add(media)
    session.commit()
    session.refresh(media)
    product = session.get(Product, payload.product_id)
    if product and not product.thumbnail_url and payload.media_type == "image":
        product.thumbnail_url = payload.file_url
        session.add(product)
        session.commit()
    return media


@router.get("/contents")
def list_contents(session: Session = Depends(get_session)):
    return session.exec(select(ContentItem).order_by(ContentItem.created_at.desc())).all()


@router.get("/community/posts")
def list_community_posts(session: Session = Depends(get_session)):
    rows = []
    for post in session.exec(select(CommunityPost).order_by(CommunityPost.created_at.desc())).all():
        meta = _community_author(session, post.author_id)
        rows.append({"id": post.id, "category": post.category, "title": post.title, "body": post.body, "visibility": post.visibility, "purpose": post.purpose, "allow_dm": post.allow_dm, "status": post.status, "author_id": post.author_id, **meta, "created_at": post.created_at.isoformat() if post.created_at else ""})
    return rows


@router.post("/community/posts")
def create_community_post(payload: CommunityPostCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    validate_exchange_text(payload.title)
    validate_exchange_text(payload.body)
    _ensure_post_visibility(current_user, payload.visibility)
    post = CommunityPost(author_id=current_user.id or 0, author_grade=_role_name(current_user.grade), category=payload.category, title=payload.title, body=payload.body, visibility=payload.visibility, purpose=payload.purpose, allow_dm=payload.allow_dm, status="published", created_at=utcnow(), updated_at=utcnow())
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@router.get("/community/threads")
def list_threads(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    rows = []
    stmt = select(DirectMessageThread).where((DirectMessageThread.participant_a_id == (current_user.id or 0)) | (DirectMessageThread.participant_b_id == (current_user.id or 0))).order_by(DirectMessageThread.updated_at.desc())
    for thread in session.exec(stmt).all():
        other_id = _message_counterparty(thread, current_user.id or 0)
        other = session.get(User, other_id)
        rows.append({"id": thread.id, "subject": thread.subject, "purpose_code": thread.purpose_code, "thread_type": thread.thread_type, "status": thread.status, "related_post_id": thread.related_post_id, "related_product_id": thread.related_product_id, "other_user_id": other_id, "other_user_name": other.name if other else f"user:{other_id}", "updated_at": thread.updated_at.isoformat() if thread.updated_at else ""})
    return rows


@router.post("/community/threads")
def create_thread(payload: DirectMessageThreadCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if payload.participant_b_id == (current_user.id or 0):
        raise HTTPException(status_code=400, detail="cannot message self")
    validate_exchange_text(payload.subject)
    _ensure_dm_policy(current_user, payload.purpose_code)
    target = session.get(User, payload.participant_b_id)
    if not target:
        raise HTTPException(status_code=404, detail="target user not found")
    thread = DirectMessageThread(subject=payload.subject, purpose_code=payload.purpose_code, thread_type=payload.thread_type, created_by=current_user.id or 0, participant_a_id=current_user.id or 0, participant_b_id=payload.participant_b_id, related_post_id=payload.related_post_id, related_product_id=payload.related_product_id, status="open", created_at=utcnow(), updated_at=utcnow())
    session.add(thread)
    session.commit()
    session.refresh(thread)
    return thread


@router.get("/community/threads/{thread_id}/messages")
def list_messages(thread_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    thread = session.get(DirectMessageThread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="thread not found")
    _ensure_thread_member(thread, current_user.id or 0)
    rows = []
    for msg in session.exec(select(DirectMessage).where(DirectMessage.thread_id == thread_id).order_by(DirectMessage.created_at)).all():
        sender = session.get(User, msg.sender_id)
        rows.append({"id": msg.id, "sender_id": msg.sender_id, "sender_name": sender.name if sender else f"user:{msg.sender_id}", "receiver_id": msg.receiver_id, "purpose_code": msg.purpose_code, "message": msg.message, "created_at": msg.created_at.isoformat() if msg.created_at else ""})
    return rows


@router.post("/community/messages")
def create_message(payload: DirectMessageCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    thread = session.get(DirectMessageThread, payload.thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="thread not found")
    _ensure_thread_member(thread, current_user.id or 0)
    _ensure_dm_policy(current_user, payload.purpose_code)
    validate_exchange_text(payload.message)
    receiver_id = _message_counterparty(thread, current_user.id or 0)
    msg = DirectMessage(thread_id=thread.id or 0, sender_id=current_user.id or 0, receiver_id=receiver_id, purpose_code=payload.purpose_code, message=payload.message, created_at=utcnow())
    thread.updated_at = utcnow()
    session.add(thread)
    session.add(msg)
    session.commit()
    session.refresh(msg)
    return msg


@router.post("/contents")
def upsert_content(payload: ContentUpsertRequest, session: Session = Depends(get_session)):
    if payload.id:
        item = session.get(ContentItem, payload.id)
        if not item:
            raise HTTPException(status_code=404, detail="content not found")
    else:
        item = ContentItem(author_id=payload.author_id, title=payload.title)
    for field, value in payload.model_dump().items():
        if field != "id":
            setattr(item, field, value)
    item.updated_at = utcnow()
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.post("/contents/{content_id}/delete")
def delete_content(content_id: int, session: Session = Depends(get_session)):
    item = session.get(ContentItem, content_id)
    if not item:
        raise HTTPException(status_code=404, detail="content not found")
    session.delete(item)
    session.commit()
    return {"ok": True}


@router.post("/upload")
async def upload_media(file: UploadFile = File(...)):
    suffix, media_type = _ensure_upload_file(file)
    safe_name = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}{suffix}"
    upload_dir = Path(settings.uploads_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    out_path = upload_dir / safe_name
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail=f"file too large: {len(content)} bytes")
    out_path.write_bytes(content)
    return {"file_name": file.filename, "saved_name": safe_name, "file_url": f"/media/{safe_name}", "media_type": media_type, "size": len(content)}


@router.post("/reports")
def create_report(payload: SimpleReportCreate, session: Session = Depends(get_session)):
    report = ModerationReport(**payload.model_dump())
    session.add(report)
    session.commit()
    session.refresh(report)
    ensure_sla_event(session, "report_review", "report", str(report.id), owner_id=report.assigned_to, hours=24)
    return report


@router.get("/orders")
def list_orders(session: Session = Depends(get_session)):
    rows = []
    for order in session.exec(select(Order)).all():
        items = session.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all()
        rows.append(
            {
                "id": order.id,
                "order_no": order.order_no,
                "member_id": order.member_id,
                "seller_id": order.seller_id,
                "status": order.order_status,
                "payment_method": order.payment_method,
                "payment_pg": order.payment_pg,
                "total_amount": order.total_amount,
                "settlement_status": order.settlement_status,
                "item_count": len(items),
            }
        )
    return rows


@router.post("/orders")
def create_order(payload: OrderCreateRequest, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    product = session.get(Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="product not found")
    qty = max(1, payload.qty)
    unit_price = int(product.price or 0)
    total_amount = unit_price * qty
    supply_amount = int(round(total_amount / 1.1)) if total_amount else 0
    vat_amount = total_amount - supply_amount
    order = Order(
        order_no=f"ORD-{utcnow().strftime('%Y%m%d%H%M%S')}",
        member_id=current_user.id or 0,
        seller_id=product.seller_id,
        order_status="paid",
        payment_method=payload.payment_method,
        payment_pg=payload.payment_pg,
        approved_at=utcnow(),
        supply_amount=supply_amount,
        vat_amount=vat_amount,
        total_amount=total_amount,
        fee_rate=payload.fee_rate,
        settlement_status="open",
    )
    session.add(order)
    session.commit()
    session.refresh(order)
    item = OrderItem(
        order_id=order.id or 0,
        product_id=product.id or 0,
        sku_code=product.sku_code,
        qty=qty,
        unit_price=unit_price,
        supply_amount=supply_amount,
        vat_amount=vat_amount,
        fee_rate=payload.fee_rate,
        coupon_burden_owner=payload.coupon_burden_owner,
        refund_status=None,
    )
    session.add(item)
    session.commit()
    write_admin_log(session, current_user, "order_create", "order", str(order.id), "스타터 주문 생성", after_state=f"total={total_amount}")
    return {"ok": True, "order_id": order.id, "order_no": order.order_no, "total_amount": total_amount}


@router.get("/settlements/preview")
def settlement_preview(session: Session = Depends(get_session)):
    lines = []
    for item in session.exec(select(OrderItem)).all():
        order = session.get(Order, item.order_id)
        product = session.get(Product, item.product_id)
        if not order:
            continue
        platform_fee = int(round((order.total_amount or 0) * float(item.fee_rate or 0)))
        pg_fee = int(round((order.total_amount or 0) * 0.03))
        seller_receivable = max(0, int(order.total_amount or 0) - platform_fee - pg_fee)
        lines.append(
            {
                "order_id": order.id,
                "order_no": order.order_no,
                "product": product.name if product else f"product:{item.product_id}",
                "qty": item.qty,
                "fee_rate": f"{float(item.fee_rate or 0)*100:.1f}%",
                "platform_fee": platform_fee,
                "pg_fee": pg_fee,
                "seller_receivable": seller_receivable,
                "coupon_burden_owner": item.coupon_burden_owner,
            }
        )
    return {"items": lines, "summary": {"count": len(lines), "gross_amount": sum(int(x["seller_receivable"]) + int(x["platform_fee"]) + int(x["pg_fee"]) for x in lines), "seller_receivable_total": sum(int(x["seller_receivable"]) for x in lines)}}


@router.get("/reports")
def list_reports(session: Session = Depends(get_session)):
    rows = []
    for report in session.exec(select(ModerationReport)).all():
        rows.append(
            {
                "id": report.id,
                "reporter_id": report.reporter_id,
                "target_type": report.target_type,
                "target_id": report.target_id,
                "reason_code": report.reason_code,
                "priority": report.priority,
                "status": report.status,
                "assigned_to": report.assigned_to,
                "action_taken": report.action_taken,
            }
        )
    return rows


@router.post("/reports/{report_id}/resolve")
def resolve_report(report_id: int, payload: ReportResolveRequest, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    report = session.get(ModerationReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="report not found")
    before = report.status
    report.status = payload.status
    report.action_taken = payload.action_taken
    report.assigned_to = current_user.id
    session.add(report)
    session.commit()
    write_admin_log(session, current_user, "report_resolve", "report", str(report_id), payload.action_taken or "신고 처리", before_state=before, after_state=report.status)
    return {"ok": True, "id": report_id, "status": report.status}


@router.get("/admin-action-logs")
def list_admin_action_logs(session: Session = Depends(get_session)):
    rows = []
    for row in session.exec(select(AdminActionLog)).all():
        rows.append(
            {
                "id": row.id,
                "admin_id": row.admin_id,
                "admin_grade": row.admin_grade,
                "action_type": row.action_type,
                "target_type": row.target_type,
                "target_id": row.target_id,
                "reason": row.reason,
                "created_at": row.created_at.isoformat() if row.created_at else "",
            }
        )
    return rows


@router.get("/qa/smoke")
def smoke_check(session: Session = Depends(get_session)):
    return {
        "status": "ok",
        "users": len(session.exec(select(User)).all()),
        "products": len(session.exec(select(Product)).all()),
        "orders": len(session.exec(select(Order)).all()),
        "reports": len(session.exec(select(ModerationReport)).all()),
        "contents": len(session.exec(select(ContentItem)).all()),
    }


@router.get("/legal/documents")
def legal_documents():
    base = Path(__file__).resolve().parents[2] / "docs" / "legal_templates"
    items = []
    for name in ["terms_checklist.md", "terms_of_service_final.md", "privacy_policy_final.md", "seller_terms_final.md", "youth_policy_final.md", "refund_policy_final.md"]:
        file_path = base / name
        items.append({"name": name, "exists": file_path.exists(), "path": str(file_path.relative_to(base.parents[1])) if file_path.exists() else str(file_path)})
    return {"items": items}


@router.get("/tax/month-close.csv")
def tax_month_close_csv(session: Session = Depends(get_session)):
    orders = session.exec(select(Order)).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["order_no", "seller_id", "payment_pg", "supply_amount", "vat_amount", "total_amount", "settlement_status"])
    for o in orders:
        writer.writerow([o.order_no, o.seller_id, o.payment_pg, o.supply_amount, o.vat_amount, o.total_amount, o.settlement_status])
    return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": 'attachment; filename="adultapp_month_close.csv"'})


@router.get("/tax/month-close.pdf")
def tax_month_close_pdf(session: Session = Depends(get_session)):
    orders = session.exec(select(Order)).all()
    lines = ["Adult Commerce Platform - Month Close", ""]
    for o in orders:
        lines.append(f"{o.order_no} | seller {o.seller_id} | {o.total_amount} | {o.settlement_status}")
    body = "\n".join(lines)
    pdf_bytes = (
        b"%PDF-1.1\n"
        b"1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n"
        b"2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n"
        b"3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] >>endobj\n"
        b"trailer<< /Root 1 0 R >>\n%%EOF"
    )
    headers = {"Content-Disposition": 'attachment; filename="adultapp_month_close.pdf"', "X-AdultApp-Preview": body[:200]}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)



@router.get("/security/audit-chain")
def audit_chain(session: Session = Depends(get_session)):
    rows = session.exec(select(AdminActionLog).order_by(AdminActionLog.id)).all()
    valid = True
    prev = None
    for row in rows:
        if settings.audit_log_hash_chain and row.chain_prev_hash != prev:
            valid = False
            break
        prev = row.chain_hash
    return {"count": len(rows), "valid": valid, "last_hash": prev}


@router.get("/operations/sla-events")
def sla_events(session: Session = Depends(get_session)):
    return session.exec(select(SlaEvent).order_by(SlaEvent.id.desc())).all()


@router.post("/reports/{report_id}/appeal")
def create_appeal(report_id: int, payload: dict[str, str], user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    item = AppealCase(report_id=report_id, requester_id=user.id or 0, reason=payload.get("reason", "재심 요청"))
    session.add(item)
    session.commit()
    return {"ok": True, "id": item.id}


@router.get("/reports/appeals")
def list_appeals(session: Session = Depends(get_session)):
    return session.exec(select(AppealCase).order_by(AppealCase.id.desc())).all()
