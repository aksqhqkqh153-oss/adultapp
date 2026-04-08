from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import UniqueConstraint
from sqlmodel import SQLModel, Field


class MemberGrade(str, Enum):
    ADMIN = "1"
    SUB_ADMIN = "2"
    MANAGER = "3"
    SELLER = "4"
    CUSTOMER = "5"
    GENERAL = "6"
    ETC = "7"


class SellerOnboardingStatus(str, Enum):
    PENDING = "pending"
    BUSINESS_REVIEWED = "business_reviewed"
    ACCOUNT_VERIFIED = "account_verified"
    RETURN_CENTER_DONE = "return_center_done"
    CS_CONTACT_DONE = "cs_contact_done"
    POLICY_AGREED = "policy_agreed"
    ACTIVE = "active"


class RefundStatus(str, Enum):
    REQUESTED = "requested"
    SELLER_NOTIFIED = "seller_notified"
    PICKUP_REQUESTED = "pickup_requested"
    INSPECTING = "inspecting"
    APPROVED = "approved"
    REJECTED = "rejected"
    PG_CANCELLED = "pg_cancelled"
    CANCEL_FAILED = "cancel_failed"
    RESTOCKED = "restocked"
    DISCARDED = "discarded"


class ReviewVisibility(str, Enum):
    SAFE = "safe"
    AUTH_ONLY = "auth_only"
    WEB_ONLY = "web_only"
    HIDDEN = "hidden"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    name: str
    password_hash: str = Field(default="")
    grade: MemberGrade = Field(default=MemberGrade.GENERAL)
    adult_verified: bool = Field(default=False)
    member_status: str = Field(default="active")
    seller_onboarding_status: Optional[SellerOnboardingStatus] = Field(default=None)
    admin_2fa_secret: Optional[str] = None
    admin_2fa_confirmed: bool = Field(default=False)
    admin_backup_codes: Optional[str] = None
    failed_login_count: int = Field(default=0)
    locked_until: Optional[datetime] = None
    last_failed_login_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    password_changed_at: Optional[datetime] = None
    reset_required: bool = Field(default=False)


