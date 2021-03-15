from flask import current_app
from werkzeug.security import generate_password_hash, check_password_hash

from goal_tracker import db


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(128), index=True, unique=True)
    password_hash = db.Column(db.String(128))

    goals = db.relationship("Goal", lazy="dynamic", backref="user")

    def set_password_hash(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.email}>"

    def generate_token(self):
        token = current_app.token_serializer.dumps({"user_id": self.id}).decode("utf-8")
        return token


class Goal(db.Model):
    __tablename__ = "goals"
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(256))

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    intervals = db.relationship("Interval", lazy="dynamic", backref="goal")

    def __repr__(self):
        return f"<Goal '{self.description}'>"


class Interval(db.Model):
    __tablename__ = "intervals"
    id = db.Column(db.Integer, primary_key=True)
    start = db.Column(db.DateTime)  # TODO: consider adding `nullable=False`
    final = db.Column(db.DateTime)

    goal_id = db.Column(db.Integer, db.ForeignKey("goals.id"))

    def __repr__(self):
        return f"<Interval {self.id} (goal={self.goal})>"
