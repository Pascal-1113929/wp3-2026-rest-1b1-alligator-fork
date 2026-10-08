from datetime import datetime

from flask import Blueprint, abort, jsonify, request
from models.geo_ip_model import GeoIP
from models.role_model import Role
from models.session_model import Session
from models.user_model import User
from ua_parser import parse
from utils.auth import check_authentication, remove_bearer
from utils.response import handle_preflight, response

user_bp = Blueprint("user", __name__)


@user_bp.route("/", methods=["GET", "OPTIONS"])
def user():
    if request.method == "OPTIONS":
        return handle_preflight()

    user = check_authentication(request.headers.get("Authorization"))

    if not user:
        abort(401)

    db_user = User.get_by_id(user.user_id)
    role = Role.get_by_id(db_user.role_id)

    return response(
        jsonify(
            {
                "status": "ok",
                "user_object": {
                    "id": user.user_id,
                    "email": user.email,
                    "name": user.name,
                    "role": {
                        "id": role.role_id,
                        "role": role.name,
                    },
                },
            }
        )
    ), 200


@user_bp.route("/sessions", methods=["GET", "OPTIONS"])
def user_sessions():
    if request.method == "OPTIONS":
        return handle_preflight()

    token = remove_bearer(request.headers.get("Authorization"))
    user = check_authentication(token)

    if not user:
        abort(401)

    all_sessions = Session.get_by_user_id(user.user_id)
    session_object = []
    for session in all_sessions:
        geo_ip = GeoIP.get_by_ip(session.ip)
        parsed_ua = parse(session.useragent)
        user_agent = "Onbekend apparaat"
        if (
            parsed_ua.user_agent
            and parsed_ua.user_agent.family
            and parsed_ua.user_agent.family != "Other"
        ):
            user_agent = parsed_ua.user_agent.family
            if parsed_ua.os and parsed_ua.os.family and parsed_ua.os.family != "Other":
                user_agent = f"{user_agent} op {parsed_ua.os.family}"
        else:
            user_agent = parsed_ua.string if parsed_ua.string else "Onbekend apparaat"
        geo = f"{geo_ip.country_name}, {geo_ip.region_name}, {geo_ip.city_name}"

        now = datetime.now()
        session_last_activity = session.last_activity

        delta = now - session_last_activity
        if delta.days > 1:
            last_seen = f"{delta.days} dagen geleden"
        elif delta.days == 1:
            last_seen = f"{delta.days} dag geleden"
        elif delta.seconds // 3600 > 1:
            last_seen = f"{delta.seconds // 3600} uur geleden"
        elif delta.seconds // 3600 == 1:
            last_seen = f"{delta.seconds // 3600} uur geleden"
        elif delta.seconds // 60 > 1:
            last_seen = f"{delta.seconds // 60} minuten geleden"
        elif delta.seconds // 60 == 1:
            last_seen = f"{delta.seconds // 60} minuut geleden"
        else:
            last_seen = "zojuist"

        first_activity = session.first_activity.strftime("%d/%m/%Y om %H:%M")

        session_object.append(
            {
                "id": session.id,
                "last_seen": last_seen,
                "first_login": first_activity,
                "device": user_agent,
                "location": geo,
                "is_this_device": user.session_id == session.id,
            }
        )

    return response(jsonify({"status": "ok", "session_object": session_object})), 200


@user_bp.route("/sessions/<session_id>", methods=["DELETE", "OPTIONS"])
def delete_session(session_id):
    if request.method == "OPTIONS":
        return handle_preflight()

    token = remove_bearer(request.headers.get("Authorization"))
    user = check_authentication(token)

    if not user:
        abort(401)

    Session.remove_session_id(session_id, user.user_id)
    return response(jsonify({"status": "ok"})), 200
