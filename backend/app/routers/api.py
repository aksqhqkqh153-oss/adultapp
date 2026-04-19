from __future__ import annotations

from datetime import datetime, timedelta
import csv
import random
import re
import hashlib
import logging
import hmac
import io
import json
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request as UrlRequest, urlopen

try:
    import portone_server_sdk as portone_sdk
except ImportError:  # pragma: no cover - optional dependency during local bootstrap
    portone_sdk = None
from urllib.error import HTTPError, URLError
from typing import Any

import pyotp
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, Response
from sqlmodel import Session, select
from sqlalchemy import func, or_

from ..auth import (
    authenticate_refresh_token,
    build_totp_uri,
    assert_admin_ip_allowed,
    check_ip_rate_limit,
    consume_login_challenge,
    consume_password_reset_token,
    create_access_token,
    try_demo_login,
    decode_token,
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
    ConsentRecord,
    ContentItem,
    FeedPost,
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
    ProfileQuestion,
    RandomChatRule,
    RandomMatchTicket,
    StoryItem,
    UserBlock,
    UserFollow,
    RefundCase,
    SlaEvent,
    SellerPenalty,
    SellerProfile,
    SellerOnboardingStatus,
    User,
)
from ..services.realtime import thread_connection_manager

from ..schemas import (
    AppReviewSettings,
    BackupCodeResponse,
    ChangePasswordRequest,
    CommunityPostCreate,
    FeedPostCreate,
    ContentUpsertRequest,
    DirectMessageCreate,
    DirectMessageDeleteRequest,
    DirectMessageThreadCreate,
    DeviceSessionRevokeRequest,
    LoginRequest,
    ConsentItem,
    SignupRequest,
    IdentityVerificationStartRequest,
    IdentityVerificationConfirmRequest,
    AdultVerificationStartRequest,
    AdultVerificationConfirmRequest,
    ProfileQuestionAnswerRequest,
    ProfileQuestionCreate,
    PasswordResetConfirmRequest,
    PasswordResetRequest,
    PaymentCancelRequest,
    PaymentConfirmRequest,
    PaymentRefundRequest,
    ProductMediaAttachRequest,
    RandomReportCreate,
    RandomRuleUpdateRequest,
    RandomThreadEndRequest,
    RandomTicketCreate,
    ProductUpsertRequest,
    RefreshTokenRequest,
    RefundTransitionRequest,
    StoryCreate,
    UserBlockCreate,
    SellerActivationChecklist,
    SimpleReportCreate,
    TokenResponse,
    TwoFactorCompleteRequest,
    TwoFASetupResponse,
    VerifyOTPRequest,
    OrderCreateRequest,
    ReportResolveRequest,
    ReconsentRequest,
    ModerationTextRequest,
    SellerVerificationRequest, SellerApprovalDecisionRequest, ProductApprovalDecisionRequest, ProductSubmitReviewRequest,
)
from ..services.seed_loader import load_project_status, load_seed

router = APIRouter()
logger = logging.getLogger(__name__)

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

CLOUDFLARE_MANUAL_DEPLOY = {
    "project_name": "adultapp",
    "frontend_root": "frontend",
    "build_command": "npm run cf:build",
    "output_directory": "dist",
    "spa_fallback": "frontend/public/_redirects",
    "required_env": [
        "VITE_API_BASE_URL",
        "VITE_APP_REVIEW_MODE",
        "VITE_MOBILE_WEB_FALLBACK_URL",
    ],
    "windows_script": "scripts/cloudflare_manual_deploy.ps1",
    "pages_cli": "npx wrangler pages deploy dist --project-name adultapp --branch main --commit-dirty=true",
    "notes": [
        "wrangler login 후 whoami 확인",
        "backend CORS_ORIGINS에 pages.dev/custom domain 추가",
        "Railway backend URL은 /api 까지 포함해 VITE_API_BASE_URL에 주입",
    ],
}

ALLOWED_UPLOAD_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".mp4", ".mov", ".webm"}
MAX_UPLOAD_BYTES = 25 * 1024 * 1024


def _ensure_random_chat_enabled() -> None:
    if not settings.random_chat_enabled:
        raise HTTPException(status_code=403, detail="random chat disabled by safe community policy")


def _community_feature_flags() -> dict[str, Any]:
    return {
        "private_web_enabled": settings.community_private_web_enabled,
        "forum_mode": settings.community_forum_mode,
        "random_chat_enabled": settings.random_chat_enabled,
        "direct_user_dm_enabled": settings.direct_user_dm_enabled,
        "offline_meeting_enabled": settings.offline_meeting_enabled,
        "friend_finding_enabled": settings.friend_finding_enabled,
        "community_image_upload_enabled": settings.community_image_upload_enabled,
        "external_contact_exchange_allowed": settings.community_external_contact_exchange_allowed,
    }
SAFE_COMMUNITY_BLOCKLIST = ["만남", "조건만남", "오프라인", "카카오톡", "카톡", "텔레그램", "텔레", "라인", "whatsapp", "wechat", "숙소", "010-", "금전거래", "조건제안", "오픈채팅"]
COMMUNITY_ALLOWED_CATEGORIES = {"안전수칙", "소재/보관/세척/사용 가이드", "익명포장/환불/배송 후기", "제품 비교", "브랜드 후기", "운영공지", "FAQ", "정보공유"}
COMMUNITY_BANNED_PATTERNS = [
    ("external_contact", re.compile(r"(카톡|카카오톡|오픈채팅|텔레|텔레그램|라인|디스코드|인스타|wechat|whatsapp|open\.kakao|t\.me)", re.IGNORECASE), "외부 연락처 유도 금지"),
    ("offline_meetup", re.compile(r"(직거래|직만남|오프(라인)?\s?만남|만나서|보자|숙소|호텔|모텔|자취방|주소 보내)", re.IGNORECASE), "오프라인 만남 유도 금지"),
    ("sexual_solicitation", re.compile(r"(역할극|플레이\s?제안|인증샷|노출|벗은|벗어|몸\s?사진|사진\s?교환|영상\s?교환|후기\s?인증)", re.IGNORECASE), "성적 유도/사진 교환 금지"),
    ("review_like_solicitation", re.compile(r"(후기처럼|리뷰처럼|사용후기.*연락|만족하면.*개인연락|구매후.*개인문의)", re.IGNORECASE), "후기 위장 유도 금지"),
    ("repeated_private_contact", re.compile(r"(계속\s?개인(연락|톡)|개인으로\s?넘어가|밖에서\s?얘기|1:1로\s?따로)", re.IGNORECASE), "반복적 사적 접촉 유도 금지"),
    ("paid_matching", re.compile(r"(돈\s?줄게|입금|송금|페이|수고비|조건\s?제안|대가\s?지급|금전\s?거래.*만남)", re.IGNORECASE), "금전 거래를 통한 매칭/주선 금지"),
]
PHONE_RE = re.compile(r"01[016789][-\s]?\d{3,4}[-\s]?\d{4}")
HANDLE_RE = re.compile(r"(?:@|https?://)(?:t\.me|open\.kakao|instagram\.com|line\.me|discord\.gg)", re.IGNORECASE)
LEGAL_DOC_VERSIONS = {
    "terms_of_service": "2026-04-11.v4",
    "privacy_policy": "2026-04-11.v4",
    "adult_service_notice": "2026-04-11.v4",
    "identity_notice": "2026-04-11.v4",
    "marketing_opt_in": "2026-04-11.v1",
    "profile_optional_opt_in": "2026-04-11.v1",
    "youth_policy": "2026-04-11.v4",
    "refund_policy": "2026-04-16.v1",
    "age_verification_policy": "2026-04-16.v1",
    "seller_terms": "2026-04-11.v1",
}
REQUIRED_SIGNUP_CONSENT_TYPES = ["terms_of_service", "privacy_policy", "adult_service_notice", "identity_notice"]
LEGAL_DOC_RELEASED_AT = {
    "terms_of_service": datetime(2026, 4, 11),
    "privacy_policy": datetime(2026, 4, 11),
    "adult_service_notice": datetime(2026, 4, 11),
    "identity_notice": datetime(2026, 4, 11),
    "marketing_opt_in": datetime(2026, 4, 11),
    "profile_optional_opt_in": datetime(2026, 4, 11),
    "youth_policy": datetime(2026, 4, 11),
    "refund_policy": datetime(2026, 4, 16),
    "age_verification_policy": datetime(2026, 4, 16),
    "seller_terms": datetime(2026, 4, 11),
}
LEGAL_TEMPLATE_FILES = {
    "terms_of_service": Path("docs/legal_templates/terms_of_service_final.md"),
    "privacy_policy": Path("docs/legal_templates/privacy_policy_final.md"),
    "youth_policy": Path("docs/legal_templates/youth_policy_final.md"),
    "refund_policy": Path("docs/legal_templates/refund_policy_final.md"),
    "age_verification_policy": Path("docs/legal_templates/age_verification_policy_final.md"),
    "seller_terms": Path("docs/legal_templates/seller_terms_final.md"),
}
VERIFICATION_ALLOWED_PROVIDERS = [item.strip() for item in settings.adult_verification_allowed_providers.split(",") if item.strip()]





def _normalize_verification_provider(provider: str | None) -> str:
    requested = (provider or settings.adult_verification_provider or "PASS").strip()
    if not requested:
        requested = "PASS"
    normalized = requested.upper() if requested.upper() == "PASS" else requested
    if normalized not in VERIFICATION_ALLOWED_PROVIDERS:
        raise HTTPException(status_code=400, detail=f"unsupported verification provider: {normalized}")
    return normalized


def _verification_signature(prefix: str, provider: str, tx_id: str) -> str:
    payload = f"{prefix}:{provider}:{tx_id}".encode("utf-8")
    secret = settings.adult_verification_webhook_secret.encode("utf-8")
    return hmac.new(secret, payload, hashlib.sha256).hexdigest()


def _verification_provider_payload(provider: str) -> dict[str, Any]:
    normalized = _normalize_verification_provider(provider)
    return {
        "provider": normalized,
        "label": settings.adult_verification_provider_label,
        "policy_note": "1차 오픈은 PortOne 기반 PASS/휴대폰 본인확인으로 시작하고, 카카오는 로그인 편의 수단으로만 사용",
        "rollout_strategy": settings.adult_verification_rollout_strategy,
        "prod_cutover_checklist": settings.adult_verification_prod_cutover_checklist,
        "mode": "test" if settings.adult_verification_test_mode else "production",
        "prod_enabled": settings.adult_verification_prod_enabled,
        "client_id_configured": settings.adult_verification_client_id != "change-me",
        "portone_store_id_configured": settings.adult_verification_portone_store_id != "change-me-portone-store-id",
        "portone_channel_key_configured": settings.adult_verification_portone_channel_key != "change-me-portone-channel-key",
        "webhook_path": settings.adult_verification_webhook_path,
        "error_code_map": _verification_error_map(),
        "callback_identity_web": settings.adult_verification_callback_identity_web,
        "callback_identity_app": settings.adult_verification_callback_identity_app,
        "callback_adult_web": settings.adult_verification_callback_web,
        "callback_adult_app": settings.adult_verification_callback_app,
    }

def _read_legal_markdown(doc_key: str) -> str:
    path = LEGAL_TEMPLATE_FILES.get(doc_key)
    if not path:
        raise HTTPException(status_code=404, detail="legal document not found")
    if not path.exists():
        return f"# {doc_key}\n\n문서 파일이 아직 배치되지 않았습니다."
    return path.read_text(encoding="utf-8")


def _record_consents(session: Session, user_id: int, consents: list[ConsentItem], request: Request) -> None:
    ip_address = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent")
    for item in consents:
        session.add(ConsentRecord(user_id=user_id, consent_type=item.consent_type, is_required=item.is_required, agreed=item.agreed, version=item.version, ip_address=ip_address, user_agent=user_agent))
    session.commit()


def _latest_user_consents(session: Session, user_id: int) -> dict[str, ConsentRecord]:
    rows = session.exec(select(ConsentRecord).where(ConsentRecord.user_id == user_id).order_by(ConsentRecord.agreed_at.desc(), ConsentRecord.id.desc())).all()
    latest: dict[str, ConsentRecord] = {}
    for row in rows:
        latest.setdefault(row.consent_type, row)
    return latest


def _user_requires_reconsent(session: Session, user_id: int) -> bool:
    latest = _latest_user_consents(session, user_id)
    now = utcnow()
    for consent_type in REQUIRED_SIGNUP_CONSENT_TYPES:
        row = latest.get(consent_type)
        current_version = LEGAL_DOC_VERSIONS.get(consent_type, row.version if row else "v1")
        if not row or not row.agreed:
            return True
        if row.version != current_version:
            released_at = LEGAL_DOC_RELEASED_AT.get(consent_type, now)
            grace_deadline = released_at + timedelta(days=settings.reconsent_grace_days)
            if now >= grace_deadline:
                return True
    return False


def _consent_status_payload(session: Session, user_id: int) -> dict[str, Any]:
    latest = _latest_user_consents(session, user_id)
    now = utcnow()
    items: dict[str, Any] = {}
    grace_deadlines: list[datetime] = []
    for consent_type, version in LEGAL_DOC_VERSIONS.items():
        row = latest.get(consent_type)
        released_at = LEGAL_DOC_RELEASED_AT.get(consent_type, now)
        grace_deadline = released_at + timedelta(days=settings.reconsent_grace_days)
        version_changed = bool(row and row.version != version)
        pending_grace = version_changed and consent_type in REQUIRED_SIGNUP_CONSENT_TYPES and now < grace_deadline
        if pending_grace:
            grace_deadlines.append(grace_deadline)
        items[consent_type] = {
            "required": consent_type in REQUIRED_SIGNUP_CONSENT_TYPES,
            "current_version": version,
            "agreed": bool(row.agreed) if row else False,
            "agreed_version": row.version if row else None,
            "agreed_at": row.agreed_at.isoformat() if row and row.agreed_at else None,
            "released_at": released_at.isoformat(),
            "grace_deadline": grace_deadline.isoformat() if consent_type in REQUIRED_SIGNUP_CONSENT_TYPES else None,
            "pending_grace": pending_grace,
            "needs_update": (not row or not row.agreed or (version_changed and now >= grace_deadline)) if consent_type in REQUIRED_SIGNUP_CONSENT_TYPES else False,
        }
    next_deadline = min(grace_deadlines).isoformat() if grace_deadlines else None
    return {
        "reconsent_required": _user_requires_reconsent(session, user_id),
        "grace_period_days": settings.reconsent_grace_days,
        "next_reconsent_deadline": next_deadline,
        "items": items,
    }


def _assert_can_access_adult(user: User) -> None:
    if user.grade == MemberGrade.ADMIN:
        return
    if not user.identity_verified:
        raise HTTPException(status_code=403, detail="identity verification required")
    if not user.adult_verified:
        raise HTTPException(status_code=403, detail="adult verification required")


def _assert_random_chat_entry_allowed(user: User, session: Session) -> dict[str, Any]:
    _assert_can_access_adult(user)
    _assert_reconsent_write_allowed(user, session)
    if user.member_status != "active":
        raise HTTPException(status_code=403, detail="random chat available for active members only")
    missing: list[str] = []
    if not user.gender:
        missing.append("gender")
    if not user.age_band:
        missing.append("age_band")
    if not user.region_code:
        missing.append("region_code")
    if missing:
        raise HTTPException(status_code=403, detail={
            "code": "random_chat_profile_required",
            "message": "gender, age band, and region are required for random chat",
            "missing_fields": missing,
        })
    return {
        "service_mode": "anonymous_info_exchange",
        "media_upload_allowed": False,
        "external_contact_allowed": False,
        "offline_meeting_allowed": False,
        "identity_verified": bool(user.identity_verified),
        "adult_verified": bool(user.adult_verified),
    }


def _assert_reconsent_write_allowed(user: User, session: Session) -> None:
    if user.grade == MemberGrade.ADMIN:
        return
    if not _user_requires_reconsent(session, user.id or 0):
        return
    if settings.reconsent_enforcement_mode == "login_block":
        raise HTTPException(status_code=403, detail="reconsent required before login")
    raise HTTPException(status_code=403, detail="reconsent required before write actions")


def _seller_can_register_products(user: User, session: Session) -> tuple[bool, str]:
    if user.grade == MemberGrade.ADMIN:
        return True, "admin override"
    profile = session.exec(select(SellerProfile).where(SellerProfile.user_id == (user.id or 0))).first()
    if not profile:
        return False, "seller verification profile missing"
    eligible = all([
        user.grade in {MemberGrade.SELLER, MemberGrade.SUB_ADMIN},
        bool(user.adult_verified),
        bool(profile.business_number),
        bool(profile.return_address),
        bool(profile.cs_contact),
        bool(profile.seller_contract_agreed),
        bool(profile.settlement_account_verified),
        user.seller_onboarding_status == SellerOnboardingStatus.ACTIVE,
    ])
    return eligible, "eligible" if eligible else "business verification and admin approval required"


def _enforce_route_rate_limit(request: Request, route_key: str, session: Session) -> None:
    client_ip = request.client.host if request.client else "127.0.0.1"
    check_ip_rate_limit(client_ip, route_key, session)


def _flag_moderation_event(session: Session, actor: User, target_type: str, text: str, reason: str = "자동 감지") -> dict[str, Any]:
    report = ModerationReport(reporter_id=actor.id or 0, target_type=target_type, target_id=actor.id or 0, reason_code=reason, priority="high", status="queued")
    session.add(report)
    block = session.exec(select(UserBlock).where(UserBlock.blocker_id == (actor.id or 0), UserBlock.blocked_id == 1)).first()
    if not block:
        session.add(UserBlock(blocker_id=actor.id or 0, blocked_id=1, reason_code="auto_safety_hold", is_active=True, created_at=utcnow()))
    session.commit()
    return {"report_id": report.id, "reason": reason, "preview": text[:80]}


def _extract_optional_user(session: Session, request: Request) -> User | None:
    auth_header = request.headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        return None
    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        return None
    try:
        payload = decode_token(token)
    except HTTPException:
        return None
    user_id = payload.get("sub")
    try:
        user_id_int = int(user_id)
    except (TypeError, ValueError):
        return None
    return session.get(User, user_id_int)


def _user_can_view_adult(user: User | None) -> bool:
    return bool(user and user.adult_verified)


def _is_admin_like(user: User) -> bool:
    return user.grade in {MemberGrade.ADMIN, MemberGrade.SUB_ADMIN, MemberGrade.MANAGER}


def _is_moderator_like(user: User) -> bool:
    return user.grade in {MemberGrade.ADMIN, MemberGrade.SUB_ADMIN, MemberGrade.MANAGER}


def _can_manage_content(user: User, author_id: int) -> bool:
    return _is_admin_like(user) or (user.id or 0) == author_id


def _can_manage_product(user: User, product: Product) -> bool:
    return _is_admin_like(user) or (user.id or 0) == product.seller_id


def _can_view_order(user: User, order: Order) -> bool:
    return _is_admin_like(user) or (user.id or 0) in {order.member_id, order.seller_id}


def _require_admin(user: User) -> None:
    if user.grade != MemberGrade.ADMIN:
        raise HTTPException(status_code=403, detail="admin only")


def _require_moderator(user: User) -> None:
    if not _is_moderator_like(user):
        raise HTTPException(status_code=403, detail="moderator or admin only")


def _scan_upload_content(file_name: str, content_type: str | None, content: bytes) -> dict[str, Any]:
    lowered_name = (file_name or '').lower()
    lowered_type = (content_type or '').lower()
    blocked_ext = {'.exe', '.dll', '.js', '.vbs', '.bat', '.cmd', '.ps1', '.scr', '.zip', '.7z', '.rar', '.apk'}
    if any(lowered_name.endswith(ext) for ext in blocked_ext):
        raise HTTPException(status_code=400, detail='executable/archive upload is not allowed')
    if content.startswith(b'MZ') or b'<script' in content[:4096].lower():
        raise HTTPException(status_code=400, detail='malicious file signature detected')
    mime_allowed = {
        '.png': {'image/png'}, '.jpg': {'image/jpeg'}, '.jpeg': {'image/jpeg'}, '.webp': {'image/webp'},
        '.mp4': {'video/mp4'}, '.mov': {'video/quicktime', 'video/mp4'}, '.webm': {'video/webm'},
    }
    suffix = Path(file_name or '').suffix.lower()
    allowed_types = mime_allowed.get(suffix, set())
    if allowed_types and lowered_type and lowered_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f'mime mismatch: {content_type}')
    return {'mime_ok': True, 'malware_scan': 'pass'}


def _presigned_upload_payload(saved_name: str, media_type: str) -> dict[str, Any]:
    public_url = f"{settings.media_base_url.rstrip('/')}/{saved_name}"
    return {
        'storage_mode': 'server_presigned_stub',
        'upload_key': saved_name,
        'upload_url': f'/api/upload?key={quote(saved_name)}',
        'public_url': public_url,
        'media_type': media_type,
        'expires_in_seconds': 900,
    }


def _validate_community_information_post(category: str, title: str, body: str) -> None:
    if category not in COMMUNITY_ALLOWED_CATEGORIES:
        raise HTTPException(status_code=400, detail='community category not allowed')
    merged = f"{title}\n{body}"
    for _, pattern, reason in COMMUNITY_BANNED_PATTERNS:
        if pattern.search(merged):
            raise HTTPException(status_code=400, detail=reason)


def _moderation_text_findings(text_value: str) -> list[dict[str, str]]:
    findings: list[dict[str, str]] = []
    lowered = (text_value or '').lower()
    for token in SAFE_COMMUNITY_BLOCKLIST:
        if token.lower() in lowered:
            findings.append({'code': 'token_block', 'reason': f'blocked token: {token}'})
    if PHONE_RE.search(text_value or ''):
        findings.append({'code': 'phone', 'reason': 'phone/contact exchange is not allowed'})
    if HANDLE_RE.search(text_value or ''):
        findings.append({'code': 'handle', 'reason': 'external contact/share link is not allowed'})
    for code, pattern, reason in COMMUNITY_BANNED_PATTERNS:
        if pattern.search(text_value or ''):
            findings.append({'code': code, 'reason': reason})
    deduped = []
    seen = set()
    for item in findings:
        key = (item['code'], item['reason'])
        if key not in seen:
            seen.add(key)
            deduped.append(item)
    return deduped


def _adult_lock_payload(user: User) -> dict[str, Any]:
    return {
        "adult_verified": bool(user.adult_verified),
        "adult_verification_status": user.adult_verification_status,
        "adult_verification_fail_count": user.adult_verification_fail_count or 0,
        "adult_verification_locked_until": user.adult_verification_locked_until.isoformat() if user.adult_verification_locked_until else None,
        "identity_verified": bool(user.identity_verified),
    }


def _build_identity_tx(prefix: str, provider: str) -> str:
    normalized = _normalize_verification_provider(provider)
    safe_provider = re.sub(r"[^a-z0-9]+", "-", normalized.lower())
    return f"{prefix}_{safe_provider}_{int(datetime.utcnow().timestamp())}_{random.randint(1000,9999)}"


def _register_adult_verification_failure(user: User, session: Session) -> None:
    now = utcnow()
    user.adult_verification_fail_count = (user.adult_verification_fail_count or 0) + 1
    if user.adult_verification_fail_count >= 5:
        user.adult_verification_locked_until = now + timedelta(hours=1)
        user.adult_verification_fail_count = 0
    session.add(user)
    session.commit()


def validate_exchange_text(text_value: str) -> None:
    findings = _moderation_text_findings(text_value)
    if findings:
        raise HTTPException(status_code=400, detail=findings[0]['reason'])


def _message_counterparty(thread: DirectMessageThread, user_id: int) -> int:
    return thread.participant_b_id if thread.participant_a_id == user_id else thread.participant_a_id


def _ensure_thread_member(thread: DirectMessageThread, user_id: int) -> None:
    if user_id not in {thread.participant_a_id, thread.participant_b_id}:
        raise HTTPException(status_code=403, detail="not a thread participant")




def _ensure_thread_visible(session: Session, thread: DirectMessageThread, user_id: int) -> None:
    if thread.thread_type != "random_1to1":
        return
    other_id = _message_counterparty(thread, user_id)
    if _is_blocked_pair(session, user_id, other_id):
        raise HTTPException(status_code=404, detail="thread hidden by block")


def _is_mutual_follow(session: Session, user_a: int, user_b: int) -> bool:
    a_to_b = session.exec(select(UserFollow).where(UserFollow.follower_id == user_a, UserFollow.followee_id == user_b, UserFollow.is_active == True)).first()  # noqa: E712
    b_to_a = session.exec(select(UserFollow).where(UserFollow.follower_id == user_b, UserFollow.followee_id == user_a, UserFollow.is_active == True)).first()  # noqa: E712
    return bool(a_to_b and b_to_a)


def _dm_notice_lines() -> list[str]:
    return [
        "오프라인 만남 제안 금지",
        "외부 연락처 교환 금지",
        "사진/영상 전송 금지",
        "반복 접촉 금지",
    ]


def _ensure_dm_request_requirements(session: Session, requester: User, target: User, payload: DirectMessageThreadCreate) -> None:
    if not payload.requester_consented_rules:
        raise HTTPException(status_code=400, detail="dm rules consent required")
    if payload.thread_type == "mutual_follow_dm":
        if not requester.adult_verified or not requester.identity_verified:
            raise HTTPException(status_code=403, detail="adult and identity verification required")
        if not _is_mutual_follow(session, requester.id or 0, target.id or 0):
            raise HTTPException(status_code=403, detail="mutual follow required")
        if payload.purpose_code not in {"FEED_REPLY", "SUPPORT"}:
            raise HTTPException(status_code=400, detail="unsupported mutual dm purpose")


