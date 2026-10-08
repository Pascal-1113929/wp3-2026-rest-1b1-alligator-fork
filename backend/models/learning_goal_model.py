from database.db import Base, engine
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import Session
from utils.hash import ph


class LearningGoal(Base):
    __tablename__ = "learning_goal"

    learning_goal_id = Column(String, primary_key=True)
    title = Column(String)
    subject_id = Column(Integer, ForeignKey("subject.subject_id"))

    @classmethod
    def get_by_id(cls, id):
        with Session(engine) as session:
            learning_goals = session.query(cls).filter_by(learning_goal_id=id).first()
            return learning_goals

    @classmethod
    def get_by_subject_id(cls, subject_id):
        with Session(engine) as session:
            learning_goals = session.query(cls).filter_by(subject_id=subject_id).all()
            return learning_goals
