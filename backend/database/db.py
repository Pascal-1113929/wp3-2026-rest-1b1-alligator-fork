from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base

import os

db_path = os.path.join(os.path.dirname(__file__), "database.db")
engine = create_engine(f"sqlite:///{db_path}")
Base = declarative_base()
Base.metadata.create_all(engine)
