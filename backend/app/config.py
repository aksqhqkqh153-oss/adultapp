from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Adult Commerce Platform API"
    app_env: str = "development"
    app_review_mode: bool = True
    database_url: str = "sqlite:///./adult_platform.db"
    cors_origins: str = "http://localhost:5173"

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

    adult_verification_provider: str = "pass"
    adult_verification_client_id: str = "change-me"
    adult_verification_client_secret: str = "change-me"
    adult_verification_callback_web: str = "https://example.com/auth/adult/callback"
    adult_verification_callback_app: str = "adultapp://auth/adult/callback"
    adult_verification_test_mode: bool = True

    tax_invoice_provider: str = "hometax_or_vendor"
    tax_invoice_api_key: str = "change-me"
    cash_receipt_provider: str = "pg_or_vendor"
    cash_receipt_api_key: str = "change-me"

    admin_2fa_enabled: bool = True
    admin_2fa_issuer: str = "adultapp"
    admin_ip_allowlist: str = "127.0.0.1,10.0.0.0/8"
    dual_approval_enabled: bool = True
    audit_log_hash_chain: bool = True

    uploads_dir: str = "./uploads"
    media_base_url: str = "http://localhost:8000/media"
    media_public_root: str = "assets/store"
    password_reset_delivery_mode: str = "file"
    password_reset_sender_email: str = "noreply@example.com"
    password_reset_sender_sms: str = "07000000000"
    password_reset_outbox_dir: str = "./outbox/password-reset"
    alembic_config_path: str = "./alembic.ini"
    mobile_web_fallback_url: str = "https://m.example.com/safe"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
