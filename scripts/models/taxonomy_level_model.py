from sqlalchemy import Column, Integer, String
from database.db import Base, engine


class TaxonomyLevel(Base):
    __tablename__ = "taxonomy_level"

    taxonomy_level_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)

    @classmethod
    def insert(cls, session, name):
        new_taxonomy_level = cls(name=name)

        session.add(new_taxonomy_level)

        return new_taxonomy_level
