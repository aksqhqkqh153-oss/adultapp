from sqlmodel import Session, select
from backend.app.database import engine, create_db_and_tables
from backend.app.models import User
from backend.app.auth import utcnow
from backend.app.config import settings
from datetime import timedelta


def main():
    create_db_and_tables()
    threshold = utcnow() - timedelta(days=settings.minor_block_retention_days)
    purged = 0
    with Session(engine) as session:
        users = session.exec(select(User).where(User.member_status.in_(["minor_blocked", "blocked_minor", "login_blocked_minor"]))).all()
        for user in users:
            pivot = user.identity_verified_at or user.adult_verified_at or user.last_login_at
            if pivot and pivot > threshold:
                continue
            user.email = f"minor-blocked-{user.id}@purged.local"
            user.name = "미성년 차단 계정(파기 처리)"
            user.password_hash = ""
            user.login_provider = None
            user.identity_verification_method = None
            user.identity_verification_token = None
            user.identity_verified = False
            user.adult_verified = False
            user.gender = None
            user.age_band = None
            user.region_code = None
            user.latitude = None
            user.longitude = None
            user.member_status = "minor_blocked_purged"
            user.reset_required = True
            session.add(user)
            purged += 1
        session.commit()
    print({"ok": True, "purged": purged, "retention_days": settings.minor_block_retention_days})


if __name__ == "__main__":
    main()
