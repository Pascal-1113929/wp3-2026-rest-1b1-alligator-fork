from database.db import Base, engine
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import Session
from utils.hash import ph


class Class(Base):
    __tablename__ = "class"
    class_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)

    @classmethod
    def get_by_id(cls, class_id):
        with Session(engine) as session:
            db_class = session.query(cls).filter_by(class_id=class_id).first()
            return db_class
