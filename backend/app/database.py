from __future__ import annotations

from pathlib import Path
import sqlite3
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

from sqlalchemy import create_engine as sa_create_engine, inspect, text
from sqlalchemy.schema import CreateColumn
from sqlmodel import SQLModel, Session

from .config import settings


def _normalize_database_url(raw: str) -> str:
    url = (raw or '').strip()
    if not url:
        return 'sqlite:///./adult_platform.db'
    if url.startswith('postgres://'):
        url = 'postgresql://' + url[len('postgres://'): ]
    if url.startswith('postgresql+psycopg2://'):
        url = 'postgresql://' + url[len('postgresql+psycopg2://'): ]
    if url.startswith('postgresql://'):
        parts = urlsplit(url)
        query = dict(parse_qsl(parts.query, keep_blank_values=True))
        query.setdefault('connect_timeout', str(max(settings.postgres_connect_timeout_seconds, 1)))
        query.setdefault('sslmode', 'require')
        return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))
    return url


DATABASE_URL = _normalize_database_url(settings.database_url)
IS_SQLITE = DATABASE_URL.startswith('sqlite')
connect_args = {'check_same_thread': False} if IS_SQLITE else {}
engine = sa_create_engine(
    DATABASE_URL,
    echo=False,
    connect_args=connect_args,
    pool_pre_ping=not IS_SQLITE,
    pool_recycle=300 if not IS_SQLITE else -1,
)

if settings.app_env.lower() in {'production', 'staging'} and IS_SQLITE:
    raise RuntimeError('SQLite is restricted to local development only. Set DATABASE_URL to PostgreSQL for staging/production.')


