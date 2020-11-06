import os

from flask import Flask, abort, request, jsonify, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from flask_httpauth import HTTPBasicAuth


basedir = os.path.abspath(os.path.dirname(__file__))
db_file = os.path.join(basedir, "goal_tracker.db")

app = Flask(__name__)
app.config["DEBUG"] = True
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_file}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

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


basic_auth = HTTPBasicAuth()


@basic_auth.verify_password
def verify_password(email, password):
    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        return False
    return user


@app.route("/api/v1.0/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return {"users": [{"id": u.id, "email": u.email} for u in users]}


@app.route("/api/v1.0/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        abort(404)  # Content-Type: text/html; charset=utf-8
    return {"id": user.id, "email": user.email}


@app.route("/api/v1.0/users", methods=["POST"])
def create_user():
    # Check whether the client supplied all required arguments.
    if not request.json:
        abort(400)  # Content-Type: text/html; charset=utf-8

    email = request.json.get("email")
    password = request.json.get("password")
    if email is None or password is None:
        abort(400)

    # Prevent the to-be-created user from using the email of any existing user.
    if User.query.filter_by(email=email).first() is not None:
        abort(400)

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
    user = User.query.get_or_404(user_id)  # Content-Type: text/html; charset=utf-8
    if user != basic_auth.current_user():
        abort(403)  # Content-Type: text/html; charset=utf-8

    # Check whether the client supplied admissible arguments.
    if not request.json:
        abort(400)  # Content-Type: text/html; charset=utf-8

    email = request.json.get("email")
    if email and type(email) is not str:
        abort(400)
    if User.query.filter_by(email=email).first() is not None:
        abort(400)

    # Update the user.
    user.email = email or user.email
    db.session.commit()

    return {"id": user.id, "email": user.email}


@app.route("/api/v1.0/users/<int:user_id>", methods=["DELETE"])
@basic_auth.login_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)  # Content-Type: text/html; charset=utf-8
    if user != basic_auth.current_user():
        abort(403)  # Content-Type: text/html; charset=utf-8

    db.session.delete(user)
    db.session.commit()
    return "", 204


if __name__ == "__main__":
    app.run(use_debugger=False, use_reloader=False, passthrough_errors=True)
