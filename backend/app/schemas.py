from typing import Optional
from datetime import datetime
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




class ConsentItem(BaseModel):
    consent_type: str
    agreed: bool
    is_required: bool = True
    version: str = "v1"


class SignupRequest(BaseModel):
    email: str
    password: str
    name: str
    login_provider: str = "email"
    identity_verification_token: str
    identity_verification_method: str = "PASS"
    adult_verification_status: str = "pending"
    consents: list[ConsentItem]


class IdentityVerificationStartRequest(BaseModel):
    provider: str = "PASS"


class IdentityVerificationConfirmRequest(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    provider: str = "PASS"
    tx_id: str
    verification_code: str


class AdultVerificationStartRequest(BaseModel):
    provider: str = "PASS"


class AdultVerificationConfirmRequest(BaseModel):
    tx_id: str
    verification_code: str



class ReconsentRequest(BaseModel):
    consents: list[ConsentItem]


class ModerationTextRequest(BaseModel):
    text: str
    target_type: str = "generic"


class SellerVerificationRequest(BaseModel):
    business_number: str
    cs_contact: str
    return_address: str
    settlement_bank: str = ""
    settlement_account_number: str = ""
    settlement_account_holder: str = ""
    seller_contract_agreed: bool = True
    business_document_url: str = ""
    approval_note: str = "사업자 인증 신청"


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
    image_urls: list[str] = []




class SellerApprovalDecisionRequest(BaseModel):
    decision: str = "approved"
    note: str = ""


class ProductApprovalDecisionRequest(BaseModel):
    decision: str = "approved"
    note: str = ""


class ProductSubmitReviewRequest(BaseModel):
    note: str = "승인대기 제출"


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
    starter_topic: Optional[str] = None
    requester_consented_rules: bool = False
    consent_notice_version: str = "dm_rules_v1"


class DirectMessageCreate(BaseModel):
    thread_id: int
    message: str
    purpose_code: str = "INFO_EXCHANGE"


class StoryCreate(BaseModel):
    title: str = "스토리"
    image_url: Optional[str] = None
    visibility: str = "safe"


class FeedPostCreate(BaseModel):
    category: str = "일상"
    title: str
    body: str
    image_url: Optional[str] = None
    allow_questions: bool = True
    visibility: str = "safe"


class ProfileQuestionCreate(BaseModel):
    target_user_id: int
    question_text: str
    feed_post_id: Optional[int] = None
    is_anonymous: bool = True


class ProfileQuestionAnswerRequest(BaseModel):
    answer_text: str


class UserBlockCreate(BaseModel):
    blocked_id: int
    reason_code: str = "user_request"


class RandomTicketCreate(BaseModel):
    category: str
    gender_option: str = "무관"
    age_option: str = "성인 전체"
    region_option: str = "무관"
    region_value: Optional[str] = None
    is_anonymous: bool = True


class RandomRuleUpdateRequest(BaseModel):
    same_category_only: bool = True
    gender_standard: list[str] = ["남성", "여성", "기타", "비공개"]
    gender_options: list[str] = ["무관", "남-여", "동성"]
    age_options: list[str] = ["성인 전체", "20대", "30대", "40대", "50대", "60대", "70대"]
    age_match_mode: str = "exact_then_adjacent"
    adjacent_age_pairs: str = "30대:40대,40대:30대"
    region_unit: str = "시"
    region_options: list[str] = ["무관", "같은 지역 우선", "거리기반"]
    geo_distance_enabled: bool = True
    max_distance_km: int = 600
    distance_slider_steps: str = "0-20:1,20-100:5,100-600:20"
    distance_score_mode: str = "band_bonus"
    anonymous_mode: str = "완전 익명"
    min_wait_seconds: int = 20
    max_wait_seconds: int = 300
    auto_rematch: bool = True
    exclude_blocked_users: bool = True
    priority_order: list[str] = ["gender_wait", "age", "region"]
    room_open_mode: str = "auto_create_1to1"
    chat_end_rule: str = "manual_or_block"
    retention_days: int = 1095
    thread_keep_hours_after_block: int = 24
    allow_unblock: bool = True
    unblock_roles: list[str] = ["user", "admin"]
    unblock_log_mode: str = "always_admin_log"
    personal_room_conversion: str = "mutual_consent_only"
    message_storage_mode: str = "full_text"
    message_edit_delete_mask_support: bool = True
    delete_display_mode: str = "masked_deleted_label_admin_archive"
    admin_restore_only: bool = True
    admin_log_enabled: bool = True
    admin_message_access_scope: str = "admin_archive_all_threads"
    report_reason_codes: list[str] = ["욕설", "스팸", "개인정보요구", "음란물전송", "불법권유", "기타"]
    report_score_label: str = "점"
    report_score_weights: str = "욕설:1,스팸:1,개인정보요구:2,음란물전송:3,불법권유:3,기타:1"
    auto_suspend_policy: str = "5:3d,10:7d,20:30d,21:admin_review"
    auto_suspend_threshold: int = 5
    admin_review_sla_hours: int = 48
    report_manage_layout: str = "filter,count,user_id,report_history,last_reported_at"
    permanent_ban_mode: str = "admin_decision_by_report_history"
    permanent_ban_keep_threads: bool = True
    permanent_ban_thread_access: str = "read_only_profile_limited_attachment_block_reconnect_block"
    region_display_mode: str = "city_alias_standard"
    websocket_scale_policy: str = "railway_only_until_single_instance_limit_then_redis"
    duplicate_report_policy: str = "same_target_once"
    report_auto_block_mode: str = "immediate_reporter_block"
    false_report_policy: str = "3:warn,5:3d,8:7d,15:admin_review"
    random_chat_only_sanction_enabled: bool = True
    random_chat_only_sanction_policy: str = "3:24h,5:72h,8:7d,15:admin_review"
    permanent_ban_rejoin_after_days: int = 365
    report_result_notice_mode: str = "silent"
    blocked_thread_visibility: str = "hard_hidden"
    unblock_rematch_mode: str = "immediate"
    match_retry_limit: int = 4
    match_search_timeout_seconds: int = 300
    contact_exchange_detection_mode: str = "terms_only"
    contact_exchange_warning_mode: str = "none"
    media_message_mode: str = "text_only"
    thread_view_audit_enabled: bool = True
    self_message_delete_window_minutes: int = 30
    message_delete_scope: str = "delete_for_both_masked_archive"
    male_rematch_min_seconds: int = 20
    male_rematch_max_seconds: int = 40
    female_rematch_min_seconds: int = 5
    female_rematch_max_seconds: int = 10


class RandomReportCreate(BaseModel):
    thread_id: int
    reason_code: str
    detail: Optional[str] = None


class DirectMessageDeleteRequest(BaseModel):
    reason_code: str = "user_delete"


class RandomThreadEndRequest(BaseModel):
    reason_code: str = "user_end"



class ConsentItem(BaseModel):
    consent_type: str
    agreed: bool
    is_required: bool = True
    version: str = "v1"


class SignupConsentStatus(BaseModel):
    terms_version: str = "terms_v1"
    privacy_version: str = "privacy_v1"
    adult_notice_version: str = "adult_notice_v1"
    identity_notice_version: str = "identity_notice_v1"
    reconsent_required: bool = False


class SignupProfilePayload(BaseModel):
    gender: Optional[str] = None
    age_band: Optional[str] = None
    region_code: Optional[str] = None
    interests: list[str] = []
    marketing_opt_in: bool = False


class SignupRequest(BaseModel):
    email: str
    password: str
    display_name: str
    login_provider: str = "이메일"
    identity_verification_token: str
    identity_verification_method: str = "PASS"
    consents: list[ConsentItem]
    profile: Optional[SignupProfilePayload] = None
