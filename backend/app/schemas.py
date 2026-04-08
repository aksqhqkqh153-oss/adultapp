from typing import Optional
from pydantic import BaseModel


class DashboardMetric(BaseModel):
    key: str
    label: str
    value: int | str


class LaunchGateItem(BaseModel):
    gate: str
    complete_condition: str
    evidence: str
    owner: str
    verdict: str


class AppReviewSettings(BaseModel):
    app_review_mode: bool
    home_block_level: str
    video_tab_enabled: bool
    search_suggestion_mode: str
    mobile_web_fallback_url: str
    hidden_category_ids: list[str]


class RefundTransitionRequest(BaseModel):
    status: str
    reject_reason_code: Optional[str] = None
    reject_reason_detail: Optional[str] = None
    evidence_photo_set_id: Optional[str] = None
    pickup_carrier: Optional[str] = None
    pickup_tracking_no: Optional[str] = None


class SellerActivationChecklist(BaseModel):
    adult_verified: bool
    business_reviewed: bool
    settlement_account_verified: bool
    return_address_done: bool
    cs_contact_done: bool
    seller_contract_agreed: bool
    eligible: bool


class SimpleReportCreate(BaseModel):
    reporter_id: int
    target_type: str
    target_id: int
    reason_code: str
    priority: str = "normal"


class LoginRequest(BaseModel):
    email: str
    password: str
    otp_code: Optional[str] = None
    backup_code: Optional[str] = None
    device_name: str = "web-browser"


class TwoFactorCompleteRequest(BaseModel):
    challenge_token: str
    otp_code: Optional[str] = None
    backup_code: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str = ""
    token_type: str = "bearer"
    role: str
    user_id: int
    two_factor_required: bool = False
    challenge_token: str = ""
    locked_until: Optional[str] = None


class TwoFASetupResponse(BaseModel):
    secret: str
    otp_auth_url: str
    issuer: str
    account_name: str


class VerifyOTPRequest(BaseModel):
    otp_code: str


class BackupCodeResponse(BaseModel):
    codes: list[str]
    remaining: int


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetConfirmRequest(BaseModel):
    reset_token: str
    new_password: str


class DeviceSessionRevokeRequest(BaseModel):
    session_id: int


class ProductUpsertRequest(BaseModel):
    id: Optional[int] = None
    seller_id: int = 2
    name: str
    sku_code: str
    category: str
    description: str = ""
    price: int = 0
    stock_qty: int = 0
    risk_grade: str = "A"
    display_scope: str = "app_web"
    payment_scope: str = "card_transfer"
    status: str = "draft"
    thumbnail_url: Optional[str] = None


class ProductMediaAttachRequest(BaseModel):
    product_id: int
    file_name: str
    file_url: str
    media_type: str = "image"
    sort_order: int = 0


class ContentUpsertRequest(BaseModel):
    id: Optional[int] = None
    author_id: int = 1
    category: str = "가이드"
    title: str
    body: str = ""
    visibility: str = "safe"
    thumbnail_url: Optional[str] = None
    video_url: Optional[str] = None
    status: str = "draft"


class OrderCreateRequest(BaseModel):
    product_id: int
    qty: int = 1
    payment_method: str = "card"
    payment_pg: str = "demo-pg"
    fee_rate: float = 0.1
    coupon_burden_owner: str = "platform"


class ReportResolveRequest(BaseModel):
    status: str = "resolved"
    action_taken: str = "임시조치"


class CommunityPostCreate(BaseModel):
    category: str = "정보공유"
    title: str
    body: str
    visibility: str = "safe"
    purpose: str = "정보교류"
    allow_dm: bool = True


class DirectMessageThreadCreate(BaseModel):
    participant_b_id: int
    subject: str
    purpose_code: str = "INFO_EXCHANGE"
    thread_type: str = "feed_reply"
    related_post_id: Optional[int] = None
    related_product_id: Optional[int] = None


class DirectMessageCreate(BaseModel):
    thread_id: int
    message: str
    purpose_code: str = "INFO_EXCHANGE"
