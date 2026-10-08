from flask import Blueprint, abort, jsonify, request
from sqlalchemy.orm import Session
from database.db import engine
from models.class_model import Class
from models.class_subject_model import ClassSubject
from models.role_model import Role
from models.subject_model import Subject
from models.user_model import User
from models.snapshot_model import Snapshot
from models.score_model import Score
from models.taxonomy_level_model import TaxonomyLevel
from utils.auth import check_authentication
from utils.response import handle_preflight, response

dashboard_bp = Blueprint("dashboard", __name__)

SUBJECT_LIMIT = 5


@dashboard_bp.route("/stats", methods=["GET", "OPTIONS"])
def dashboard_stats():
    if request.method == "OPTIONS":
        return handle_preflight()

    user = check_authentication(request.headers.get("Authorization"))
    if not user:
        abort(401)

    db_user = User.get_by_id(user.user_id)
    role = Role.get_by_id(db_user.role_id)

    if role.name == "teacher":
        teacher_classes_data = ClassSubject.get_class_list_from_teacherid(
            db_user.user_id
        )

        teacher_classes = []
        for class_data in teacher_classes_data:
            class_obj = Class.get_by_id(class_data.class_id)
            if class_obj:
                teacher_classes.append(class_obj)

        total_students = 0
        student_role_id = Role.get_id_by_name("student")

        if student_role_id:
            for class_obj in teacher_classes:
                class_students = User.get_students_by_class_id(
                    class_obj.class_id, student_role_id
                )
                total_students += len(class_students) if class_students else 0

        teacher_subjects = []
        if teacher_classes:
            for class_obj in teacher_classes:
                class_subjects = ClassSubject.get_by_class_id(class_obj.class_id)
                if class_subjects:
                    for cs in class_subjects:
                        subject = Subject.get_by_id(cs.subject_id)
                        if subject and subject not in teacher_subjects:
                            teacher_subjects.append(subject)

        stats = {
            "totalSubjects": len(teacher_subjects),
            "totalStudents": total_students,
            "totalClasses": len(teacher_classes),
        }

    else:
        student_class = Class.get_by_id(db_user.class_id) if db_user.class_id else None

        student_subjects = []
        if student_class:
            class_subjects = ClassSubject.get_by_class_id(student_class.class_id)
            if class_subjects:
                for cs in class_subjects:
                    subject = Subject.get_by_id(cs.subject_id)
                    if subject:
                        student_subjects.append(subject)

        stats = {
            "totalSubjects": len(student_subjects),
            "totalStudents": 0,
            "totalClasses": 0,
        }

    return response(jsonify({"status": "ok", "stats": stats})), 200


@dashboard_bp.route("/subjects", methods=["GET", "OPTIONS"])
def dashboard_subjects():
    if request.method == "OPTIONS":
        return handle_preflight()

    user = check_authentication(request.headers.get("Authorization"))
    if not user:
        abort(401)

    db_user = User.get_by_id(user.user_id)
    role = Role.get_by_id(db_user.role_id)

    subjects_list = []

    if role.name == "teacher":
        teacher_classes_data = ClassSubject.get_class_list_from_teacherid(
            db_user.user_id
        )

        teacher_subjects = []
        for class_data in teacher_classes_data:
            class_obj = Class.get_by_id(class_data.class_id)
            if class_obj:
                class_subjects = ClassSubject.get_by_class_id(class_obj.class_id)
                if class_subjects:
                    for cs in class_subjects:
                        subject = Subject.get_by_id(cs.subject_id)
                        if subject and subject not in teacher_subjects:
                            teacher_subjects.append(subject)

        for subject in teacher_subjects:
            subjects_list.append(
                {"id": subject.subject_id, "name": subject.name, "type": "teacher"}
            )

    else:
        student_class = Class.get_by_id(db_user.class_id) if db_user.class_id else None

        if student_class:
            class_subjects = ClassSubject.get_by_class_id(student_class.class_id)
            if class_subjects:
                for cs in class_subjects:
                    subject = Subject.get_by_id(cs.subject_id)
                    if subject:
                        subjects_list.append(
                            {
                                "id": subject.subject_id,
                                "name": subject.name,
                                "type": "student",
                            }
                        )

    return response(jsonify({"status": "ok", "subjects": subjects_list})), 200


@dashboard_bp.route("/classes", methods=["GET", "OPTIONS"])
def dashboard_classes():
    if request.method == "OPTIONS":
        return handle_preflight()

    user = check_authentication(request.headers.get("Authorization"))
    if not user:
        abort(401)

    db_user = User.get_by_id(user.user_id)
    role = Role.get_by_id(db_user.role_id)

    classes_list = []

    if role.name == "teacher":
        teacher_classes_data = ClassSubject.get_class_list_from_teacherid(
            db_user.user_id
        )

        for class_data in teacher_classes_data:
            class_obj = Class.get_by_id(class_data.class_id)
            if class_obj:
                student_count = 0
                student_role_id = Role.get_id_by_name("student")
                if student_role_id:
                    class_students = User.get_students_by_class_id(
                        class_obj.class_id, student_role_id
                    )
                    student_count = len(class_students) if class_students else 0

                class_subjects = ClassSubject.get_by_class_id(class_obj.class_id)
                subject_names = []
                if class_subjects:
                    for cs in class_subjects:
                        subject = Subject.get_by_id(cs.subject_id)
                        if subject:
                            subject_names.append(subject.name)

                classes_list.append(
                    {
                        "id": class_obj.class_id,
                        "name": class_obj.name,
                        "studentCount": student_count,
                        "subjects": subject_names[:SUBJECT_LIMIT],
                        "subjectCount": len(subject_names),
                    }
                )

    else:
        student_class = Class.get_by_id(db_user.class_id) if db_user.class_id else None

        if student_class:
            class_subjects = ClassSubject.get_by_class_id(student_class.class_id)
            subject_names = []
            if class_subjects:
                for cs in class_subjects:
                    subject = Subject.get_by_id(cs.subject_id)
                    if subject:
                        subject_names.append(subject.name)

            classes_list.append(
                {
                    "id": student_class.class_id,
                    "name": student_class.name,
                    "subjects": subject_names[:SUBJECT_LIMIT],
                    "subjectCount": len(subject_names),
                }
            )

    return response(jsonify({"status": "ok", "classes": classes_list})), 200


