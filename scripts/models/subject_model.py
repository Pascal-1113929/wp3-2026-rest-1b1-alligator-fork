from sqlalchemy import Column, Integer, String
from database.db import Base, engine


class Subject(Base):
    __tablename__ = "subject"

    subject_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)

    @classmethod
    def insert(cls, session, subject_id, name):
        new_subject = cls(subject_id=subject_id, name=name)

        session.add(new_subject)

        return new_subject
