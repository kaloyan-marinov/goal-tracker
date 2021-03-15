from goal_tracker.api import api_bp

from goal_tracker.auth import basic_auth


@api_bp.route("/tokens", methods=["POST"])
@basic_auth.login_required
def create_token():
    """
    Issue an access JSON Web Signature token
    for a user (who has authenticated herself successfully).
    """
    token = basic_auth.current_user().generate_token()
    return {"token": token}