@dashboard_bp.route("/taxonomy", methods=["GET", "OPTIONS"])
def dashboard_taxonomy():
    if request.method == "OPTIONS":
        return handle_preflight()

    user = check_authentication(request.headers.get("Authorization"))
    if not user:
        abort(401)

    db_user = User.get_by_id(user.user_id)
    role = Role.get_by_id(db_user.role_id)

    if role.name == "teacher":
        teacher_classes_data = ClassSubject.get_class_list_from_teacherid(
            db_user.user_id
        )

        all_students = []
        student_role_id = Role.get_id_by_name("student")

        if student_role_id:
            for class_data in teacher_classes_data:
                class_obj = Class.get_by_id(class_data.class_id)
                if class_obj:
                    class_students = User.get_students_by_class_id(
                        class_obj.class_id, student_role_id
                    )
                    if class_students:
                        all_students.extend(class_students)

        taxonomy_data = {}
        taxonomy_counts = {}

        for student in all_students:
            with Session(engine) as session:
                snapshots = (
                    session.query(Snapshot).filter_by(student_id=student.user_id).all()
                )

            for snapshot in snapshots:
                scores = Score.get_by_snapshot_id(snapshot.snapshot_id)

                for score in scores:
                    taxonomy_level = TaxonomyLevel.get_taxonomy_level(
                        score.taxonomy_level_id
                    )
                    if taxonomy_level:
                        level_name = taxonomy_level.name
                        kennen = score.kennen or 0
                        kunnen = score.kunnen or 0
                        confidence = score.confidence or 0

                        if level_name not in taxonomy_data:
                            taxonomy_data[level_name] = {
                                "kennen": 0,
                                "kunnen": 0,
                                "confidence": 0,
                            }
                            taxonomy_counts[level_name] = 0

                        taxonomy_data[level_name]["kennen"] += kennen
                        taxonomy_data[level_name]["kunnen"] += kunnen
                        taxonomy_data[level_name]["confidence"] += confidence
                        taxonomy_counts[level_name] += 1

        result = {}
        for level_name, data in taxonomy_data.items():
            count = taxonomy_counts[level_name]
            if count > 0:
                result[level_name] = {
                    "kennen": round(data["kennen"] / count, 2),
                    "kunnen": round(data["kunnen"] / count, 2),
                    "confidence": round(data["confidence"] / count, 2),
                }
            else:
                result[level_name] = {"kennen": 0, "kunnen": 0, "confidence": 0}

        all_levels = ["Onthouden", "Begrijpen", "Toepassen", "Analyseren"]
        for level in all_levels:
            if level not in result:
                result[level] = {"kennen": 0, "kunnen": 0, "confidence": 0}

    else:
        with Session(engine) as session:
            snapshots = (
                session.query(Snapshot).filter_by(student_id=db_user.user_id).all()
            )

        taxonomy_data = {}
        taxonomy_counts = {}

        for snapshot in snapshots:
            scores = Score.get_by_snapshot_id(snapshot.snapshot_id)

            for score in scores:
                taxonomy_level = TaxonomyLevel.get_taxonomy_level(
                    score.taxonomy_level_id
                )
                if taxonomy_level:
                    level_name = taxonomy_level.name
                    kennen = score.kennen or 0
                    kunnen = score.kunnen or 0
                    confidence = score.confidence or 0

                    if level_name not in taxonomy_data:
                        taxonomy_data[level_name] = {
                            "kennen": 0,
                            "kunnen": 0,
                            "confidence": 0,
                        }
                        taxonomy_counts[level_name] = 0

                    taxonomy_data[level_name]["kennen"] += kennen
                    taxonomy_data[level_name]["kunnen"] += kunnen
                    taxonomy_data[level_name]["confidence"] += confidence
                    taxonomy_counts[level_name] += 1

        result = {}
        for level_name, data in taxonomy_data.items():
            count = taxonomy_counts[level_name]
            if count > 0:
                result[level_name] = {
                    "kennen": round(data["kennen"] / count, 2),
                    "kunnen": round(data["kunnen"] / count, 2),
                    "confidence": round(data["confidence"] / count, 2),
                }
            else:
                result[level_name] = {"kennen": 0, "kunnen": 0, "confidence": 0}

        all_levels = ["Onthouden", "Begrijpen", "Toepassen", "Analyseren"]
        for level in all_levels:
            if level not in result:
                result[level] = {"kennen": 0, "kunnen": 0, "confidence": 0}

    return response(jsonify({"status": "ok", "taxonomy": result})), 200
