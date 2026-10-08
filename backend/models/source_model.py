from database.db import Base, engine
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session
from utils.hash import ph


class Source(Base):
    __tablename__ = "source"

    source_id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String)
    external_id = Column(String)

    @classmethod
    def get_source(cls, source_id):
        with Session(engine) as session:
            sources = session.query(cls).filter_by(source_id=source_id).all()
            return sources
