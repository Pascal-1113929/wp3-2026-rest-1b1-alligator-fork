import time

from flask import Blueprint, abort, jsonify, request
from models.user_model import User
from models.session_model import Session
from models.role_model import Role
from utils.auth import check_authentication, remove_bearer
from utils.jwt import create_jwt
from utils.response import handle_preflight, response

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/logout", methods=["GET", "OPTIONS"])
def auth_logout():
    if request.method == "OPTIONS":
        return handle_preflight()

    token = remove_bearer(request.headers.get("Authorization"))
    user = check_authentication(token)

    if not user:
        abort(401)

    Session.remove_session_id(user.session_id, user.user_id)
    return response(jsonify({"status": "ok"})), 200


@auth_bp.route("/login", methods=["POST", "OPTIONS"])
def auth_login():
    if request.method == "OPTIONS":
        return handle_preflight()

    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    time.sleep(0.45)

    if not username or not password:
        return response(
            jsonify(
                {
                    "status": "error",
                    "message": "Gebruikersnaam en wachtwoord zijn vereist",
                }
            )
        ), 400

    user = User.login(username, password)
    if user:
        role = Role.get_by_id(user.role_id)
        session = Session.create(
            user.user_id, request.remote_addr, request.user_agent.string
        )
        jwt_token = create_jwt(session.id)
        return response(
            jsonify(
                {
                    "status": "ok",
                    "token": jwt_token,
                    "user_object": {
                        "user_id": user.user_id,
                        "email": user.email,
                        "name": user.name,
                        "role": {
                            "id": role.role_id,
                            "role": role.name,
                        }
                    },
                }
            )
        ), 200
    return response(
        jsonify({"status": "error", "message": "Ongeldige inloggegevens"})
    ), 401
