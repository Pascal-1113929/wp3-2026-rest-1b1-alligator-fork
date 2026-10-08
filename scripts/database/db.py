import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base

db_path = os.path.join(
    os.path.dirname(__file__), "..", "..", "backend", "database", "database.db"
)

if os.path.exists(db_path):
    os.remove(db_path)

engine = create_engine(f"sqlite:///{db_path}")
Base = declarative_base()
Base.metadata.create_all(engine)
