from __future__ import annotations

from datetime import datetime, timedelta
import base64
import hashlib
import hmac
import json
import secrets
from ipaddress import ip_address, ip_network
from pathlib import Path
from typing import Optional

import jwt
import pyotp
from fastapi import Depends, Header, HTTPException
from passlib.context import CryptContext
from sqlmodel import Session, select

from .config import settings
from .database import get_session
from .models import DeviceSession, LoginChallenge, MemberGrade, PasswordResetToken, RateLimitEvent, RefreshToken, User

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def utcnow() -> datetime:
    return datetime.utcnow()


PBKDF2_SCHEME = "pbkdf2_sha256"
PBKDF2_DEFAULT_ITERATIONS = 260000


def _b64encode_no_padding(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _b64decode_no_padding(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode((value + padding).encode("ascii"))


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def hash_password_pbkdf2(password: str, salt: str | None = None, iterations: int = PBKDF2_DEFAULT_ITERATIONS) -> str:
    salt_bytes = (salt or secrets.token_urlsafe(24)).encode("utf-8")
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, iterations)
    return f"{PBKDF2_SCHEME}${iterations}${_b64encode_no_padding(salt_bytes)}${_b64encode_no_padding(digest)}"


def _verify_password_pbkdf2(password: str, password_hash: str) -> bool:
    try:
        scheme, iterations_raw, salt_raw, digest_raw = password_hash.split("$", 3)
        if scheme != PBKDF2_SCHEME:
            return False
        iterations = int(iterations_raw)
        salt = _b64decode_no_padding(salt_raw)
        expected = _b64decode_no_padding(digest_raw)
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False


def verify_password(password: str, password_hash: str) -> bool:
    if not password_hash:
        return False
    if password_hash.startswith(f"{PBKDF2_SCHEME}$"):
        return _verify_password_pbkdf2(password, password_hash)
    try:
        return pwd_context.verify(password, password_hash)
    except Exception:
        return False


def _hash_refresh_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def _hash_reset_token(raw_token: str) -> str:
    return hashlib.sha256(f"reset::{raw_token}".encode("utf-8")).hexdigest()


def build_access_payload(user: User, device_session_id: int | None = None) -> dict:
    expire = utcnow() + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    return {
        "sub": str(user.id),
        "email": user.email,
        "role": user.grade,
        "type": "access",
        "device_session_id": device_session_id,
        "exp": expire,
        "iat": utcnow(),
    }


def create_access_token(user: User, device_session_id: int | None = None) -> str:
    return jwt.encode(build_access_payload(user, device_session_id), settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

DEMO_ACCOUNT_DEFS = {
    "admin@example.com": {"password": "admin1234", "role": MemberGrade.ADMIN, "user_id": -1, "name": "관리자", "adult_verified": True, "identity_verified": True, "member_status": "active"},
    "customer@example.com": {"password": "customer1234", "role": MemberGrade.CUSTOMER, "user_id": -2, "name": "회원", "adult_verified": True, "identity_verified": True, "member_status": "active"},
    "seller@example.com": {"password": "seller1234", "role": MemberGrade.SELLER, "user_id": -3, "name": "판매자", "adult_verified": True, "identity_verified": True, "member_status": "active"},
    "general@example.com": {"password": "general1234", "role": MemberGrade.GENERAL, "user_id": -4, "name": "일반회원", "adult_verified": False, "identity_verified": False, "member_status": "pending"},
}

def build_demo_access_token(email: str) -> str:
    demo = DEMO_ACCOUNT_DEFS[email]
    expire = utcnow() + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    payload = {
        "sub": str(demo["user_id"]),
        "email": email,
        "role": demo["role"],
        "type": "access",
        "device_session_id": None,
        "exp": expire,
        "iat": utcnow(),
        "demo_account": True,
        "name": demo["name"],
        "adult_verified": demo["adult_verified"],
        "identity_verified": demo["identity_verified"],
        "member_status": demo["member_status"],
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

def try_demo_login(email: str, password: str):
    # Demo accounts are disabled by default for launch safety.
    if not getattr(settings, "demo_login_enabled", False):
        return None
    demo = DEMO_ACCOUNT_DEFS.get(email)
    if not demo or demo["password"] != password:
        return None
    return {
        "access_token": build_demo_access_token(email),
        "refresh_token": "",
        "role": demo["role"],
        "user_id": demo["user_id"],
        "two_factor_required": False,
    }

def build_demo_user_from_payload(payload: dict) -> User:
    return User(
        id=int(payload.get("sub", 0)),
        email=payload.get("email", ""),
        name=payload.get("name", ""),
        grade=payload.get("role", MemberGrade.GENERAL),
        adult_verified=bool(payload.get("adult_verified", False)),
        identity_verified=bool(payload.get("identity_verified", False)),
        member_status=payload.get("member_status", "active"),
        adult_verification_status="verified_adult" if payload.get("adult_verified") else "pending",
    )



def create_device_session(user: User, session: Session, device_name: str = "web-browser", user_agent: str | None = None, ip_address: str | None = None) -> DeviceSession:
    item = DeviceSession(user_id=user.id or 0, device_name=device_name, user_agent=user_agent, ip_address=ip_address)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def touch_device_session(device_session: DeviceSession, session: Session, refresh_token_hash: str | None = None) -> None:
    device_session.last_seen_at = utcnow()
    device_session.is_current = True
    if refresh_token_hash:
        device_session.refresh_token_hash = refresh_token_hash
    session.add(device_session)
    session.commit()


def create_refresh_token(user: User, session: Session, device_session: DeviceSession | None = None) -> str:
    raw_token = secrets.token_urlsafe(48)
    token_hash = _hash_refresh_token(raw_token)
    expires_at = utcnow() + timedelta(days=settings.jwt_refresh_token_expire_days)
    session.add(
        RefreshToken(
            user_id=user.id or 0,
            token_hash=token_hash,
            session_id=device_session.id if device_session else None,
            expires_at=expires_at,
            is_revoked=False,
        )
    )
    session.commit()
    if device_session:
        touch_device_session(device_session, session, token_hash)
    return raw_token


def revoke_refresh_token(raw_token: str, session: Session) -> None:
    token_hash = _hash_refresh_token(raw_token)
    token = session.exec(select(RefreshToken).where(RefreshToken.token_hash == token_hash)).first()
    if token:
        token.is_revoked = True
        session.add(token)
        if token.session_id:
            device = session.get(DeviceSession, token.session_id)
            if device:
                device.revoked_at = utcnow()
                device.is_current = False
                session.add(device)
        session.commit()


def authenticate_refresh_token(raw_token: str, session: Session) -> tuple[User, DeviceSession | None]:
    token_hash = _hash_refresh_token(raw_token)
    token = session.exec(select(RefreshToken).where(RefreshToken.token_hash == token_hash)).first()
    if not token or token.is_revoked:
        raise HTTPException(status_code=401, detail="invalid refresh token")
    if token.expires_at < utcnow():
        raise HTTPException(status_code=401, detail="expired refresh token")
    user = session.get(User, token.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="user not found")
    token.is_revoked = True
    session.add(token)
    device = session.get(DeviceSession, token.session_id) if token.session_id else None
    if device:
        device.last_seen_at = utcnow()
        session.add(device)
    session.commit()
    return user, device


def revoke_device_session(session_id: int, session: Session) -> None:
    device = session.get(DeviceSession, session_id)
    if not device:
        return
    device.revoked_at = utcnow()
    device.is_current = False
    session.add(device)
    tokens = session.exec(select(RefreshToken).where(RefreshToken.session_id == session_id, RefreshToken.is_revoked == False)).all()  # noqa: E712
    for token in tokens:
        token.is_revoked = True
        session.add(token)
    session.commit()


def issue_login_challenge(user: User, session: Session, device_session: DeviceSession | None = None) -> LoginChallenge:
    challenge = LoginChallenge(
        user_id=user.id or 0,
        device_session_id=device_session.id if device_session else None,
        challenge_token=secrets.token_urlsafe(32),
        expires_at=utcnow() + timedelta(minutes=settings.login_challenge_expire_minutes),
    )
    session.add(challenge)
    session.commit()
    session.refresh(challenge)
    return challenge


def consume_login_challenge(challenge_token: str, session: Session) -> tuple[User, DeviceSession | None]:
    challenge = session.exec(
        select(LoginChallenge).where(LoginChallenge.challenge_token == challenge_token, LoginChallenge.used_at.is_(None))
    ).first()
    if not challenge or challenge.expires_at < utcnow():
        raise HTTPException(status_code=401, detail="invalid or expired challenge")
    challenge.used_at = utcnow()
    session.add(challenge)
    session.commit()
    user = session.get(User, challenge.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="user not found")
    device = session.get(DeviceSession, challenge.device_session_id) if challenge.device_session_id else None
    return user, device




def is_ip_allowed(ip_str: str, allowlist: str | None = None) -> bool:
    allowlist = allowlist or settings.admin_ip_allowlist
    if not allowlist:
        return True
    try:
        ip_obj = ip_address(ip_str)
    except ValueError:
        return False
    for raw in [item.strip() for item in allowlist.split(",") if item.strip()]:
        try:
            if "/" in raw:
                if ip_obj in ip_network(raw, strict=False):
                    return True
            elif ip_obj == ip_address(raw):
                return True
        except ValueError:
            continue
    return False


def assert_admin_ip_allowed(user: User, ip_str: str | None) -> None:
    if user.grade != MemberGrade.ADMIN:
        return
    candidate = ip_str or "127.0.0.1"
    if not is_ip_allowed(candidate):
        raise HTTPException(status_code=403, detail=f"admin ip not allowed: {candidate}")


def deliver_password_reset_token(user: User, raw_token: str) -> dict:
    outbox = Path(settings.password_reset_outbox_dir)
    outbox.mkdir(parents=True, exist_ok=True)
    payload = {
        "email": user.email,
        "token": raw_token,
        "mode": settings.password_reset_delivery_mode,
        "sender_email": settings.password_reset_sender_email,
        "sender_sms": settings.password_reset_sender_sms,
        "issued_at": utcnow().isoformat(),
    }
    file_path = outbox / f"reset_{user.id}_{int(utcnow().timestamp())}.json"
    file_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"delivery_mode": settings.password_reset_delivery_mode, "outbox_file": str(file_path)}

def create_password_reset_token(user: User, session: Session) -> str:
    raw_token = secrets.token_urlsafe(32)
    session.add(
        PasswordResetToken(
            user_id=user.id or 0,
            token_hash=_hash_reset_token(raw_token),
            expires_at=utcnow() + timedelta(minutes=30),
        )
    )
    session.commit()
    return raw_token


def consume_password_reset_token(raw_token: str, session: Session) -> User:
    token = session.exec(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == _hash_reset_token(raw_token), PasswordResetToken.used_at.is_(None)
        )
    ).first()
    if not token or token.expires_at < utcnow():
        raise HTTPException(status_code=400, detail="invalid or expired reset token")
    token.used_at = utcnow()
    session.add(token)
    session.commit()
    user = session.get(User, token.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    return user


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail=f"invalid token: {exc}")
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="invalid token type")
    return payload


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    session: Session = Depends(get_session),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="missing bearer token")
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    if payload.get("demo_account"):
        return build_demo_user_from_payload(payload)
    user_id = int(payload.get("sub", 0))
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="user not found")
    if user.grade != MemberGrade.ADMIN and user.member_status in {"minor_blocked", "blocked_minor", "login_blocked_minor"}:
        raise HTTPException(status_code=403, detail="minor account blocked")
    return user