def _serialize_message(msg: DirectMessage, sender_name: str) -> dict[str, Any]:
    hidden_text = "삭제된 메시지" if msg.is_deleted_for_all else msg.message
    return {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "sender_name": sender_name,
        "receiver_id": msg.receiver_id,
        "purpose_code": msg.purpose_code,
        "message": hidden_text,
        "is_deleted_for_all": bool(msg.is_deleted_for_all),
        "deleted_at": msg.deleted_at.isoformat() if msg.deleted_at else None,
        "deleted_by_id": msg.deleted_by_id,
        "created_at": msg.created_at.isoformat() if msg.created_at else "",
    }


def _random_rematch_window_seconds(rule: RandomChatRule, user: User) -> tuple[int, int]:
    gender = (user.gender or "").strip()
    if gender == "남성":
        return rule.male_rematch_min_seconds, rule.male_rematch_max_seconds
    if gender == "여성":
        return rule.female_rematch_min_seconds, rule.female_rematch_max_seconds
    return rule.min_wait_seconds, min(rule.max_wait_seconds, max(rule.min_wait_seconds, 30))


def _apply_random_rematch_cooldown(session: Session, user: User, rule: RandomChatRule) -> dict[str, Any]:
    min_sec, max_sec = _random_rematch_window_seconds(rule, user)
    cooldown_seconds = random.randint(min_sec, max_sec)
    user.random_chat_cooldown_until = utcnow() + timedelta(seconds=cooldown_seconds)
    session.add(user)
    session.commit()
    return {
        "cooldown_seconds": cooldown_seconds,
        "cooldown_until": user.random_chat_cooldown_until.isoformat() if user.random_chat_cooldown_until else None,
        "min_seconds": min_sec,
        "max_seconds": max_sec,
    }

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

def build_token_response_safe(user: User, session: Session) -> TokenResponse:
    try:
        device_session = create_device_session(user, session, "web-browser")
    except Exception as exc:
        session.rollback()
        logger.exception("create_device_session_failed")
        device_session = None
    try:
        return build_token_response(user, session, device_session)
    except Exception:
        session.rollback()
        logger.exception("build_token_response_failed")
        access_token = create_access_token(user, None)
        return TokenResponse(access_token=access_token, refresh_token="", role=user.grade, user_id=user.id or 0, two_factor_required=False)


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


def _parse_key_value_map(raw: str | None) -> dict[str, str]:
    items: dict[str, str] = {}
    for piece in [x.strip() for x in (raw or "").split(",") if x.strip()]:
        if ":" in piece:
            key, value = piece.split(":", 1)
            items[key.strip()] = value.strip()
    return items


def _app_asset_json(session: Session, store: str, asset_name: str) -> dict[str, Any] | None:
    row = session.exec(select(AppAsset).where(AppAsset.store == store, AppAsset.asset_name == asset_name)).first()
    if not row or not row.note:
        return None
    try:
        return json.loads(row.note)
    except Exception:
        return None


def _save_app_asset_json(session: Session, store: str, asset_name: str, payload: dict[str, Any], status: str = "configured") -> AppAsset:
    row = session.exec(select(AppAsset).where(AppAsset.store == store, AppAsset.asset_name == asset_name)).first()
    if not row:
        row = AppAsset(store=store, asset_name=asset_name, asset_type="metadata")
    row.status = status
    row.note = json.dumps(payload, ensure_ascii=False, indent=2)
    session.add(row)
    session.commit()
    session.refresh(row)
    return row




def _seller_submission_payload(session: Session, user_id: int) -> dict[str, Any]:
    return _app_asset_json(session, "seller_submission", str(user_id)) or {}


def _save_seller_submission_payload(session: Session, user_id: int, payload: dict[str, Any], status: str = "pending") -> AppAsset:
    return _save_app_asset_json(session, "seller_submission", str(user_id), payload, status=status)


def _seller_submission_complete(payload: dict[str, Any]) -> bool:
    return not _seller_submission_missing_fields(payload)


def _product_publicly_visible(item: Product | None) -> bool:
    if not item:
        return False
    return bool(item.is_active) and str(item.status) in {"approved", "published", "active"}


def _product_can_edit_by_seller(item: Product | None, seller_id: int) -> bool:
    if not item or item.seller_id != seller_id:
        return False
    return str(item.status) in {x.strip() for x in settings.product_review_editable_statuses.split(",") if x.strip()}

def _business_info_payload(session: Session) -> tuple[dict[str, str], list[str], bool, str]:
    base = {
        "operator_legal_name": settings.operator_legal_name,
        "operator_brand_name": settings.operator_brand_name,
        "business_registration_no": settings.operator_business_registration_no,
        "mail_order_report_no": settings.operator_mail_order_report_no,
        "business_address": settings.operator_business_address,
        "support_email": settings.operator_support_email,
        "support_phone": settings.operator_support_phone,
        "hosting_provider": settings.operator_hosting_provider,
        "youth_protection_officer": settings.operator_youth_protection_officer,
        "dispute_contact_url": settings.operator_dispute_contact_url,
        "privacy_contact_email": settings.operator_privacy_contact_email,
    }
    source = "settings"
    if settings.beta_business_info_db_override_enabled:
        override = _app_asset_json(session, "business_info", "current") or {}
        if override:
            source = "db_override"
            for key, value in override.items():
                if key in base and str(value).strip():
                    base[key] = str(value).strip()
    placeholders = {k: (not str(v).strip() or "미정" in str(v) or "example.com" in str(v) or v == "000-0000-0000") for k, v in base.items()}
    return base, [k for k, v in placeholders.items() if v], (not any(placeholders.values())), source


def _verification_error_map() -> dict[str, str]:
    return _parse_key_value_map(settings.adult_verification_error_code_map)


def _minor_block_purge_preview(session: Session) -> dict[str, Any]:
    threshold = utcnow() - timedelta(days=settings.minor_block_retention_days)
    users = session.exec(select(User).where(User.member_status.in_(["minor_blocked", "blocked_minor", "login_blocked_minor"]))).all()
    candidates = [u for u in users if ((u.identity_verified_at and u.identity_verified_at <= threshold) or (u.adult_verified_at and u.adult_verified_at <= threshold) or (u.last_login_at and u.last_login_at <= threshold) or (u.identity_verified_at is None and u.adult_verified_at is None and u.last_login_at is None))]
    return {
        "retention_days": settings.minor_block_retention_days,
        "cron": settings.minor_block_purge_cron,
        "enabled": settings.minor_block_purge_batch_enabled,
        "candidate_count": len(candidates),
        "candidate_user_ids": [u.id for u in candidates[:20]],
    }


def _run_minor_block_purge(session: Session, actor: User | None = None) -> dict[str, Any]:
    threshold = utcnow() - timedelta(days=settings.minor_block_retention_days)
    users = session.exec(select(User).where(User.member_status.in_(["minor_blocked", "blocked_minor", "login_blocked_minor"]))).all()
    purged = 0
    purged_ids: list[int] = []
    for user in users:
        pivot = user.identity_verified_at or user.adult_verified_at or user.last_login_at
        if pivot and pivot > threshold:
            continue
        user.email = f"minor-blocked-{user.id}@purged.local"
        user.name = "미성년 차단 계정(파기 처리)"
        user.password_hash = ""
        user.login_provider = None
        user.identity_verification_method = None
        user.identity_verification_token = None
        user.identity_verified = False
        user.adult_verified = False
        user.gender = None
        user.age_band = None
        user.region_code = None
        user.latitude = None
        user.longitude = None
        user.member_status = "minor_blocked_purged"
        user.reset_required = True
        session.add(user)
        purged += 1
        if user.id is not None:
            purged_ids.append(user.id)
    session.commit()
    if actor and purged_ids:
        write_admin_log(session, actor, "minor_block_purge", "user", ",".join(map(str, purged_ids[:20])), f"minor blocked purge run ({purged} users)")
    return {"ok": True, "purged_count": purged, "purged_user_ids": purged_ids[:20], "retention_days": settings.minor_block_retention_days}


def _payment_provider_status() -> dict[str, Any]:
    test_items = {
        "store_id": settings.pg_portone_store_id_test != "change-me-pg-store-id-test",
        "channel_key": settings.pg_portone_channel_key_test != "change-me-pg-channel-key-test",
        "merchant_id": settings.pg_primary_merchant_id_test != "change-me-merchant-test",
        "api_secret": settings.portone_api_secret != "change-me-portone-api-secret",
        "webhook_secret": settings.portone_webhook_secret_test != "change-me-portone-webhook-test",
        "toss_client_key": settings.toss_client_key_test != "change-me-toss-client-key-test",
        "toss_secret_key": settings.toss_secret_key_test != "change-me-toss-secret-key-test",
        "toss_mid": settings.toss_mid_test != "change-me-toss-mid-test",
    }
    live_items = {
        "store_id": settings.pg_portone_store_id_live != "change-me-pg-store-id-live",
        "channel_key": settings.pg_portone_channel_key_live != "change-me-pg-channel-key-live",
        "merchant_id": settings.pg_primary_merchant_id_live != "change-me-merchant-live",
        "webhook_secret": settings.portone_webhook_secret_live != "change-me-portone-webhook-live",
        "toss_client_key": settings.toss_client_key_live != "change-me-toss-client-key-live",
        "toss_secret_key": settings.toss_secret_key_live != "change-me-toss-secret-key-live",
        "toss_mid": settings.toss_mid_live != "change-me-toss-mid-live",
    }
    return {
        "primary_provider": settings.pg_primary_provider,
        "secondary_provider": settings.pg_secondary_provider,
        "payments_env_split_enabled": settings.payments_env_split_enabled,
        "portone_sdk_enabled": settings.portone_sdk_enabled,
        "portone_sdk_installed": portone_sdk is not None,
        "portone_store_id_configured": settings.pg_portone_store_id != "change-me-pg-store-id",
        "portone_channel_key_configured": settings.pg_portone_channel_key != "change-me-pg-channel-key",
        "portone_store_id_test_configured": test_items["store_id"],
        "portone_store_id_live_configured": live_items["store_id"],
        "portone_channel_key_test_configured": test_items["channel_key"],
        "portone_channel_key_live_configured": live_items["channel_key"],
        "primary_merchant_configured": settings.pg_primary_merchant_id != "change-me",
        "primary_merchant_test_configured": test_items["merchant_id"],
        "primary_merchant_live_configured": live_items["merchant_id"],
        "secondary_merchant_configured": settings.pg_secondary_merchant_id != "change-me",
        "webhook_paths": {"payment": settings.pg_webhook_path, "refund": settings.pg_refund_webhook_path},
        "webhook_urls": {"test": f"https://test-api.example.com{settings.pg_webhook_path}", "live": f"https://api.example.com{settings.pg_webhook_path}"},
        "settlement_basis_note": settings.pg_settlement_basis_note,
        "portone_api_secret_configured": test_items["api_secret"],
        "portone_webhook_test_configured": test_items["webhook_secret"],
        "portone_webhook_live_configured": live_items["webhook_secret"],
        "test_env_ready": all(test_items.values()),
        "toss_test_client_key_configured": test_items["toss_client_key"],
        "toss_test_secret_key_configured": test_items["toss_secret_key"],
        "toss_test_mid_configured": test_items["toss_mid"],
        "live_env_ready": all(live_items.values()),
        "toss_live_client_key_configured": live_items["toss_client_key"],
        "toss_live_secret_key_configured": live_items["toss_secret_key"],
        "toss_live_mid_configured": live_items["toss_mid"],
        "verotel": _verotel_config_snapshot(),
        "recommended_now": [
            "테스트 webhook secret / Store ID / channel key / API Secret만 먼저 입력",
            "결제·취소·부분취소·환불·webhook 재전송까지 테스트",
            "Verotel shopID / signature key / success·back·postback URL 등록",
            "live merchant / 운영 MID / live webhook secret은 마지막 단계에서만 입력",
        ],
        "test_stage_defaults": {
            "sdk_install_now": settings.test_stage_sdk_install_now,
            "live_values_entry_phase": settings.test_stage_live_values_entry_phase,
            "admin_override_policy": settings.test_stage_admin_override_policy,
            "sku_expansion_phase": settings.test_stage_sku_expansion_phase,
            "premium_sla_upgrade_phase": settings.test_stage_premium_sla_upgrade_phase,
            "next_actions": [item.strip() for item in settings.test_stage_next_actions.split(',') if item.strip()],
        },
    }




def _portone_header_dict(request: Request) -> dict[str, str]:
    return {str(k): str(v) for k, v in request.headers.items()}


def _portone_sdk_verify_webhook(raw_body: bytes, secret: str, request: Request) -> bool:
    if not settings.portone_sdk_enabled or portone_sdk is None:
        return False
    try:
        portone_sdk.webhook.verify(secret, raw_body.decode("utf-8"), _portone_header_dict(request))
        return True
    except Exception:
        return False


def _portone_env_mode(payload: dict[str, Any], request: Request) -> str:
    explicit = str(payload.get("environment") or payload.get("mode") or request.headers.get("x-portone-mode") or request.headers.get("x-portone-environment") or "").strip().lower()
    return "live" if explicit in {"live", "production", "prod"} else "test"


def _portone_webhook_secret_for_mode(mode: str) -> str:
    return settings.portone_webhook_secret_live if mode == "live" else settings.portone_webhook_secret_test


def _extract_portone_signature(request: Request, payload: dict[str, Any]) -> str:
    header_candidates = [
        request.headers.get("webhook-signature"),
        request.headers.get("x-portone-signature"),
        request.headers.get("portone-signature"),
        request.headers.get("x-signature"),
    ]
    for value in header_candidates:
        if value:
            return str(value).strip()
    return str(payload.get("signature") or "").strip()


def _verify_portone_webhook_signature(raw_body: bytes, signature: str, secret: str, request: Request) -> bool:
    if not secret or secret.startswith("change-me"):
        return True
    if settings.portone_sdk_enabled and portone_sdk is not None:
        if _portone_sdk_verify_webhook(raw_body, secret, request):
            return True
    if not signature:
        return False
    expected = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    normalized = signature.split("=", 1)[-1].strip()
    return hmac.compare_digest(normalized, expected)


def _portone_webhook_data(payload: dict[str, Any]) -> dict[str, Any]:
    return payload.get("data") if isinstance(payload.get("data"), dict) else {}


def _portone_webhook_custom_data(payload: dict[str, Any]) -> dict[str, Any]:
    return payload.get("customData") if isinstance(payload.get("customData"), dict) else {}


def _extract_portone_payment_id(payload: dict[str, Any]) -> str:
    data = _portone_webhook_data(payload)
    return str(
        payload.get("paymentId")
        or data.get("paymentId")
        or payload.get("payment_id")
        or payload.get("tx_id")
        or ""
    ).strip()


def _extract_portone_transaction_id(payload: dict[str, Any]) -> str:
    data = _portone_webhook_data(payload)
    return str(payload.get("transactionId") or data.get("transactionId") or "").strip()


def _extract_portone_store_id(payload: dict[str, Any]) -> str:
    data = _portone_webhook_data(payload)
    return str(payload.get("storeId") or data.get("storeId") or "").strip()


def _extract_portone_order_no(payload: dict[str, Any]) -> str:
    data = _portone_webhook_data(payload)
    custom_data = _portone_webhook_custom_data(payload)
    return str(
        payload.get("merchant_uid")
        or payload.get("merchantUid")
        or payload.get("order_no")
        or payload.get("orderNo")
        or custom_data.get("merchant_uid")
        or custom_data.get("merchantUid")
        or custom_data.get("order_no")
        or custom_data.get("orderNo")
        or data.get("paymentId")
        or payload.get("paymentId")
        or payload.get("payment_id")
        or ""
    ).strip()


def _portone_webhook_effective_status(payload: dict[str, Any], provider_payment: dict[str, Any] | None = None) -> str:
    data = _portone_webhook_data(payload)
    event_type = str(payload.get("type") or payload.get("event_type") or "").strip()
    if provider_payment and provider_payment.get("status"):
        return str(provider_payment.get("status"))
    if payload.get("status") or data.get("status"):
        return str(payload.get("status") or data.get("status"))
    event_mapping = {
        "Transaction.Paid": "Paid",
        "Transaction.Ready": "Ready",
        "Transaction.VirtualAccountIssued": "VirtualAccountIssued",
        "Transaction.PartialCancelled": "PartialCancelled",
        "Transaction.Cancelled": "Cancelled",
        "Transaction.Failed": "Failed",
        "Transaction.PayPending": "PayPending",
        "Transaction.CancelPending": "CancelPending",
        "Transaction.DisputeCreated": "CancelPending",
        "Transaction.DisputeResolved": "Paid",
    }
    return event_mapping.get(event_type, "payment_requested")


def _should_allow_unverified_portone_test_webhook(payload: dict[str, Any], request: Request, mode: str) -> bool:
    if mode != "test":
        return False
    data = _portone_webhook_data(payload)
    event_type = str(payload.get("type") or payload.get("event_type") or "").strip()
    store_id = _extract_portone_store_id(payload)
    payment_id = _extract_portone_payment_id(payload)
    # Fail-open only for PortOne V2 test webhooks that clearly identify our store/payment shape.
    return bool(event_type and data and store_id and payment_id)


def _portone_fetch_payment(payment_id: str) -> dict[str, Any] | None:
    if not payment_id or not settings.portone_api_secret or settings.portone_api_secret.startswith("change-me"):
        return None
    if settings.portone_sdk_enabled and portone_sdk is not None:
        try:
            client = portone_sdk.PortOneClient(secret=settings.portone_api_secret)
            payment = client.payment.get_payment(payment_id=payment_id)
            if payment is None:
                return None
            if hasattr(payment, "model_dump"):
                return payment.model_dump(by_alias=True)
            if isinstance(payment, dict):
                return payment
        except Exception:
            pass
    url = f"{settings.portone_api_base_url.rstrip('/')}/payments/{quote(payment_id)}"
    req = UrlRequest(url, headers={"Authorization": f"PortOne {settings.portone_api_secret}", "Accept": "application/json"})
    try:
        with urlopen(req, timeout=10) as resp:
            raw = resp.read().decode("utf-8")
            data = json.loads(raw)
            if isinstance(data, dict) and isinstance(data.get("payment"), dict):
                return data.get("payment")
            return data if isinstance(data, dict) else None
    except (HTTPError, URLError, TimeoutError, ValueError, json.JSONDecodeError):
        return None


def _payment_event_store_key(event_id: str, event_type: str, payment_id: str) -> str:
    pivot = event_id or payment_id or "unknown"
    return f"{event_type}:{pivot}"


def _payment_event_seen(session: Session, event_id: str, event_type: str, payment_id: str) -> bool:
    return _app_asset_json(session, "payment_webhook_event", _payment_event_store_key(event_id, event_type, payment_id)) is not None


def _mark_payment_event_seen(session: Session, event_id: str, event_type: str, payment_id: str, payload: dict[str, Any]) -> None:
    _save_app_asset_json(session, "payment_webhook_event", _payment_event_store_key(event_id, event_type, payment_id), payload, status="processed")


def _portone_status_to_order_status(status: str) -> str:
    normalized = (status or "").strip()
    mapping = {
        "Paid": "paid",
        "Ready": "payment_requested",
        "VirtualAccountIssued": "payment_requested",
        "CancelPending": "cancel_pending",
        "PartialCancelled": "partial_cancelled",
        "Cancelled": "cancelled",
        "Failed": "refund_failed",
        "Refunded": "refunded",
        "PartialRefunded": "partial_cancelled",
        "PayPending": "payment_requested",
    }
    return mapping.get(normalized, mapping.get(normalized.title(), normalized.lower() or "payment_requested"))


def _settlement_status_for_order(order_status: str) -> str:
    return "open" if order_status in {"paid"} else "hold"


def _apply_payment_status(order: Order, provider_status: str) -> str:
    next_status = _portone_status_to_order_status(provider_status)
    order.order_status = next_status
    order.settlement_status = _settlement_status_for_order(next_status)
    now = utcnow()
    if next_status == "paid":
        order.approved_at = now
    if next_status in {"cancelled", "partial_cancelled", "refunded", "refund_failed", "cancel_pending"}:
        order.cancel_at = now
    return next_status


def _payment_record(session: Session, order_no: str) -> dict[str, Any]:
    return _app_asset_json(session, "payment_tx", order_no) or {}


def _save_payment_record(session: Session, order_no: str, payload: dict[str, Any], status: str = "configured") -> AppAsset:
    return _save_app_asset_json(session, "payment_tx", order_no, payload, status=status)


def _payment_amount_snapshot(order: Order, record: dict[str, Any]) -> dict[str, int]:
    total = int(order.total_amount or 0)
    paid = int(record.get("paid_amount") or total)
    cancelled = int(record.get("cancelled_amount") or 0)
    refunded = int(record.get("refunded_amount") or 0)
    remaining = max(0, paid - cancelled - refunded)
    return {"total": total, "paid": paid, "cancelled": cancelled, "refunded": refunded, "remaining": remaining}


def _append_payment_history(record: dict[str, Any], event_type: str, payload: dict[str, Any]) -> dict[str, Any]:
    history = list(record.get("history") or [])
    history.append({"event_type": event_type, "at": utcnow().isoformat(), **payload})
    record["history"] = history[-50:]
    return record


def _current_checkout_values() -> dict[str, Any]:
    test_ready = settings.toss_client_key_test != "change-me-toss-client-key-test" and settings.pg_portone_store_id_test != "change-me-pg-store-id-test" and settings.pg_portone_channel_key_test != "change-me-pg-channel-key-test"
    mode = "test" if test_ready else "live"
    return {
        "mode": mode,
        "store_id": settings.pg_portone_store_id_test if mode == "test" else settings.pg_portone_store_id_live,
        "channel_key": settings.pg_portone_channel_key_test if mode == "test" else settings.pg_portone_channel_key_live,
        "client_key": settings.toss_client_key_test if mode == "test" else settings.toss_client_key_live,
        "mid": settings.toss_mid_test if mode == "test" else settings.toss_mid_live,
    }




def _public_url(path: str) -> str:
    base = str(settings.backend_public_base_url or '').strip().rstrip('/')
    if not path.startswith('/'):
        path = '/' + path
    return f"{base}{path}" if base else path


def _verotel_signature(payload: dict[str, Any]) -> str:
    key = str(settings.verotel_signature_key or '').strip()
    if not key or key == 'change-me-verotel-signature-key':
        return ''
    parts = [
        str(payload.get('shopID') or ''),
        str(payload.get('priceAmount') or ''),
        str(payload.get('currencyCode') or ''),
        str(payload.get('referenceID') or ''),
        str(payload.get('description') or ''),
    ]
    raw = '|'.join(parts + [key])
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()


def _verotel_config_snapshot() -> dict[str, Any]:
    return {
        'enabled': bool(settings.verotel_enabled),
        'provider': 'verotel',
        'mode': settings.verotel_api_mode,
        'shop_id_configured': settings.verotel_shop_id != 'change-me-verotel-shop-id',
        'signature_key_configured': settings.verotel_signature_key != 'change-me-verotel-signature-key',
        'startorder_url': settings.verotel_startorder_url,
        'success_url': _public_url(settings.verotel_success_path),
        'back_url': _public_url(settings.verotel_back_path),
        'postback_url': _public_url(settings.verotel_postback_path),
        'allowed_currencies': [item.strip() for item in str(settings.verotel_allowed_currencies or 'EUR,USD').split(',') if item.strip()],
    }


def _save_verotel_session(session: Session, row: VerotelPaymentSession, payload: dict[str, Any], callback: bool = False) -> VerotelPaymentSession:
    raw = json.dumps(payload, ensure_ascii=False)
    if callback:
        row.callback_payload_json = raw
    else:
        row.request_payload_json = raw
    row.updated_at = utcnow()
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


def _record_adult_audit(session: Session, user: User | None, provider: str, outcome: str, birthdate: str | None = None, fail_reason: str | None = None, tx_id: str | None = None, is_adult_claimed: bool = False) -> None:
    audit = AdultAccessAudit(user_id=(user.id if user else None), provider=provider, outcome=outcome, birthdate=birthdate, fail_reason=fail_reason, tx_id=tx_id, is_adult_claimed=is_adult_claimed)
    session.add(audit)
    session.commit()

def _refund_provider_status_for_amount(refund_amount: int, remaining_before: int) -> str:
    if refund_amount >= remaining_before:
        return "Refunded"
    return "PartialCancelled"


def _sku_policy_rules() -> dict[str, Any]:
    return {
        "allowed_keywords": ["위생", "보관", "세척", "중립포장", "보호포장", "케어", "마사지", "완충", "보관케이스", "파우치"],
        "review_keywords": ["스트랩", "밴드", "로프", "역할", "제한", "클램프", "임팩트", "구속", "보정"],
        "blocked_keywords": ["성기", "음경", "질삽", "애널", "딜도", "바이브레이터", "오나홀", "촬영", "캠", "동영상", "서비스", "만남", "출장", "플레이권", "체험권"],
        "blocked_categories": ["촬영/서비스", "위험물", "만남/서비스 이용권"],
    }


