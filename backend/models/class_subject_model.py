from database.db import Base, engine
from models.class_model import Class
from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import Session
from utils.hash import ph


class ClassSubject(Base):
    __tablename__ = "class_subject"
    class_subject_id = Column(Integer, primary_key=True, autoincrement=True)
    class_id = Column(Integer, ForeignKey("class.class_id"))
    subject_id = Column(Integer, ForeignKey("subject.subject_id"))
    teacher_id = Column(Integer, ForeignKey("user.user_id"))

    @classmethod
    def get_by_class_id(cls, class_id):
        with Session(engine) as session:
            class_subjects = session.query(cls).filter_by(class_id=class_id).all()
            return class_subjects

    @classmethod
    def get_by_class_and_subject_id(cls, class_id, subject_id):
        with Session(engine) as session:
            class_subjects = (
                session.query(cls)
                .filter_by(class_id=class_id, subject_id=subject_id)
                .first()
            )
            return class_subjects

    @classmethod
    def subjects_for_teacher(cls, teacher_id, class_id):
        with Session(engine) as session:
            teacher_subjects = (
                session.query(cls)
                .filter_by(teacher_id=teacher_id, class_id=class_id)
                .all()
            )
            return teacher_subjects

    @classmethod
    def get_class_list_from_teacherid(cls, teacher_id):
        with Session(engine) as session:
            teacher_classes = (
                session.query(Class.name, Class.class_id)
                .join(cls, cls.class_id == Class.class_id)
                .filter(cls.teacher_id == teacher_id)
                .distinct(Class.name)
                .all()
            )
            return teacher_classes
