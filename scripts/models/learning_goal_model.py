from sqlalchemy import Column, Integer, String, ForeignKey
from database.db import Base, engine


class LearningGoal(Base):
    __tablename__ = "learning_goal"

    learning_goal_id = Column(String, primary_key=True)
    title = Column(String)
    subject_id = Column(Integer, ForeignKey("subject.subject_id"))

    @classmethod
    def insert(cls, session, learning_goal_id, title, subject_id):
        new_learning_goal = cls(
            learning_goal_id=learning_goal_id, title=title, subject_id=subject_id
        )

        session.add(new_learning_goal)
        return new_learning_goal
