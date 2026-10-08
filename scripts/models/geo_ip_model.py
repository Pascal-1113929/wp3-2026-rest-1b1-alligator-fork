from database.db import Base, engine
from sqlalchemy import Column, Integer, String


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
    def insert(
        cls, session, ip_from, ip_to, country_code, country_name, region_name, city_name
    ):
        new_geoip = cls(
            ip_from=ip_from,
            ip_to=ip_to,
            country_code=country_code,
            country_name=country_name,
            region_name=region_name,
            city_name=city_name,
        )

        session.add(new_geoip)

        return new_geoip
