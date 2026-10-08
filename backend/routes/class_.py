from flask import Blueprint, abort, jsonify, request
from models.class_model import Class
from models.class_subject_model import ClassSubject
from models.role_model import Role
from models.user_model import User
from utils.auth import check_authentication, remove_bearer
from utils.response import handle_preflight, response

class_bp = Blueprint("class", __name__)


@class_bp.route("/", methods=["GET", "OPTIONS"])
def get_class_list():
    if request.method == "OPTIONS":
        return handle_preflight()

    token = remove_bearer(request.headers.get("Authorization"))
    user = check_authentication(token, "teacher")

    if not user:
        abort(401)

    teacher_classes = ClassSubject.get_class_list_from_teacherid(user.user_id)

    if not teacher_classes:
        return response(
            jsonify(
                {
                    "status": "error",
                    "message": "Er kunnen geen vakken gevonden worden.",
                }
            )
        ), 404

    teacher_classes_list = []

    for class_obj in teacher_classes:
        teacher_classes_list.append({"id": class_obj.class_id, "name": class_obj.name})

    return response(
        jsonify({"status": "ok", "teacher_classes": teacher_classes_list})
    ), 200


@class_bp.route("/<class_id>", methods=["GET", "OPTIONS"])
def get_class(class_id):
    if request.method == "OPTIONS":
        return handle_preflight()

    class_ = Class.get_by_id(class_id)

    if not class_:
        return response(jsonify({"status": "error", "message": "Class not found"})), 404

    student_role_id = Role.get_id_by_name("student")

    students = User.get_students_by_class_id(class_id, student_role_id)

    class_object = {"id": class_id, "name": class_.name, "students": []}

    for student in students:
        class_object["students"].append(
            {
                "id": student.user_id,
                "name": student.name,
            }
        )

    return response(jsonify({"status": "ok", "class_object": class_object})), 200
