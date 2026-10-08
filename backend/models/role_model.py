from database.db import Base, engine
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session
from utils.hash import ph


class Role(Base):
    __tablename__ = "role"
    role_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)

    @classmethod
    def get_by_id(cls, role_id):
        with Session(engine) as session:
            role = session.query(cls).filter_by(role_id=role_id).first()
            return role

    @classmethod
    def get_id_by_name(cls, name):
        with Session(engine) as session:
            role = session.query(cls).filter_by(name=name).first()
            return role.role_id
