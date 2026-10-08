from database.db import Base, engine
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import Session
from utils.hash import ph


class Snapshot(Base):
    __tablename__ = "snapshot"

    snapshot_id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String)

    student_id = Column(Integer, ForeignKey("user.user_id"))
    learning_goal_id = Column(String, ForeignKey("learning_goal.learning_goal_id"))
    source_id = Column(Integer, ForeignKey("source.source_id"))

    @classmethod
    def snapshot_by_ids(cls, student_id, learning_goal_id):
        with Session(engine) as session:
            snapshots = session.query(cls).filter_by(
                student_id=student_id, learning_goal_id=learning_goal_id
            )
            return snapshots

    @classmethod
    def get_by_lg_and_student_id(cls, learning_goal_id, student_id):
        with Session(engine) as session:
            snapshots = (
                session.query(cls)
                .filter_by(learning_goal_id=learning_goal_id, student_id=student_id)
                .all()
            )
            return snapshots

    @classmethod
    def get_by_learning_goal_id(cls, learning_goal_id):
        with Session(engine) as session:
            snapshots = (
                session.query(cls).filter_by(learning_goal_id=learning_goal_id).all()
            )
            return snapshots

    @classmethod
    def get_by_lg(cls, learning_goal_id):
        with Session(engine) as session:
            snapshots = session.query(cls).filter_by(learning_goal_id=learning_goal_id).all()
            return snapshots
