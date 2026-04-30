from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Adult Commerce Platform API"
    app_env: str = "development"
    app_review_mode: bool = False
    database_url: str = "sqlite:///./adult_platform.db"
    cors_origins: str = "http://localhost:5173,http://localhost:8000,https://adultapp.pages.dev"
    cors_origin_regex: str = r"https://.*\.adultapp\.pages\.dev"
    backend_public_base_url: str = "https://adultapp-production.up.railway.app"

    jwt_secret_key: str = "change-me-jwt-secret"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    jwt_refresh_token_expire_days: int = 14
    login_max_failures: int = 5
    login_lock_minutes: int = 15
    login_challenge_expire_minutes: int = 10

    ip_rate_limit_window_minutes: int = 5
    ip_rate_limit_max_requests: int = 20
    ip_rate_limit_block_minutes: int = 10

    pg_primary_provider: str = "kginicis"
    pg_primary_merchant_id: str = "change-me"
    pg_primary_api_key: str = "change-me"
    pg_primary_webhook_secret: str = "change-me"
    pg_secondary_provider: str = "danalpay"
    pg_secondary_merchant_id: str = "change-me"
    pg_secondary_api_key: str = "change-me"
    pg_secondary_webhook_secret: str = "change-me"

    pg_portone_store_id: str = "change-me-pg-store-id"
    pg_portone_channel_key: str = "change-me-pg-channel-key"
    pg_portone_store_id_test: str = "change-me-pg-store-id-test"
    pg_portone_store_id_live: str = "change-me-pg-store-id-live"
    pg_portone_channel_key_test: str = "change-me-pg-channel-key-test"
    pg_portone_channel_key_live: str = "change-me-pg-channel-key-live"
    pg_primary_merchant_id_test: str = "change-me-merchant-test"
    pg_primary_merchant_id_live: str = "change-me-merchant-live"
    toss_mid_test: str = "iamporttest_3"
    toss_client_key_test: str = "change-me-toss-client-key-test"
    toss_secret_key_test: str = "change-me-toss-secret-key-test"
    toss_mid_live: str = "change-me-toss-mid-live"
    toss_client_key_live: str = "change-me-toss-client-key-live"
    toss_secret_key_live: str = "change-me-toss-secret-key-live"
    portone_sdk_enabled: bool = True
    payments_env_split_enabled: bool = True
    portone_api_base_url: str = "https://api.portone.io"
    portone_api_secret: str = "change-me-portone-api-secret"
    portone_webhook_secret_test: str = "change-me-portone-webhook-test"
    portone_webhook_secret_live: str = "change-me-portone-webhook-live"
    pg_webhook_path: str = "/api/payments/webhooks/pg"
    pg_refund_webhook_path: str = "/api/payments/webhooks/refund"
    pg_settlement_basis_note: str = "초기에는 관리자 승인형 판매자/상품 공개 구조로 운영하며, 관리자 직접판매와 사업자 판매물품 중개를 병행"
    verotel_enabled: bool = True
    verotel_shop_id: str = "change-me-verotel-shop-id"
    verotel_signature_key: str = "change-me-verotel-signature-key"
    verotel_api_mode: str = "test"
    verotel_startorder_url: str = "https://secure.verotel.com/startorder"
    verotel_success_path: str = "/shop/checkout/success"
    verotel_back_path: str = "/shop/checkout/back"
    verotel_postback_path: str = "/api/payments/webhooks/verotel"
    verotel_allowed_currencies: str = "EUR,USD"


    adult_verification_provider: str = "portone_pass"
    adult_verification_provider_label: str = "PortOne 기반 PASS/휴대폰 본인확인"
    adult_verification_client_id: str = "change-me"
    adult_verification_client_secret: str = "change-me"
    adult_verification_webhook_secret: str = "change-me-webhook"
    adult_verification_callback_web: str = "https://example.com/auth/adult/callback"
    adult_verification_callback_app: str = "adultapp://auth/adult/callback"
    adult_verification_callback_identity_web: str = "https://example.com/auth/identity/callback"
    adult_verification_callback_identity_app: str = "adultapp://auth/identity/callback"
    adult_verification_test_mode: bool = False
    adult_verification_prod_enabled: bool = True
    adult_verification_allowed_providers: str = "PASS,휴대폰"
    adult_verification_rollout_strategy: str = "1차는 PortOne 기반 PASS 통합 연동으로 시작하고, 운영 안정화 후 NICE 또는 Danal 직접 전환 여부를 검토"

    adult_verification_portone_store_id: str = "change-me-portone-store-id"
    adult_verification_portone_channel_key: str = "change-me-portone-channel-key"
    adult_verification_webhook_path: str = "/api/auth/verification/webhook"
    adult_verification_error_code_map: str = "INVALID_IDENTITY:본인확인 실패,MINOR_BLOCKED:미성년 차단,SIGNATURE_ERROR:콜백 서명 오류,PROVIDER_TIMEOUT:공급사 응답 지연"

    adult_verification_prod_cutover_checklist: str = "본인확인 실연동,콜백 검증,서버 저장,장애 알림,운영 점검표 완료 후 운영키 전환"
    reconsent_grace_days: int = 0
    reconsent_enforcement_mode: str = "limited_access"
    reconsent_redirect_path: str = "/reconsent"
    minor_block_retention_days: int = 365
    minor_block_retention_scope: str = "최소 식별값과 차단 이력만 분쟁 대응 범위에서 1년 보관 후 파기"
    adult_verification_hash_secret: str = "change-me-adult-verify-hash-secret"
    adult_verification_simple_failure_retention_days: int = 30
    adult_verification_underage_retention_days: int = 365
    adult_verification_dispute_retention_days: int = 1095
    adult_verification_retry_fail_1h_limit: int = 3
    adult_verification_retry_fail_3h_limit: int = 5
    adult_verification_retry_lock_1h_hours: int = 1
    adult_verification_retry_lock_3h_hours: int = 3

    ops_alert_slack_enabled: bool = True
    ops_alert_slack_webhook_url: str = "change-me-slack"
    ops_alert_email_enabled: bool = True
    ops_alert_email_to: str = "ops@example.com"
    ops_checklist_document_path: str = "./docs/ops_preflight_checklist.md"
    beta_business_info_db_override_enabled: bool = True
    minor_block_purge_cron: str = "0 4 * * *"
    minor_block_purge_batch_enabled: bool = True
    minor_block_purge_runbook_path: str = "./docs/ops_minor_block_purge.md"

    operator_legal_name: str = "미정-법인명입력필요"
    operator_brand_name: str = "adultapp"
    operator_business_registration_no: str = "미정-사업자번호입력필요"
    operator_mail_order_report_no: str = "미정-통신판매업신고번호입력필요"
    operator_business_address: str = "미정-사업장주소입력필요"
    operator_support_email: str = "aksqhqkqh153@gmail.com"
    operator_support_phone: str = "000-0000-0000"
    operator_hosting_provider: str = "Railway + Cloudflare"
    operator_youth_protection_officer: str = "미정-청소년보호책임자입력필요"
    operator_dispute_contact_url: str = "https://example.com/support"
    operator_privacy_contact_email: str = "aksqhqkqh153@gmail.com"
    location_based_features_enabled: bool = True
    location_feature_mode: str = "region_band_only"
    location_realtime_sharing_enabled: bool = False
    location_distance_band_labels: str = "0-3km,3-10km,10-30km,30km+"
    location_privacy_notice_required: bool = True
    seller_product_preapproval_required: bool = True

    community_private_web_enabled: bool = True
    community_forum_mode: str = "gated_information_forum"
    random_chat_enabled: bool = False
    direct_user_dm_enabled: bool = False
    offline_meeting_enabled: bool = False
    friend_finding_enabled: bool = False
    community_image_upload_enabled: bool = False
    community_external_contact_exchange_allowed: bool = False
    community_policy_reference_path: str = "./docs/adultapp_aragon_policy_comparison_20260412.md"

    monetization_seller_subscription_enabled: bool = False
    monetization_feed_sponsored_slots_enabled: bool = True
    monetization_premium_member_enabled: bool = True
    monetization_b2b_report_tools_enabled: bool = True
    monetization_sponsored_slot_policy: str = "브랜드관/기획전 대신 홈·질문 피드 사이에 검수형 추천노출 상품 슬롯만 허용"
    monetization_premium_member_policy: str = "구매자 회원제 기반으로 익명포장·빠른출고·보호포장·프리미엄CS 옵션 제공"
    premium_delivery_sla_mode: str = "target"
    monetization_b2b_tool_policy: str = "판매자 월 구독 없이 월별 정산·반품환불 이력·분쟁로그·증빙·대시보드·SKU 승인 상태 리포트만 유료화"

    seller_approval_requirements: str = "사업자등록증,정산계좌 확인,반품지,CS 연락처,판매자 약관 동의 완료 시 승인"
    seller_onboarding_admin_override_enabled: bool = False
    test_stage_sdk_install_now: bool = True
    test_stage_live_values_entry_phase: str = "테스트 webhook secret, Store ID, channel key, API Secret 발급 후 test 환경부터 입력하고 live 값은 운영 MID 발급 직전에 입력"
    test_stage_admin_override_policy: str = "출시 준비 단계 기본값은 비활성화이며, 내부 QA 환경에서만 일시적 활성화를 허용"
    test_stage_sku_expansion_phase: str = "PG 사전상담 피드백 전까지 보수 유지, 승인 후 단계적으로 확장"
    test_stage_premium_sla_upgrade_phase: str = "운영 안정화 이후 목표형에서 보장형 전환 검토"
    test_stage_next_actions: str = "PortOne 테스트 webhook secret/Store ID/channel key/API Secret 발급,backend/.env에 test 값만 입력,결제·취소·부분취소·환불·webhook 재전송 테스트,판매자 필수 입력 누락 차단 확인,허용 SKU만 공개해 PG 사전상담,live merchant/MID/live webhook secret은 마지막 단계에서만 입력"
    launch_stage_mode: str = "production_guarded"
    product_review_visibility_policy: str = "승인 전 비공개"
    product_review_editable_statuses: str = "draft,pending_review,rejected"
    settlement_cycle_policy: str = "환불 리스크와 CS 처리 안정화 후 주별 정산"
    tax_invoice_responsibility_direct: str = "platform"
    tax_invoice_responsibility_marketplace: str = "seller"
    cash_receipt_responsibility_direct: str = "platform"
    cash_receipt_responsibility_marketplace: str = "seller"

    tax_invoice_provider: str = "hometax_or_vendor"
    tax_invoice_api_key: str = "change-me"
    cash_receipt_provider: str = "pg_or_vendor"
    cash_receipt_api_key: str = "change-me"

    admin_2fa_enabled: bool = True
    admin_2fa_issuer: str = "adultapp"
    admin_ip_allowlist: str = "127.0.0.1,10.0.0.0/8"
    dual_approval_enabled: bool = True
    audit_log_hash_chain: bool = True
    admin_exception_approval_mode: str = "초기에는 내부 승인 문서 + 감사로그 방식, 이후 백오피스 승인 화면으로 전환"
    admin_exception_audit_required: bool = True

    uploads_dir: str = "./uploads"
    media_base_url: str = "https://adultapp-production.up.railway.app/media"
    media_public_root: str = "assets/store"
    r2_account_id: str = ""
    r2_access_key: str = ""
    r2_secret_key: str = ""
    r2_bucket_name: str = "adultapp-images"
    r2_public_url: str = ""
    r2_endpoint_url: str = ""
    r2_upload_prefix: str = "uploads"
    r2_enabled: bool = True
    password_reset_delivery_mode: str = "file"
    password_reset_sender_email: str = "noreply@example.com"
    password_reset_sender_sms: str = "07000000000"
    password_reset_outbox_dir: str = "./outbox/password-reset"
    alembic_config_path: str = "./alembic.ini"
    mobile_web_fallback_url: str = "https://m.example.com/safe"

    # Launch safety gates
    demo_login_enabled: bool = False
    allow_unverified_test_webhooks: bool = False
    payment_confirm_requires_provider_requery: bool = True
    local_uploads_allowed: bool = False
    object_storage_required: bool = True

    startup_db_init_enabled: bool = True
    startup_seed_enabled: bool = False
    postgres_connect_timeout_seconds: int = 5
    postgres_statement_timeout_ms: int = 10000

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
