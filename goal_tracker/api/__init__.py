from flask import Blueprint, jsonify
from werkzeug.http import HTTP_STATUS_CODES


api_bp = Blueprint("api_bp_name", __name__)


def error_response(status_code, message):
    payload = {
        "error": HTTP_STATUS_CODES.get(status_code),
        "message": message,
    }
    r = jsonify(payload)
    r.status_code = status_code
    return r


from goal_tracker.api import users, tokens, goals, intervals
