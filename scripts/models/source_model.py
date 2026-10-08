from sqlalchemy import Column, Integer, String
from database.db import Base, engine


class Source(Base):
    __tablename__ = "source"

    source_id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String)
    external_id = Column(String)

    @classmethod
    def insert(cls, session, source_id, type, external_id):
        new_source = cls(source_id=source_id, type=type, external_id=external_id)

        session.add(new_source)

        return new_source
