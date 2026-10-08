from sqlalchemy import Column, Integer, String
from database.db import Base, engine


class Class(Base):
    __tablename__ = "class"
    class_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)

    @classmethod
    def insert(cls, session, name):
        new_class = cls(name=name)

        session.add(new_class)
        return new_class
