from flask import jsonify, request, url_for

from goal_tracker.api import api_bp, error_response

from goal_tracker import db
from goal_tracker.auth import basic_auth, token_auth
from goal_tracker.models import User


@api_bp.route("/user", methods=["GET"])
@token_auth.login_required
def get_user_details():
    return {
        "id": token_auth.current_user().id,
        "email": token_auth.current_user().email,
    }


@api_bp.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return {"users": [{"id": u.id} for u in users]}


@api_bp.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        return error_response(
            404, "There does not exist a user with the provided user ID."
        )
    return {"id": user.id}


@api_bp.route("/users", methods=["POST"])
def create_user():
    # Check whether the client supplied all required arguments.
    if not request.json:
        return error_response(
            400,
            'Your request did not include a "Content-Type: application/json" header.',
        )

    email = request.json.get("email")
    password = request.json.get("password")
    if email is None or password is None:
        return error_response(
            400, "The request body must include both an email and a password."
        )

    # Prevent the to-be-created user from using the email of any existing user.
    if User.query.filter_by(email=email).first() is not None:
        return error_response(
            400, "There already exists a user with the provided email."
        )

    # Create a new user.
    user = User(email=email)
    user.set_password_hash(password)
    db.session.add(user)
    db.session.commit()

    r = jsonify({"id": user.id, "email": user.email})
    r.status_code = 201
    r.headers["Location"] = url_for("api_bp_name.get_user", user_id=user.id)
    return r


@api_bp.route("/users/<int:user_id>", methods=["PUT"])
@basic_auth.login_required
def edit_user(user_id):
    user = User.query.get_or_404(user_id)  # NB! Content-Type: text/html; charset=utf-8
    if user != basic_auth.current_user():
        return error_response(
            403, "You may not edit any user's account other than your own."
        )

    # Check whether the client supplied admissible arguments.
    if not request.json:
        return error_response(
            400,
            'Your request did not include a "Content-Type: application/json" header.',
        )

    email = request.json.get("email")
    if email and type(email) is not str:
        return error_response(
            400, "If an email is provided in the request body, it must be a string."
        )
    if User.query.filter_by(email=email).first() is not None:
        return error_response(
            400, "There already exists a user with the provided email."
        )

    # Update the user.
    user.email = email or user.email
    db.session.commit()

    return {"id": user.id, "email": user.email}


@api_bp.route("/users/<int:user_id>", methods=["DELETE"])
@basic_auth.login_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)  # NB! Content-Type: text/html; charset=utf-8
    if user != basic_auth.current_user():
        return error_response(
            403, "You may not delete any user's account other than your own."
        )

    db.session.delete(user)
    db.session.commit()
    return "", 204
