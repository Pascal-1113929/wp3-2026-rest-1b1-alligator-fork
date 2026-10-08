from datetime import datetime

from database.db import Base, engine
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Session as Connection


class Session(Base):
    __tablename__ = "session"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("user.user_id"))
    ip = Column(String)
    last_activity = Column(DateTime)
    first_activity = Column(DateTime)
    useragent = Column(String)

    @classmethod
    def create(cls, user_id, ip, useragent):
        session_data = cls(
            user_id=user_id,
            ip=ip,
            last_activity=datetime.now(),
            first_activity=datetime.now(),
            useragent=useragent,
        )

        with Connection(engine) as conn:
            conn.add(session_data)
            conn.commit()
            conn.refresh(session_data)
        return session_data

    @classmethod
    def get_by_id(cls, session_id):
        with Connection(engine) as conn:
            session_data = conn.query(cls).filter_by(id=session_id).first()
            return session_data

    @classmethod
    def get_by_user_id(cls, user_id):
        with Connection(engine) as conn:
            session_data = conn.query(cls).filter_by(user_id=user_id).all()
            return session_data

    @classmethod
    def remove_session_id(cls, session_id, user_id):
        with Connection(engine) as conn:
            session_data = (
                conn.query(cls).filter_by(id=session_id, user_id=user_id).first()
            )
            if session_data:
                conn.delete(session_data)
                conn.commit()
            return session_data

    @classmethod
    def update_active(cls, session_id):
        with Connection(engine) as conn:
            session_data = conn.query(cls).filter_by(id=session_id).first()
            if session_data:
                session_data.last_activity = datetime.now()
                conn.commit()
            return session_data
