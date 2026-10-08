from database.db import Base, engine
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import Session
from utils.hash import ph


class Keyword(Base):
    __tablename__ = "keyword"

    keyword_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)

    learning_goal_id = Column(String, ForeignKey("learning_goal.learning_goal_id"))

    @classmethod
    def learninggoal_keywords(cls, learning_goal_id):
        with Session(engine) as session:
            keywords = session.query(cls).filter_by(learning_goal_id=learning_goal_id).all()
            return keywords

    @classmethod
    def get_by_learning_goal_id(cls, learning_goal_id):
        with Session(engine) as session:
            keywords = session.query(cls).filter_by(learning_goal_id=learning_goal_id).all()
            return keywords