def require_grade(*allowed: MemberGrade):
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.grade not in allowed:
            raise HTTPException(status_code=403, detail="insufficient role")
        return user
    return dependency


def build_totp_uri(secret: str, email: str) -> str:
    return pyotp.TOTP(secret).provisioning_uri(name=email, issuer_name=settings.admin_2fa_issuer)


def verify_totp(secret: str, otp_code: str) -> bool:
    return pyotp.TOTP(secret).verify(otp_code, valid_window=1)


def hash_backup_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def generate_backup_codes(count: int = 10) -> tuple[list[str], list[str]]:
    plain_codes: list[str] = []
    hashed_codes: list[str] = []
    for _ in range(count):
        code = secrets.token_hex(4).upper()
        plain_codes.append(code)
        hashed_codes.append(hash_backup_code(code))
    return plain_codes, hashed_codes


def verify_backup_code(user: User, backup_code: str, session: Session) -> bool:
    if not backup_code:
        return False
    code_hash = hash_backup_code(backup_code.strip().upper())
    codes = [code for code in (user.admin_backup_codes or "").split(",") if code]
    if code_hash not in codes:
        return False
    remaining = [code for code in codes if code != code_hash]
    user.admin_backup_codes = ",".join(remaining)
    session.add(user)
    session.commit()
    return True


