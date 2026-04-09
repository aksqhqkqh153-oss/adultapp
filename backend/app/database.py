from __future__ import annotations

from pathlib import Path
import sqlite3

from sqlalchemy import inspect, text
from sqlmodel import SQLModel, Session, create_engine

from .config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, echo=False, connect_args=connect_args)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)
    run_migrations()


SQLITE_MIGRATIONS = {
    "user": [
        ("password_changed_at", "ALTER TABLE user ADD COLUMN password_changed_at DATETIME"),
        ("reset_required", "ALTER TABLE user ADD COLUMN reset_required BOOLEAN DEFAULT 0"),
        ("gender", "ALTER TABLE user ADD COLUMN gender VARCHAR"),
        ("age_band", "ALTER TABLE user ADD COLUMN age_band VARCHAR"),
        ("region_code", "ALTER TABLE user ADD COLUMN region_code VARCHAR"),
        ("latitude", "ALTER TABLE user ADD COLUMN latitude FLOAT"),
        ("longitude", "ALTER TABLE user ADD COLUMN longitude FLOAT"),
    ],
    "randomchatrule": [
        ("age_match_mode", "ALTER TABLE randomchatrule ADD COLUMN age_match_mode VARCHAR DEFAULT 'exact_then_adjacent'"),
        ("max_distance_km", "ALTER TABLE randomchatrule ADD COLUMN max_distance_km INTEGER DEFAULT 600"),
        ("distance_slider_steps", "ALTER TABLE randomchatrule ADD COLUMN distance_slider_steps VARCHAR DEFAULT '0-20:1,20-100:5,100-600:20'"),
        ("unblock_roles", "ALTER TABLE randomchatrule ADD COLUMN unblock_roles VARCHAR DEFAULT 'user,admin'"),
        ("delete_display_mode", "ALTER TABLE randomchatrule ADD COLUMN delete_display_mode VARCHAR DEFAULT 'hard_deleted_label_admin_raw'"),
        ("admin_review_sla_hours", "ALTER TABLE randomchatrule ADD COLUMN admin_review_sla_hours INTEGER DEFAULT 48"),
        ("report_manage_layout", "ALTER TABLE randomchatrule ADD COLUMN report_manage_layout VARCHAR DEFAULT 'filter,count,user_id,report_history,last_reported_at'"),
        ("permanent_ban_mode", "ALTER TABLE randomchatrule ADD COLUMN permanent_ban_mode VARCHAR DEFAULT 'admin_decision_by_report_history'"),
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
    "adminactionlog": [
        ("chain_prev_hash", "ALTER TABLE adminactionlog ADD COLUMN chain_prev_hash VARCHAR"),
        ("chain_hash", "ALTER TABLE adminactionlog ADD COLUMN chain_hash VARCHAR"),
    ],
}


def run_migrations() -> None:
    Path(settings.uploads_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.password_reset_outbox_dir).mkdir(parents=True, exist_ok=True)
    if not settings.database_url.startswith("sqlite"):
        return

    db_path = engine.url.database
    if not db_path:
        return

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

    Path(settings.uploads_dir).mkdir(parents=True, exist_ok=True)


def get_session():
    with Session(engine) as session:
        yield session
