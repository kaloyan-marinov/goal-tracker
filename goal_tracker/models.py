from datetime import datetime
from flask import current_app, url_for
from werkzeug.security import generate_password_hash, check_password_hash

from goal_tracker import db


class PaginatedAPIMixin(object):
    """
    This is a "mixin" class, which implements generic functionality for
    generating a representation for a collection of resources.
    """

    @staticmethod
    def to_collection_dict(query, per_page, page, endpoint, **kwargs):
        pagination_obj = query.paginate(page=page, per_page=per_page, error_out=False)

        # With regard to the `endpoint` parameter passed in to the calls of `url_for`
        # that appear below, here is what the Flask documentation says:
        #   "`endpoint` (str) – the endpoint of the URL (name of the function)"
        link_to_self = url_for(endpoint, per_page=per_page, page=page, **kwargs)
        link_to_next = (
            url_for(endpoint, per_page=per_page, page=page + 1, **kwargs)
            if pagination_obj.has_next
            else None
        )
        link_to_prev = (
            url_for(endpoint, per_page=per_page, page=page - 1, **kwargs)
            if pagination_obj.has_prev
            else None
        )
        link_to_first = url_for(endpoint, per_page=per_page, page=1, **kwargs)
        link_to_last = (
            url_for(endpoint, per_page=per_page, page=pagination_obj.pages, **kwargs)
            if pagination_obj.pages > 0
            else None
        )

        resource_representations = {
            "items": [resource.to_dict() for resource in pagination_obj.items],
            "_meta": {
                "total_items": pagination_obj.total,
                "per_page": per_page,
                "total_pages": pagination_obj.pages,
                "page": page,
            },
            "_links": {
                "self": link_to_self,
                "next": link_to_next,
                "prev": link_to_prev,
                "first": link_to_first,
                "last": link_to_last,
            },
        }
        return resource_representations


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(128), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    goals = db.relationship(
        "Goal",
        lazy="dynamic",
        backref="user",
        cascade="all, delete, delete-orphan",
    )

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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    intervals = db.relationship(
        "Interval",
        lazy="dynamic",
        backref="goal",
        cascade="all, delete, delete-orphan",
    )

    def __repr__(self):
        return f"<Goal '{self.description}'>"


class Interval(PaginatedAPIMixin, db.Model):
    __tablename__ = "intervals"

    id = db.Column(db.Integer, primary_key=True)
    start = db.Column(db.DateTime)  # TODO: consider adding `nullable=False`
    final = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    goal_id = db.Column(db.Integer, db.ForeignKey("goals.id"))

    def __repr__(self):
        return f"<Interval {self.id} (goal={self.goal})>"

    def to_dict(self):
        return {
            "id": self.id,
            "goal_id": self.goal_id,
            "start": self.start.strftime("%Y-%m-%d %H:%M"),
            "final": self.final.strftime("%Y-%m-%d %H:%M"),
        }
