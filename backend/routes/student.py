from flask import Blueprint, jsonify, request, abort


from models.user_model import User
from models.class_model import Class
from models.class_subject_model import ClassSubject
from models.subject_model import Subject

from utils.response import response, handle_preflight
from utils.auth import check_authentication, remove_bearer

student_bp = Blueprint("student", __name__)


@student_bp.route("/subject", methods=["GET", "OPTIONS"])
def subjects():
    if request.method == "OPTIONS":
        return handle_preflight()

    token = remove_bearer(request.headers.get("Authorization"))
    user = check_authentication(token)

    if not user:
        abort(401)

    db_user = User.get_by_id(user.user_id)

    print(db_user.class_id)

    db_class = Class.get_by_id(db_user.class_id)

    if db_class is None:
        return response(
            jsonify(
                {
                    "status": "error",
                    "message": "Klas kan niet worden gevonden contacteer een beheerder",
                }
            )
        ), 404

    class_subjects = ClassSubject.get_by_class_id(db_class.class_id)

    subjects = []

    for class_subject in class_subjects:
        subject = Subject.get_by_id(class_subject.subject_id)
        if subject is None:
            return response(
                jsonify(
                    {
                        "status": "error",
                        "message": "Dit Vak kan niet worden gevonden contacteer een beheerder",
                    }
                )
            ), 404

        subjects.append({
            "id": subject.subject_id,
            "name": subject.name
        })

    return response(jsonify({"status": "ok", "subjects": subjects})), 200