SQLITE_MIGRATIONS =  {
    "user": [
        ("password_changed_at", "ALTER TABLE user ADD COLUMN password_changed_at DATETIME"),
        ("reset_required", "ALTER TABLE user ADD COLUMN reset_required BOOLEAN DEFAULT 0"),
        ("gender", "ALTER TABLE user ADD COLUMN gender VARCHAR"),
        ("age_band", "ALTER TABLE user ADD COLUMN age_band VARCHAR"),
        ("region_code", "ALTER TABLE user ADD COLUMN region_code VARCHAR"),
        ("latitude", "ALTER TABLE user ADD COLUMN latitude FLOAT"),
        ("longitude", "ALTER TABLE user ADD COLUMN longitude FLOAT"),
        ("false_report_count", "ALTER TABLE user ADD COLUMN false_report_count INTEGER DEFAULT 0"),
        ("false_report_score", "ALTER TABLE user ADD COLUMN false_report_score INTEGER DEFAULT 0"),
        ("random_chat_cooldown_until", "ALTER TABLE user ADD COLUMN random_chat_cooldown_until DATETIME"),
        ("identity_verified", "ALTER TABLE user ADD COLUMN identity_verified BOOLEAN DEFAULT 0"),
        ("login_provider", "ALTER TABLE user ADD COLUMN login_provider VARCHAR"),
        ("identity_verification_method", "ALTER TABLE user ADD COLUMN identity_verification_method VARCHAR"),
        ("identity_verification_token", "ALTER TABLE user ADD COLUMN identity_verification_token VARCHAR"),
        ("identity_verified_at", "ALTER TABLE user ADD COLUMN identity_verified_at DATETIME"),
        ("adult_verified_at", "ALTER TABLE user ADD COLUMN adult_verified_at DATETIME"),
        ("adult_verification_status", "ALTER TABLE user ADD COLUMN adult_verification_status VARCHAR DEFAULT 'pending'"),
        ("adult_verification_provider", "ALTER TABLE user ADD COLUMN adult_verification_provider VARCHAR"),
        ("adult_verification_tx_id", "ALTER TABLE user ADD COLUMN adult_verification_tx_id VARCHAR"),
        ("adult_verification_fail_count", "ALTER TABLE user ADD COLUMN adult_verification_fail_count INTEGER DEFAULT 0"),
        ("adult_verification_locked_until", "ALTER TABLE user ADD COLUMN adult_verification_locked_until DATETIME"),
    ],
    "randomchatrule": [
        ("age_match_mode", "ALTER TABLE randomchatrule ADD COLUMN age_match_mode VARCHAR DEFAULT 'exact_then_adjacent'"),
        ("adjacent_age_pairs", "ALTER TABLE randomchatrule ADD COLUMN adjacent_age_pairs VARCHAR DEFAULT '30대:40대,40대:30대'"),
        ("max_distance_km", "ALTER TABLE randomchatrule ADD COLUMN max_distance_km INTEGER DEFAULT 600"),
        ("distance_slider_steps", "ALTER TABLE randomchatrule ADD COLUMN distance_slider_steps VARCHAR DEFAULT '0-20:1,20-100:5,100-600:20'"),
        ("distance_score_mode", "ALTER TABLE randomchatrule ADD COLUMN distance_score_mode VARCHAR DEFAULT 'band_bonus'"),
        ("unblock_roles", "ALTER TABLE randomchatrule ADD COLUMN unblock_roles VARCHAR DEFAULT 'user,admin'"),
        ("unblock_log_mode", "ALTER TABLE randomchatrule ADD COLUMN unblock_log_mode VARCHAR DEFAULT 'always_admin_log'"),
        ("delete_display_mode", "ALTER TABLE randomchatrule ADD COLUMN delete_display_mode VARCHAR DEFAULT 'masked_deleted_label_admin_archive'"),
        ("admin_restore_only", "ALTER TABLE randomchatrule ADD COLUMN admin_restore_only BOOLEAN DEFAULT 1"),
        ("admin_review_sla_hours", "ALTER TABLE randomchatrule ADD COLUMN admin_review_sla_hours INTEGER DEFAULT 48"),
        ("report_manage_layout", "ALTER TABLE randomchatrule ADD COLUMN report_manage_layout VARCHAR DEFAULT 'filter,count,user_id,report_history,last_reported_at'"),
        ("permanent_ban_mode", "ALTER TABLE randomchatrule ADD COLUMN permanent_ban_mode VARCHAR DEFAULT 'admin_decision_by_report_history'"),
        ("permanent_ban_keep_threads", "ALTER TABLE randomchatrule ADD COLUMN permanent_ban_keep_threads BOOLEAN DEFAULT 1"),
        ("report_score_label", "ALTER TABLE randomchatrule ADD COLUMN report_score_label VARCHAR DEFAULT '점'"),
        ("report_score_weights", "ALTER TABLE randomchatrule ADD COLUMN report_score_weights VARCHAR DEFAULT '욕설:1,스팸:1,개인정보요구:2,음란물전송:3,불법권유:3,기타:1'"),
        ("permanent_ban_thread_access", "ALTER TABLE randomchatrule ADD COLUMN permanent_ban_thread_access VARCHAR DEFAULT 'read_only_profile_limited_attachment_block_reconnect_block'"),
        ("region_display_mode", "ALTER TABLE randomchatrule ADD COLUMN region_display_mode VARCHAR DEFAULT 'city_alias_standard'"),
        ("websocket_scale_policy", "ALTER TABLE randomchatrule ADD COLUMN websocket_scale_policy VARCHAR DEFAULT 'railway_only_until_single_instance_limit_then_redis'"),
        ("duplicate_report_policy", "ALTER TABLE randomchatrule ADD COLUMN duplicate_report_policy VARCHAR DEFAULT 'same_target_once'"),
        ("report_auto_block_mode", "ALTER TABLE randomchatrule ADD COLUMN report_auto_block_mode VARCHAR DEFAULT 'immediate_reporter_block'"),
        ("false_report_policy", "ALTER TABLE randomchatrule ADD COLUMN false_report_policy VARCHAR DEFAULT '3:warn,5:3d,8:7d,15:admin_review'"),
        ("random_chat_only_sanction_enabled", "ALTER TABLE randomchatrule ADD COLUMN random_chat_only_sanction_enabled BOOLEAN DEFAULT 1"),
        ("random_chat_only_sanction_policy", "ALTER TABLE randomchatrule ADD COLUMN random_chat_only_sanction_policy VARCHAR DEFAULT '3:24h,5:72h,8:7d,15:admin_review'"),
        ("permanent_ban_rejoin_after_days", "ALTER TABLE randomchatrule ADD COLUMN permanent_ban_rejoin_after_days INTEGER DEFAULT 365"),
        ("report_result_notice_mode", "ALTER TABLE randomchatrule ADD COLUMN report_result_notice_mode VARCHAR DEFAULT 'silent'"),
        ("blocked_thread_visibility", "ALTER TABLE randomchatrule ADD COLUMN blocked_thread_visibility VARCHAR DEFAULT 'hard_hidden'"),
        ("unblock_rematch_mode", "ALTER TABLE randomchatrule ADD COLUMN unblock_rematch_mode VARCHAR DEFAULT 'immediate'"),
        ("match_retry_limit", "ALTER TABLE randomchatrule ADD COLUMN match_retry_limit INTEGER DEFAULT 4"),
        ("match_search_timeout_seconds", "ALTER TABLE randomchatrule ADD COLUMN match_search_timeout_seconds INTEGER DEFAULT 300"),
        ("contact_exchange_detection_mode", "ALTER TABLE randomchatrule ADD COLUMN contact_exchange_detection_mode VARCHAR DEFAULT 'terms_only'"),
        ("contact_exchange_warning_mode", "ALTER TABLE randomchatrule ADD COLUMN contact_exchange_warning_mode VARCHAR DEFAULT 'none'"),
        ("media_message_mode", "ALTER TABLE randomchatrule ADD COLUMN media_message_mode VARCHAR DEFAULT 'text_only'"),
        ("thread_view_audit_enabled", "ALTER TABLE randomchatrule ADD COLUMN thread_view_audit_enabled BOOLEAN DEFAULT 1"),
        ("self_message_delete_window_minutes", "ALTER TABLE randomchatrule ADD COLUMN self_message_delete_window_minutes INTEGER DEFAULT 30"),
        ("message_delete_scope", "ALTER TABLE randomchatrule ADD COLUMN message_delete_scope VARCHAR DEFAULT 'delete_for_both_masked_archive'"),
        ("male_rematch_min_seconds", "ALTER TABLE randomchatrule ADD COLUMN male_rematch_min_seconds INTEGER DEFAULT 20"),
        ("male_rematch_max_seconds", "ALTER TABLE randomchatrule ADD COLUMN male_rematch_max_seconds INTEGER DEFAULT 40"),
        ("female_rematch_min_seconds", "ALTER TABLE randomchatrule ADD COLUMN female_rematch_min_seconds INTEGER DEFAULT 5"),
        ("female_rematch_max_seconds", "ALTER TABLE randomchatrule ADD COLUMN female_rematch_max_seconds INTEGER DEFAULT 10"),
    ],
    "refreshtoken": [
        ("session_id", "ALTER TABLE refreshtoken ADD COLUMN session_id INTEGER"),
    ],
    "loginchallenge": [
        ("device_session_id", "ALTER TABLE loginchallenge ADD COLUMN device_session_id INTEGER"),
    ],
    "product": [
        ("description", "ALTER TABLE product ADD COLUMN description VARCHAR"),
        ("price", "ALTER TABLE product ADD COLUMN price INTEGER DEFAULT 0"),
        ("stock_qty", "ALTER TABLE product ADD COLUMN stock_qty INTEGER DEFAULT 0"),
        ("thumbnail_url", "ALTER TABLE product ADD COLUMN thumbnail_url VARCHAR"),
        ("status", "ALTER TABLE product ADD COLUMN status VARCHAR DEFAULT 'draft'"),
        ("created_at", "ALTER TABLE product ADD COLUMN created_at DATETIME"),
        ("updated_at", "ALTER TABLE product ADD COLUMN updated_at DATETIME"),
    ],
    "directmessage": [
        ("original_message_backup", "ALTER TABLE directmessage ADD COLUMN original_message_backup VARCHAR"),
        ("is_deleted_for_all", "ALTER TABLE directmessage ADD COLUMN is_deleted_for_all BOOLEAN DEFAULT 0"),
        ("deleted_by_id", "ALTER TABLE directmessage ADD COLUMN deleted_by_id INTEGER"),
        ("deleted_at", "ALTER TABLE directmessage ADD COLUMN deleted_at DATETIME"),
    ],
    "adminactionlog": [
        ("chain_prev_hash", "ALTER TABLE adminactionlog ADD COLUMN chain_prev_hash VARCHAR"),
        ("chain_hash", "ALTER TABLE adminactionlog ADD COLUMN chain_hash VARCHAR"),
    ],
}


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)
    run_migrations()


