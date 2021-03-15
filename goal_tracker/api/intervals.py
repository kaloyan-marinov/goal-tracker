from flask import jsonify, request, url_for

from . import api_bp, error_response
from .. import db
from ..auth import token_auth
from ..models import Interval
from ..utils import format_time, parse_time


@api_bp.route("/intervals", methods=["GET"])
@token_auth.login_required
def get_intervals():
    goal_ids = [g.id for g in token_auth.current_user().goals.all()]
    intervals = Interval.query.filter(Interval.goal_id.in_(goal_ids))
    return {
        "intervals": [
            {
                "id": i.id,
                "start": i.start.strftime("%Y-%m-%d %H:%M"),
                "final": i.final.strftime("%Y-%m-%d %H:%M"),
                "goal_id": i.goal_id,
            }
            for i in intervals
        ]
    }


@api_bp.route("/intervals/<int:interval_id>", methods=["GET"])
@token_auth.login_required
def get_interval(interval_id):
    interval = Interval.query.get(interval_id)

    message = None
    if interval is None:
        message = (
            "Your user does not have a Goal resource"
            ' that is associated with the provided "interval_id".'
        )
    elif interval.goal.user != token_auth.current_user():
        message = (
            "Your user does not have a Goal resource"
            ' that is associated with the provided "interval_id".'
        )
    if message is not None:
        return error_response(400, message)

    return {
        "id": interval.id,
        "start": format_time(interval.start),
        "final": format_time(interval.final),
        "goal_id": interval.goal_id,
    }


@api_bp.route("/intervals", methods=["POST"])
@token_auth.login_required
def create_interval():
    # Check whether the client supplied all required arguments.
    if not request.json:
        return error_response(
            400,
            (
                'Your request did not include a "Content-Type: application/json"'
                " header."
            ),
        )

    goal_id = request.json.get("goal_id")
    if goal_id is None or not isinstance(goal_id, int):
        return error_response(
            400, "The request body must include a goal_id, which must be an int."
        )
    if token_auth.current_user().goals.filter_by(id=goal_id).first() is None:
        return error_response(
            400, 'Your user does not have a Goal resource with the provided "goal_id".'
        )

    start_str = request.json.get("start")
    if start_str is None:
        return error_response(
            400, 'The request body must include both a "start" timestamp.'
        )
    else:
        try:
            start = parse_time(start_str)
        except ValueError:
            return error_response(
                400, '"start" must match the format "YYYY-MM-DD HH:MM".'
            )

    final_str = request.json.get("final")
    if final_str is None:
        return error_response(
            400, 'The request body must include both a "final" timestamp.'
        )
    else:
        try:
            final = parse_time(final_str)
        except ValueError:
            return error_response(
                400, '"final" must match the format "YYYY-MM-DD HH:MM".'
            )

    interval = Interval(start=start, final=final, goal_id=goal_id)
    db.session.add(interval)
    db.session.commit()

    payload = {
        "id": interval.id,
        "start": format_time(interval.start),
        "final": format_time(interval.final),
        "goal_id": interval.goal_id,
    }
    r = jsonify(payload)
    r.status_code = 201
    r.headers["Location"] = url_for("api_bp_name.get_interval", interval_id=interval.id)
    return r


@api_bp.route("/intervals/<int:interval_id>", methods=["PUT"])
@token_auth.login_required
def edit_interval(interval_id):
    if not request.json:
        return error_response(
            400,
            'Your request did not include a "Content-Type: application/json" header.',
        )

    # Check whether the client supplied a valid interval_id (as part of the URL).
    interval = Interval.query.get(interval_id)

    message = None
    if interval is None:
        message = (
            "Your user does not have a Goal resource"
            ' that is associated with the provided "interval_id".'
        )
    elif interval.goal.user != token_auth.current_user():
        message = (
            "Your user does not have a Goal resource"
            ' that is associated with the provided "interval_id".'
        )
    if message is not None:
        return error_response(400, message)

    # Check whether the client supplied all required arguments in the request body.
    goal_id = request.json.get("goal_id") or interval.goal_id
    if not isinstance(goal_id, int):
        return error_response(
            400, 'If the request body includes "goal_id", it must be an integer.'
        )
    if token_auth.current_user().goals.filter_by(id=goal_id).first() is None:
        return error_response(
            400, 'Your user does not have a Goal resource with the provided "goal_id".'
        )

    start_str = request.json.get("start")
    if start_str is None:
        start = None
    else:
        try:
            start = parse_time(start_str)
        except ValueError:
            return error_response(
                400, 'If provided, "start" must match the format "YYYY-MM-DD HH:MM".'
            )

    final_str = request.json.get("final")
    if final_str is None:
        final = None
    else:
        try:
            final = parse_time(final_str)
        except ValueError:
            return error_response(
                400, 'If provided, "final" must match the format "YYYY-MM-DD HH:MM".'
            )

    # Update the interval.
    interval.start = start or interval.start
    interval.final = final or interval.final
    interval.goal_id = goal_id or interval.goal_id
    db.session.commit()

    return {
        "id": interval.id,
        "start": format_time(interval.start),
        "final": format_time(interval.final),
        "goal_id": interval.goal_id,
    }


@api_bp.route("/intervals/<int:interval_id>", methods=["DELETE"])
@token_auth.login_required
def delete_interval(interval_id):
    interval = Interval.query.get(interval_id)

    message = None
    if interval is None:
        message = (
            "Your user does not have a Goal resource"
            ' that is associated with the provided "interval_id".'
        )
    elif interval.goal.user != token_auth.current_user():
        message = (
            "Your user does not have a Goal resource"
            ' that is associated with the provided "interval_id".'
        )
    if message is not None:
        return error_response(400, message)

    db.session.delete(interval)
    db.session.commit()
    return "", 204