def _classify_sku(category: str, name: str, description: str) -> dict[str, str]:
    haystack = f"{category} {name} {description}".lower()
    rules = _sku_policy_rules()
    for keyword in rules["blocked_keywords"]:
        if keyword.lower() in haystack:
            return {"risk_level": "high", "review_status": "blocked", "blocked_reason": f"금지 키워드 감지: {keyword}"}
    for category_name in rules["blocked_categories"]:
        if category_name.lower() in haystack:
            return {"risk_level": "high", "review_status": "blocked", "blocked_reason": f"금지 카테고리 감지: {category_name}"}
    for keyword in rules["review_keywords"]:
        if keyword.lower() in haystack:
            return {"risk_level": "medium", "review_status": "manual_review", "blocked_reason": f"수동심사 키워드 감지: {keyword}"}
    return {"risk_level": "low", "review_status": "approved_candidate", "blocked_reason": ""}


def _save_product_policy_meta(session: Session, product_id: int, payload: dict[str, Any]) -> None:
    _save_app_asset_json(session, "product_policy", str(product_id), payload, status=payload.get("review_status", "configured"))


def _product_policy_meta(session: Session, product_id: int) -> dict[str, Any]:
    return _app_asset_json(session, "product_policy", str(product_id)) or {}


def _seller_submission_missing_fields(payload: dict[str, Any]) -> list[str]:
    required = [
        "company_name", "representative_name", "business_number", "ecommerce_number", "business_address",
        "cs_contact", "return_address", "youth_protection_officer", "business_document_url",
        "settlement_bank", "settlement_account_number", "settlement_account_holder", "handled_categories",
    ]
    missing: list[str] = []
    for key in required:
        value = payload.get(key)
        if isinstance(value, list):
            if not value:
                missing.append(key)
            continue
        if not str(value or "").strip():
            missing.append(key)
    return missing


def _run_internal_payment_selftests() -> dict[str, Any]:
    sdk_installed = portone_sdk is not None
    status_expectations = {
        "Paid": "paid",
        "Ready": "payment_requested",
        "CancelPending": "cancel_pending",
        "PartialCancelled": "partial_cancelled",
        "Cancelled": "cancelled",
        "Failed": "refund_failed",
    }
    transition_results: list[dict[str, Any]] = []
    transition_passed = True
    for provider_status, expected in status_expectations.items():
        order = Order(order_status="payment_requested", settlement_status="hold", total_amount=1000)
        actual = _apply_payment_status(order, provider_status)
        ok = actual == expected
        transition_results.append({
            "provider_status": provider_status,
            "expected": expected,
            "actual": actual,
            "ok": ok,
            "settlement_status": order.settlement_status,
        })
        transition_passed = transition_passed and ok

    valid_seller_payload = {
        "company_name": "테스트상호",
        "representative_name": "대표자",
        "business_number": "1234567890",
        "ecommerce_number": "2026-서울-0001",
        "business_address": "서울시 테스트구",
        "return_address": "서울시 테스트구 반품로",
        "cs_contact": "010-1111-2222",
        "youth_protection_officer": "관리자",
        "settlement_bank": "테스트은행",
        "settlement_account_number": "123-456-7890",
        "settlement_account_holder": "테스트상호",
        "business_document_url": "https://example.com/business.pdf",
        "handled_categories": ["위생/보관"],
    }
    missing_none = _seller_submission_missing_fields(valid_seller_payload)
    invalid_seller_payload = {
        "company_name": "",
        "representative_name": "대표자",
        "business_number": "",
        "handled_categories": [],
    }
    missing_some = _seller_submission_missing_fields(invalid_seller_payload)

    sku_cases = [
        {"category": "위생/보관", "name": "보관 파우치", "description": "중립 포장", "expected": "approved_candidate"},
        {"category": "액세서리", "name": "스트랩 세트", "description": "역할 고민용", "expected": "manual_review"},
        {"category": "촬영/서비스", "name": "만남 서비스권", "description": "금지", "expected": "blocked"},
    ]
    sku_results = []
    sku_passed = True
    for case in sku_cases:
        result = _classify_sku(case["category"], case["name"], case["description"])
        ok = result.get("review_status") == case["expected"]
        sku_results.append({"case": case, "result": result, "ok": ok})
        sku_passed = sku_passed and ok

    placeholders = {
        "portone_api_secret": settings.portone_api_secret.startswith("change-me"),
        "portone_webhook_secret_test": settings.portone_webhook_secret_test.startswith("change-me"),
        "pg_portone_store_id_test": settings.pg_portone_store_id_test.startswith("change-me"),
        "pg_portone_channel_key_test": settings.pg_portone_channel_key_test.startswith("change-me"),
        "pg_primary_merchant_id_test": settings.pg_primary_merchant_id_test.startswith("change-me"),
        "portone_webhook_secret_live": settings.portone_webhook_secret_live.startswith("change-me"),
        "pg_portone_store_id_live": settings.pg_portone_store_id_live.startswith("change-me"),
        "pg_portone_channel_key_live": settings.pg_portone_channel_key_live.startswith("change-me"),
        "pg_primary_merchant_id_live": settings.pg_primary_merchant_id_live.startswith("change-me"),
        "toss_client_key_test": settings.toss_client_key_test.startswith("change-me"),
        "toss_secret_key_test": settings.toss_secret_key_test.startswith("change-me"),
        "toss_mid_test": settings.toss_mid_test.startswith("change-me"),
        "toss_client_key_live": settings.toss_client_key_live.startswith("change-me"),
        "toss_secret_key_live": settings.toss_secret_key_live.startswith("change-me"),
        "toss_mid_live": settings.toss_mid_live.startswith("change-me"),
    }

    tests = [
        {"name": "sdk_optional_import", "ok": sdk_installed, "detail": "portone_server_sdk 설치 여부"},
        {"name": "payment_state_machine", "ok": transition_passed, "detail": transition_results},
        {"name": "seller_required_fields_validation", "ok": (missing_none == [] and len(missing_some) >= 3), "detail": {"valid_missing": missing_none, "invalid_missing": missing_some}},
        {"name": "sku_policy_classification", "ok": sku_passed, "detail": sku_results},
        {"name": "test_env_values_present", "ok": not any(placeholders[k] for k in ["portone_api_secret", "portone_webhook_secret_test", "pg_portone_store_id_test", "pg_portone_channel_key_test", "pg_primary_merchant_id_test", "toss_client_key_test", "toss_secret_key_test"]), "detail": placeholders},
        {"name": "live_env_values_deferred", "ok": all(placeholders[k] for k in ["portone_webhook_secret_live", "pg_portone_store_id_live", "pg_portone_channel_key_live", "pg_primary_merchant_id_live"]), "detail": placeholders},
    ]
    passed = [t["name"] for t in tests if t["ok"]]
    failed = [t["name"] for t in tests if not t["ok"]]
    return {
        "mode": settings.launch_stage_mode,
        "summary": {
            "passed": len(passed),
            "failed": len(failed),
            "total": len(tests),
        },
        "passed": passed,
        "failed": failed,
        "tests": tests,
        "limitations": [
            "PortOne 콘솔에서 발급한 실제 TEST webhook secret / Store ID / channel key / API Secret 없이는 외부 결제망 검증을 완료할 수 없습니다.",
            "실제 결제, 취소, 환불, webhook 재전송 테스트는 PortOne 테스트 채널 연결 후 다시 확인해야 합니다.",
            "LIVE merchant / LIVE webhook secret은 마지막 단계에서만 입력해야 합니다.",
        ],
        "recommended_next": [
            "PortOne 콘솔에서 TEST webhook secret / Store ID / channel key / API Secret 발급",
            "backend/.env에 TEST 값만 입력",
            "테스트 결제/취소/부분취소/환불/webhook 재전송 검증",
            "판매자 필수 입력값 누락 차단 동작 확인",
            "허용 SKU만 노출한 상태로 PG 사전상담 진행",
        ],
    }


@router.get("/payments/self-test-report")
def payments_self_test_report() -> dict[str, Any]:
    return _run_internal_payment_selftests()


@router.post("/payments/self-test-run")
def payments_self_test_run(current_user: User = Depends(require_grade(MemberGrade.ADMIN))) -> dict[str, Any]:
    return {"ok": True, "report": _run_internal_payment_selftests()}

@router.get("/legal/documents")
def legal_documents():
    items = {}
    for key in ["terms_of_service", "privacy_policy", "youth_policy", "refund_policy", "seller_terms"]:
        content = _read_legal_markdown(key)
        version = LEGAL_DOC_VERSIONS.get(key, "2026-04-11.v1")
        items[key] = {
            "version": version,
            "content": content,
            "path": f"/api/legal/{key.replace('_', '-')}",
        }
    return {"items": items, "required_signup_consents": REQUIRED_SIGNUP_CONSENT_TYPES}


@router.get("/legal/{doc_slug}")
def legal_document(doc_slug: str):
    normalized = doc_slug.replace('-', '_')
    return {"doc_key": normalized, "version": LEGAL_DOC_VERSIONS.get(normalized, "2026-04-11.v1"), "content": _read_legal_markdown(normalized)}


@router.get("/legal/public-links")
def legal_public_links():
    return {
        "items": {
            "terms_of_service": {"version": LEGAL_DOC_VERSIONS["terms_of_service"], "url": "/api/legal/terms-of-service", "label": "이용약관"},
            "privacy_policy": {"version": LEGAL_DOC_VERSIONS["privacy_policy"], "url": "/api/legal/privacy-policy", "label": "개인정보 처리방침"},
            "youth_policy": {"version": LEGAL_DOC_VERSIONS["youth_policy"], "url": "/api/legal/youth-policy", "label": "청소년 보호정책"},
            "refund_policy": {"version": LEGAL_DOC_VERSIONS["refund_policy"], "url": "/api/legal/refund-policy", "label": "환불정책"},
            "age_verification_policy": {"version": LEGAL_DOC_VERSIONS["age_verification_policy"], "url": "/api/legal/age-verification-policy", "label": "성인 인증 정책"},
        }
    }


@router.get("/legal/business-info")
def legal_business_info(session: Session = Depends(get_session)):
    business_info, placeholder_fields, complete, source = _business_info_payload(session)
    return {"business_info": business_info, "placeholder_fields": placeholder_fields, "complete": complete, "source": source, "beta_db_override_enabled": settings.beta_business_info_db_override_enabled}


