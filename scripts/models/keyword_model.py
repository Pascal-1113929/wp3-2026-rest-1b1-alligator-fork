from sqlalchemy import Column, Integer, String, ForeignKey
from database.db import Base, engine


class Keyword(Base):
    __tablename__ = "keyword"

    keyword_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)

    learning_goal_id = Column(String, ForeignKey("learning_goal.learning_goal_id"))

    @classmethod
    def insert(cls, session, name, learning_goal_id):
        new_keyword = cls(name=name, learning_goal_id=learning_goal_id)

        session.add(new_keyword)
        return new_keyword
