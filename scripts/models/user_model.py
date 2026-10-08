from database.db import Base, engine
from sqlalchemy import Column, ForeignKey, Integer, String


class User(Base):
    __tablename__ = "user"
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String)
    password = Column(String)
    name = Column(String)
    role_id = Column(Integer, ForeignKey("role.role_id"))
    class_id = Column(Integer, ForeignKey("class.class_id"), nullable=True)

    @classmethod
    def insert(
        cls,
        session,
        user_id,
        email,
        password,
        name,
        role_id,
        class_id=None,
    ):
        new_user = cls(
            user_id=user_id,
            email=email,
            password=password,
            name=name,
            role_id=role_id,
            class_id=class_id,
        )

        session.add(new_user)

        return new_user
