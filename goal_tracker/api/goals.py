from flask import jsonify, request, url_for

from . import api_bp, error_response
from .. import db
from ..auth import token_auth
from ..models import Goal


@api_bp.route("/goals", methods=["GET"])
@token_auth.login_required
def get_goals():
    curr_user_goals = token_auth.current_user().goals.all()
    return {
        "goals": [{"id": g.id, "description": g.description} for g in curr_user_goals]
    }


@api_bp.route("/goals/<int:goal_id>", methods=["GET"])
@token_auth.login_required
def get_goal(goal_id):
    goal = Goal.query.get_or_404(goal_id)  # NB! Content-Type: text/html; charset=utf-8

    if token_auth.current_user() != goal.user:
        return error_response(
            403, "You may not access goals, which do not belong to you."
        )

    return {"id": goal.id, "description": goal.description}


@api_bp.route("/goals", methods=["POST"])
@token_auth.login_required
def create_goal():
    # Check whether the client supplied all required arguments.
    if not request.json:
        return error_response(
            400,
            'Your request did not include a "Content-Type: application/json" header.',
        )

    description = request.json.get("description")
    if description is None or type(description) is not str:
        return error_response(
            400, "The request body must include a description, which must be a string."
        )
    elif description == "":
        return error_response(400, "The description must be a non-empty string.")

    if (
        token_auth.current_user().goals.filter_by(description=description).first()
        is not None
    ):
        return error_response(403, "You already have a goal with the same description.")

    # Create a new goal for the logged-in user.
    goal = Goal(description=description)
    token_auth.current_user().goals.append(goal)
    db.session.commit()

    r = jsonify({"id": goal.id, "description": goal.description})
    r.status_code = 201
    r.headers["Location"] = url_for("api_bp_name.get_goal", goal_id=goal.id)
    return r


@api_bp.route("/goals/<int:goal_id>", methods=["PUT"])
@token_auth.login_required
def edit_goal(goal_id):
    goal = token_auth.current_user().goals.filter_by(id=goal_id).first()
    if goal is None:
        # TODO: find out if the following status code is suitable
        return error_response(
            400, "You may only edit goals that both exist and belong to you."
        )

    # Check whether the client supplied admissible arguments.
    if not request.json:
        return error_response(
            400,
            'Your request did not include a "Content-Type: application/json" header.',
        )

    description = request.json.get("description")
    if description is not None:
        if type(description) is not str:
            return error_response(
                400,
                "If a description is provided in the request body, it must be a string.",
            )
        elif description == "":
            return error_response(
                400,
                "If a description is provided in the request body, it must be a"
                " non-empty string.",
            )
        elif (
            token_auth.current_user().goals.filter_by(description=description).first()
            is not None
        ):
            return error_response(
                403,
                (
                    "You already have a goal, whose description coincides with what you"
                    " provided in the request payload."
                ),
            )

    # Update the goal.
    goal.description = description or goal.description
    db.session.commit()

    return {"id": goal.id, "description": goal.description}


@api_bp.route("/goals/<int:goal_id>", methods=["DELETE"])
@token_auth.login_required
def delete_goal(goal_id):
    goal = token_auth.current_user().goals.filter_by(id=goal_id).first()
    if goal is None:
        # TODO: find out if the following status code is suitable
        return error_response(
            400, "You may only delete goals that both exist and belong to you."
        )

    db.session.delete(goal)
    db.session.commit()
    return "", 204
