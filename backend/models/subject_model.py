from database.db import Base, engine
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session
from utils.hash import ph


class Subject(Base):
    __tablename__ = "subject"

    subject_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)

    @classmethod
    def get_by_id(cls, subject_id):
        with Session(engine) as session:
            subject = session.query(cls).filter_by(subject_id=subject_id).first()
            return subject
