from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Get absolute path to backend/amnesia.db
# __file__ gives us the path to this file (database.py), which is in backend/
db_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "amnesia.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_file}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
