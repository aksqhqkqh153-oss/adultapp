"""minor access block and age verification log

Revision ID: 20260429_0002
Revises: 20260408_0001
Create Date: 2026-04-29
"""
from alembic import op
import sqlalchemy as sa


revision = "20260429_0002"
down_revision = "20260408_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "minoraccessblock",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("subject_hash", sa.String(length=128), nullable=False, unique=True, index=True),
        sa.Column("phone_hash", sa.String(length=128), nullable=True, index=True),
        sa.Column("ip_hash", sa.String(length=128), nullable=True, index=True),
        sa.Column("provider", sa.String(length=30), nullable=False, server_default="PASS", index=True),
        sa.Column("result_code", sa.String(length=30), nullable=False, server_default="UNDERAGE", index=True),
        sa.Column("reason", sa.String(length=100), nullable=False, server_default="UNDERAGE"),
        sa.Column("blocked_until", sa.DateTime(), nullable=False, index=True),
        sa.Column("attempt_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("last_attempt_at", sa.DateTime(), nullable=False, index=True),
        sa.Column("review_status", sa.String(length=30), nullable=False, server_default="active", index=True),
        sa.Column("review_note", sa.String(), nullable=True),
        sa.Column("released_at", sa.DateTime(), nullable=True),
        sa.Column("released_by_id", sa.Integer(), nullable=True, index=True),
        sa.Column("release_reason", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, index=True),
        sa.Column("deleted_at", sa.DateTime(), nullable=True, index=True),
    )
    op.create_table(
        "ageverificationlog",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=True, index=True),
        sa.Column("subject_hash", sa.String(length=128), nullable=True, index=True),
        sa.Column("phone_hash", sa.String(length=128), nullable=True, index=True),
        sa.Column("ip_hash", sa.String(length=128), nullable=True, index=True),
        sa.Column("provider", sa.String(length=30), nullable=False, server_default="PASS", index=True),
        sa.Column("result", sa.String(length=30), nullable=False, server_default="VERIFY_FAILED", index=True),
        sa.Column("reason", sa.String(length=100), nullable=False, server_default="VERIFY_FAILED"),
        sa.Column("flow", sa.String(length=30), nullable=False, server_default="signup", index=True),
        sa.Column("tx_id_hash", sa.String(length=128), nullable=True, index=True),
        sa.Column("user_agent", sa.String(), nullable=True),
        sa.Column("retry_limited_until", sa.DateTime(), nullable=True),
        sa.Column("purge_after", sa.DateTime(), nullable=False, index=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, index=True),
        sa.Column("deleted_at", sa.DateTime(), nullable=True, index=True),
    )


def downgrade() -> None:
    op.drop_table("ageverificationlog")
    op.drop_table("minoraccessblock")