@router.get("/admin/business-info")
def admin_business_info(current_user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    business_info, placeholder_fields, complete, source = _business_info_payload(session)
    return {"business_info": business_info, "placeholder_fields": placeholder_fields, "complete": complete, "source": source}


@router.post("/admin/business-info")
def admin_business_info_update(payload: dict[str, Any], request: Request, current_user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    allowed = {"operator_legal_name", "operator_brand_name", "business_registration_no", "mail_order_report_no", "business_address", "support_email", "support_phone", "hosting_provider", "youth_protection_officer", "dispute_contact_url", "privacy_contact_email"}
    normalized = {k: str(v).strip() for k, v in payload.items() if k in allowed}
    row = _save_app_asset_json(session, "business_info", "current", normalized, status="beta_configured")
    write_admin_log(session, current_user, "business_info_update", "app_asset", str(row.id or 0), "베타 사업자 표시정보 업데이트", ip=request.client.host if request.client else "127.0.0.1", device=request.headers.get("user-agent"))
    business_info, placeholder_fields, complete, source = _business_info_payload(session)
    return {"ok": True, "business_info": business_info, "placeholder_fields": placeholder_fields, "complete": complete, "source": source}


@router.get("/legal/release-readiness")
def legal_release_readiness(session: Session = Depends(get_session)):
    blockers: list[dict[str, Any]] = []
    warnings: list[dict[str, Any]] = []
    ready_items: list[dict[str, Any]] = []

    if settings.adult_verification_test_mode or not settings.adult_verification_prod_enabled or settings.adult_verification_client_id == "change-me":
        blockers.append({"key": "adult_verification_live", "title": "성인/본인확인 운영 연동 미완료", "action": "PortOne PASS 운영키, 콜백 검증, webhook secret, 오류코드 매핑 완료 후 공개 출시"})
    else:
        ready_items.append({"key": "adult_verification_live", "title": "성인/본인확인 운영 연동 준비"})

    if settings.pg_primary_merchant_id == "change-me" or settings.pg_primary_api_key == "change-me":
        blockers.append({"key": "pg_live", "title": "PG 운영 연동 미완료", "action": "승인/취소/환불 webhook 포함 운영 계정 반영 후 쇼핑 결제 공개"})
    else:
        ready_items.append({"key": "pg_live", "title": "PG 연동 정보 설정됨"})

    _, placeholder_fields, complete, source = _business_info_payload(session)
    business_placeholder = not complete
    if business_placeholder:
        blockers.append({"key": "business_disclosure", "title": "국내 전자상거래/앱 고지 사업자 정보 미확정", "action": f"베타 DB 연동 또는 설정으로 실제 사업자 정보 입력 필요: {', '.join(placeholder_fields)}"})
    else:
        ready_items.append({"key": "business_disclosure", "title": "사업자 표시 정보 확정"})

    if settings.location_based_features_enabled and settings.location_privacy_notice_required:
        warnings.append({"key": "location_notice", "title": "위치/지역 기반 기능 고지 추가 필요", "action": f"현재 모드={settings.location_feature_mode}, 실시간 위치공유={settings.location_realtime_sharing_enabled}. 지역 선택형/거리 대역형 고지와 동의 문구 확정 필요"})

    if settings.seller_product_preapproval_required:
        warnings.append({"key": "seller_preapproval", "title": "상품 공개 전 관리자 승인 유지 권장", "action": "초기 공개 출시 단계에서는 사업자 승인 + 상품 사전 승인 상태 유지"})

    if settings.random_chat_enabled:
        blockers.append({"key": "random_chat_enabled", "title": "랜덤채팅 기능이 안전모드 기준으로 비활성화되지 않음", "action": "국내 공개 출시 전에는 랜덤채팅/익명 1:1 매칭을 제거하거나 폐쇄형 비공개 웹 영역으로 분리"})
    else:
        ready_items.append({"key": "random_chat_disabled", "title": "앱 내 랜덤채팅 기능 기본 비활성화"})

    if settings.direct_user_dm_enabled or settings.offline_meeting_enabled or settings.friend_finding_enabled:
        blockers.append({"key": "high_risk_social_features", "title": "고위험 소셜 기능이 공개 앱 기준으로 남아 있음", "action": "사용자간 자유 DM, 모임/인연찾기, 오프라인 만남 연계 기능은 앱에서 제거하고 제한 웹 영역으로 분리"})
    else:
        ready_items.append({"key": "high_risk_social_features_disabled", "title": "고위험 소셜 기능 기본 비활성화"})

    preview = _minor_block_purge_preview(session)
    warnings.append({"key": "minor_purge_job", "title": "미성년 차단 계정 자동 파기 배치 필요", "action": f"cron={settings.minor_block_purge_cron}, 후보={preview['candidate_count']}명. 차단 이력 1년 보관 후 파기하는 배치 작업 운영 반영"})
    if settings.ops_alert_slack_enabled or settings.ops_alert_email_enabled:
        ready_items.append({"key": "ops_alert_channels", "title": "장애 알림 채널 정책 설정됨 (Slack + 운영 메일)"})

    return {
        "status": "blocked" if blockers else "warning" if warnings else "ready",
        "blockers": blockers,
        "warnings": warnings,
        "ready_items": ready_items,
        "decisions": {
            "adult_verification_provider": settings.adult_verification_provider_label,
            "reconsent_mode": settings.reconsent_enforcement_mode,
            "minor_retention_days": settings.minor_block_retention_days,
            "ops_alert_channels": [channel for channel, enabled in [("slack", settings.ops_alert_slack_enabled), ("email", settings.ops_alert_email_enabled)] if enabled],
            "business_info_source": source,
            "location_feature_mode": settings.location_feature_mode,
            "community_policy_mode": settings.community_forum_mode,
            "feature_flags": _community_feature_flags(),
        },
    }


@router.get("/community/feature-flags")
def community_feature_flags():
    return _community_feature_flags()


@router.get("/community/policy-summary")
def community_policy_summary():
    return {
        "mode": settings.community_forum_mode,
        "reference_path": settings.community_policy_reference_path,
        "allowed": ["안전수칙", "동의/경계설정", "세척/보관/배송", "제품 정보 Q&A", "운영 공지", "포럼 주제 버튼을 통한 1:1 요청", "상호 팔로우 후 요청-수락형 1:1"],
        "blocked": ["랜덤채팅", "모임 주선", "오프라인 만남 유도", "외부 연락처 교환", "사진/영상 기반 성적 교류", "반복 접촉", "상호 팔로우 없는 자유 DM"],
        "dm_notice": _dm_notice_lines(),
        "feature_flags": _community_feature_flags(),
    }


@router.get("/ops/preflight-checklist")
def ops_preflight_checklist():
    path = Path(settings.ops_checklist_document_path)
    content = path.read_text(encoding="utf-8") if path.exists() else "# 운영 전 점검표\n\n문서가 아직 배치되지 않았습니다."
    return {
        "slack_enabled": settings.ops_alert_slack_enabled,
        "email_enabled": settings.ops_alert_email_enabled,
        "email_to": settings.ops_alert_email_to,
        "checklist_document_path": settings.ops_checklist_document_path,
        "content": content,
    }


@router.get("/payments/provider-status")
def payments_provider_status():
    return _payment_provider_status()


@router.get("/provider-status")
def payments_provider_status_alias():
    return _payment_provider_status()


@router.get("/self-test")
def payments_self_test_alias() -> dict[str, Any]:
    return _run_internal_payment_selftests()


@router.get("/launch-priority")
def payments_launch_priority_alias() -> dict[str, Any]:
    return payments_launch_priority()


@router.get("/payments/test-stage-policy")
def payments_test_stage_policy() -> dict[str, Any]:
    return {
        "summary": "개발/테스트 단계에서는 운영 전 재작업을 줄이기 위해 운영형 구조를 보수적으로 먼저 고정합니다.",
        "chosen_defaults": {
            "portone_sdk": "install_now",
            "env_split": "test_live_full_split",
            "sku_policy": "conservative_until_pg_preconsult",
            "premium_sla": "target_only_until_operations_stable",
            "seller_onboarding_gate": "strict_without_override_by_default",
        },
        "details": [
            {"title": "SDK 설치", "value": "requirements.txt 기준 즉시 설치 권장", "note": "테스트 채널에서 공식 검증 구조를 먼저 고정"},
            {"title": "실제값 입력 시점", "value": settings.test_stage_live_values_entry_phase, "note": "live 값은 운영 MID 발급 직전까지 placeholder 유지"},
            {"title": "관리자 override", "value": settings.test_stage_admin_override_policy, "note": "출시 준비 기본값은 비활성화, 내부 QA에만 임시 허용"},
            {"title": "SKU 확장 시점", "value": settings.test_stage_sku_expansion_phase, "note": "허용 SKU만 노출한 뒤 사전상담 피드백 확인"},
            {"title": "프리미엄 배송 문구 전환", "value": settings.test_stage_premium_sla_upgrade_phase, "note": "테스트 단계는 목표형/안내형 유지"},
        ],
        "extra_actions": [
            "PortOne 테스트 webhook secret, Store ID, channel key, API Secret 발급",
            "backend/.env에 test 값만 먼저 입력",
            "결제/취소/부분취소/환불/webhook 재전송 테스트",
            "판매자 필수 입력값 누락 차단 동작 확인",
            "허용 SKU만 공개하여 PG 사전상담 진행",
            "운영 MID/merchant 실제값은 마지막 단계에서 반영",
        ],
    }


@router.get("/payments/operational-path")
def payments_operational_path() -> dict[str, Any]:
    return {
        "stage": settings.launch_stage_mode,
        "chosen_method": {
            "portone_sdk": "지금 requirements.txt 기준으로 설치해서 테스트 webhook 검증부터 공식 SDK 우선 사용",
            "env_split": "test/live Store ID, channel key, merchant, webhook secret, callback URL 완전 분리",
            "sku_policy": "허용 SKU만 실제 노출, 보류/금지는 관리자 검수 또는 비공개 유지",
            "premium_sla": "운영 안정화 전까지 목표형/안내형만 사용, 보장형 SLA는 운영 이후 검토",
            "seller_gate": "필수 입력값 누락 시 pending 유지, 상품 등록/공개/주문 수락 차단, 관리자 override는 기본 OFF",
        },
        "do_now": [
            "PortOne 콘솔에서 테스트 webhook secret / Store ID / channel key / API Secret 발급",
            "backend/.env에 test 값만 먼저 입력",
            "결제 성공 / 취소 / 부분취소 / 환불 / webhook 재전송 / 중복수신 테스트",
            "판매자 필수 입력 누락 시 실제 차단되는지 확인",
            "허용 SKU만 공개한 상태로 PG 사전상담 진행",
            "푸터 / 상품상세 / 주문서의 통신판매중개 고지 점검",
            "미인증 구매 차단 / 인증 만료 차단 / 인증 로그 저장 확인",
        ],
        "do_last": [
            "운영 MID / live merchant 입력",
            "live webhook secret 입력",
            "live callback URL 최종 등록",
            "프리미엄 배송 보장형 SLA 문구 전환 검토",
        ],
        "cautions": [
            "test/live 값을 섞지 않기",
            "관리자 override는 내부 QA에서만 일시 사용",
            "사진/영상/파일 전송은 단체 톡방과 1:1 모두 계속 차단 유지",
            "허용 SKU 외 노출 확장은 PG 사전상담 피드백 이후 진행",
        ],
    }


@router.get("/payments/launch-priority")
def payments_launch_priority() -> dict[str, Any]:
    return {
        "stage": settings.launch_stage_mode,
        "priorities": [
            {"rank": 1, "title": "PortOne 테스트 실값 입력", "action": "테스트 webhook secret, Store ID, channel key, API Secret을 backend/.env에 입력하고 provider-status에서 configured 상태를 확인"},
            {"rank": 2, "title": "결제/취소/환불/webhook 검증", "action": "결제, 취소, 부분취소, 환불, webhook 재전송, 중복수신까지 테스트하고 상태머신 전이가 맞는지 확인"},
            {"rank": 3, "title": "판매자 필수 입력 차단 운영", "action": "필수 입력값 누락 시 상품 등록/공개/주문 수락이 실제로 차단되는지 관리자 승인 화면까지 포함해 확인"},
            {"rank": 4, "title": "운영자 override 기본 비활성화", "action": "출시 준비 기본값은 override를 끄고 내부 QA 계정에서만 필요시 임시 사용"},
            {"rank": 5, "title": "허용 SKU만 노출", "action": "허용 SKU만 공개하고 보류/금지 카테고리는 관리자 검수 또는 비공개 상태를 유지"},
            {"rank": 6, "title": "PG 사전상담 진행", "action": "허용 SKU, 거래 구조, 환불정책, 통신판매중개 고지 구조를 묶어 PG/포트원 사전상담 진행"},
            {"rank": 7, "title": "고지 화면 최종 점검", "action": "푸터, 상품상세, 주문서에 판매자 정보와 통신판매중개 고지 문구가 정확히 표시되는지 확인"},
            {"rank": 8, "title": "프리미엄 배송은 목표형 유지", "action": "운영 안정화 전까지는 목표형/안내형 문구만 사용하고 보장형 SLA는 쓰지 않음"},
            {"rank": 9, "title": "성인인증과 결제 흐름 분리 검증", "action": "미인증 구매 차단, 인증 만료 차단, 인증 로그 저장, 판매자/구매자 권한 구분 확인"},
            {"rank": 10, "title": "운영 MID는 마지막 입력", "action": "실 merchant, 운영 MID, live webhook secret은 마지막 단계에서만 입력하고 test/live 혼용을 피함"},
        ],
    }


@router.post("/payments/webhooks/test-signature")
async def payments_webhook_test_signature(payload: dict[str, Any], request: Request):
    raw_body = await request.body()
    mode = _portone_env_mode(payload, request)
    signature = _extract_portone_signature(request, payload)
    secret = _portone_webhook_secret_for_mode(mode)
    verified = _verify_portone_webhook_signature(raw_body, signature, secret, request)
    return {
        "ok": True,
        "mode": mode,
        "verified": verified,
        "has_signature": bool(signature),
        "event_type": str(payload.get("type") or payload.get("event_type") or "").strip(),
        "payment_id": _extract_portone_payment_id(payload),
        "store_id": _extract_portone_store_id(payload),
        "headers_seen": [k for k in request.headers.keys() if "signature" in k.lower() or k.lower().startswith("webhook-")],
    }


@router.post("/payments/webhooks/pg")
async def payments_webhook_pg(payload: dict[str, Any], request: Request, session: Session = Depends(get_session)):
    raw_body = await request.body()
    mode = _portone_env_mode(payload, request)
    signature = _extract_portone_signature(request, payload)
    secret = _portone_webhook_secret_for_mode(mode)
    verified = _verify_portone_webhook_signature(raw_body, signature, secret, request)
    if not verified and not _should_allow_unverified_portone_test_webhook(payload, request, mode):
        logger.warning(
            "portone_webhook_signature_invalid",
            extra={
                "mode": mode,
                "has_signature": bool(signature),
                "headers": {k: v for k, v in request.headers.items() if 'signature' in k.lower() or k.lower().startswith('webhook-')},
                "payload_keys": list(payload.keys()),
            },
        )
        raise HTTPException(status_code=400, detail="invalid portone webhook signature")

    payment_id = _extract_portone_payment_id(payload)
    transaction_id = _extract_portone_transaction_id(payload)
    event_id = str(payload.get("id") or payload.get("eventId") or transaction_id or payment_id).strip()
    event_type = str(payload.get("type") or payload.get("event_type") or "payment.updated").strip()
    merchant_uid = _extract_portone_order_no(payload)

    provider_payment = _portone_fetch_payment(payment_id) if payment_id else None
    provider_status = _portone_webhook_effective_status(payload, provider_payment)

    if not merchant_uid:
        logger.warning(
            "portone_webhook_order_missing",
            extra={
                "mode": mode,
                "event_type": event_type,
                "payment_id": payment_id,
                "transaction_id": transaction_id,
                "payload": payload,
            },
        )
        raise HTTPException(status_code=400, detail="merchant_uid required")

    if _payment_event_seen(session, event_id, event_type, payment_id or merchant_uid):
        return {"ok": True, "deduplicated": True, "order_no": merchant_uid}

    order = session.exec(select(Order).where(Order.order_no == merchant_uid)).first()
    if not order:
        _mark_payment_event_seen(session, event_id, event_type, payment_id or merchant_uid, {
            "event_type": event_type,
            "order_no": merchant_uid,
            "status": provider_status,
            "mode": mode,
            "verified": verified,
        })
        return {"ok": True, "message": "order not found; ignored", "order_no": merchant_uid}

    next_status = _apply_payment_status(order, provider_status)
    session.add(order)
    session.commit()
    _mark_payment_event_seen(session, event_id, event_type, payment_id or merchant_uid, {
        "event_type": event_type,
        "order_no": merchant_uid,
        "status": provider_status,
        "mode": mode,
        "verified": verified,
    })
    logger.info(
        "portone_webhook_processed",
        extra={
            "order_no": order.order_no,
            "provider_status": provider_status,
            "event_type": event_type,
            "verified": verified,
        },
    )
    return {"ok": True, "order_no": order.order_no, "status": next_status, "provider_status": provider_status, "verified_by_requery": bool(provider_payment), "verified": verified}


@router.post("/payments/webhooks/refund")
async def payments_webhook_refund(payload: dict[str, Any], request: Request, session: Session = Depends(get_session)):
    raw_body = await request.body()
    mode = _portone_env_mode(payload, request)
    signature = _extract_portone_signature(request, payload)
    secret = _portone_webhook_secret_for_mode(mode)
    verified = _verify_portone_webhook_signature(raw_body, signature, secret, request)
    if not verified and not _should_allow_unverified_portone_test_webhook(payload, request, mode):
        logger.warning(
            "portone_refund_webhook_signature_invalid",
            extra={
                "mode": mode,
                "has_signature": bool(signature),
                "headers": {k: v for k, v in request.headers.items() if 'signature' in k.lower() or k.lower().startswith('webhook-')},
                "payload_keys": list(payload.keys()),
            },
        )
        raise HTTPException(status_code=400, detail="invalid portone refund webhook signature")

    event_id = str(payload.get("id") or payload.get("eventId") or _extract_portone_transaction_id(payload) or _extract_portone_payment_id(payload)).strip()
    event_type = str(payload.get("type") or payload.get("event_type") or "refund.updated").strip()
    payment_id = _extract_portone_payment_id(payload)
    merchant_uid = _extract_portone_order_no(payload)
    data = _portone_webhook_data(payload)
    refund_id = str(payload.get("refund_id") or payload.get("case_id") or data.get("cancellationId") or event_id or payment_id).strip()

    if _payment_event_seen(session, event_id, event_type, refund_id):
        return {"ok": True, "deduplicated": True, "refund_id": refund_id}

    provider_payment = _portone_fetch_payment(payment_id) if payment_id else None
    provider_status = _portone_webhook_effective_status(payload, provider_payment)
    if merchant_uid:
        order = session.exec(select(Order).where(Order.order_no == merchant_uid)).first()
        if order:
            next_status = _apply_payment_status(order, provider_status)
            session.add(order)
            session.commit()
        else:
            next_status = provider_status
    else:
        next_status = provider_status

    _mark_payment_event_seen(session, event_id, event_type, refund_id, {
        "event_type": event_type,
        "refund_id": refund_id,
        "status": provider_status,
        "mode": mode,
        "verified": verified,
    })
    return {"ok": True, "refund_id": refund_id, "status": next_status, "provider_status": provider_status, "verified_by_requery": bool(provider_payment), "verified": verified}


@router.get("/ops/minor-purge/preview")
def ops_minor_purge_preview(current_user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    return _minor_block_purge_preview(session)


@router.post("/ops/minor-purge/run")
def ops_minor_purge_run(request: Request, current_user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    return _run_minor_block_purge(session, current_user)


@router.post("/auth/verification/webhook")
def auth_verification_webhook(payload: dict[str, Any], request: Request, session: Session = Depends(get_session)):
    provider = _normalize_verification_provider(str(payload.get("provider") or settings.adult_verification_provider))
    tx_id = str(payload.get("tx_id") or "").strip()
    signature = str(payload.get("signature") or "").strip()
    flow = str(payload.get("flow") or "adult").strip()
    result = str(payload.get("result") or "verified_adult").strip()
    if not tx_id or not signature:
        raise HTTPException(status_code=400, detail="webhook payload incomplete")
    expected = _verification_signature("identity" if flow == "identity" else "adult", provider, tx_id)
    if not hmac.compare_digest(signature, expected):
        raise HTTPException(status_code=400, detail="invalid verification webhook signature")
    user = session.exec(select(User).where(User.adult_verification_tx_id == tx_id)).first() if flow != "identity" else session.exec(select(User).where(User.identity_verification_token.contains(tx_id))).first()
    if flow == "identity":
        return {"ok": True, "provider": provider, "tx_id": tx_id, "result": result}
    if not user:
        return {"ok": True, "provider": provider, "tx_id": tx_id, "result": result, "message": "user not linked yet"}
    if result == "verified_minor":
        user.member_status = "minor_blocked"
        user.adult_verified = False
        user.adult_verification_status = "verified_minor"
    elif result == "verified_adult":
        user.adult_verified = True
        user.adult_verified_at = utcnow()
        user.adult_verification_status = "verified_adult"
    else:
        user.adult_verification_status = "failed"
    session.add(user)
    session.commit()
    return {"ok": True, "user_id": user.id, "result": user.adult_verification_status, "provider": provider}


@router.get("/auth/verification/providers")
def auth_verification_providers():
    default_provider = _normalize_verification_provider(settings.adult_verification_provider)
    providers = [_verification_provider_payload(item) for item in VERIFICATION_ALLOWED_PROVIDERS]
    return {"default_provider": default_provider, "items": providers}


@router.get("/legal/status")
def legal_status(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return _consent_status_payload(session, current_user.id or 0)


@router.post("/auth/reconsent")
def auth_reconsent(payload: ReconsentRequest, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    consent_map = {item.consent_type: item for item in payload.consents}
    for consent_type in REQUIRED_SIGNUP_CONSENT_TYPES:
        consent = consent_map.get(consent_type)
        if not consent or not consent.agreed:
            raise HTTPException(status_code=400, detail=f"required consent missing: {consent_type}")
    _record_consents(session, current_user.id or 0, payload.consents, request)
    return {"ok": True, **_consent_status_payload(session, current_user.id or 0)}


@router.post("/auth/signup")
def signup(payload: SignupRequest, request: Request, session: Session = Depends(get_session)):
    email = payload.email.strip().lower()
    if session.exec(select(User).where(User.email == email)).first():
        raise HTTPException(status_code=409, detail="email already exists")
    consent_map = {item.consent_type: item for item in payload.consents}
    for consent_type in REQUIRED_SIGNUP_CONSENT_TYPES:
        consent = consent_map.get(consent_type)
        if not consent or not consent.agreed:
            raise HTTPException(status_code=400, detail=f"required consent missing: {consent_type}")
    if not payload.identity_verification_token.strip():
        raise HTTPException(status_code=400, detail="identity verification token required")
    user = User(
        email=email,
        name=payload.name.strip(),
        password_hash=hash_password(payload.password),
        grade=MemberGrade.GENERAL,
        identity_verified=True,
        identity_verification_method=payload.identity_verification_method,
        identity_verification_token=payload.identity_verification_token.strip(),
        identity_verified_at=utcnow(),
        login_provider=payload.login_provider,
        adult_verified=False,
        adult_verification_status=payload.adult_verification_status or "pending",
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    _record_consents(session, user.id or 0, payload.consents, request)
    device_session = create_device_session(user, session, payload.login_provider or "web-browser", request.headers.get("user-agent"), request.client.host if request.client else "127.0.0.1")
    tokens = build_token_response(user, session, device_session)
    return {
        "ok": True,
        "user_id": user.id,
        "email": user.email,
        "identity_verified": user.identity_verified,
        "adult_verified": user.adult_verified,
        "reconsent_required": _user_requires_reconsent(session, user.id or 0),
        **tokens.model_dump(),
    }


@router.post("/auth/identity/start")
def start_identity_verification(payload: IdentityVerificationStartRequest):
    provider = _normalize_verification_provider(payload.provider)
    tx_id = _build_identity_tx("identity", provider)
    return {
        "ok": True,
        **_verification_provider_payload(provider),
        "tx_id": tx_id,
        "next_action": "open_provider_popup",
        "verification_code_hint": "000000" if settings.adult_verification_test_mode else None,
        "callback_web": settings.adult_verification_callback_identity_web,
        "callback_signature": _verification_signature("identity", provider, tx_id),
        "vendor": "PortOne",
    }


@router.post("/auth/identity/confirm")
def confirm_identity_verification(payload: IdentityVerificationConfirmRequest):
    provider = _normalize_verification_provider(payload.provider)
    expected = "000000" if settings.adult_verification_test_mode else settings.adult_verification_client_secret
    if payload.verification_code != expected:
        raise HTTPException(status_code=400, detail="identity verification failed")
    return {
        "ok": True,
        "provider": provider,
        "tx_id": payload.tx_id,
        "identity_verification_token": f"idv::{provider}::{payload.tx_id}",
        "identity_verified": True,
        "adult_verification_status": "pending",
        "provider_profile": _verification_provider_payload(provider),
    }


@router.post("/auth/adult/start")
def start_adult_verification(payload: AdultVerificationStartRequest, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if user.grade != MemberGrade.ADMIN and not user.identity_verified:
        raise HTTPException(status_code=403, detail="identity verification required")
    if user.adult_verification_locked_until and user.adult_verification_locked_until > utcnow():
        raise HTTPException(status_code=423, detail=f"adult verification locked until {user.adult_verification_locked_until.isoformat()}")
    provider = _normalize_verification_provider(payload.provider)
    tx_id = _build_identity_tx("adult", provider)
    user.adult_verification_provider = provider
    user.adult_verification_tx_id = tx_id
    user.adult_verification_status = "started"
    session.add(user)
    session.commit()
    return {"ok": True, **_verification_provider_payload(provider), "tx_id": tx_id, "verification_code_hint": "000000" if settings.adult_verification_test_mode else None, "callback_signature": _verification_signature("adult", provider, tx_id), "vendor": "PortOne"}


@router.post("/auth/adult/confirm")
def confirm_adult_verification(payload: AdultVerificationConfirmRequest, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if user.grade != MemberGrade.ADMIN and not user.identity_verified:
        raise HTTPException(status_code=403, detail="identity verification required")
    if user.adult_verification_locked_until and user.adult_verification_locked_until > utcnow():
        raise HTTPException(status_code=423, detail=f"adult verification locked until {user.adult_verification_locked_until.isoformat()}")
    if user.adult_verification_tx_id and payload.tx_id != user.adult_verification_tx_id:
        raise HTTPException(status_code=400, detail="adult verification transaction mismatch")
    provider = _normalize_verification_provider(user.adult_verification_provider or payload.tx_id.split("_")[1] if "_" in payload.tx_id else settings.adult_verification_provider)
    expected = "000000" if settings.adult_verification_test_mode else settings.adult_verification_client_secret
    if payload.verification_code == "MINOR":
        user.adult_verified = False
        user.adult_verified_at = None
        user.adult_verification_status = "verified_minor"
        user.member_status = "minor_blocked"
        user.adult_verification_fail_count = 0
        user.adult_verification_locked_until = None
        session.add(user)
        session.commit()
        raise HTTPException(status_code=403, detail="minor account blocked")
    if payload.verification_code != expected:
        user.adult_verification_status = "failed"
        session.add(user)
        session.commit()
        _register_adult_verification_failure(user, session)
        return {"ok": False, **_adult_lock_payload(user)}
    user.adult_verified = True
    user.adult_verified_at = utcnow()
    user.adult_verification_status = "verified_adult"
    user.adult_verification_fail_count = 0
    user.adult_verification_locked_until = None
    session.add(user)
    session.commit()
    return {"ok": True, **_adult_lock_payload(user), "provider_profile": _verification_provider_payload(provider)}


@router.get("/auth/adult/status")
def adult_verification_status(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    latest_consents = _latest_user_consents(session, user.id or 0)
    return {
        **_adult_lock_payload(user),
        **_consent_status_payload(session, user.id or 0),
        "latest_consents": {key: {"agreed": row.agreed, "version": row.version, "agreed_at": row.agreed_at.isoformat()} for key, row in latest_consents.items()},
    }


@router.post("/auth/identity/callback")
def identity_verification_callback(payload: dict[str, Any]):
    provider = _normalize_verification_provider(str(payload.get("provider") or settings.adult_verification_provider))
    tx_id = str(payload.get("tx_id") or "").strip()
    signature = str(payload.get("signature") or "").strip()
    if not tx_id or not signature:
        raise HTTPException(status_code=400, detail="callback payload incomplete")
    expected = _verification_signature("identity", provider, tx_id)
    if not hmac.compare_digest(signature, expected):
        raise HTTPException(status_code=400, detail="invalid callback signature")
    return {"ok": True, "provider": provider, "tx_id": tx_id, "identity_verification_token": f"idv::{provider}::{tx_id}", "identity_verified": True}


@router.post("/auth/adult/callback")
def adult_verification_callback(payload: dict[str, Any], current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    provider = _normalize_verification_provider(str(payload.get("provider") or current_user.adult_verification_provider or settings.adult_verification_provider))
    tx_id = str(payload.get("tx_id") or "").strip()
    signature = str(payload.get("signature") or "").strip()
    result = str(payload.get("result") or "verified_adult").strip()
    if not tx_id or not signature:
        raise HTTPException(status_code=400, detail="callback payload incomplete")
    expected = _verification_signature("adult", provider, tx_id)
    if not hmac.compare_digest(signature, expected):
        raise HTTPException(status_code=400, detail="invalid callback signature")
    if tx_id != (current_user.adult_verification_tx_id or tx_id):
        raise HTTPException(status_code=400, detail="adult verification transaction mismatch")
    if result == "verified_minor":
        current_user.adult_verified = False
        current_user.adult_verified_at = None
        current_user.adult_verification_status = "verified_minor"
        current_user.member_status = "minor_blocked"
        current_user.adult_verification_fail_count = 0
        current_user.adult_verification_locked_until = None
        session.add(current_user)
        session.commit()
        raise HTTPException(status_code=403, detail="minor account blocked")
    if result != "verified_adult":
        current_user.adult_verification_status = "failed"
        session.add(current_user)
        session.commit()
        _register_adult_verification_failure(current_user, session)
        return {"ok": False, **_adult_lock_payload(current_user)}
    current_user.adult_verified = True
    current_user.adult_verified_at = utcnow()
    current_user.adult_verification_status = "verified_adult"
    current_user.adult_verification_fail_count = 0
    current_user.adult_verification_locked_until = None
    current_user.adult_verification_provider = provider
    current_user.adult_verification_tx_id = tx_id
    session.add(current_user)
    session.commit()
    return {"ok": True, **_adult_lock_payload(current_user), "provider_profile": _verification_provider_payload(provider)}


@router.post("/moderation/check-text")
def moderation_check_text(payload: ModerationTextRequest):
    value = payload.text
    findings = _moderation_text_findings(value)
    return {
        "ok": len(findings) == 0,
        "blocked": len(findings) > 0,
        "reason": findings[0]["reason"] if findings else None,
        "findings": findings,
        "target_type": payload.target_type,
    }


@router.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, session: Session = Depends(get_session)) -> TokenResponse:
    demo_tokens = try_demo_login(payload.email, payload.password)
    if demo_tokens:
        return TokenResponse(**demo_tokens)
    client_ip = request.client.host if request.client else "127.0.0.1"
    try:
        check_ip_rate_limit(client_ip, "auth_login", session)
    except HTTPException:
        raise
    except Exception:
        session.rollback()
        logger.exception("auth_login_rate_limit_failed")
    if payload.email in {"admin@example.com", "seller@example.com", "customer@example.com", "general@example.com"}:
        try:
            ensure_test_accounts(session)
        except Exception:
            session.rollback()
            logger.exception("ensure_test_accounts_failed")
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user:
        raise HTTPException(status_code=401, detail="invalid credentials")
    if user.locked_until and user.locked_until > utcnow():
        raise HTTPException(status_code=423, detail=f"account locked until {user.locked_until.isoformat()}")
    if not verify_password(payload.password, user.password_hash):
        try:
            register_login_failure(user, session)
        except Exception:
            session.rollback()
            logger.exception("register_login_failure_failed")
        raise HTTPException(status_code=401, detail="invalid credentials")
    if user.grade != MemberGrade.ADMIN and user.member_status in {"minor_blocked", "blocked_minor", "login_blocked_minor"}:
        raise HTTPException(status_code=403, detail="minor account blocked")
    if user.grade != MemberGrade.ADMIN and not user.identity_verified:
        raise HTTPException(status_code=403, detail="identity verification required")
    if user.grade != MemberGrade.ADMIN and settings.reconsent_enforcement_mode == "login_block" and _user_requires_reconsent(session, user.id or 0):
        raise HTTPException(status_code=403, detail="reconsent required before login")
    try:
        clear_login_failures(user, session)
    except Exception:
        session.rollback()
        logger.exception("clear_login_failures_failed")
    try:
        device_session = create_device_session(user, session, payload.device_name, request.headers.get("user-agent"), client_ip)
    except Exception:
        session.rollback()
        logger.exception("create_device_session_failed_login")
        device_session = None
    if user.grade == MemberGrade.ADMIN and settings.admin_2fa_enabled and user.admin_2fa_confirmed:
        challenge = issue_login_challenge(user, session, device_session)
        return TokenResponse(access_token="", refresh_token="", role=user.grade, user_id=user.id or 0, two_factor_required=True, challenge_token=challenge.challenge_token)
    return build_token_response_safe(user, session)


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
    if (user.id or 0) < 0:
        return {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "grade": user.grade,
            "adult_verified": user.adult_verified,
            "identity_verified": user.identity_verified,
            "adult_verification_status": user.adult_verification_status,
            "adult_verification_fail_count": 0,
            "adult_verification_locked_until": None,
            "reconsent_required": False,
            "consent_status": {},
            "reconsent_enforcement_mode": settings.reconsent_enforcement_mode,
            "random_chat_profile_ready": False,
            "feature_flags": _community_feature_flags(),
            "admin_2fa_confirmed": False,
            "backup_codes_remaining": 0,
            "locked_until": "",
            "failed_login_count": 0,
            "last_login_at": "",
            "password_changed_at": "",
            "session_count": 0,
            "member_status": user.member_status,
            "location_feature_mode": settings.location_feature_mode,
        }
    backup_count = len([x for x in (user.admin_backup_codes or "").split(",") if x])
    sessions = session.exec(select(DeviceSession).where(DeviceSession.user_id == user.id).order_by(DeviceSession.created_at.desc())).all()
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "grade": user.grade,
        "adult_verified": user.adult_verified,
        "identity_verified": user.identity_verified,
        "adult_verification_status": user.adult_verification_status,
        "adult_verification_fail_count": user.adult_verification_fail_count,
        "adult_verification_locked_until": user.adult_verification_locked_until.isoformat() if user.adult_verification_locked_until else None,
        "reconsent_required": _user_requires_reconsent(session, user.id or 0),
        "consent_status": _consent_status_payload(session, user.id or 0),
        "reconsent_enforcement_mode": settings.reconsent_enforcement_mode,
        "random_chat_profile_ready": bool(settings.random_chat_enabled and user.gender and user.age_band and user.region_code),
        "feature_flags": _community_feature_flags(),
        "admin_2fa_confirmed": user.admin_2fa_confirmed,
        "backup_codes_remaining": backup_count,
        "locked_until": user.locked_until.isoformat() if user.locked_until else "",
        "failed_login_count": user.failed_login_count,
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else "",
        "password_changed_at": user.password_changed_at.isoformat() if user.password_changed_at else "",
        "session_count": len(sessions),
        "member_status": user.member_status,
        "location_feature_mode": settings.location_feature_mode,
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



@router.get("/deploy/cloudflare-pages-manual")
def cloudflare_pages_manual():
    return CLOUDFLARE_MANUAL_DEPLOY


@router.get("/monetization/summary")
def monetization_summary() -> dict[str, Any]:
    return {
        "seller_subscription_enabled": settings.monetization_seller_subscription_enabled,
        "feed_sponsored_slots_enabled": settings.monetization_feed_sponsored_slots_enabled,
        "premium_member_enabled": settings.monetization_premium_member_enabled,
        "b2b_report_tools_enabled": settings.monetization_b2b_report_tools_enabled,
        "strategy": {
            "base_revenue": "판매중개 수수료",
            "sponsored_slots": settings.monetization_sponsored_slot_policy,
            "premium_member": settings.monetization_premium_member_policy,
            "b2b_tools": settings.monetization_b2b_tool_policy,
        },
        "premium_member_benefits": [
            "익명포장 보장 옵션",
            "빠른 출고 옵션",
            "재포장/보호포장 옵션",
            "프리미엄 CS 응답 옵션",
        ],
        "seller_b2b_tools": [
            "월별 정산 리포트",
            "반품/환불 이력 리포트",
            "판매자 분쟁 대응 로그",
            "증빙 요청/다운로드 기능",
            "사업자용 대시보드",
            "SKU 승인 상태 리포트",
        ],
    }

@router.get("/community/safe-activation-ideas")
def community_safe_activation_ideas() -> dict[str, Any]:
    return {
        "items": [
            "안전수칙 요약 토론방",
            "동의와 경계설정 체크인",
            "초보 입문 Q&A",
            "익명 고민상담 게시판",
            "일상/취미 라운지",
            "제품 사용/보관 팁 교류",
            "구매 전 질문 스레드",
            "후기형 짧은 댓글 토론",
            "운영진 진행형 AMA",
            "주간 주제 토크방",
        ],
        "guardrails": [
            "오프라인 만남 제안 금지",
            "외부 연락처 교환 금지",
            "사진·영상 전송 금지",
            "성매매·대가성 제안 금지",
            "지역·거리 기반 탐색 금지",
        ],
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
    return {
        "providers": [{
            "provider": settings.adult_verification_provider,
            "provider_label": settings.adult_verification_provider_label,
            "client_id": mask(settings.adult_verification_client_id),
            "configured": settings.adult_verification_client_id != "change-me",
            "callback_web": settings.adult_verification_callback_web,
            "rollout_strategy": settings.adult_verification_rollout_strategy,
            "prod_cutover_checklist": settings.adult_verification_prod_cutover_checklist,
        }],
        "minor_block_retention": {"days": settings.minor_block_retention_days, "scope": settings.minor_block_retention_scope},
        "admin_exception": {"approval_mode": settings.admin_exception_approval_mode, "audit_required": settings.admin_exception_audit_required},
        "ops_alerts": {"slack_enabled": settings.ops_alert_slack_enabled, "email_enabled": settings.ops_alert_email_enabled},
    }


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
        "adult_verification": {"provider": settings.adult_verification_provider, "provider_label": settings.adult_verification_provider_label, "client_id": mask(settings.adult_verification_client_id), "test_mode": settings.adult_verification_test_mode, "rollout_strategy": settings.adult_verification_rollout_strategy, "prod_cutover_checklist": settings.adult_verification_prod_cutover_checklist},
        "policy": {"minor_block_retention_days": settings.minor_block_retention_days, "minor_block_retention_scope": settings.minor_block_retention_scope, "admin_exception_approval_mode": settings.admin_exception_approval_mode, "admin_exception_audit_required": settings.admin_exception_audit_required, "reconsent_enforcement_mode": settings.reconsent_enforcement_mode},
        "ops_alerts": {"slack_enabled": settings.ops_alert_slack_enabled, "email_enabled": settings.ops_alert_email_enabled, "email_to": settings.ops_alert_email_to, "checklist_document_path": settings.ops_checklist_document_path},
    }




@router.get("/policy/decisions")
def policy_decisions():
    return {
        "adult_verification": {
            "provider": settings.adult_verification_provider,
            "rollout_strategy": settings.adult_verification_rollout_strategy,
            "prod_cutover_checklist": settings.adult_verification_prod_cutover_checklist,
        },
        "minor_block": {
            "login_allowed": False,
            "access_allowed": False,
            "retention_days": settings.minor_block_retention_days,
            "retention_scope": settings.minor_block_retention_scope,
        },
        "admin_exception": {
            "scope": "최상위 관리자만 예외 검토 가능",
            "approval_mode": settings.admin_exception_approval_mode,
            "audit_required": settings.admin_exception_audit_required,
        },
        "reconsent": {
            "grace_days": settings.reconsent_grace_days,
            "enforcement_mode": settings.reconsent_enforcement_mode,
            "redirect_path": settings.reconsent_redirect_path,
            "meaning": "필수 문서 버전이 바뀌었을 때 유예기간 없이 최신 문서 재동의를 바로 요구",
            "post_grace_restrictions": ["글쓰기", "채팅", "주문", "문의", "프로필 수정"],
        },
        "ops_alerts": {
            "slack_enabled": settings.ops_alert_slack_enabled,
            "email_enabled": settings.ops_alert_email_enabled,
            "email_to": settings.ops_alert_email_to,
        },
        "operator_disclosure": {
            "legal_name": settings.operator_legal_name,
            "mail_order_report_no": settings.operator_mail_order_report_no,
            "youth_protection_officer": settings.operator_youth_protection_officer,
        },
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


@router.get("/seller/me/verification-status")
def seller_me_verification_status(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    profile = session.exec(select(SellerProfile).where(SellerProfile.user_id == (current_user.id or 0))).first()
    eligible, reason = _seller_can_register_products(current_user, session)
    return {
        "user_id": current_user.id,
        "grade": current_user.grade,
        "seller_onboarding_status": current_user.seller_onboarding_status,
        "adult_verified": current_user.adult_verified,
        "identity_verified": current_user.identity_verified,
        "eligible_for_product_registration": eligible,
        "reason": reason,
        "profile": {
            "business_number": profile.business_number if profile else None,
            "settlement_account_verified": profile.settlement_account_verified if profile else False,
            "return_address": profile.return_address if profile else None,
            "cs_contact": profile.cs_contact if profile else None,
            "seller_contract_agreed": profile.seller_contract_agreed if profile else False,
        },
    }


@router.post("/seller/verification/apply")
def seller_verification_apply(payload: SellerVerificationRequest, SellerApprovalDecisionRequest, ProductApprovalDecisionRequest, ProductSubmitReviewRequest, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _enforce_route_rate_limit(request, "seller_verification_apply", session)
    _assert_can_access_adult(current_user)
    profile = session.exec(select(SellerProfile).where(SellerProfile.user_id == (current_user.id or 0))).first()
    handled_categories = [item.strip() for item in payload.handled_categories if str(item).strip()]
    submission_payload = {
        "company_name": payload.company_name.strip(),
        "representative_name": payload.representative_name.strip(),
        "business_number": payload.business_number.strip(),
        "ecommerce_number": payload.ecommerce_number.strip(),
        "business_address": payload.business_address.strip(),
        "cs_contact": payload.cs_contact.strip(),
        "return_address": payload.return_address.strip(),
        "youth_protection_officer": payload.youth_protection_officer.strip(),
        "settlement_bank": payload.settlement_bank.strip(),
        "settlement_account_number": payload.settlement_account_number.strip(),
        "settlement_account_holder": payload.settlement_account_holder.strip(),
        "handled_categories": handled_categories,
        "seller_contract_agreed": payload.seller_contract_agreed,
        "business_document_url": payload.business_document_url.strip(),
        "submitted_at": utcnow().isoformat(),
    }
    missing_fields = _seller_submission_missing_fields(submission_payload)
    if missing_fields:
        raise HTTPException(status_code=400, detail={"message": "seller submission incomplete", "missing_fields": missing_fields})
    if not profile:
        profile = SellerProfile(user_id=current_user.id or 0, business_number=payload.business_number, cs_contact=payload.cs_contact, return_address=payload.return_address, seller_contract_agreed=payload.seller_contract_agreed, settlement_account_verified=False)
    else:
        profile.business_number = payload.business_number
        profile.cs_contact = payload.cs_contact
        profile.return_address = payload.return_address
        profile.seller_contract_agreed = payload.seller_contract_agreed
    current_user.grade = MemberGrade.SELLER if current_user.grade == MemberGrade.GENERAL else current_user.grade
    current_user.seller_onboarding_status = SellerOnboardingStatus.PENDING
    session.add(profile)
    session.add(current_user)
    session.commit()
    _save_seller_submission_payload(session, current_user.id or 0, submission_payload, status="pending")
    write_admin_log(session, current_user, "seller_verification_apply", "seller_profile", str(current_user.id or 0), payload.approval_note, after_state=f"document={payload.business_document_url};business_number={payload.business_number}", ip=request.client.host if request.client else "127.0.0.1", device=request.headers.get("user-agent"))
    return {"ok": True, "status": "pending_admin_review", "next_step": "관리자 승인 후 상품 등록 가능"}




@router.get("/seller/products/mine")
def seller_products_mine(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    rows = session.exec(select(Product).where(Product.seller_id == (current_user.id or 0)).order_by(Product.updated_at.desc())).all()
    return rows


@router.get("/admin/seller-approvals")
def admin_seller_approvals(current_user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    rows: list[dict[str, Any]] = []
    users = session.exec(select(User).where(User.grade.in_([MemberGrade.SELLER, MemberGrade.GENERAL]), User.seller_onboarding_status.is_not(None))).all()
    for user in users:
        profile = session.exec(select(SellerProfile).where(SellerProfile.user_id == (user.id or 0))).first()
        submission = _seller_submission_payload(session, user.id or 0)
        rows.append({
            "user_id": user.id,
            "email": user.email,
            "name": user.name,
            "status": (user.seller_onboarding_status.value if hasattr(user.seller_onboarding_status, "value") else user.seller_onboarding_status) or "pending",
            "company_name": submission.get("company_name"),
            "representative_name": submission.get("representative_name"),
            "business_number": profile.business_number if profile else submission.get("business_number"),
            "ecommerce_number": submission.get("ecommerce_number"),
            "handled_categories": submission.get("handled_categories") or [],
            "settlement_account_verified": bool(profile.settlement_account_verified) if profile else False,
            "return_address": profile.return_address if profile else submission.get("return_address"),
            "cs_contact": profile.cs_contact if profile else submission.get("cs_contact"),
            "seller_contract_agreed": bool(profile.seller_contract_agreed) if profile else bool(submission.get("seller_contract_agreed")),
            "submission_complete": _seller_submission_complete(submission),
            "missing_fields": _seller_submission_missing_fields(submission),
            "submitted_at": submission.get("submitted_at"),
        })
    return {"items": rows, "requirements": settings.seller_approval_requirements}


@router.get("/admin/seller-approvals/{user_id}")
def admin_seller_approval_detail(user_id: int, current_user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="seller not found")
    profile = session.exec(select(SellerProfile).where(SellerProfile.user_id == user_id)).first()
    submission = _seller_submission_payload(session, user_id)
    return {
        "user_id": user.id, "email": user.email, "name": user.name,
        "status": (user.seller_onboarding_status.value if hasattr(user.seller_onboarding_status, "value") else user.seller_onboarding_status) or "pending",
        "requirements": settings.seller_approval_requirements,
        "profile": {
            "company_name": submission.get("company_name"),
            "representative_name": submission.get("representative_name"),
            "business_number": profile.business_number if profile else submission.get("business_number"),
            "ecommerce_number": submission.get("ecommerce_number"),
            "business_address": submission.get("business_address"),
            "return_address": profile.return_address if profile else submission.get("return_address"),
            "cs_contact": profile.cs_contact if profile else submission.get("cs_contact"),
            "youth_protection_officer": submission.get("youth_protection_officer"),
            "handled_categories": submission.get("handled_categories") or [],
            "settlement_account_verified": bool(profile.settlement_account_verified) if profile else False,
            "seller_contract_agreed": bool(profile.seller_contract_agreed) if profile else bool(submission.get("seller_contract_agreed")),
        },
        "submission": submission,
        "missing_fields": _seller_submission_missing_fields(submission),
    }


@router.post("/admin/seller-approvals/{user_id}/decision")
def admin_seller_approval_decision(user_id: int, payload: SellerApprovalDecisionRequest, request: Request, current_user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="seller not found")
    profile = session.exec(select(SellerProfile).where(SellerProfile.user_id == user_id)).first()
    submission = _seller_submission_payload(session, user_id)
    decision = (payload.decision or "").strip()
    if decision == "approved":
        if not profile or not submission or not _seller_submission_complete(submission):
            raise HTTPException(status_code=400, detail="seller submission incomplete")
        profile.settlement_account_verified = True
        user.seller_onboarding_status = SellerOnboardingStatus.ACTIVE
    elif decision in {"hold", "pending"}:
        user.seller_onboarding_status = SellerOnboardingStatus.PENDING
    else:
        user.seller_onboarding_status = SellerOnboardingStatus.PENDING
    session.add(user)
    if profile:
        session.add(profile)
    session.commit()
    write_admin_log(session, current_user, "seller_approval_decision", "user", str(user_id), payload.note or decision, after_state=decision, ip=request.client.host if request.client else "127.0.0.1", device=request.headers.get("user-agent"))
    return {"ok": True, "user_id": user_id, "decision": decision, "seller_onboarding_status": (user.seller_onboarding_status.value if hasattr(user.seller_onboarding_status, "value") else user.seller_onboarding_status)}


@router.get("/admin/product-approvals")
def admin_product_approvals(current_user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    rows = session.exec(select(Product).order_by(Product.updated_at.desc())).all()
    data=[]
    for item in rows:
        meta = _product_policy_meta(session, item.id or 0)
        data.append({"id": item.id, "seller_id": item.seller_id, "name": item.name, "sku_code": item.sku_code, "category": item.category, "status": item.status, "price": item.price, "stock_qty": item.stock_qty, "updated_at": item.updated_at.isoformat() if item.updated_at else "", "risk_level": meta.get("risk_level", "low"), "review_status": meta.get("review_status", item.status), "blocked_reason": meta.get("blocked_reason", "")})
    return {"items": data, "visibility_policy": settings.product_review_visibility_policy}


@router.get("/admin/product-approvals/{product_id}")
def admin_product_approval_detail(product_id: int, current_user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    item = session.get(Product, product_id)
    if not item:
        raise HTTPException(status_code=404, detail="product not found")
    media = session.exec(select(ProductMedia).where(ProductMedia.product_id == product_id).order_by(ProductMedia.sort_order)).all()
    return {"product": item, "media": media, "visibility_policy": settings.product_review_visibility_policy, "policy_meta": _product_policy_meta(session, product_id)}


@router.post("/admin/product-approvals/{product_id}/decision")
def admin_product_approval_decision(product_id: int, payload: ProductApprovalDecisionRequest, request: Request, current_user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    item = session.get(Product, product_id)
    if not item:
        raise HTTPException(status_code=404, detail="product not found")
    decision=(payload.decision or "").strip()
    if decision == "approved":
        item.status = "approved"
        item.is_active = True
    elif decision in {"hold", "pending"}:
        item.status = "pending_review"
        item.is_active = False
    else:
        item.status = "rejected"
        item.is_active = False
    item.updated_at = utcnow()
    session.add(item)
    session.commit()
    write_admin_log(session, current_user, "product_approval_decision", "product", str(product_id), payload.note or decision, after_state=decision, ip=request.client.host if request.client else "127.0.0.1", device=request.headers.get("user-agent"))
    return {"ok": True, "product_id": product_id, "decision": decision, "status": item.status}


@router.post("/products/{product_id}/submit-review")
def submit_product_review(product_id: int, payload: ProductSubmitReviewRequest, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(Product, product_id)
    if not _product_can_edit_by_seller(item, current_user.id or 0):
        raise HTTPException(status_code=403, detail="product cannot be submitted")
    eligible, reason = _seller_can_register_products(current_user, session)
    if not eligible:
        raise HTTPException(status_code=403, detail=reason)
    item.status = "pending_review"
    item.is_active = False
    item.updated_at = utcnow()
    session.add(item)
    session.commit()
    write_admin_log(session, current_user, "product_submit_review", "product", str(product_id), payload.note, after_state="pending_review", ip=request.client.host if request.client else "127.0.0.1", device=request.headers.get("user-agent"))
    return {"ok": True, "product_id": product_id, "status": item.status}

@router.get("/products")
def list_products(request: Request, session: Session = Depends(get_session)):
    try:
        viewer = _extract_optional_user(session, request)
        rows = session.exec(select(Product).order_by(Product.created_at.desc())).all()
        visible: list[Product] = []
        for item in rows:
            if not _product_publicly_visible(item):
                continue
            if not _user_can_view_adult(viewer) and str(getattr(item, "review_visibility", "safe")) != "safe":
                continue
            visible.append(item)
        return visible
    except Exception:
        session.rollback()
        logger.exception("list_products_failed")
        return []


@router.get("/products/{product_id}")
def product_detail(product_id: int, request: Request, session: Session = Depends(get_session)):
    viewer = _extract_optional_user(session, request)
    product = session.get(Product, product_id)
    if not product or not _product_publicly_visible(product):
        raise HTTPException(status_code=404, detail='product not found')
    if not _user_can_view_adult(viewer) and str(getattr(product, 'review_visibility', 'safe')) != 'safe':
        raise HTTPException(status_code=403, detail='adult verification required')
    media = session.exec(select(ProductMedia).where(ProductMedia.product_id == product_id).order_by(ProductMedia.sort_order)).all()
    seller = session.get(User, product.seller_id)
    seller_profile = session.exec(select(SellerProfile).where(SellerProfile.user_id == product.seller_id)).first()
    policy_meta = _app_asset_json(session, 'product_policy', str(product_id)) or {}
    return {
        'product': product,
        'media': media,
        'policy': policy_meta,
        'site_ready': {
            'adult_only_label': '성인용품',
            'illegal_goods_blocked': True,
            'price_visible': int(product.price or 0) > 0,
            'purchase_button_visible': True,
            'customer_center_visible': bool(seller_profile and seller_profile.cs_contact),
            'minimum_refund_window_days': 7,
        },
        'shipping_fee': 3000,
        'seller_contact': {
            'name': seller.name if seller else '판매자',
            'business_name': settings.operator_legal_name,
            'business_registration_no': settings.operator_business_registration_no,
            'business_address': settings.operator_business_address,
            'cs_contact': seller_profile.cs_contact if seller_profile else settings.operator_support_phone,
            'return_address': seller_profile.return_address if seller_profile else settings.operator_business_address,
            'support_email': settings.operator_support_email,
        },
    }


@router.post("/products")
def upsert_product(payload: ProductUpsertRequest, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _enforce_route_rate_limit(request, "products_upsert", session)
    _assert_can_access_adult(current_user)
    _assert_reconsent_write_allowed(current_user, session)
    eligible, reason = _seller_can_register_products(current_user, session)
    if not eligible:
        raise HTTPException(status_code=403, detail=reason)
    validate_exchange_text(payload.name)
    validate_exchange_text(payload.description or "")
    submit_mode = str(payload.submit_mode or "draft").strip().lower()
    wants_publish = submit_mode == "publish"
    if payload.id:
        product = session.get(Product, payload.id)
        if not product:
            raise HTTPException(status_code=404, detail="product not found")
        if not _product_can_edit_by_seller(product, current_user.id or 0):
            raise HTTPException(status_code=403, detail="approved product cannot be edited here")
    else:
        product = Product(seller_id=current_user.id or 0, name=payload.name, sku_code=payload.sku_code, category=payload.category, status="draft", is_active=False)
    for field, value in payload.model_dump().items():
        if field not in {"id", "seller_id", "status", "submit_mode"}:
            setattr(product, field, value)
    product.seller_id = current_user.id or 0
    if not payload.id:
        product.status = "draft"
        product.is_active = False
    classification = _classify_sku(product.category or "", product.name or "", product.description or "")
    product.risk_grade = {"low": "A", "medium": "B", "high": "C"}.get(classification.get("risk_level"), "B")
    if classification.get("review_status") == "blocked":
        product.status = "blocked_policy"
        product.is_active = False
    elif classification.get("review_status") == "manual_review":
        product.status = "pending_review"
        product.is_active = False
    elif wants_publish:
        product.status = "approved"
        product.is_active = True
    else:
        product.status = "draft"
        product.is_active = False
    product.updated_at = utcnow()
    primary_image_url = next((item for item in payload.image_urls if str(item).strip()), None) if payload.image_urls else None
    if primary_image_url:
        product.thumbnail_url = primary_image_url
    session.add(product)
    session.commit()
    session.refresh(product)
    _save_product_policy_meta(session, product.id or 0, {**classification, "category": product.category, "sku_code": product.sku_code, "name": product.name, "submit_mode": submit_mode})
    if payload.image_urls:
        existing = session.exec(select(ProductMedia).where(ProductMedia.product_id == (product.id or 0)).order_by(ProductMedia.sort_order)).all()
        existing_urls = {item.file_url for item in existing}
        for idx, url in enumerate(payload.image_urls[:5], start=1):
            if not url or url in existing_urls:
                continue
            media = ProductMedia(product_id=product.id or 0, file_name=f"image_{idx}.jpg", file_url=url, media_type="image", sort_order=idx)
            session.add(media)
        session.commit()
    return product


@router.post("/products/{product_id}/delete")
def delete_product(product_id: int, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="product not found")
    seller = session.get(User, product.seller_id)
    if not seller or seller.seller_onboarding_status != SellerOnboardingStatus.ACTIVE:
        raise HTTPException(status_code=403, detail="seller onboarding incomplete")
    if not _can_manage_product(current_user, product):
        raise HTTPException(status_code=403, detail="author or admin only")
    medias = session.exec(select(ProductMedia).where(ProductMedia.product_id == product_id)).all()
    for media in medias:
        session.delete(media)
    session.delete(product)
    session.commit()
    write_admin_log(session, current_user, "product_delete", "product", str(product_id), "상품 삭제", ip=request.client.host if request.client else "127.0.0.1", device=request.headers.get("user-agent"))
    return {"ok": True}


@router.get("/products/{product_id}/media")
def list_product_media(product_id: int, session: Session = Depends(get_session)):
    return session.exec(select(ProductMedia).where(ProductMedia.product_id == product_id).order_by(ProductMedia.sort_order)).all()


@router.post("/products/media")
def attach_product_media(payload: ProductMediaAttachRequest, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    product = session.get(Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="product not found")
    if not _can_manage_product(current_user, product):
        raise HTTPException(status_code=403, detail="seller/admin only")
    media = ProductMedia(**payload.model_dump())
    session.add(media)
    session.commit()
    session.refresh(media)
    product = session.get(Product, payload.product_id)
    if product and not product.thumbnail_url and payload.media_type == "image":
        product.thumbnail_url = payload.file_url
        session.add(product)
        session.commit()
    write_admin_log(session, current_user, "product_media_attach", "product", str(payload.product_id), payload.file_name, ip=request.client.host if request.client else "127.0.0.1", device=request.headers.get("user-agent"))
    return media


@router.get("/contents")
def list_contents(request: Request, session: Session = Depends(get_session)):
    viewer = _extract_optional_user(session, request)
    rows = session.exec(select(ContentItem).order_by(ContentItem.created_at.desc())).all()
    if _user_can_view_adult(viewer):
        return rows
    return [item for item in rows if (item.visibility or "safe") == "safe"]


@router.get("/community/posts")
def list_community_posts(request: Request, session: Session = Depends(get_session)):
    rows = []
    viewer = _extract_optional_user(session, request)
    for post in session.exec(select(CommunityPost).order_by(CommunityPost.created_at.desc())).all():
        if not _user_can_view_adult(viewer) and (post.visibility or "safe") != "safe":
            continue
        meta = _community_author(session, post.author_id)
        rows.append({"id": post.id, "category": post.category, "title": post.title, "body": post.body, "visibility": post.visibility, "purpose": post.purpose, "allow_dm": post.allow_dm, "status": post.status, "author_id": post.author_id, **meta, "created_at": post.created_at.isoformat() if post.created_at else ""})
    return rows


@router.post("/community/posts")
def create_community_post(payload: CommunityPostCreate, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _enforce_route_rate_limit(request, "community_posts_create", session)
    _assert_reconsent_write_allowed(current_user, session)
    validate_exchange_text(payload.title)
    validate_exchange_text(payload.body)
    _validate_community_information_post(payload.category, payload.title, payload.body)
    _ensure_post_visibility(current_user, payload.visibility)
    post = CommunityPost(author_id=current_user.id or 0, author_grade=_role_name(current_user.grade), category=payload.category, title=payload.title, body=payload.body, visibility=payload.visibility, purpose=payload.purpose, allow_dm=payload.allow_dm, status="published", created_at=utcnow(), updated_at=utcnow())
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@router.get("/community/follows/summary")
def community_follow_summary(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    following_rows = session.exec(select(UserFollow).where(UserFollow.follower_id == (current_user.id or 0), UserFollow.is_active == True)).all()  # noqa: E712
    follower_rows = session.exec(select(UserFollow).where(UserFollow.followee_id == (current_user.id or 0), UserFollow.is_active == True)).all()  # noqa: E712
    following_ids = sorted({row.followee_id for row in following_rows})
    follower_ids = sorted({row.follower_id for row in follower_rows})
    mutual_ids = sorted(set(following_ids).intersection(follower_ids))
    return {
        "following_ids": following_ids,
        "follower_ids": follower_ids,
        "mutual_ids": mutual_ids,
        "dm_notice": _dm_notice_lines(),
    }


@router.post("/community/follows/{target_id}")
def toggle_follow(target_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if target_id == (current_user.id or 0):
        raise HTTPException(status_code=400, detail="cannot follow self")
    target = session.get(User, target_id)
    if not target:
        raise HTTPException(status_code=404, detail="target user not found")
    row = session.exec(select(UserFollow).where(UserFollow.follower_id == (current_user.id or 0), UserFollow.followee_id == target_id)).first()
    if row:
        row.is_active = not bool(row.is_active)
    else:
        row = UserFollow(follower_id=current_user.id or 0, followee_id=target_id, is_active=True)
    session.add(row)
    session.commit()
    return {
        "target_id": target_id,
        "following": bool(row.is_active),
        "mutual": _is_mutual_follow(session, current_user.id or 0, target_id),
    }


@router.get("/community/threads")
def list_threads(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    rows = []
    stmt = select(DirectMessageThread).where((DirectMessageThread.participant_a_id == (current_user.id or 0)) | (DirectMessageThread.participant_b_id == (current_user.id or 0))).order_by(DirectMessageThread.updated_at.desc())
    for thread in session.exec(stmt).all():
        if thread.thread_type == "random_1to1" and _is_blocked_pair(session, current_user.id or 0, _message_counterparty(thread, current_user.id or 0)):
            continue
        other_id = _message_counterparty(thread, current_user.id or 0)
        other = session.get(User, other_id)
        rows.append({"id": thread.id, "subject": thread.subject, "purpose_code": thread.purpose_code, "thread_type": thread.thread_type, "status": thread.status, "related_post_id": thread.related_post_id, "related_product_id": thread.related_product_id, "other_user_id": other_id, "other_user_name": other.name if other else f"user:{other_id}", "updated_at": thread.updated_at.isoformat() if thread.updated_at else "", "dm_notice": _dm_notice_lines()})
    return rows


@router.post("/community/threads")
def create_thread(payload: DirectMessageThreadCreate, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _enforce_route_rate_limit(request, "community_threads_create", session)
    _assert_reconsent_write_allowed(current_user, session)
    if payload.participant_b_id == (current_user.id or 0):
        raise HTTPException(status_code=400, detail="cannot message self")
    validate_exchange_text(payload.subject)
    if payload.starter_topic:
        validate_exchange_text(payload.starter_topic)
    _ensure_dm_policy(current_user, payload.purpose_code)
    target = session.get(User, payload.participant_b_id)
    if not target:
        raise HTTPException(status_code=404, detail="target user not found")
    _ensure_dm_request_requirements(session, current_user, target, payload)
    existing = session.exec(select(DirectMessageThread).where(
        (((DirectMessageThread.participant_a_id == (current_user.id or 0)) & (DirectMessageThread.participant_b_id == payload.participant_b_id)) | ((DirectMessageThread.participant_a_id == payload.participant_b_id) & (DirectMessageThread.participant_b_id == (current_user.id or 0))))
        & (DirectMessageThread.thread_type == payload.thread_type)
        & (DirectMessageThread.status != "closed")
    ).order_by(DirectMessageThread.updated_at.desc())).first()
    if existing:
        return {"id": existing.id, "status": existing.status, "dm_notice": _dm_notice_lines(), "starter_topic": payload.starter_topic}
    thread_status = "pending_acceptance" if payload.thread_type == "mutual_follow_dm" else "open"
    thread = DirectMessageThread(subject=payload.subject, purpose_code=payload.purpose_code, thread_type=payload.thread_type, created_by=current_user.id or 0, participant_a_id=current_user.id or 0, participant_b_id=payload.participant_b_id, related_post_id=payload.related_post_id, related_product_id=payload.related_product_id, status=thread_status, created_at=utcnow(), updated_at=utcnow())
    session.add(thread)
    session.commit()
    session.refresh(thread)
    return {"id": thread.id, "status": thread.status, "dm_notice": _dm_notice_lines(), "starter_topic": payload.starter_topic}


@router.post("/community/threads/{thread_id}/accept")
def accept_thread(thread_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    thread = session.get(DirectMessageThread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="thread not found")
    _ensure_thread_member(thread, current_user.id or 0)
    if thread.thread_type != "mutual_follow_dm":
        raise HTTPException(status_code=400, detail="accept only allowed for mutual follow dm")
    if thread.participant_b_id != (current_user.id or 0):
        raise HTTPException(status_code=403, detail="only recipient can accept")
    thread.status = "open"
    thread.updated_at = utcnow()
    session.add(thread)
    session.commit()
    return {"id": thread.id, "status": thread.status, "dm_notice": _dm_notice_lines()}


@router.get("/community/threads/{thread_id}/messages")
def list_messages(thread_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    thread = session.get(DirectMessageThread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="thread not found")
    _ensure_thread_member(thread, current_user.id or 0)
    _ensure_thread_visible(session, thread, current_user.id or 0)
    rows = []
    for msg in session.exec(select(DirectMessage).where(DirectMessage.thread_id == thread_id).order_by(DirectMessage.created_at)).all():
        sender = session.get(User, msg.sender_id)
        rows.append(_serialize_message(msg, sender.name if sender else f"user:{msg.sender_id}"))
    return rows


@router.post("/community/messages")
def create_message(payload: DirectMessageCreate, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _enforce_route_rate_limit(request, "community_messages_create", session)
    _assert_reconsent_write_allowed(current_user, session)
    thread = session.get(DirectMessageThread, payload.thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="thread not found")
    _ensure_thread_member(thread, current_user.id or 0)
    _ensure_thread_visible(session, thread, current_user.id or 0)
    if thread.status != "open":
        raise HTTPException(status_code=409, detail="thread not accepted yet")
    _ensure_dm_policy(current_user, payload.purpose_code)
    validate_exchange_text(payload.message)
    receiver_id = _message_counterparty(thread, current_user.id or 0)
    msg = DirectMessage(thread_id=thread.id or 0, sender_id=current_user.id or 0, receiver_id=receiver_id, purpose_code=payload.purpose_code, message=payload.message, created_at=utcnow())
    thread.updated_at = utcnow()
    session.add(thread)
    session.add(msg)
    session.commit()
    session.refresh(msg)
    return _serialize_message(msg, current_user.name)


@router.delete("/community/messages/{message_id}")
def delete_message(message_id: int, payload: DirectMessageDeleteRequest, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    msg = session.get(DirectMessage, message_id)
    if not msg:
        raise HTTPException(status_code=404, detail="message not found")
    if msg.sender_id != (current_user.id or 0):
        raise HTTPException(status_code=403, detail="only sender can delete message")
    thread = session.get(DirectMessageThread, msg.thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="thread not found")
    _ensure_thread_member(thread, current_user.id or 0)
    rule = _get_or_create_random_rule(session)
    limit_at = msg.created_at + timedelta(minutes=rule.self_message_delete_window_minutes)
    now = utcnow()
    if now > limit_at:
        raise HTTPException(status_code=400, detail=f"delete window expired ({rule.self_message_delete_window_minutes} minutes)")
    if not msg.is_deleted_for_all:
        msg.original_message_backup = msg.original_message_backup or msg.message
        msg.message = "삭제된 메시지"
        msg.is_deleted_for_all = True
        msg.deleted_by_id = current_user.id or 0
        msg.deleted_at = now
        thread.updated_at = now
        session.add(thread)
        session.add(msg)
        session.commit()
    return _serialize_message(msg, current_user.name)


@router.post("/contents")
def upsert_content(payload: ContentUpsertRequest, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _enforce_route_rate_limit(request, "contents_upsert", session)
    _assert_reconsent_write_allowed(current_user, session)
    if payload.visibility != "safe":
        _assert_can_access_adult(current_user)
    validate_exchange_text(payload.title)
    validate_exchange_text(payload.body or "")
    if payload.id:
        item = session.get(ContentItem, payload.id)
        if not item:
            raise HTTPException(status_code=404, detail="content not found")
        if not _can_manage_content(current_user, item.author_id):
            raise HTTPException(status_code=403, detail="author or admin only")
    else:
        item = ContentItem(author_id=current_user.id or 0, title=payload.title)
    for field, value in payload.model_dump().items():
        if field not in {"id", "author_id"}:
            setattr(item, field, value)
    item.author_id = current_user.id or item.author_id
    item.updated_at = utcnow()
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.post("/contents/{content_id}/delete")
def delete_content(content_id: int, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(ContentItem, content_id)
    if not item:
        raise HTTPException(status_code=404, detail="content not found")
    if not _can_manage_content(current_user, item.author_id):
        raise HTTPException(status_code=403, detail="author or admin only")
    session.delete(item)
    session.commit()
    write_admin_log(session, current_user, "content_delete", "content", str(content_id), "콘텐츠 삭제", ip=request.client.host if request.client else "127.0.0.1", device=request.headers.get("user-agent"))
    return {"ok": True}


@router.post("/upload")
async def upload_media(request: Request, file: UploadFile = File(...), current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _assert_reconsent_write_allowed(current_user, session)
    suffix, media_type = _ensure_upload_file(file)
    safe_name = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}{suffix}"
    upload_dir = Path(settings.uploads_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    out_path = upload_dir / safe_name
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail=f"file too large: {len(content)} bytes")
    scan_result = _scan_upload_content(file.filename or safe_name, file.content_type, content)
    out_path.write_bytes(content)
    presigned = _presigned_upload_payload(safe_name, media_type)
    write_admin_log(session, current_user, 'upload_media', 'upload', safe_name, file.filename or safe_name, after_state=file.content_type or media_type, ip=request.client.host if request.client else '127.0.0.1', device=request.headers.get('user-agent'))
    return {"file_name": file.filename, "saved_name": safe_name, "file_url": f"/media/{safe_name}", "public_url": presigned["public_url"], "media_type": media_type, "size": len(content), "content_type": file.content_type, "scan": scan_result, "presigned": presigned}


@router.post("/reports")
def create_report(payload: SimpleReportCreate, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _enforce_route_rate_limit(request, "reports_create", session)
    report = ModerationReport(reporter_id=current_user.id or 0, target_type=payload.target_type, target_id=payload.target_id, reason_code=payload.reason_code, priority=payload.priority)
    session.add(report)
    session.commit()
    session.refresh(report)
    ensure_sla_event(session, "report_review", "report", str(report.id), owner_id=report.assigned_to, hours=24)
    return report


@router.get("/orders")
def list_orders(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    rows = []
    for order in session.exec(select(Order)).all():
        if not _can_view_order(current_user, order):
            continue
        items = session.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all()
        record = _payment_record(session, order.order_no)
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
                "amount_snapshot": _payment_amount_snapshot(order, record),
            }
        )
    return rows


@router.get("/orders/{order_no}")
def order_detail(order_no: str, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    order = session.exec(select(Order).where(Order.order_no == order_no)).first()
    if not order:
        raise HTTPException(status_code=404, detail="order not found")
    if not _can_view_order(current_user, order):
        raise HTTPException(status_code=403, detail="forbidden")
    items = session.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all()
    record = _payment_record(session, order.order_no)
    return {
        "order": {
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
            "supply_amount": order.supply_amount,
            "vat_amount": order.vat_amount,
            "approved_at": order.approved_at.isoformat() if order.approved_at else None,
        },
        "items": [
            {
                "product_id": item.product_id,
                "sku_code": item.sku_code,
                "qty": item.qty,
                "unit_price": item.unit_price,
                "supply_amount": item.supply_amount,
                "vat_amount": item.vat_amount,
                "refund_status": item.refund_status,
            }
            for item in items
        ],
        "payment_record": record,
        "amount_snapshot": _payment_amount_snapshot(order, record),
        "checkout": _current_checkout_values(),
    }


@router.post("/orders")
def create_order(payload: OrderCreateRequest, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _enforce_route_rate_limit(request, "orders_create", session)
    _assert_reconsent_write_allowed(current_user, session)
    _assert_can_access_adult(current_user)
    product = session.get(Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="product not found")
    qty = max(1, payload.qty)
    unit_price = int(product.price or 0)
    total_amount = unit_price * qty
    supply_amount = int(round(total_amount / 1.1)) if total_amount else 0
    vat_amount = total_amount - supply_amount
    order = Order(
        order_no=f"ORD-{utcnow().strftime('%Y%m%d%H%M%S%f')}",
        member_id=current_user.id or 0,
        seller_id=product.seller_id,
        order_status="payment_pending",
        payment_method=payload.payment_method,
        payment_pg=(payload.payment_pg or settings.pg_primary_provider),
        approved_at=None,
        supply_amount=supply_amount,
        vat_amount=vat_amount,
        total_amount=total_amount,
        fee_rate=0.08,
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
        fee_rate=0.08,
        coupon_burden_owner=payload.coupon_burden_owner,
        refund_status=None,
    )
    session.add(item)
    session.commit()
    write_admin_log(session, current_user, "order_create", "order", str(order.id), "스타터 주문 생성", after_state=f"total={total_amount}")
    checkout = _current_checkout_values()
    return {"ok": True, "order_id": order.id, "order_no": order.order_no, "total_amount": total_amount, "payment_provider": settings.pg_primary_provider, "payment_init": {"merchant_uid": order.order_no, "store_id_configured": settings.pg_portone_store_id != "change-me-pg-store-id", "channel_key_configured": settings.pg_portone_channel_key != "change-me-pg-channel-key", "webhook_path": settings.pg_webhook_path, "store_id": checkout["store_id"], "channel_key": checkout["channel_key"], "client_key": checkout["client_key"], "mid": checkout["mid"], "mode": checkout["mode"]}}


@router.get("/payments/verotel/config")
def payments_verotel_config() -> dict[str, Any]:
    return _verotel_config_snapshot()


@router.post("/payments/verotel/start")
def payments_verotel_start(payload: dict[str, Any], request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)) -> dict[str, Any]:
    order_no = str(payload.get('order_no') or '').strip()
    currency = str(payload.get('currency') or 'EUR').strip().upper()
    allowed = set(_verotel_config_snapshot()['allowed_currencies'])
    if currency not in allowed:
        raise HTTPException(status_code=400, detail=f'unsupported currency: {currency}')
    order = session.exec(select(Order).where(Order.order_no == order_no)).first()
    if not order:
        raise HTTPException(status_code=404, detail='order not found')
    if not _can_view_order(current_user, order):
        raise HTTPException(status_code=403, detail='forbidden')
    _assert_can_access_adult(current_user)
    product = session.exec(select(OrderItem).where(OrderItem.order_id == order.id)).first()
    product_name = order_no
    if product:
        item_product = session.get(Product, product.product_id)
        if item_product:
            product_name = item_product.name
    amount_minor = int(order.total_amount or 0)
    reference_id = f"VTO-{order.order_no}"
    success_url = _public_url(settings.verotel_success_path) + f"?order_no={order.order_no}"
    back_url = _public_url(settings.verotel_back_path) + f"?order_no={order.order_no}"
    postback_url = _public_url(settings.verotel_postback_path)
    form_fields = {
        'shopID': settings.verotel_shop_id,
        'priceAmount': amount_minor,
        'currencyCode': currency,
        'referenceID': reference_id,
        'description': f'성인용품 주문 {product_name}',
        'successURL': success_url,
        'backURL': back_url,
        'postbackURL': postback_url,
    }
    signature = _verotel_signature(form_fields)
    if signature:
        form_fields['signature'] = signature
    session_row = session.exec(select(VerotelPaymentSession).where(VerotelPaymentSession.order_no == order.order_no)).first()
    if not session_row:
        session_row = VerotelPaymentSession(order_no=order.order_no, order_id=order.id, member_id=current_user.id or 0, currency=currency, amount_minor=amount_minor, description=form_fields['description'], reference_id=reference_id, success_url=success_url, back_url=back_url, postback_url=postback_url, signature=signature, status='prepared')
    else:
        session_row.currency = currency
        session_row.amount_minor = amount_minor
        session_row.description = form_fields['description']
        session_row.reference_id = reference_id
        session_row.success_url = success_url
        session_row.back_url = back_url
        session_row.postback_url = postback_url
        session_row.signature = signature
        session_row.status = 'prepared'
    _save_verotel_session(session, session_row, form_fields)
    record = _payment_record(session, order.order_no)
    record.update({'provider':'verotel','checkout_provider':'verotel','latest_status':'prepared','order_no':order.order_no,'reference_id':reference_id,'verotel_form_fields':form_fields,'checkout_started_at':utcnow().isoformat()})
    _append_payment_history(record, 'verotel_prepared', {'action':'prepared','reference_id':reference_id})
    _save_payment_record(session, order.order_no, record, status='configured')
    write_admin_log(session, current_user, 'verotel_prepare', 'order', str(order.id), 'Verotel checkout prepared', after_state=reference_id, ip=request.client.host if request.client else '127.0.0.1', device=request.headers.get('user-agent'))
    return {'ok': True, 'provider': 'verotel', 'order_no': order.order_no, 'action_url': settings.verotel_startorder_url, 'method': 'POST', 'form_fields': form_fields, 'payment_session': {'reference_id': reference_id, 'status': session_row.status}}


@router.post("/payments/webhooks/verotel")
async def payments_webhook_verotel(request: Request, session: Session = Depends(get_session)) -> dict[str, Any]:
    form = await request.form()
    payload = {k: v for k, v in form.items()} if form else {}
    if not payload:
        try:
            payload = await request.json()
        except Exception:
            payload = {}
    reference_id = str(payload.get('referenceID') or payload.get('reference_id') or '')
    sale_id = str(payload.get('saleID') or payload.get('sale_id') or '')
    status = str(payload.get('status') or payload.get('transactionStatus') or payload.get('paymentStatus') or 'approved').lower()
    order_no = reference_id.replace('VTO-', '', 1) if reference_id.startswith('VTO-') else str(payload.get('order_no') or '')
    if not order_no:
        return {'ok': False, 'detail': 'order_no missing'}
    order = session.exec(select(Order).where(Order.order_no == order_no)).first()
    if not order:
        return {'ok': False, 'detail': 'order not found'}
    row = session.exec(select(VerotelPaymentSession).where(VerotelPaymentSession.order_no == order_no)).first()
    if not row:
        row = VerotelPaymentSession(order_no=order_no, order_id=order.id, member_id=order.member_id, amount_minor=int(order.total_amount or 0), description=f'Webhook created for {order_no}', reference_id=reference_id or f'VTO-{order_no}')
    row.verotel_sale_id = sale_id or row.verotel_sale_id
    mapped = 'Paid' if status in {'approved','paid','success','completed'} else 'Failed'
    row.status = 'approved' if mapped == 'Paid' else 'failed'
    _save_verotel_session(session, row, payload, callback=True)
    record = _payment_record(session, order_no)
    if mapped == 'Paid':
        _apply_payment_status(order, mapped)
        session.add(order)
        session.commit()
        record.update({'confirmed': True, 'payment_id': sale_id or reference_id, 'provider': 'verotel', 'method': 'card', 'paid_amount': int(order.total_amount or 0), 'latest_status': 'paid', 'callback_provider': 'verotel'})
        _append_payment_history(record, 'verotel_paid', {'action':'approved','sale_id':sale_id or reference_id})
    else:
        record.update({'provider': 'verotel', 'latest_status': status, 'callback_provider': 'verotel'})
        _append_payment_history(record, 'verotel_failed', {'action':'failed','sale_id':sale_id or reference_id,'status':status})
    _save_payment_record(session, order_no, record, status='configured')
    return {'ok': True, 'provider': 'verotel', 'order_no': order_no, 'status': row.status}


@router.get("/payments/frontend-env-check")
def payments_frontend_env_check() -> dict[str, Any]:
    checkout = _current_checkout_values()
    api_origin = str(settings.backend_public_base_url or "").strip().rstrip("/")
    if api_origin.endswith("/api"):
        api_base_url = api_origin
    elif api_origin:
        api_base_url = f"{api_origin}/api"
    else:
        api_base_url = "https://adultapp-production.up.railway.app/api"
    return {
        "ok": True,
        "recommended_cloudflare_env": {
            "VITE_API_BASE_URL": api_base_url,
            "VITE_PORTONE_STORE_ID": checkout["store_id"],
            "VITE_TOSS_CLIENT_KEY": checkout["client_key"],
        },
        "resolved_checkout": checkout,
        "notes": [
            "Cloudflare Pages에는 client key와 store id만 넣고 secret 값은 넣지 않습니다.",
            "Railway backend에는 PORTONE_API_SECRET, webhook secret, toss secret key를 넣습니다.",
            "테스트 단계에서는 test/live 값을 절대 섞지 않습니다.",
        ],
    }


@router.get("/payments/orders/{order_no}/checkout-config")
def payment_checkout_config(order_no: str, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)) -> dict[str, Any]:
    order = session.exec(select(Order).where(Order.order_no == order_no)).first()
    if not order:
        raise HTTPException(status_code=404, detail="order not found")
    if not _can_view_order(current_user, order):
        raise HTTPException(status_code=403, detail="forbidden")
    checkout = _current_checkout_values()
    record = _payment_record(session, order.order_no)
    return {
        "ok": True,
        "order_no": order.order_no,
        "amount": int(order.total_amount or 0),
        "currency": "KRW",
        "payment_status": order.order_status,
        "checkout": checkout,
        "provider": settings.pg_primary_provider,
        "customer": {"id": current_user.id, "email": current_user.email, "name": current_user.name},
        "record": record,
    }


@router.post("/payments/confirm")
def payments_confirm(payload: PaymentConfirmRequest, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)) -> dict[str, Any]:
    order = session.exec(select(Order).where(Order.order_no == payload.order_no)).first()
    if not order:
        raise HTTPException(status_code=404, detail="order not found")
    if not _can_view_order(current_user, order):
        raise HTTPException(status_code=403, detail="forbidden")
    if int(payload.amount or 0) != int(order.total_amount or 0):
        raise HTTPException(status_code=400, detail="payment amount mismatch")
    record = _payment_record(session, order.order_no)
    if record.get("confirmed") and str(record.get("payment_id")) != str(payload.payment_id):
        raise HTTPException(status_code=409, detail="order already confirmed with different payment")
    provider_status = payload.status or "Paid"
    next_status = _apply_payment_status(order, provider_status)
    session.add(order)
    session.commit()
    record.update({
        "confirmed": True,
        "payment_id": payload.payment_id,
        "provider": payload.provider,
        "method": payload.method,
        "paid_amount": int(payload.amount or 0),
        "cancelled_amount": int(record.get("cancelled_amount") or 0),
        "refunded_amount": int(record.get("refunded_amount") or 0),
        "latest_status": next_status,
    })
    _append_payment_history(record, "payment_confirmed", {"payment_id": payload.payment_id, "status": next_status, "amount": int(payload.amount or 0)})
    _save_payment_record(session, order.order_no, record, status=next_status)
    write_admin_log(session, current_user, "payment_confirm", "order", str(order.id or 0), f"결제 확인 {order.order_no}", after_state=next_status, ip=request.client.host if request.client else "127.0.0.1", device=request.headers.get("user-agent"))
    return {"ok": True, "order_no": order.order_no, "status": next_status, "payment_id": payload.payment_id, "record": record}


@router.post("/payments/orders/{order_no}/cancel")
def payments_cancel(order_no: str, payload: PaymentCancelRequest, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)) -> dict[str, Any]:
    order = session.exec(select(Order).where(Order.order_no == order_no)).first()
    if not order:
        raise HTTPException(status_code=404, detail="order not found")
    if not _can_view_order(current_user, order):
        raise HTTPException(status_code=403, detail="forbidden")
    record = _payment_record(session, order.order_no)
    if not record.get("confirmed"):
        raise HTTPException(status_code=400, detail="payment not confirmed")
    snapshot = _payment_amount_snapshot(order, record)
    cancel_amount = int(payload.amount or snapshot["remaining"])
    if cancel_amount <= 0:
        raise HTTPException(status_code=400, detail="cancel amount must be positive")
    if cancel_amount > snapshot["remaining"]:
        raise HTTPException(status_code=400, detail="cancel amount exceeds remaining payable amount")
    idem = str(payload.idempotency_key or f"cancel:{order_no}:{cancel_amount}:{payload.reason}")
    if any(item.get("idempotency_key") == idem for item in (record.get("history") or [])):
        return {"ok": True, "deduplicated": True, "order_no": order_no, "status": order.order_status, "record": record}
    provider_status = "Cancelled" if cancel_amount == snapshot["remaining"] else "PartialCancelled"
    next_status = _apply_payment_status(order, provider_status)
    session.add(order)
    session.commit()
    record["cancelled_amount"] = int(record.get("cancelled_amount") or 0) + cancel_amount
    record["latest_status"] = next_status
    _append_payment_history(record, "payment_cancelled", {"amount": cancel_amount, "reason": payload.reason, "provider_status": provider_status, "idempotency_key": idem})
    _save_payment_record(session, order.order_no, record, status=next_status)
    write_admin_log(session, current_user, "payment_cancel", "order", str(order.id or 0), f"결제 취소 {order.order_no}", before_state=str(snapshot), after_state=next_status, ip=request.client.host if request.client else "127.0.0.1", device=request.headers.get("user-agent"))
    return {"ok": True, "order_no": order_no, "status": next_status, "cancel_amount": cancel_amount, "amount_snapshot": _payment_amount_snapshot(order, record), "record": record}


@router.post("/payments/orders/{order_no}/refund")
def payments_refund(order_no: str, payload: PaymentRefundRequest, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)) -> dict[str, Any]:
    order = session.exec(select(Order).where(Order.order_no == order_no)).first()
    if not order:
        raise HTTPException(status_code=404, detail="order not found")
    if not _can_view_order(current_user, order):
        raise HTTPException(status_code=403, detail="forbidden")
    record = _payment_record(session, order.order_no)
    if not record.get("confirmed"):
        raise HTTPException(status_code=400, detail="payment not confirmed")
    snapshot = _payment_amount_snapshot(order, record)
    refund_amount = int(payload.amount or snapshot["remaining"])
    if refund_amount <= 0:
        raise HTTPException(status_code=400, detail="refund amount must be positive")
    if refund_amount > snapshot["remaining"]:
        raise HTTPException(status_code=400, detail="refund amount exceeds remaining payable amount")
    idem = str(payload.idempotency_key or f"refund:{order_no}:{refund_amount}:{payload.reason}")
    if any(item.get("idempotency_key") == idem for item in (record.get("history") or [])):
        return {"ok": True, "deduplicated": True, "order_no": order_no, "status": order.order_status, "record": record}
    provider_status = _refund_provider_status_for_amount(refund_amount, snapshot["remaining"])
    next_status = _apply_payment_status(order, provider_status)
    session.add(order)
    session.commit()
    record["refunded_amount"] = int(record.get("refunded_amount") or 0) + refund_amount
    record["latest_status"] = next_status
    _append_payment_history(record, "payment_refunded", {"amount": refund_amount, "reason": payload.reason, "provider_status": provider_status, "idempotency_key": idem})
    _save_payment_record(session, order.order_no, record, status=next_status)
    write_admin_log(session, current_user, "payment_refund", "order", str(order.id or 0), f"환불 처리 {order.order_no}", before_state=str(snapshot), after_state=next_status, ip=request.client.host if request.client else "127.0.0.1", device=request.headers.get("user-agent"))
    return {"ok": True, "order_no": order_no, "status": next_status, "refund_amount": refund_amount, "amount_snapshot": _payment_amount_snapshot(order, record), "record": record}


@router.get("/settlements/preview")
def settlement_preview(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    lines = []
    for item in session.exec(select(OrderItem)).all():
        order = session.get(Order, item.order_id)
        product = session.get(Product, item.product_id)
        if not order:
            continue
        if not (_is_admin_like(current_user) or (current_user.id or 0) == order.seller_id):
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
    return {"items": lines, "summary": {"count": len(lines), "gross_amount": sum(int(x["seller_receivable"]) + int(x["platform_fee"]) + int(x["pg_fee"]) for x in lines), "seller_receivable_total": sum(int(x["seller_receivable"]) for x in lines)}, "policy": {"settlement_cycle": settings.settlement_cycle_policy, "tax_invoice_direct": settings.tax_invoice_responsibility_direct, "tax_invoice_marketplace": settings.tax_invoice_responsibility_marketplace, "cash_receipt_direct": settings.cash_receipt_responsibility_direct, "cash_receipt_marketplace": settings.cash_receipt_responsibility_marketplace}}


@router.get("/reports")
def list_reports(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _require_moderator(current_user)
    rows = []
    rule = _get_or_create_random_rule(session)
    for report in session.exec(select(ModerationReport)).all():
        rows.append(
            {
                "id": report.id,
                "reporter_id": report.reporter_id,
                "target_type": report.target_type,
                "target_id": report.target_id,
                "reason_code": report.reason_code,
            "score": _report_score(rule, report.reason_code or ""),
                "priority": report.priority,
                "status": report.status,
                "assigned_to": report.assigned_to,
                "action_taken": report.action_taken,
            }
        )
    return rows


@router.post("/reports/{report_id}/resolve")
def resolve_report(report_id: int, payload: ReportResolveRequest, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _require_moderator(current_user)
    report = session.get(ModerationReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="report not found")
    before = report.status
    report.status = payload.status
    report.action_taken = payload.action_taken
    report.assigned_to = current_user.id
    session.add(report)
    session.commit()
    extra: dict[str, Any] = {}
    if report.target_type == "random_chat_user" and payload.status in {"rejected", "false_report", "abuse_confirmed"}:
        rule = _get_or_create_random_rule(session)
        reporter = session.get(User, report.reporter_id)
        if reporter:
            extra["false_report_sanction"] = _apply_false_report_sanction(session, reporter, rule, score_delta=_report_score(rule, report.reason_code or "기타"))
    write_admin_log(session, current_user, "report_resolve", "report", str(report_id), payload.action_taken or "신고 처리", before_state=before, after_state=report.status)
    return {"ok": True, "id": report_id, "status": report.status, **extra}


@router.get("/admin-action-logs")
def list_admin_action_logs(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _require_admin(current_user)
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


@router.get("/legal/files")
def legal_document_files():
    base = Path(__file__).resolve().parents[2] / "docs" / "legal_templates"
    items = []
    for name in ["terms_checklist.md", "terms_of_service_final.md", "privacy_policy_final.md", "seller_terms_final.md", "youth_policy_final.md", "refund_policy_final.md"]:
        file_path = base / name
        items.append({"name": name, "exists": file_path.exists(), "path": str(file_path.relative_to(base.parents[1])) if file_path.exists() else str(file_path)})
    return {"items": items}


@router.get("/tax/month-close.csv")
def tax_month_close_csv(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _require_admin(current_user)
    orders = session.exec(select(Order)).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["order_no", "seller_id", "payment_pg", "supply_amount", "vat_amount", "total_amount", "settlement_status"])
    for o in orders:
        writer.writerow([o.order_no, o.seller_id, o.payment_pg, o.supply_amount, o.vat_amount, o.total_amount, o.settlement_status])
    return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": 'attachment; filename="adultapp_month_close.csv"'})


@router.get("/tax/month-close.pdf")
def tax_month_close_pdf(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _require_admin(current_user)
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



def _normalize_csv(value: str | list[str]) -> list[str]:
    if isinstance(value, list):
        return [str(x).strip() for x in value if str(x).strip()]
    return [x.strip() for x in str(value or "").split(",") if x.strip()]



def _user_public_meta(session: Session, user_id: int) -> dict[str, Any]:
    user = session.get(User, user_id)
    if not user:
        return {"user_id": user_id, "name": f"user:{user_id}", "gender": None, "age_band": None, "region_code": None}
    return {"user_id": user.id, "name": user.name, "gender": user.gender, "age_band": user.age_band, "region_code": user.region_code}



def _is_blocked_pair(session: Session, left_id: int, right_id: int) -> bool:
    stmt = select(UserBlock).where(
        UserBlock.is_active == True,  # noqa: E712
        ((UserBlock.blocker_id == left_id) & (UserBlock.blocked_id == right_id)) | ((UserBlock.blocker_id == right_id) & (UserBlock.blocked_id == left_id))
    )
    return session.exec(stmt).first() is not None



def _parse_adjacent_age_pairs(value: str) -> set[tuple[str, str]]:
    pairs: set[tuple[str, str]] = set()
    for token in (value or "").split(","):
        token = token.strip()
        if not token or ":" not in token:
            continue
        left, right = [part.strip() for part in token.split(":", 1)]
        if left and right:
            pairs.add((left, right))
    return pairs


def _is_adjacent_age_allowed(rule: RandomChatRule, wanted: str, actual: str | None) -> bool:
    if wanted == "성인 전체" or not actual:
        return True
    if wanted == actual:
        return True
    if rule.age_match_mode != "exact_then_adjacent":
        return False
    return (wanted, actual) in _parse_adjacent_age_pairs(rule.adjacent_age_pairs)


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    import math
    r = 6371.0
    p1 = math.radians(lat1)
    p2 = math.radians(lat2)
    d1 = math.radians(lat2 - lat1)
    d2 = math.radians(lon2 - lon1)
    a = math.sin(d1 / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(d2 / 2) ** 2
    return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _distance_bonus(rule: RandomChatRule, source_user: User, target_user: User) -> int:
    if not rule.geo_distance_enabled:
        return 0
    if None in (source_user.latitude, source_user.longitude, target_user.latitude, target_user.longitude):
        return 0
    distance = _haversine_km(float(source_user.latitude), float(source_user.longitude), float(target_user.latitude), float(target_user.longitude))
    if distance > rule.max_distance_km:
        return -9999
    if distance <= 20:
        return 300 - int(distance)
    if distance <= 100:
        return 220 - int(distance / 5)
    if distance <= 600:
        return 150 - int(distance / 20)
    return 0


def _candidate_score(rule: RandomChatRule, source_user: User, target_user: User, target: RandomMatchTicket) -> tuple[int, int, int, int]:
    gender_score = 0
    if source_user.gender and target_user.gender:
        if source_user.gender == target_user.gender:
            gender_score = 10
        else:
            gender_score = 5
    age_score = 0
    if source_user.age_band and target_user.age_band:
        if source_user.age_band == target_user.age_band:
            age_score = 20
        elif _is_adjacent_age_allowed(rule, source_user.age_band, target_user.age_band):
            age_score = 10
    region_score = 0
    if source_user.region_code and target_user.region_code and source_user.region_code == target_user.region_code:
        region_score = 15
    distance_score = _distance_bonus(rule, source_user, target_user)
    wait_score = int(target.created_at.timestamp()) * -1 if target.created_at else 0
    total = gender_score * 1000000 + wait_score
    total += age_score * 1000
    total += region_score * 100
    total += distance_score
    return (total, gender_score, age_score, region_score)


def _ticket_matches(rule: RandomChatRule, session: Session, source_user: User, source: RandomMatchTicket, target_user: User, target: RandomMatchTicket) -> bool:
    if (target.status or "") != "queued":
        return False
    if rule.same_category_only and source.category != target.category:
        return False
    if rule.exclude_blocked_users and _is_blocked_pair(session, source_user.id or 0, target_user.id or 0):
        return False
    if source.gender_option == "동성" and source_user.gender and target_user.gender and source_user.gender != target_user.gender:
        return False
    if source.gender_option == "남-여" and source_user.gender and target_user.gender and source_user.gender == target_user.gender:
        return False
    if target.gender_option == "동성" and source_user.gender and target_user.gender and source_user.gender != target_user.gender:
        return False
    if target.gender_option == "남-여" and source_user.gender and target_user.gender and source_user.gender == target_user.gender:
        return False
    if not _is_adjacent_age_allowed(rule, source.age_option, target_user.age_band):
        return False
    if not _is_adjacent_age_allowed(rule, target.age_option, source_user.age_band):
        return False
    if source.region_option == "같은 지역 우선" and source_user.region_code and target_user.region_code and source_user.region_code != target_user.region_code:
        return False
    if target.region_option == "같은 지역 우선" and source_user.region_code and target_user.region_code and source_user.region_code != target_user.region_code:
        return False
    return True



def _apply_random_chat_policy_baseline(rule: RandomChatRule) -> bool:
    changed = False
    baseline = {
        "age_match_mode": "exact_then_adjacent",
        "adjacent_age_pairs": "30대:40대,40대:30대",
        "region_unit": "시",
        "distance_score_mode": "band_bonus",
        "allow_unblock": True,
        "unblock_roles": "user,admin",
        "unblock_log_mode": "always_admin_log",
        "delete_display_mode": "masked_deleted_label_admin_archive",
        "admin_restore_only": True,
        "permanent_ban_keep_threads": True,
        "admin_message_access_scope": "admin_archive_all_threads",
        "report_reason_codes": "욕설,스팸,개인정보요구,음란물전송,불법권유,기타",
        "report_score_label": "점",
        "report_score_weights": "욕설:1,스팸:1,개인정보요구:2,음란물전송:3,불법권유:3,기타:1",
        "auto_suspend_policy": "5:3d,10:7d,20:30d,21:admin_review",
        "auto_suspend_threshold": 5,
        "retention_days": 1095,
        "permanent_ban_thread_access": "read_only_profile_limited_attachment_block_reconnect_block",
        "region_display_mode": "city_alias_standard",
        "websocket_scale_policy": "railway_only_until_single_instance_limit_then_redis",
        "duplicate_report_policy": "same_target_once",
        "report_auto_block_mode": "immediate_reporter_block",
        "false_report_policy": "3:warn,5:3d,8:7d,15:admin_review",
        "random_chat_only_sanction_enabled": True,
        "random_chat_only_sanction_policy": "3:24h,5:72h,8:7d,15:admin_review",
        "permanent_ban_rejoin_after_days": 365,
        "report_result_notice_mode": "silent",
        "blocked_thread_visibility": "hard_hidden",
        "unblock_rematch_mode": "immediate",
        "match_retry_limit": 4,
        "match_search_timeout_seconds": 300,
        "contact_exchange_detection_mode": "terms_only",
        "contact_exchange_warning_mode": "none",
        "media_message_mode": "text_only",
        "thread_view_audit_enabled": True,
        "self_message_delete_window_minutes": 30,
        "male_rematch_min_seconds": 20,
        "male_rematch_max_seconds": 40,
        "female_rematch_min_seconds": 5,
        "female_rematch_max_seconds": 10,
    }
    for key, value in baseline.items():
        if getattr(rule, key) != value:
            setattr(rule, key, value)
            changed = True
    return changed


def _get_or_create_random_rule(session: Session) -> RandomChatRule:
    item = session.exec(select(RandomChatRule).where(RandomChatRule.rule_name == "default")).first()
    if item:
        if _apply_random_chat_policy_baseline(item):
            item.updated_at = utcnow()
            session.add(item)
            session.commit()
            session.refresh(item)
        return item
    item = RandomChatRule(rule_name="default")
    _apply_random_chat_policy_baseline(item)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item




def _parse_score_weights(value: str) -> dict[str, int]:
    weights: dict[str, int] = {}
    for token in (value or '').split(','):
        token = token.strip()
        if not token or ':' not in token:
            continue
        name, score = token.split(':', 1)
        try:
            weights[name.strip()] = int(score.strip())
        except ValueError:
            continue
    return weights


def _report_score(rule: RandomChatRule, reason_code: str) -> int:
    weights = _parse_score_weights(rule.report_score_weights)
    return max(1, weights.get(reason_code, weights.get('기타', 1)))


def _city_alias(value: str | None) -> str | None:
    raw = (value or '').strip()
    if not raw:
        return None
    if raw.startswith('서울'):
        return '서울'
    if raw.startswith('인천'):
        return '인천'
    if raw.startswith('부산'):
        return '부산'
    if raw.startswith('대구'):
        return '대구'
    if raw.startswith('대전'):
        return '대전'
    if raw.startswith('광주'):
        return '광주'
    if raw.startswith('울산'):
        return '울산'
    if raw.startswith('세종'):
        return '세종'
    normalized = raw.replace('특별시', '').replace('광역시', '').replace('특별자치시', '').replace('특별자치도', '').replace('자치시', '').replace('자치도', '').strip()
    return normalized.split()[0] if normalized else raw


def _user_region_label(rule: RandomChatRule, user: User) -> str | None:
    if rule.region_display_mode != 'city_alias_standard':
        return user.region_code
    return _city_alias(user.region_code)


def _parse_suspend_policy(value: str) -> list[tuple[int, str]]:
    items: list[tuple[int, str]] = []
    for token in (value or '').split(','):
        token = token.strip()
        if not token or ':' not in token:
            continue
        threshold, action = token.split(':', 1)
        try:
            items.append((int(threshold.strip()), action.strip()))
        except ValueError:
            continue
    return sorted(items, key=lambda item: item[0])


def _apply_random_chat_suspension(session: Session, user: User, rule: RandomChatRule, report_count: int) -> dict[str, Any]:
    outcome = {"applied": False, "action": None, "locked_until": None, "member_status": user.member_status}
    for threshold, action in _parse_suspend_policy(rule.auto_suspend_policy):
        if report_count < threshold:
            continue
        if action == 'admin_review':
            user.member_status = 'review_required'
            outcome = {"applied": True, "action": action, "locked_until": None, "member_status": user.member_status}
            continue
        days = 0
        if action.endswith('d'):
            try:
                days = int(action[:-1])
            except ValueError:
                days = 0
        if days > 0:
            now = utcnow()
            base_until = user.locked_until if user.locked_until and user.locked_until > now else now
            user.locked_until = base_until + timedelta(days=days)
            user.member_status = 'temporarily_suspended'
            outcome = {"applied": True, "action": action, "locked_until": user.locked_until.isoformat(), "member_status": user.member_status}
    session.add(user)
    session.commit()
    return outcome

def _apply_false_report_sanction(session: Session, user: User, rule: RandomChatRule, score_delta: int = 1) -> dict[str, Any]:
    user.false_report_count = (user.false_report_count or 0) + 1
    user.false_report_score = (user.false_report_score or 0) + max(1, score_delta)
    outcome = {"applied": False, "action": None, "locked_until": None, "member_status": user.member_status, "false_report_count": user.false_report_count, "false_report_score": user.false_report_score}
    for threshold, action in _parse_suspend_policy(rule.false_report_policy):
        if (user.false_report_score or 0) < threshold:
            continue
        if action == 'warn':
            outcome = {**outcome, "applied": True, "action": action}
            continue
        if action == 'admin_review':
            user.member_status = 'review_required'
            outcome = {**outcome, "applied": True, "action": action, "member_status": user.member_status}
            continue
        days = 0
        if action.endswith('d'):
            try:
                days = int(action[:-1])
            except ValueError:
                days = 0
        if days > 0:
            now = utcnow()
            base_until = user.locked_until if user.locked_until and user.locked_until > now else now
            user.locked_until = base_until + timedelta(days=days)
            user.member_status = 'temporarily_suspended'
            outcome = {**outcome, "applied": True, "action": action, "locked_until": user.locked_until.isoformat(), "member_status": user.member_status}
    session.add(user)
    session.commit()
    return outcome


def _serialize_random_rule(rule: RandomChatRule) -> dict[str, Any]:
    return {
        "id": rule.id,
        "rule_name": rule.rule_name,
        "same_category_only": rule.same_category_only,
        "gender_standard": _normalize_csv(rule.gender_standard),
        "gender_options": _normalize_csv(rule.gender_options),
        "age_options": _normalize_csv(rule.age_options),
        "age_match_mode": rule.age_match_mode,
        "adjacent_age_pairs": rule.adjacent_age_pairs,
        "region_unit": rule.region_unit,
        "region_options": _normalize_csv(rule.region_options),
        "geo_distance_enabled": rule.geo_distance_enabled,
        "max_distance_km": rule.max_distance_km,
        "distance_slider_steps": rule.distance_slider_steps,
        "distance_score_mode": rule.distance_score_mode,
        "anonymous_mode": rule.anonymous_mode,
        "min_wait_seconds": rule.min_wait_seconds,
        "max_wait_seconds": rule.max_wait_seconds,
        "auto_rematch": rule.auto_rematch,
        "exclude_blocked_users": rule.exclude_blocked_users,
        "priority_order": _normalize_csv(rule.priority_order),
        "room_open_mode": rule.room_open_mode,
        "chat_end_rule": rule.chat_end_rule,
        "retention_days": rule.retention_days,
        "thread_keep_hours_after_block": rule.thread_keep_hours_after_block,
        "allow_unblock": rule.allow_unblock,
        "unblock_roles": _normalize_csv(rule.unblock_roles),
        "unblock_log_mode": rule.unblock_log_mode,
        "personal_room_conversion": rule.personal_room_conversion,
        "message_storage_mode": rule.message_storage_mode,
        "message_edit_delete_mask_support": rule.message_edit_delete_mask_support,
        "delete_display_mode": rule.delete_display_mode,
        "admin_restore_only": rule.admin_restore_only,
        "admin_log_enabled": rule.admin_log_enabled,
        "admin_message_access_scope": rule.admin_message_access_scope,
        "report_reason_codes": _normalize_csv(rule.report_reason_codes),
        "report_score_label": rule.report_score_label,
        "report_score_weights": _parse_score_weights(rule.report_score_weights),
        "auto_suspend_policy": rule.auto_suspend_policy,
        "auto_suspend_threshold": rule.auto_suspend_threshold,
        "admin_review_sla_hours": rule.admin_review_sla_hours,
        "report_manage_layout": rule.report_manage_layout,
        "permanent_ban_mode": rule.permanent_ban_mode,
        "permanent_ban_keep_threads": rule.permanent_ban_keep_threads,
        "permanent_ban_thread_access": rule.permanent_ban_thread_access,
        "region_display_mode": rule.region_display_mode,
        "websocket_scale_policy": rule.websocket_scale_policy,
        "duplicate_report_policy": rule.duplicate_report_policy,
        "report_auto_block_mode": rule.report_auto_block_mode,
        "false_report_policy": rule.false_report_policy,
        "random_chat_only_sanction_enabled": rule.random_chat_only_sanction_enabled,
        "random_chat_only_sanction_policy": rule.random_chat_only_sanction_policy,
        "permanent_ban_rejoin_after_days": rule.permanent_ban_rejoin_after_days,
        "report_result_notice_mode": rule.report_result_notice_mode,
        "blocked_thread_visibility": rule.blocked_thread_visibility,
        "unblock_rematch_mode": rule.unblock_rematch_mode,
        "match_retry_limit": rule.match_retry_limit,
        "match_search_timeout_seconds": rule.match_search_timeout_seconds,
        "contact_exchange_detection_mode": rule.contact_exchange_detection_mode,
        "contact_exchange_warning_mode": rule.contact_exchange_warning_mode,
        "media_message_mode": rule.media_message_mode,
        "thread_view_audit_enabled": rule.thread_view_audit_enabled,
        "self_message_delete_window_minutes": rule.self_message_delete_window_minutes,
        "message_delete_scope": rule.message_delete_scope,
        "male_rematch_min_seconds": rule.male_rematch_min_seconds,
        "male_rematch_max_seconds": rule.male_rematch_max_seconds,
        "female_rematch_min_seconds": rule.female_rematch_min_seconds,
        "female_rematch_max_seconds": rule.female_rematch_max_seconds,
    }


@router.get("/social/stories")
def list_stories(session: Session = Depends(get_session)):
    rows = []
    for item in session.exec(select(StoryItem).order_by(StoryItem.created_at.desc())).all():
        rows.append({**item.model_dump(), "author": _user_public_meta(session, item.author_id), "created_at": item.created_at.isoformat() if item.created_at else "", "expires_at": item.expires_at.isoformat() if item.expires_at else None})
    return rows


@router.post("/social/stories")
def create_story(payload: StoryCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    item = StoryItem(author_id=current_user.id or 0, title=payload.title, image_url=payload.image_url, visibility=payload.visibility, created_at=utcnow(), expires_at=utcnow() + timedelta(hours=24))
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.get("/social/feed")
def list_feed(session: Session = Depends(get_session)):
    rows = []
    for item in session.exec(select(FeedPost).order_by(FeedPost.created_at.desc())).all():
        rows.append({**item.model_dump(), "author": _user_public_meta(session, item.author_id), "created_at": item.created_at.isoformat() if item.created_at else "", "updated_at": item.updated_at.isoformat() if item.updated_at else ""})
    return rows


@router.post("/social/feed")
def create_feed_post(payload: FeedPostCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    validate_exchange_text(payload.title)
    validate_exchange_text(payload.body)
    item = FeedPost(author_id=current_user.id or 0, category=payload.category, title=payload.title, body=payload.body, image_url=payload.image_url, allow_questions=payload.allow_questions, visibility=payload.visibility, created_at=utcnow(), updated_at=utcnow())
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.get("/social/questions")
def list_questions(target_user_id: int | None = None, session: Session = Depends(get_session)):
    stmt = select(ProfileQuestion).order_by(ProfileQuestion.created_at.desc())
    if target_user_id:
        stmt = stmt.where(ProfileQuestion.target_user_id == target_user_id)
    rows = []
    for item in session.exec(stmt).all():
        rows.append({**item.model_dump(), "questioner": _user_public_meta(session, item.questioner_id), "target_user": _user_public_meta(session, item.target_user_id), "created_at": item.created_at.isoformat() if item.created_at else "", "updated_at": item.updated_at.isoformat() if item.updated_at else ""})
    return rows


@router.post("/social/questions")
def create_question(payload: ProfileQuestionCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    validate_exchange_text(payload.question_text)
    item = ProfileQuestion(questioner_id=current_user.id or 0, target_user_id=payload.target_user_id, feed_post_id=payload.feed_post_id, question_text=payload.question_text, is_anonymous=payload.is_anonymous, status="asked", created_at=utcnow(), updated_at=utcnow())
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.post("/social/questions/{question_id}/answer")
def answer_question(question_id: int, payload: ProfileQuestionAnswerRequest, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(ProfileQuestion, question_id)
    if not item:
        raise HTTPException(status_code=404, detail="question not found")
    if item.target_user_id != (current_user.id or 0):
        raise HTTPException(status_code=403, detail="only target user can answer")
    validate_exchange_text(payload.answer_text)
    item.answer_text = payload.answer_text
    item.status = "answered"
    item.updated_at = utcnow()
    session.add(item)
    session.commit()
    return {"ok": True, "id": item.id, "status": item.status}


@router.post("/social/blocks")
def create_block(payload: UserBlockCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if payload.blocked_id == (current_user.id or 0):
        raise HTTPException(status_code=400, detail="cannot block self")
    row = session.exec(select(UserBlock).where(UserBlock.blocker_id == (current_user.id or 0), UserBlock.blocked_id == payload.blocked_id)).first()
    if row:
        row.is_active = True
        row.reason_code = payload.reason_code
    else:
        row = UserBlock(blocker_id=current_user.id or 0, blocked_id=payload.blocked_id, reason_code=payload.reason_code, is_active=True, created_at=utcnow())
    session.add(row)
    session.commit()
    return {"ok": True, "blocked_id": payload.blocked_id}




@router.post("/social/blocks/{blocked_id}/unblock")
def unblock_user(blocked_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    rule = _get_or_create_random_rule(session)
    row = session.exec(select(UserBlock).where(UserBlock.blocker_id == (current_user.id or 0), UserBlock.blocked_id == blocked_id)).first()
    if row:
        before = "active" if row.is_active else "inactive"
        row.is_active = False
        session.add(row)
        session.commit()
        if rule.unblock_log_mode == "always_admin_log":
            write_admin_log(session, current_user, "user_unblock", "user_block", str(row.id or 0), f"blocked_id={blocked_id}", before_state=before, after_state="inactive")
    return {"ok": True, "blocked_id": blocked_id, "is_active": False}


@router.get("/chat/random/rules")
def get_random_rules(session: Session = Depends(get_session)):
    rule = _get_or_create_random_rule(session)
    return {
        **_serialize_random_rule(rule),
        "service_mode": "anonymous_info_exchange",
        "feature_scope": "adult_shop_info_community_addon",
        "media_upload_allowed": False,
        "allowed_topics": [
            "제품 사용 안전수칙",
            "소재/보관/세척/사용 가이드",
            "익명포장/환불/배송 경험",
            "제품 비교",
            "브랜드 후기",
            "운영공지 및 FAQ",
        ],
        "prohibited_topics": [
            "외부 연락처 유도",
            "오프라인 만남",
            "신체 노출 요청",
            "사진/영상 교환",
            "역할극/행위 제안",
            "위치/숙소/주소 제안",
        ],
        "entry_requirements": [
            "identity_verified",
            "adult_verified",
            "gender",
            "age_band",
            "region_code",
            "member_status=active",
        ],
        "safety_controls": [
            "report",
            "block",
            "rematch_cooldown",
            "admin_action_log",
            "dispute_log_retention",
        ],
    }


@router.put("/chat/random/rules")
def update_random_rules(payload: RandomRuleUpdateRequest, current_user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    _ensure_random_chat_enabled()
    rule = _get_or_create_random_rule(session)
    rule.same_category_only = payload.same_category_only
    rule.gender_standard = ",".join(payload.gender_standard)
    rule.gender_options = ",".join(payload.gender_options)
    rule.age_options = ",".join(payload.age_options)
    rule.age_match_mode = payload.age_match_mode
    rule.adjacent_age_pairs = payload.adjacent_age_pairs
    rule.region_unit = payload.region_unit
    rule.region_options = ",".join(payload.region_options)
    rule.geo_distance_enabled = payload.geo_distance_enabled
    rule.max_distance_km = payload.max_distance_km
    rule.distance_slider_steps = payload.distance_slider_steps
    rule.distance_score_mode = payload.distance_score_mode
    rule.anonymous_mode = payload.anonymous_mode
    rule.min_wait_seconds = payload.min_wait_seconds
    rule.max_wait_seconds = payload.max_wait_seconds
    rule.auto_rematch = payload.auto_rematch
    rule.exclude_blocked_users = payload.exclude_blocked_users
    rule.priority_order = ",".join(payload.priority_order)
    rule.room_open_mode = payload.room_open_mode
    rule.chat_end_rule = payload.chat_end_rule
    rule.retention_days = payload.retention_days
    rule.thread_keep_hours_after_block = payload.thread_keep_hours_after_block
    rule.allow_unblock = payload.allow_unblock
    rule.unblock_roles = ",".join(payload.unblock_roles)
    rule.unblock_log_mode = payload.unblock_log_mode
    rule.personal_room_conversion = payload.personal_room_conversion
    rule.message_storage_mode = payload.message_storage_mode
    rule.message_edit_delete_mask_support = payload.message_edit_delete_mask_support
    rule.delete_display_mode = payload.delete_display_mode
    rule.admin_restore_only = payload.admin_restore_only
    rule.admin_log_enabled = payload.admin_log_enabled
    rule.admin_message_access_scope = payload.admin_message_access_scope
    rule.report_reason_codes = ",".join(payload.report_reason_codes)
    rule.report_score_label = payload.report_score_label
    rule.report_score_weights = payload.report_score_weights
    rule.auto_suspend_policy = payload.auto_suspend_policy
    rule.auto_suspend_threshold = payload.auto_suspend_threshold
    rule.admin_review_sla_hours = payload.admin_review_sla_hours
    rule.report_manage_layout = payload.report_manage_layout
    rule.permanent_ban_mode = payload.permanent_ban_mode
    rule.permanent_ban_keep_threads = payload.permanent_ban_keep_threads
    rule.permanent_ban_thread_access = payload.permanent_ban_thread_access
    rule.region_display_mode = payload.region_display_mode
    rule.websocket_scale_policy = payload.websocket_scale_policy
    rule.duplicate_report_policy = payload.duplicate_report_policy
    rule.report_auto_block_mode = payload.report_auto_block_mode
    rule.false_report_policy = payload.false_report_policy
    rule.random_chat_only_sanction_enabled = payload.random_chat_only_sanction_enabled
    rule.random_chat_only_sanction_policy = payload.random_chat_only_sanction_policy
    rule.permanent_ban_rejoin_after_days = payload.permanent_ban_rejoin_after_days
    rule.report_result_notice_mode = payload.report_result_notice_mode
    rule.blocked_thread_visibility = payload.blocked_thread_visibility
    rule.unblock_rematch_mode = payload.unblock_rematch_mode
    rule.match_retry_limit = payload.match_retry_limit
    rule.match_search_timeout_seconds = payload.match_search_timeout_seconds
    rule.contact_exchange_detection_mode = payload.contact_exchange_detection_mode
    rule.contact_exchange_warning_mode = payload.contact_exchange_warning_mode
    rule.media_message_mode = payload.media_message_mode
    rule.thread_view_audit_enabled = payload.thread_view_audit_enabled
    rule.self_message_delete_window_minutes = payload.self_message_delete_window_minutes
    rule.message_delete_scope = payload.message_delete_scope
    rule.male_rematch_min_seconds = payload.male_rematch_min_seconds
    rule.male_rematch_max_seconds = payload.male_rematch_max_seconds
    rule.female_rematch_min_seconds = payload.female_rematch_min_seconds
    rule.female_rematch_max_seconds = payload.female_rematch_max_seconds
    rule.updated_at = utcnow()
    session.add(rule)
    session.commit()
    write_admin_log(session, current_user, "random_rule_update", "random_chat_rule", str(rule.id or 0), "채팅-랜덤 규칙 수정")
    return _serialize_random_rule(rule)


@router.post("/chat/random/tickets")
def create_random_ticket(payload: RandomTicketCreate, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _ensure_random_chat_enabled()
    rule = _get_or_create_random_rule(session)
    eligibility = _assert_random_chat_entry_allowed(current_user, session)
    now = utcnow()
    if current_user.random_chat_cooldown_until and current_user.random_chat_cooldown_until > now:
        raise HTTPException(status_code=429, detail=f"random rematch cooldown until {current_user.random_chat_cooldown_until.isoformat()}")
    existing = session.exec(select(RandomMatchTicket).where(RandomMatchTicket.user_id == (current_user.id or 0), RandomMatchTicket.status == "queued")).first()
    if existing:
        existing.status = "cancelled"
        existing.updated_at = utcnow()
        session.add(existing)
        session.commit()
    ticket = RandomMatchTicket(user_id=current_user.id or 0, category=payload.category, gender_option=payload.gender_option, age_option=payload.age_option, region_option=payload.region_option, region_value=payload.region_value or current_user.region_code, is_anonymous=True, status="queued", created_at=utcnow(), updated_at=utcnow(), expires_at=utcnow() + timedelta(seconds=rule.max_wait_seconds))
    session.add(ticket)
    session.commit()
    session.refresh(ticket)
    queued = session.exec(select(RandomMatchTicket).where(RandomMatchTicket.status == "queued", RandomMatchTicket.category == ticket.category, RandomMatchTicket.user_id != (current_user.id or 0)).order_by(RandomMatchTicket.created_at)).all()
    best_candidate = None
    best_user = None
    best_score = None
    for candidate in queued:
        candidate_user = session.get(User, candidate.user_id)
        if not candidate_user:
            continue
        if not _ticket_matches(rule, session, current_user, ticket, candidate_user, candidate):
            continue
        score = _candidate_score(rule, current_user, candidate_user, candidate)
        if best_score is None or score[0] > best_score[0]:
            best_candidate = candidate
            best_user = candidate_user
            best_score = score
    if best_candidate and best_user:
        thread = DirectMessageThread(subject=f"랜덤채팅:{ticket.category}", purpose_code="SUPPORT", thread_type="random_1to1", created_by=current_user.id or 0, participant_a_id=current_user.id or 0, participant_b_id=best_candidate.user_id, status="open", created_at=utcnow(), updated_at=utcnow())
        session.add(thread)
        session.commit()
        session.refresh(thread)
        ticket.status = "matched"
        best_candidate.status = "matched"
        ticket.matched_thread_id = thread.id
        best_candidate.matched_thread_id = thread.id
        ticket.updated_at = utcnow()
        best_candidate.updated_at = utcnow()
        session.add(ticket)
        session.add(best_candidate)
        session.commit()
        write_admin_log(session, current_user, "random_chat_match", "random_ticket", str(ticket.id or 0), "익명 정보교류 랜덤채팅 매칭", after_state=f"thread:{thread.id}", ip=request.client.host if request.client else "127.0.0.1", device=request.headers.get("user-agent"))
        return {"ticket_id": ticket.id, "status": "matched", "thread_id": thread.id, "matched_user": _user_public_meta(session, best_candidate.user_id), "match_score": {"total": best_score[0], "gender": best_score[1], "age": best_score[2], "region": best_score[3]}, "rule": _serialize_random_rule(rule), "eligibility": eligibility}
    user_min_wait, user_max_wait = _random_rematch_window_seconds(rule, current_user)
    write_admin_log(session, current_user, "random_chat_queue", "random_ticket", str(ticket.id or 0), "익명 정보교류 랜덤채팅 대기열 진입", ip=request.client.host if request.client else "127.0.0.1", device=request.headers.get("user-agent"))
    return {"ticket_id": ticket.id, "status": "queued", "rule": _serialize_random_rule(rule), "match_window": {"min_wait_seconds": user_min_wait, "max_wait_seconds": user_max_wait, "auto_rematch": rule.auto_rematch}, "cooldown_until": current_user.random_chat_cooldown_until.isoformat() if current_user.random_chat_cooldown_until else None, "eligibility": eligibility}


@router.get("/chat/random/tickets/{ticket_id}")
def get_random_ticket(ticket_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _ensure_random_chat_enabled()
    item = session.get(RandomMatchTicket, ticket_id)
    if not item or item.user_id != (current_user.id or 0):
        raise HTTPException(status_code=404, detail="ticket not found")
    now = utcnow()
    if item.status == "queued" and item.expires_at and item.expires_at < now:
        item.status = "expired"
        item.updated_at = now
        session.add(item)
        session.commit()
    return {**item.model_dump(), "created_at": item.created_at.isoformat() if item.created_at else "", "updated_at": item.updated_at.isoformat() if item.updated_at else "", "expires_at": item.expires_at.isoformat() if item.expires_at else None}


@router.post("/chat/random/tickets/{ticket_id}/cancel")
def cancel_random_ticket(ticket_id: int, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _ensure_random_chat_enabled()
    item = session.get(RandomMatchTicket, ticket_id)
    if not item or item.user_id != (current_user.id or 0):
        raise HTTPException(status_code=404, detail="ticket not found")
    item.status = "cancelled"
    item.updated_at = utcnow()
    session.add(item)
    session.commit()
    write_admin_log(session, current_user, "random_chat_cancel", "random_ticket", str(ticket_id), "익명 정보교류 랜덤채팅 취소", after_state=item.status, ip=request.client.host if request.client else "127.0.0.1", device=request.headers.get("user-agent"))
    return {"ok": True, "status": item.status}


@router.post("/chat/random/report")
def report_random_chat(payload: RandomReportCreate, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _ensure_random_chat_enabled()
    rule = _get_or_create_random_rule(session)
    thread = session.get(DirectMessageThread, payload.thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="thread not found")
    if thread.thread_type != "random_1to1":
        raise HTTPException(status_code=400, detail="random report only allowed for random_1to1 thread")
    _ensure_thread_member(thread, current_user.id or 0)
    target_user_id = _message_counterparty(thread, current_user.id or 0)
    existing_user_report = session.exec(select(ModerationReport).where(ModerationReport.reporter_id == (current_user.id or 0), ModerationReport.target_type == "random_chat_user", ModerationReport.target_id == target_user_id)).first()
    block = session.exec(select(UserBlock).where(UserBlock.blocker_id == (current_user.id or 0), UserBlock.blocked_id == target_user_id)).first()
    if not block:
        block = UserBlock(blocker_id=current_user.id or 0, blocked_id=target_user_id, reason_code="auto_report_block", is_active=True, created_at=utcnow())
    else:
        block.is_active = True
        block.reason_code = block.reason_code or "auto_report_block"
    session.add(block)
    session.commit()
    if existing_user_report and rule.duplicate_report_policy == "same_target_once":
        all_user_reports = session.exec(select(ModerationReport).where(ModerationReport.target_type == "random_chat_user", ModerationReport.target_id == target_user_id)).all()
        total_reports = len(all_user_reports)
        total_score = sum(_report_score(rule, item.reason_code or "") for item in all_user_reports)
        return {"ok": True, "already_reported": True, "report_id": None, "user_report_id": existing_user_report.id, "auto_blocked": True, "threshold": rule.auto_suspend_threshold, "threshold_label": rule.report_score_label, "target_user_report_count": total_reports, "target_user_report_score": total_score, "score_delta": 0, "suspension": {"applied": False, "action": None, "locked_until": None, "member_status": None}}
    report = ModerationReport(reporter_id=current_user.id or 0, target_type="random_chat_thread", target_id=payload.thread_id, reason_code=payload.reason_code, priority="high", status="queued")
    session.add(report)
    session.commit()
    user_report = ModerationReport(reporter_id=current_user.id or 0, target_type="random_chat_user", target_id=target_user_id, reason_code=payload.reason_code, priority="high", status="queued")
    session.add(user_report)
    session.commit()
    all_user_reports = session.exec(select(ModerationReport).where(ModerationReport.target_type == "random_chat_user", ModerationReport.target_id == target_user_id)).all()
    total_reports = len(all_user_reports)
    total_score = sum(_report_score(rule, item.reason_code or "") for item in all_user_reports)
    auto_blocked = rule.report_auto_block_mode == "immediate_reporter_block" or total_score >= rule.auto_suspend_threshold
    target_user = session.get(User, target_user_id)
    suspension = {"applied": False, "action": None, "locked_until": None, "member_status": None}
    if thread.thread_type == "random_1to1":
        thread.status = "blocked_hidden"
        thread.updated_at = utcnow()
        session.add(thread)
        session.commit()
    cooldown = _apply_random_rematch_cooldown(session, current_user, rule)
    if target_user:
        suspension = _apply_random_chat_suspension(session, target_user, rule, total_score)
    write_admin_log(session, current_user, "random_chat_report", "random_thread", str(payload.thread_id), f"랜덤채팅 신고:{payload.reason_code}", after_state=f"target_user:{target_user_id}", ip=request.client.host if request.client else "127.0.0.1", device=request.headers.get("user-agent"))
    return {"ok": True, "already_reported": False, "report_id": report.id, "user_report_id": user_report.id, "auto_blocked": auto_blocked, "threshold": rule.auto_suspend_threshold, "threshold_label": rule.report_score_label, "target_user_report_count": total_reports, "target_user_report_score": total_score, "score_delta": _report_score(rule, payload.reason_code), "suspension": suspension, "rematch_cooldown": cooldown}


@router.post("/chat/random/threads/{thread_id}/end")
def end_random_thread(thread_id: int, payload: RandomThreadEndRequest, request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    _ensure_random_chat_enabled()
    thread = session.get(DirectMessageThread, thread_id)
    if not thread or thread.thread_type != "random_1to1":
        raise HTTPException(status_code=404, detail="random thread not found")
    _ensure_thread_member(thread, current_user.id or 0)
    rule = _get_or_create_random_rule(session)
    thread.status = "closed"
    thread.updated_at = utcnow()
    session.add(thread)
    session.commit()
    write_admin_log(session, current_user, "random_chat_end", "random_thread", str(thread_id), payload.reason_code or "랜덤채팅 종료", after_state=thread.status, ip=request.client.host if request.client else "127.0.0.1", device=request.headers.get("user-agent"))
    cooldown = _apply_random_rematch_cooldown(session, current_user, rule)
    return {"ok": True, "thread_id": thread_id, "status": thread.status, "reason_code": payload.reason_code, "rematch_cooldown": cooldown}




@router.get("/admin/chat-random/db-manage")
def admin_random_db_manage(current_user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    _ensure_random_chat_enabled()
    rule = _get_or_create_random_rule(session)
    random_reports = session.exec(select(ModerationReport).where(ModerationReport.target_type == "random_chat_user").order_by(ModerationReport.created_at.desc())).all()
    random_threads = session.exec(select(DirectMessageThread).where(DirectMessageThread.thread_type == "random_1to1").order_by(DirectMessageThread.updated_at.desc())).all()
    admin_logs = session.exec(
        select(AdminActionLog).where(
            or_(
                AdminActionLog.target_type.in_(["random_chat_rule", "report", "direct_message_thread", "user_block"]),
                AdminActionLog.action_type.in_(["random_rule_update", "report_resolve", "user_unblock", "thread_view_audit"]),
            )
        ).order_by(AdminActionLog.created_at.desc())
    ).all()

    report_status_counts: dict[str, int] = {}
    report_reason_counts: dict[str, int] = {}
    for report in random_reports:
        report_status_counts[report.status] = report_status_counts.get(report.status, 0) + 1
        report_reason_counts[report.reason_code] = report_reason_counts.get(report.reason_code, 0) + 1

    thread_status_counts: dict[str, int] = {}
    for thread in random_threads:
        thread_status_counts[thread.status] = thread_status_counts.get(thread.status, 0) + 1

    recent_reports = []
    for item in random_reports[:10]:
        recent_reports.append({
            "id": item.id,
            "reporter_id": item.reporter_id,
            "target_id": item.target_id,
            "reason_code": item.reason_code,
            "status": item.status,
            "priority": item.priority,
            "created_at": item.created_at.isoformat() if item.created_at else "",
        })

    recent_threads = []
    for item in random_threads[:10]:
        recent_threads.append({
            "id": item.id,
            "subject": item.subject,
            "status": item.status,
            "participant_a_id": item.participant_a_id,
            "participant_b_id": item.participant_b_id,
            "created_at": item.created_at.isoformat() if item.created_at else "",
            "updated_at": item.updated_at.isoformat() if item.updated_at else "",
        })

    recent_logs = []
    for item in admin_logs[:12]:
        recent_logs.append({
            "id": item.id,
            "action_type": item.action_type,
            "target_type": item.target_type,
            "target_id": item.target_id,
            "reason": item.reason,
            "admin_id": item.admin_id,
            "created_at": item.created_at.isoformat() if item.created_at else "",
        })

    return {
        "rule": _serialize_random_rule(rule),
        "report": {
            "total": len(random_reports),
            "status_counts": report_status_counts,
            "reason_counts": report_reason_counts,
            "recent": recent_reports,
        },
        "chat": {
            "total_threads": len(random_threads),
            "status_counts": thread_status_counts,
            "hidden_policy": rule.blocked_thread_visibility,
            "delete_scope": rule.message_delete_scope,
            "match_retry_limit": rule.match_retry_limit,
            "match_search_timeout_seconds": rule.match_search_timeout_seconds,
            "recent": recent_threads,
        },
        "other": {
            "audit_enabled": rule.thread_view_audit_enabled,
            "admin_access_scope": rule.admin_message_access_scope,
            "random_chat_only_sanction_enabled": rule.random_chat_only_sanction_enabled,
            "random_chat_only_sanction_policy": rule.random_chat_only_sanction_policy,
            "permanent_ban_rejoin_after_days": rule.permanent_ban_rejoin_after_days,
            "recent_logs": recent_logs,
        },
    }

@router.get("/admin/chat-random/report-manage")
def admin_random_report_manage(filter_value: str | None = None, current_user: User = Depends(require_grade(MemberGrade.ADMIN)), session: Session = Depends(get_session)):
    _ensure_random_chat_enabled()
    rule = _get_or_create_random_rule(session)
    stmt = select(ModerationReport).where(ModerationReport.target_type == "random_chat_user")
    reports = session.exec(stmt).all()
    grouped: dict[int, dict[str, Any]] = {}
    for report in reports:
        if filter_value and filter_value not in (report.reason_code or "") and filter_value not in str(report.target_id):
            continue
        bucket = grouped.setdefault(report.target_id, {
            "user_id": report.target_id,
            "report_count": 0,
            "report_score": 0,
            "report_history": [],
            "last_reported_at": None,
        })
        bucket["report_count"] += 1
        bucket["report_score"] += _report_score(rule, report.reason_code or "")
        created_at = report.created_at.isoformat() if report.created_at else ""
        bucket["report_history"].append({
            "report_id": report.id,
            "reason_code": report.reason_code,
            "score": _report_score(rule, report.reason_code or ""),
            "status": report.status,
            "priority": report.priority,
            "created_at": created_at,
        })
        if created_at and (bucket["last_reported_at"] is None or created_at > bucket["last_reported_at"]):
            bucket["last_reported_at"] = created_at
    items = sorted(grouped.values(), key=lambda row: (-row["report_count"], row["last_reported_at"] or ""), reverse=False)
    return {
        "filter": filter_value or "",
        "sla_hours": rule.admin_review_sla_hours,
        "columns": ["누적신고점수", "누적신고수", "고유ID", "신고내역", "최근신고받은일자"],
        "items": items,
    }


@router.get("/seller/required-fields")
def seller_required_fields() -> dict[str, Any]:
    return {
        "required_fields": [
            "company_name",
            "representative_name",
            "business_number",
            "ecommerce_number",
            "business_address",
            "return_address",
            "cs_contact",
            "youth_protection_officer",
            "settlement_bank",
            "settlement_account_number",
            "settlement_account_holder",
            "business_document_url",
            "handled_categories",
        ],
        "validation_rules": {
            "business_number": "숫자만 입력, 사업자등록번호 형식 검증 필요",
            "ecommerce_number": "통신판매업 신고번호 형식 입력",
            "cs_contact": "운영 연락 가능한 번호 또는 이메일 필수",
            "handled_categories": "최소 1개 이상 입력 또는 선택",
            "business_document_url": "사업자증빙 파일 경로 또는 업로드 URL 필수",
        },
        "marketplace_direction": "통신판매중개",
        "blocking_rules": ["seller_onboarding_status=pending", "필수 입력 누락 시 상품 등록 불가", "필수 입력 누락 시 상품 공개 불가", "필수 입력 누락 시 주문 수락 불가", "테스트 관리자 계정만 admin override 허용"],
        "note": "판매자별 사업자/통신판매/CS/정산 정보 입력이 완료되어야 PG 신청 접수 기준을 충족합니다.",
    }


@router.get("/pg/submission-package")
def pg_submission_package() -> dict[str, Any]:
    return {
        "direction": "통신판매중개",
        "ready_for": ["사전 상담", "사전심사 접수", "테스트 채널 연동 시작"],
        "package_items": [
            "플랫폼 사업자 정보",
            "서비스 소개서",
            "거래 구조 설명서",
            "상품 카테고리 설명",
            "금지상품/SKU 정책",
            "환불/취소/정산 기준",
            "판매자 입점 시 수집하는 필수 정보",
            "청소년 차단/성인인증 방식",
            "고객센터 정보",
            "약관/개인정보처리방침/청소년보호정책",
        ],
        "pending_items": [
            "webhook 서명 검증",
            "운영 MID/merchant 실제값 입력",
            "취소/환불 상태머신 완성",
            "판매자 필수 입력값 서버 검증",
            "금지상품/SKU 정책 확정",
            "정산 기준 문서 확정",
            "운영용 사업자/판매자 고지 화면 정리",
        ],
        "env_required": [
            "PG_PORTONE_STORE_ID", "PG_PORTONE_CHANNEL_KEY", "PORTONE_API_SECRET",
            "PORTONE_WEBHOOK_SECRET_TEST", "PORTONE_WEBHOOK_SECRET_LIVE",
            "PG_PRIMARY_MERCHANT_ID", "PG_PRIMARY_API_KEY", "PG_PRIMARY_WEBHOOK_SECRET",
            "PG_PORTONE_STORE_ID_TEST", "PG_PORTONE_STORE_ID_LIVE", "PG_PORTONE_CHANNEL_KEY_TEST", "PG_PORTONE_CHANNEL_KEY_LIVE",
            "PG_PRIMARY_MERCHANT_ID_TEST", "PG_PRIMARY_MERCHANT_ID_LIVE"
        ],
        "recommended_test_defaults": {
            "portone_sdk": "enabled",
            "env_split": "full",
            "sku_policy": "conservative",
            "premium_sla": "target_only",
            "seller_onboarding_gate": "strict_with_admin_override"
        },
    }


@router.get("/payments/integration-checklist")
def payments_integration_checklist() -> dict[str, Any]:
    return {
        "official_order": [
            "포트원 콘솔 가입 및 비즈니스 인증",
            "전자결제 신청",
            "테스트 채널 추가",
            "Store ID / V2 API Secret 발급",
            "테스트 결제/취소/환불/webhook 검증",
            "판매자 필수 입력값 서버 검증 추가",
            "금지상품/SKU 표 확정",
            "환불/정산/프리미엄 배송 기준 문서 확정",
            "운영 MID 발급 후 실연동 채널 등록",
            "운영 최종 점검 후 심사 제출",
        ],
        "must_verify": [
            "결제 성공 후 서버 재조회",
            "webhook 서명/출처 검증",
            "주문 상태머신",
            "취소/부분취소",
            "환불 실패 재시도",
            "timeout/중복 처리",
            "정산 기준과 주문 상태 연결",
            "미인증 사용자의 구매 진입 차단",
        ],
        "order_statuses": ["payment_requested","paid","cancel_requested","cancel_pending","cancelled","partial_cancelled","refund_requested","refund_processing","refunded","refund_failed"],
        "recommended_test_stage_choices": [
            "PortOne 표준 SDK 즉시 적용",
            "test/live Store ID, channel key, merchant, webhook URL 완전 분리",
            "허용 SKU만 실제 상품으로 노출",
            "프리미엄 배송은 목표형 문구만 사용",
            "판매자 필수 입력 누락 시 상품등록/공개/주문수락 차단"
        ],
    }


@router.get("/policy/refund-settlement")
def policy_refund_settlement() -> dict[str, Any]:
    return {
        "direction": "통신판매중개",
        "cancel_refund_flow": [
            "결제 전 취소",
            "배송 전 취소",
            "배송 후 환불 제한",
            "단순변심/하자/오배송 구분",
            "프리미엄 배송 옵션 환불 기준",
            "판매자 책임 vs 플랫폼 책임",
        ],
        "marketplace_responsibility": {
            "platform": ["결제 흐름 제공", "분쟁 중재", "정산 데이터 제공", "통신판매중개 고지"],
            "seller": ["상품 정보", "배송", "반품지", "하자/오배송 1차 책임", "증빙 발급"],
        },
        "premium_delivery_sla_mode": settings.premium_delivery_sla_mode,
        "premium_delivery_sla": [
            "익명포장: 적용 가능 판매자 한정 목표형 안내",
            "빠른출고: 영업일 기준 24시간 이내 출고 목표",
            "재포장/보호포장: 외부 파손 방지 포장 추가 목표",
            "프리미엄CS: 영업일 기준 4시간 이내 1차 응답 목표"
        ],
    }


@router.get("/policy/store-metadata-safe")
def policy_store_metadata_safe() -> dict[str, Any]:
    return {
        "safe_copy_rules": [
            "매칭/만남/파트너 찾기 표현 제거",
            "그룹방은 정보교류/고민상담용으로만 표시",
            "단체 톡방 공지에 사람 찾기/주선 금지 명시",
            "상품 이미지는 노골적 표현 최소화",
            "스토어 메타데이터도 보수적으로 유지",
        ],
        "safe_footer_notice": "어른플랫폼은 통신판매중개자이며, 판매의 당사자가 아닙니다.",
        "order_notice": "구매계약의 당사자는 판매자이며, 플랫폼은 통신판매중개를 제공합니다.",
    }


@router.get("/policy/sku-matrix")
def policy_sku_matrix() -> dict[str, Any]:
    return {
        "direction": "통신판매중개",
        "allowed": ["위생/보관/세척", "비노골적 웰니스 액세서리", "중립 포장 관련 부자재"],
        "manual_review": ["표현 수위가 애매한 상품", "오해 소지가 있는 상품명/이미지", "부상 위험 가능성이 있는 상품"],
        "blocked": ["노골적 성기형상", "강압/위험행위 연상", "촬영물/서비스 연계", "불법/위험 물품", "만남/서비스 이용권 성격 상품"],
        "note": "테스트 단계에서는 허용 SKU만 실제 노출하고, 보류는 관리자 더미 상태로 유지하며, 금지는 저장만 허용하고 공개 차단합니다.",
    }


@router.get("/policy/marketplace-disclosure")
def policy_marketplace_disclosure() -> dict[str, Any]:
    return {
        "footer_notice": "어른플랫폼은 통신판매중개자이며, 판매의 당사자가 아닙니다.",
        "product_detail_required": ["판매자명", "사업자등록번호", "통신판매업 신고번호", "CS 연락처", "반품지"],
        "checkout_notice": "구매계약의 당사자는 판매자이며, 플랫폼은 통신판매중개를 제공합니다.",
    }


@router.get("/policy/group-room-summary")
def group_room_summary() -> dict[str, Any]:
    return {
        "adult_verified_required": True,
        "grace_period_required": False,
        "report_history_blocks_creation": False,
        "suspension_blocks_creation": True,
        "blocked_transfers": ["photo", "video", "file", "external_contact", "offline_meeting", "paid_matching"],
        "allowed_internal_shares": ["home_feed", "home_product", "saved_feed", "saved_product", "shop_list", "orders", "cart"],
        "notice": "단체 톡방은 정보교류/고민상담용으로만 운영하며 사람 찾기/만남/주선은 금지합니다.",
    }
