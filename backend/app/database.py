from __future__ import annotations

from pathlib import Path

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
    with engine.begin() as conn:
        inspector = inspect(conn)
        existing_tables = set(inspector.get_table_names())
        for table_name, alters in SQLITE_MIGRATIONS.items():
            if table_name not in existing_tables:
                continue
            columns = {col["name"] for col in inspector.get_columns(table_name)}
            for column_name, sql in alters:
                if column_name not in columns:
                    conn.execute(text(sql))
        # ensure files directory exists for uploads/local media
        Path(settings.uploads_dir).mkdir(parents=True, exist_ok=True)


def get_session():
    with Session(engine) as session:
        yield session
