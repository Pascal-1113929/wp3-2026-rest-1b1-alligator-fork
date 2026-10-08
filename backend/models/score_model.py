from sqlalchemy import Column, Integer, ForeignKey, Float, func
from sqlalchemy.orm import Session
from database.db import Base, engine


class Score(Base):
    __tablename__ = "score"

    score_id = Column(Integer, primary_key=True, autoincrement=True)
    snapshot_id = Column(Integer, ForeignKey("snapshot.snapshot_id"))
    taxonomy_level_id = Column(Integer, ForeignKey("taxonomy_level.taxonomy_level_id"))

    kennen = Column(Float)
    kunnen = Column(Float)
    confidence = Column(Float)

    @classmethod
    def get_by_snapshot_id(cls, snapshot_id):
        with Session(engine) as session:
            scores = session.query(cls).filter_by(snapshot_id=snapshot_id).all()
            return scores

    @classmethod
    def average_kennen(cls, snapshot_id):
        with Session(engine) as session:
            avg_kennen = session.query(func.avg(cls.kennen), 2).filter_by(snapshot_id=snapshot_id).scalar()
            return avg_kennen