def check_ip_rate_limit(ip_address: str, route_key: str, session: Session) -> RateLimitEvent:
    now = utcnow()
    event = session.exec(select(RateLimitEvent).where(RateLimitEvent.ip_address == ip_address, RateLimitEvent.route_key == route_key)).first()
    window_delta = timedelta(minutes=settings.ip_rate_limit_window_minutes)
    if not event:
        event = RateLimitEvent(ip_address=ip_address, route_key=route_key, window_started_at=now, last_seen_at=now, hit_count=1)
        session.add(event)
        session.commit()
        session.refresh(event)
        return event
    if event.blocked_until and event.blocked_until > now:
        raise HTTPException(status_code=429, detail=f"rate limit blocked until {event.blocked_until.isoformat()}")
    if now - event.window_started_at > window_delta:
        event.window_started_at = now
        event.hit_count = 0
        event.blocked_until = None
    event.hit_count += 1
    event.last_seen_at = now
    if event.hit_count > settings.ip_rate_limit_max_requests:
        event.blocked_until = now + timedelta(minutes=settings.ip_rate_limit_block_minutes)
        session.add(event)
        session.commit()
        raise HTTPException(status_code=429, detail=f"rate limit blocked until {event.blocked_until.isoformat()}")
    session.add(event)
    session.commit()
    return event
