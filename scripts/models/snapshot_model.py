from sqlalchemy import Column, Integer, String, ForeignKey
from database.db import Base, engine


class Snapshot(Base):
    __tablename__ = "snapshot"

    snapshot_id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String)

    student_id = Column(Integer, ForeignKey("user.user_id"))
    learning_goal_id = Column(String, ForeignKey("learning_goal.learning_goal_id"))
    source_id = Column(Integer, ForeignKey("source.source_id"))

    @classmethod
    def insert(
        cls,
        session,
        snapshot_id,
        date,
        student_id,
        learning_goal_id,
        source_id,
    ):
        new_snapshot = cls(
            snapshot_id=snapshot_id,
            date=date,
            student_id=student_id,
            learning_goal_id=learning_goal_id,
            source_id=source_id,
        )

        session.add(new_snapshot)

        return new_snapshot
