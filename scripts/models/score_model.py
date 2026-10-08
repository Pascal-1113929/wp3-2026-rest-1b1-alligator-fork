from sqlalchemy import Column, Integer, ForeignKey, Float
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
    def insert(
        cls,
        session,
        snapshot_id,
        taxonomy_level_id,
        kennen,
        kunnen,
        confidence,
    ):
        new_score = cls(
            snapshot_id=snapshot_id,
            taxonomy_level_id=taxonomy_level_id,
            kennen=kennen,
            kunnen=kunnen,
            confidence=confidence,
        )

        session.add(new_score)

        return new_score
