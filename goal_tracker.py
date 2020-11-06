import os

from flask import Flask, request, jsonify, url_for
from werkzeug.http import HTTP_STATUS_CODES
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from flask_httpauth import HTTPBasicAuth, HTTPTokenAuth
from itsdangerous import (
    TimedJSONWebSignatureSerializer as Serializer,
    BadSignature,
    SignatureExpired,
)


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


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(128), index=True, unique=True)
    password_hash = db.Column(db.String(128))

    def set_password_hash(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.email}>"

    def generate_token(self):
        token = token_serializer.dumps({"user_id": self.id}).decode("utf-8")
        return token


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


token_serializer = Serializer(app.config["SECRET_KEY"], expires_in=3600)

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


@app.route("/api/v1.0/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return {"users": [{"id": u.id, "email": u.email} for u in users]}


@app.route("/api/v1.0/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        payload = {
            "error": HTTP_STATUS_CODES.get(404),
            "message": "There does not exist a user with the provided user ID.",
        }
        r = jsonify(payload)
        r.status_code = 404
        return r
    return {"id": user.id, "email": user.email}


@app.route("/api/v1.0/users", methods=["POST"])
def create_user():
    # Check whether the client supplied all required arguments.
    if not request.json:
        payload = {
            "error": HTTP_STATUS_CODES.get(400),
            "message": (
                'Your request did not include a "Content-Type: application/json"'
                " header."
            ),
        }
        r = jsonify(payload)
        r.status_code = 400
        return r

    email = request.json.get("email")
    password = request.json.get("password")
    if email is None or password is None:
        payload = {
            "error": HTTP_STATUS_CODES.get(400),
            "message": "The request body must include both an email and a password.",
        }
        r = jsonify(payload)
        r.status_code = 400
        return r

    # Prevent the to-be-created user from using the email of any existing user.
    if User.query.filter_by(email=email).first() is not None:
        payload = {
            "error": HTTP_STATUS_CODES.get(400),
            "message": "There already exists a user with the provided email.",
        }
        r = jsonify(payload)
        r.status_code = 400
        return r

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
def update_user(user_id):
    user = User.query.get_or_404(user_id)  # NB! Content-Type: text/html; charset=utf-8
    if user != basic_auth.current_user():
        payload = {
            "error": HTTP_STATUS_CODES.get(403),
            "message": "You may not update any user's account other than your own.",
        }
        r = jsonify(payload)
        r.status_code = 403
        return r

    # Check whether the client supplied admissible arguments.
    if not request.json:
        payload = {
            "error": HTTP_STATUS_CODES.get(400),
            "message": (
                'Your request did not include a "Content-Type: application/json"'
                " header."
            ),
        }
        r = jsonify(payload)
        r.status_code = 400
        return r

    email = request.json.get("email")
    if email and type(email) is not str:
        payload = {
            "error": HTTP_STATUS_CODES.get(400),
            "message": "If an email is provided in the request body, it must be a string.",
        }
        r = jsonify(payload)
        r.status_code = 400
        return r
    if User.query.filter_by(email=email).first() is not None:
        payload = {
            "error": HTTP_STATUS_CODES.get(400),
            "message": "There already exists a user with the provided email.",
        }
        r = jsonify(payload)
        r.status_code = 400
        return r

    # Update the user.
    user.email = email or user.email
    db.session.commit()

    return {"id": user.id, "email": user.email}


@app.route("/api/v1.0/users/<int:user_id>", methods=["DELETE"])
@basic_auth.login_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)  # NB! Content-Type: text/html; charset=utf-8
    if user != basic_auth.current_user():
        payload = {
            "error": HTTP_STATUS_CODES.get(403),
            "message": "You may not delete any user's account other than your own.",
        }
        r = jsonify(payload)
        r.status_code = 403
        return r

    db.session.delete(user)
    db.session.commit()
    return "", 204


@app.route("/api/v1.0/tokens", methods=["POST"])
@basic_auth.login_required
def new_token():
    """Request a user token."""
    token = basic_auth.current_user().generate_token()
    return {"token": token}


@app.route("/welcome", methods=["GET"])
@token_auth.login_required
def welcome():
    return {"welcome": f"Hello, {token_auth.current_user()}"}


if __name__ == "__main__":
    app.run(use_debugger=False, use_reloader=False, passthrough_errors=True)
