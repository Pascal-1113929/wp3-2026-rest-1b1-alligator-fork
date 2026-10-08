from flask import Blueprint, jsonify, request

from utils.response import response, handle_preflight

index_bp = Blueprint("index", __name__)


@index_bp.route("/", methods=["GET", "POST"])
def page_index():
    return response(jsonify({"hello": "world"})), 200


@index_bp.route("/status", methods=["GET", "OPTIONS"])
def page_status():
    if request.method == "OPTIONS":
        return handle_preflight()
    return response(jsonify({"status": "ok"})), 200
