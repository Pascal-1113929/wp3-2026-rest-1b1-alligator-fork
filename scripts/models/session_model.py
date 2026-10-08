from database.db import Base, engine
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String


class Session(Base):
    __tablename__ = "session"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("user.user_id"))
    ip = Column(String)
    last_activity = Column(DateTime)
    first_activity = Column(DateTime)
    useragent = Column(String)
