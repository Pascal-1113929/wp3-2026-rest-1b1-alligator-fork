from sqlalchemy import Column, Integer, String
from database.db import Base, engine


class Role(Base):
    __tablename__ = "role"
    role_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)

    @classmethod
    def insert(cls, session, name):
        new_role = cls(name=name)

        session.add(new_role)

        return new_role
