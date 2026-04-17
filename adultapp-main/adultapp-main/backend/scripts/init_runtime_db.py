from sqlmodel import Session

from app.database import create_db_and_tables, engine
from app.seed_db import seed_database


if __name__ == "__main__":
    create_db_and_tables()
    with Session(engine) as session:
        seed_database(session)
    print("db-init-ok")