class RefreshToken(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    token_hash: str = Field(index=True, unique=True)
    session_id: Optional[int] = Field(default=None, index=True)
    expires_at: datetime
    is_revoked: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LoginChallenge(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    challenge_token: str = Field(index=True, unique=True)
    device_session_id: Optional[int] = Field(default=None, index=True)
    expires_at: datetime
    used_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DeviceSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    device_name: str = Field(default="web-browser")
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    refresh_token_hash: Optional[str] = Field(default=None, index=True)
    last_seen_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    revoked_at: Optional[datetime] = None
    is_current: bool = Field(default=True)


class PasswordResetToken(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    token_hash: str = Field(index=True, unique=True)
    expires_at: datetime
    used_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RateLimitEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ip_address: str = Field(index=True)
    route_key: str = Field(index=True)
    action: str = Field(default="request")
    window_started_at: datetime = Field(default_factory=datetime.utcnow)
    last_seen_at: datetime = Field(default_factory=datetime.utcnow)
    hit_count: int = Field(default=1)
    blocked_until: Optional[datetime] = None


class SellerProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, unique=True)
    business_number: str
    settlement_account_verified: bool = Field(default=False)
    return_address: Optional[str] = None
    cs_contact: Optional[str] = None
    seller_contract_agreed: bool = Field(default=False)


class Product(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("seller_id", "sku_code", name="uq_seller_sku"),)
    id: Optional[int] = Field(default=None, primary_key=True)
    seller_id: int = Field(index=True)
    name: str
    sku_code: str = Field(index=True)
    category: str
    description: Optional[str] = None
    price: int = Field(default=0)
    stock_qty: int = Field(default=0)
    risk_grade: str = Field(default="A")
    display_scope: str = Field(default="app_web")
    payment_scope: str = Field(default="card_transfer")
    review_visibility: ReviewVisibility = Field(default=ReviewVisibility.SAFE)
    thumbnail_url: Optional[str] = None
    status: str = Field(default="draft")
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ProductMedia(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(index=True)
    media_type: str = Field(default="image")
    file_name: str
    file_url: str
    sort_order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ContentItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    author_id: int = Field(index=True)
    category: str = Field(default="가이드")
    title: str
    body: str = Field(default="")
    visibility: str = Field(default="safe")
    thumbnail_url: Optional[str] = None
    video_url: Optional[str] = None
    status: str = Field(default="draft")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CommunityPost(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    author_id: int = Field(index=True)
    author_grade: str = Field(default="6")
    category: str = Field(default="정보공유")
    title: str
    body: str
    visibility: str = Field(default="safe")
    purpose: str = Field(default="정보교류")
    allow_dm: bool = Field(default=True)
    status: str = Field(default="published")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class DirectMessageThread(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    thread_type: str = Field(default="feed_reply")
    subject: str
    purpose_code: str = Field(default="INFO_EXCHANGE")
    created_by: int = Field(index=True)
    participant_a_id: int = Field(index=True)
    participant_b_id: int = Field(index=True)
    related_post_id: Optional[int] = Field(default=None, index=True)
    related_product_id: Optional[int] = Field(default=None, index=True)
    status: str = Field(default="open")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class DirectMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    thread_id: int = Field(index=True)
    sender_id: int = Field(index=True)
    receiver_id: int = Field(index=True)
    purpose_code: str = Field(default="INFO_EXCHANGE")
    message: str
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_no: str = Field(index=True, unique=True)
    member_id: int = Field(index=True)
    seller_id: int = Field(index=True)
    order_status: str = Field(default="paid")
    payment_method: str = Field(default="card")
    payment_pg: str = Field(default="pending")
    approved_at: Optional[datetime] = None
    cancel_at: Optional[datetime] = None
    supply_amount: int = 0
    vat_amount: int = 0
    total_amount: int = 0
    fee_rate: float = 0.08
    settlement_status: str = Field(default="open")


class OrderItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(index=True)
    product_id: int = Field(index=True)
    sku_code: str
    qty: int
    unit_price: int
    supply_amount: int
    vat_amount: int
    fee_rate: float
    coupon_burden_owner: str = Field(default="platform")
    refund_status: Optional[str] = None


class RefundCase(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(index=True)
    order_item_id: int = Field(index=True)
    seller_id: int = Field(index=True)
    status: RefundStatus = Field(default=RefundStatus.REQUESTED)
    reason_code: Optional[str] = None
    reject_reason_code: Optional[str] = None
    reject_reason_detail: Optional[str] = None
    evidence_photo_set_id: Optional[str] = None
    appeal_allowed: bool = Field(default=True)
    neutral_label_name: Optional[str] = None
    pickup_carrier: Optional[str] = None
    pickup_tracking_no: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ModerationReport(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    reporter_id: int = Field(index=True)
    target_type: str
    target_id: int
    reason_code: str
    priority: str = Field(default="normal")
    status: str = Field(default="queued")
    assigned_to: Optional[int] = None
    action_taken: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AdminActionLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    admin_id: int = Field(index=True)
    admin_grade: str
    action_type: str
    target_type: str
    target_id: str
    reason: str
    before_state: Optional[str] = None
    after_state: Optional[str] = None
    ip: Optional[str] = None
    device: Optional[str] = None
    chain_prev_hash: Optional[str] = None
    chain_hash: Optional[str] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SellerPenalty(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    seller_id: int = Field(index=True)
    metric_name: str
    base_score: int
    weighted_score: int
    action_status: str = Field(default="monitoring")
    recovery_condition: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LaunchGate(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    gate: str = Field(index=True)
    complete_condition: str
    evidence: str
    owner: str
    verdict: str = Field(default="pending")
    is_required: bool = Field(default=True)


class AppAsset(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    store: str = Field(index=True)
    asset_name: str
    asset_type: str = Field(default="metadata")
    status: str = Field(default="draft")
    note: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None


class AppealCase(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    report_id: int = Field(index=True)
    requester_id: int = Field(index=True)
    status: str = Field(default="requested")
    reason: str = Field(default="")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SlaEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    event_type: str = Field(index=True)
    target_type: str = Field(index=True)
    target_id: str = Field(index=True)
    status: str = Field(default="open")
    due_at: Optional[datetime] = None
    owner_id: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