def _sync_table_columns() -> None:
    inspector = inspect(engine)
    with engine.begin() as conn:
        for table in SQLModel.metadata.sorted_tables:
            try:
                existing_columns = {col["name"] for col in inspector.get_columns(table.name)}
            except Exception:
                continue
            for column in table.columns:
                if column.name in existing_columns:
                    continue
                compiled = CreateColumn(column).compile(dialect=engine.dialect)
                column_sql = str(compiled).strip()
                if not column_sql:
                    continue
                conn.execute(text(f'ALTER TABLE "{table.name}" ADD COLUMN {column_sql}'))


def run_migrations() -> None:
    Path(settings.uploads_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.password_reset_outbox_dir).mkdir(parents=True, exist_ok=True)

    if IS_SQLITE:
        db_path = engine.url.database
        if db_path:
            conn = sqlite3.connect(db_path)
            try:
                cur = conn.cursor()
                table_rows = cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
                existing_tables = {row[0] for row in table_rows}
                for table_name, alters in SQLITE_MIGRATIONS.items():
                    if table_name not in existing_tables:
                        continue
                    columns = {row[1] for row in cur.execute(f"PRAGMA table_info('{table_name}')").fetchall()}
                    for column_name, sql in alters:
                        if column_name not in columns:
                            cur.execute(sql)
                conn.commit()
            finally:
                conn.close()

    _sync_table_columns()
    Path(settings.uploads_dir).mkdir(parents=True, exist_ok=True)


def get_session():
    with Session(engine) as session:
        yield session
