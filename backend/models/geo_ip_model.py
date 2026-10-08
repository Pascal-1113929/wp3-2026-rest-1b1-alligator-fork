from database.db import Base, engine
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session

NUM_BLOCK_ONE = 16777216
NUM_BLOCK_TWO = 65536
NUM_BLOCK_THREE = 256


class GeoIP(Base):
    __tablename__ = "geo_ip"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ip_from = Column(Integer, nullable=False, index=True)
    ip_to = Column(Integer, nullable=False, index=True)
    country_code = Column(String(2), nullable=False)
    country_name = Column(String(64), nullable=False)
    region_name = Column(String(128), nullable=False)
    city_name = Column(String(128), nullable=False)

    @classmethod
    def get_by_ip(cls, ip):
        w, x, y, z = list(map(int, ip.split(".")))
        ip_number = NUM_BLOCK_ONE * w + NUM_BLOCK_TWO * x + NUM_BLOCK_THREE * y + z

        with Session(engine) as session:
            ip_geo = (
                session.query(cls)
                .filter(cls.ip_from <= ip_number, cls.ip_to >= ip_number)
                .first()
            )
            return ip_geo
