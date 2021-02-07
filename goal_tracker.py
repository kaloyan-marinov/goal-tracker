import os

from flask import Flask, request, jsonify, url_for
from werkzeug.http import HTTP_STATUS_CODES
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_httpauth import HTTPBasicAuth, HTTPTokenAuth
from itsdangerous import (
    TimedJSONWebSignatureSerializer as Serializer,
    BadSignature,
    SignatureExpired,
)

from utils import format_time, parse_time


basedir = os.path.abspath(os.path.dirname(__file__))
db_file = os.path.join(basedir, "goal_tracker.db")

app = Flask(__name__)
app.config["DEBUG"] = True
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL", f"sqlite:///{db_file}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY") or "my-secret"

db = SQLAlchemy(app)

migrate = Migrate(app, db)

token_serializer = Serializer(app.config["SECRET_KEY"], expires_in=3600)


from models import User, Goal, Interval


def error_response(status_code, message):
    payload = {
        "error": HTTP_STATUS_CODES.get(status_code),
        "message": message,
    }
    r = jsonify(payload)
    r.status_code = status_code
    return r


basic_auth = HTTPBasicAuth()


@basic_auth.verify_password
def verify_password(email, password):
    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        return False
    return user


@basic_auth.error_handler
def basic_auth_error():
    """Return a 401 error to the client."""
    # To avoid login prompts in the browser, use the "Bearer" realm.
    r = jsonify({"error": "authentication required"})
    r.status_code = 401
    r.headers["WWW-Authenticate"] = 'Bearer realm="Authentication Required"'
    return r


token_auth = HTTPTokenAuth(scheme="Bearer")


@token_auth.verify_token
def verify_token(token):
    try:
        token_payload = token_serializer.loads(token)
    except SignatureExpired:
        return None  # valid token, but expired
    except BadSignature:
        return None  # invalid token

    user = User.query.get_or_404(token_payload["user_id"])
    if user is not None:
        return user
    return None


@token_auth.error_handler
def token_auth_error():
    """Return a 401 error to the client."""
    r = jsonify({"error": "authentication required"})
    r.status_code = 401
    r.headers["WWW-Authenticate"] = 'Bearer realm="Authentication Required"'
    return r


@app.route("/api/v1.0/user", methods=["GET"])
@token_auth.login_required
def get_user_details():
    return {
        "id": token_auth.current_user().id,
        "email": token_auth.current_user().email,
    }


@app.route("/api/v1.0/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return {"users": [{"id": u.id} for u in users]}


@app.route("/api/v1.0/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        return error_response(
            404, "There does not exist a user with the provided user ID."
        )
    return {"id": user.id}


@app.route("/api/v1.0/users", methods=["POST"])
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
    r.headers["Location"] = url_for("get_user", user_id=user.id)
    return r


@app.route("/api/v1.0/users/<int:user_id>", methods=["PUT"])
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


@app.route("/api/v1.0/users/<int:user_id>", methods=["DELETE"])
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


@app.route("/api/v1.0/tokens", methods=["POST"])
@basic_auth.login_required
def new_token():
    """Request a user token."""
    token = basic_auth.current_user().generate_token()
    return {"token": token}


@app.route("/api/v1.0/goals", methods=["GET"])
@token_auth.login_required
def get_goals():
    curr_user_goals = token_auth.current_user().goals.all()
    return {
        "goals": [{"id": g.id, "description": g.description} for g in curr_user_goals]
    }


@app.route("/api/v1.0/goals/<int:goal_id>", methods=["GET"])
@token_auth.login_required
def get_goal(goal_id):
    goal = Goal.query.get_or_404(goal_id)  # NB! Content-Type: text/html; charset=utf-8

    if token_auth.current_user() != goal.user:
        return error_response(
            403, "You may not access goals, which do not belong to you."
        )

    return {"id": goal.id, "description": goal.description}


@app.route("/api/v1.0/goals", methods=["POST"])
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
    r.headers["Location"] = url_for("get_goal", goal_id=goal.id)
    return r


@app.route("/api/v1.0/goals/<int:goal_id>", methods=["PUT"])
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


@app.route("/api/v1.0/goals/<int:goal_id>", methods=["DELETE"])
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


@app.route("/api/v1.0/intervals", methods=["GET"])
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


@app.route("/api/v1.0/intervals/<int:interval_id>", methods=["GET"])
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


@app.route("/api/v1.0/intervals", methods=["POST"])
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
    r.headers["Location"] = url_for("get_interval", interval_id=interval.id)
    return r


@app.route("/api/v1.0/intervals/<int:interval_id>", methods=["PUT"])
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


@app.route("/api/v1.0/intervals/<int:interval_id>", methods=["DELETE"])
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


if __name__ == "__main__":
    app.run(use_debugger=False, use_reloader=False, passthrough_errors=True)
