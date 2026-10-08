from database.db import Base, engine
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import Session
from utils.hash import ph


class User(Base):
    __tablename__ = "user"
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String)
    password = Column(String)
    name = Column(String)
    role_id = Column(Integer, ForeignKey("role.role_id"))
    class_id = Column(Integer, ForeignKey("class.class_id"), nullable=True)

    @classmethod
    def register(
        cls,
        email,
        password,
        name,
        role_id,
        class_id=None,
    ):
        new_user = cls(
            email=email,
            password=ph.hash(password),
            name=name,
            role_id=role_id,
            class_id=class_id,
        )

        with Session(engine) as session:
            session.add(new_user)
            session.commit()
            session.refresh(new_user)
        return new_user

    @classmethod
    def login(cls, email, password):
        email = email.strip().lower()
        with Session(engine) as session:
            user = session.query(cls).filter_by(email=email).first()

            if user:
                try:
                    if ph.verify(user.password, password):
                        return user
                except Exception:
                    return None
            return None

    @classmethod
    def get_by_id(cls, user_id):
        with Session(engine) as session:
            user = session.query(cls).filter_by(user_id=user_id).first()
            return user

    @classmethod
    def get_students_by_class_id(cls, class_id, role_id):
        with Session(engine) as session:
            users = (
                session.query(cls).filter_by(class_id=class_id, role_id=role_id).all()
            )
            return users
