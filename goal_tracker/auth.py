from flask import jsonify, current_app
from flask_httpauth import HTTPBasicAuth, HTTPTokenAuth
from itsdangerous import BadSignature, SignatureExpired

from .models import User


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
        token_payload = current_app.token_serializer.loads(token)
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
