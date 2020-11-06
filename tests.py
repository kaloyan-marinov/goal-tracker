# import coverage
import os
import unittest
import base64
import json
import sys

from unittest.mock import patch
from itsdangerous import SignatureExpired, BadSignature


# cov = coverage.Coverage(branch=True)
# cov.start()

os.environ["DATABASE_URL"] = "sqlite://"
from goal_tracker import app, db, User

app.config["TESTING"] = True


class GoalTrackerTests(unittest.TestCase):
    def setUp(self):
        db.drop_all()  # just in case
        db.create_all()
        self.client = app.test_client()

    def tearDown(self):
        db.drop_all()

    def get_headers(self, basic_auth=None, token_auth=None):
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }  # https://webmasters.stackexchange.com/questions/31212/difference-between-the-accept-and-content-type-http-headers
        if basic_auth is not None:
            headers["Authorization"] = "Basic " + base64.b64encode(
                basic_auth.encode("utf-8")
            ).decode("utf-8")
        if token_auth is not None:
            headers["Authorization"] = f"Bearer {token_auth}"
        return headers

    def get(self, url, basic_auth=None, token_auth=None):
        rv = self.client.get(
            url, headers=self.get_headers(basic_auth=basic_auth, token_auth=token_auth),
        )

        # Clean up the database session,
        # since this only occures when the app context is popped.
        db.session.remove()

        body_str = rv.get_data(as_text=True)
        if body_str is not None and body_str != "":
            try:
                body = json.loads(body_str)
            except:
                pass

        return body, rv.status_code, rv.headers

    def post(self, url, data=None, basic_auth=None, token_auth=None):
        d = data if data is None else json.dumps(data)
        rv = self.client.post(
            url,
            data=d,
            headers=self.get_headers(basic_auth=basic_auth, token_auth=token_auth),
        )

        # Clean up the database session,
        # since this only occurs when the app context is popped.
        db.session.remove()

        body_str = rv.get_data(as_text=True)
        if body_str is not None and body_str != "":
            try:
                body = json.loads(body_str)
            except:
                pass

        return body, rv.status_code, rv.headers

    def put(self, url, data=None, basic_auth=None, token_auth=None):
        d = data if data is None else json.dumps(data)
        rv = self.client.put(
            url,
            data=d,
            headers=self.get_headers(basic_auth=basic_auth, token_auth=token_auth),
        )

        # Clean up the database session,
        # since this only occurs when the app context is popped.
        db.session.remove()

        body_str = rv.get_data(as_text=True)
        if body_str is not None and body_str != "":
            try:
                body = json.loads(body_str)
            except:
                pass

        return body, rv.status_code, rv.headers

    def delete(self, url, data=None, basic_auth=None, token_auth=None):
        rv = self.client.delete(
            url, headers=self.get_headers(basic_auth=basic_auth, token_auth=token_auth),
        )

        # Clean up the database session,
        # since this only occurs when the app context is popped.
        db.session.remove()

        body_str = rv.get_data(as_text=True)
        if body_str is not None and body_str != "":
            try:
                body = json.loads(body_str)
            except:
                pass
        else:
            body = ""
        # TODO: consider whether it makes sense to add an identical else clause to the
        #       other helper methods in this class

        return body, rv.status_code, rv.headers

    def test_content_type(self):
        # Attempt to create a user by providing the wrong Content-Type.
        headers = self.get_headers()
        headers["Content-Type"] = "text/html"
        rv = self.client.post(
            "/api/v1.0/users",
            data="On purpose, this data is not in JSON format.",
            headers=headers,
        )
        self.assertEqual(rv.status_code, 400)
        self.assertEqual(rv.headers["Content-Type"], "application/json")

        # Attempt to create a user without providing a Content-Type.
        del headers["Content-Type"]
        rv = self.client.post(
            "/api/v1.0/users",
            data="On purpose, this data is not in JSON format.",
            headers=headers,
        )
        self.assertEqual(rv.status_code, 400)
        self.assertEqual(rv.headers["Content-Type"], "application/json")

        # Create a user.
        # Attempt to modify the created user by providing the wrong Content-Tpye.
        r, s, h = self.post(
            "/api/v1.0/users",
            data={"email": "john.doe@gmail.com", "password": "123456"},
        )
        url_4_john_doe = h["Location"]

        headers = self.get_headers(basic_auth="john.doe@gmail.com:123456")
        headers["Content-Type"] = "text/html"
        rv = self.client.put(
            url_4_john_doe,
            data="On purpose, this data is not in JSON format.",
            headers=headers,
        )
        self.assertEqual(rv.status_code, 400)
        self.assertEqual(rv.headers["Content-Type"], "application/json")

        # Attempt to modify the created user without providing a Content-Type.
        del headers["Content-Type"]
        rv = self.client.put(
            url_4_john_doe,
            data="On purpose, this data is not in JSON format.",
            headers=headers,
        )
        self.assertEqual(rv.status_code, 400)
        self.assertEqual(rv.headers["Content-Type"], "application/json")

    def test_one_user(self):
        # Get all users.
        r, s, h = self.get("/api/v1.0/users")
        self.assertEqual(s, 200)

        # Get a user that doesn't exist.
        r, s, h = self.get("/api/v1.0/users/1")
        self.assertEqual(s, 404)

        # Create a new user.
        r, s, h = self.post(
            "/api/v1.0/users",
            data={"email": "john.doe@yahoo.com", "password": "123456"},
        )
        self.assertEqual(s, 201)
        url_4_created_user = h["Location"]

        # Create a duplicate user.
        r, s, h = self.post(
            "/api/v1.0/users", data={"email": "john.doe@yahoo.com", "password": "789"}
        )
        self.assertEqual(s, 400)

        # Create an incomplete user.
        r, s, h = self.post("/api/v1.0/users", data={"email": "mary.smith@yahoo.com"},)
        self.assertEqual(s, 400)

        r, s, h = self.post("/api/v1.0/users", data={"password": "123456"},)
        self.assertEqual(s, 400)

        # Get an existing user.
        r, s, h = self.get(url_4_created_user)
        self.assertEqual(s, 200)

        # Modify an existing user.
        r, s, h = self.put(
            url_4_created_user,
            data={"email": "john.doe@gmail.com"},
            basic_auth="john.doe@yahoo.com:123456",
        )
        self.assertEqual(s, 200)

        # Modify an existing user in an invalid way, by providing an invalid email.
        r, s, h = self.put(
            url_4_created_user,
            data={"email": 17},
            basic_auth="john.doe@gmail.com:123456",
        )
        self.assertEqual(s, 400)

        # Modify an existing user in an invalid way, by providing an email that is
        # currently associate with some user (who MAY be the one making the HTTP
        # request).
        r, s, h = self.put(
            url_4_created_user,
            data={"email": "john.doe@gmail.com"},
            basic_auth="john.doe@gmail.com:123456",
        )
        self.assertEqual(s, 400)

        # Delete an existing user with the wrong password.
        r, s, h = self.delete(url_4_created_user, basic_auth="john.doe@gmail.com:789",)
        self.assertEqual(s, 401)

        # Delete an existing user.
        r, s, h = self.delete(
            url_4_created_user, basic_auth="john.doe@gmail.com:123456",
        )
        self.assertEqual(s, 204)

    def test_two_users(self):
        # Create two users.
        r, s, h = self.post(
            "/api/v1.0/users",
            data={"email": "john.doe@gmail.com", "password": "123456"},
        )
        self.assertEqual(s, 201)
        url_4_john_doe = h["Location"]

        r, s, h = self.post(
            "/api/v1.0/users",
            data={"email": "mary.smith@yahoo.com", "password": "123456"},
        )
        self.assertEqual(s, 201)
        url_4_mary_smith = h["Location"]

        # Have one user attempt to modify another user.
        r, s, h = self.put(
            url_4_john_doe,
            data={"email": "john.doe@yahoo.com"},
            basic_auth="mary.smith@yahoo.com:123456",
        )
        self.assertEqual(s, 403)

        # Have one user attempt to delete another user.
        r, s, h = self.delete(url_4_john_doe, basic_auth="mary.smith@yahoo.com:123456")
        self.assertEqual(s, 403)

    def test_tokens(self):
        # Create a user.
        r, s, h = self.post(
            "/api/v1.0/users",
            data={"email": "john.doe@gmail.com", "password": "123456"},
        )
        self.assertEqual(s, 201)
        url_4_john_doe = h["Location"]

        # Request a token.
        r, s, h = self.post("/api/v1.0/tokens", basic_auth="john.doe@gmail.com:123456",)
        self.assertEqual(s, 200)
        token = r["token"]

        # Request a token with the wrong password.
        r, s, h = self.post("/api/v1.0/tokens", basic_auth="john.doe@gmail.com:789",)
        self.assertEqual(s, 401)

        # Access the token-restricted resource.
        r, s, h = self.get(
            "/welcome",
            token_auth=token,  # TODO: consider renaming this kwarg to `bearer_token`
        )
        self.assertEqual(s, 200)

        # Verify that a JWS token, which contains a non-existent user ID, is invalid.
        with patch("flask_sqlalchemy.BaseQuery.get_or_404", return_value=None) as m:
            r, s, h = self.get("welcome", token_auth=token)
            self.assertEqual(s, 401)

        # Verify that a JWS token, which has expired, is invalid.
        with patch(
            "goal_tracker.Serializer.loads",
            side_effect=SignatureExpired("forced via mocking/patching"),
        ):
            r, s, h = self.get("welcome", token_auth=token)
            self.assertEqual(s, 401)

        # Verify that a JWS token, whose signature has been tampered with, is invalid.
        with patch(
            "goal_tracker.Serializer.loads",
            side_effect=BadSignature("forced via mocking/patching"),
        ):
            r, s, h = self.get("welcome", token_auth=token)
            self.assertEqual(s, 401)


if __name__ == "__main__":
    tests_ok = unittest.main(verbosity=2, exit=False).result.wasSuccessful()

    # # Print coverage report.
    # cov.stop()
    # print("")
    # cov.html_report(omit=["tests.py", "venv/*"])

    sys.exit(0 if tests_ok else 1)
