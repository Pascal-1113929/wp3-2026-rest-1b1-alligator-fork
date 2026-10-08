from flask import Blueprint, jsonify
from utils.response import response

error_bp = Blueprint("error", __name__)


@error_bp.app_errorhandler(404)
def not_found(e):
    return response(jsonify({"status": "error", "message": "Not Found"})), 404


@error_bp.app_errorhandler(403)
def forbidden(e):
    return response(jsonify({"status": "error", "message": "Forbidden"})), 403


@error_bp.app_errorhandler(400)
def bad_request(e):
    return response(jsonify({"status": "error", "message": "Bad Request"})), 400


@error_bp.app_errorhandler(401)
def unauthorized(e):
    return response(jsonify({"status": "error", "message": "Unauthorized"})), 401


@error_bp.app_errorhandler(405)
def method_not_allowed(e):
    return response(jsonify({"status": "error", "message": "Method Not Allowed"})), 405


@error_bp.app_errorhandler(500)
def internal_server_error(e):
    return response(
        jsonify({"status": "error", "message": "Internal Server Error"})
    ), 500
