from sqlalchemy import Column, Integer, ForeignKey
from database.db import Base, engine


class ClassSubject(Base):
    __tablename__ = "class_subject"
    class_subject_id = Column(Integer, primary_key=True, autoincrement=True)
    class_id = Column(Integer, ForeignKey("class.class_id"))
    subject_id = Column(Integer, ForeignKey("subject.subject_id"))
    teacher_id = Column(Integer, ForeignKey("user.user_id"))

    @classmethod
    def insert(cls, session, class_id, subject_id, teacher_id):
        # HACK: workaround for duplicate entries, need to update import_db.py but its fine for now.
        existing = (
            session.query(cls)
            .filter_by(class_id=class_id, subject_id=subject_id)
            .first()
        )

        if existing:
            existing.teacher_id = teacher_id
            return existing

        new_class_subject = cls(
            class_id=class_id, subject_id=subject_id, teacher_id=teacher_id
        )

        session.add(new_class_subject)
        return new_class_subject
