from flask import Flask, abort, request, jsonify, url_for


app = Flask(__name__)
app.config["DEBUG"] = True


users = [
    {"id": 1, "name": "John Doe", "email_address": "john.doe@gmail.com"},
    {"id": 2, "name": "Mary Smith", "email_address": "mary.smith@yahoo.com"},
]


@app.route("/api/v1.0/users", methods=["GET"])
def get_users():
    return {"users": users}


@app.route("/api/v1.0/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    idx = None
    for i, u_i in enumerate(users):
        if u_i["id"] == user_id:
            idx = i
            break
    if idx is None:
        abort(404)  # Content-Type: text/html; charset=utf-8
    return users[idx]


@app.route("/api/v1.0/users", methods=["POST"])
def create_user():
    if (
        not request.json
        or not "name" in request.json
        or not "email_address" in request.json
    ):
        abort(400)  # Content-Type: text/html; charset=utf-8
    user = {
        "id": len(users) + 1,
        "name": request.json["name"],
        "email_address": request.json["email_address"],
    }
    users.append(user)

    r = jsonify(user)
    r.status_code = 201
    r.headers["Location"] = url_for("get_user", user_id=user["id"])
    return r


@app.route("/api/v1.0/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    idx = None
    for i, u_i in enumerate(users):
        if u_i["id"] == user_id:
            idx = i
            break
    if idx is None:
        abort(404)  # Content-Type: text/html; charset=utf-8

    if not request.json:
        abort(400)
    if "name" in request.json and type(request.json["name"]) is not str:
        abort(400)
    if (
        "email_address" in request.json
        and type(request.json["email_address"]) is not str
    ):
        abort(400)

    users[idx]["name"] = request.json.get("name", users[idx]["name"])
    users[idx]["email_address"] = request.json.get(
        "email_address", users[idx]["email_address"]
    )
    return users[idx]


@app.route("/api/v1.0/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    idx = None
    for i, u_i in enumerate(users):
        if u_i["id"] == user_id:
            idx = i
            break
    if idx is None:
        abort(404)  # Content-Type: text/html; charset=utf-8

    users.remove(users[idx])

    return "", 204


if __name__ == "__main__":
    app.run(use_debugger=False, use_reloader=False, passthrough_errors=True)
