from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session
from database.db import Base, engine


class TaxonomyLevel(Base):
    __tablename__ = "taxonomy_level"

    taxonomy_level_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)

    @classmethod
    def get_taxonomy_level(cls, taxonomy_level_id):
        with Session(engine) as session:
            taxonomy_level = session.query(cls).filter_by(taxonomy_level_id=taxonomy_level_id).first()
            return taxonomy_level
