import os
import unittest
import base64
import json
import sys

from unittest.mock import patch
from itsdangerous import SignatureExpired, BadSignature

from goal_tracker import create_app, db

from goal_tracker.models import Interval


class TestBase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(config_name="testing")
        print(
            f"tests/tests.py - self.app.config['SQLALCHEMY_DATABASE_URI']={self.app.config['SQLALCHEMY_DATABASE_URI']}"
        )
        print(
            f"tests/tests.py - self.app.config['TESTING']={self.app.config['TESTING']}"
        )

        self.ctx = self.app.app_context()
        self.ctx.push()

        db.drop_all()  # just in case
        db.create_all()

        self.client = self.app.test_client()

    def tearDown(self):
        db.drop_all()

        self.ctx.pop()

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
            url,
            headers=self.get_headers(basic_auth=basic_auth, token_auth=token_auth),
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
            url,
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
        else:
            body = ""
        # TODO: consider whether it makes sense to add an identical else clause to the
        #       other helper methods in this class

        return body, rv.status_code, rv.headers


class TestUsersAndGoals(TestBase):
    """Test User and Goal resources."""

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
        self.assertEqual(r, {"users": []})

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

        # Attempt to create a duplicate user.
        r, s, h = self.post(
            "/api/v1.0/users", data={"email": "john.doe@yahoo.com", "password": "789"}
        )
        self.assertEqual(s, 400)
        self.assertEqual(
            r,
            {
                "error": "Bad Request",
                "message": "There already exists a user with the provided email.",
            },
        )

        # Create an incomplete user.
        r, s, h = self.post("/api/v1.0/users", data={"email": "mary.smith@yahoo.com"})
        self.assertEqual(s, 400)

        r, s, h = self.post("/api/v1.0/users", data={"password": "123456"})
        self.assertEqual(s, 400)

        # Get an existing user.
        r, s, h = self.get(url_4_created_user)
        self.assertEqual(s, 200)
        self.assertEqual(r, {"id": 1})

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
        # currently associated with some user (who MAY be the one making the HTTP
        # request).
        r, s, h = self.put(
            url_4_created_user,
            data={"email": "john.doe@gmail.com"},
            basic_auth="john.doe@gmail.com:123456",
        )
        self.assertEqual(s, 400)

        # Delete an existing user with the wrong password.
        r, s, h = self.delete(
            url_4_created_user,
            basic_auth="john.doe@gmail.com:789",
        )
        self.assertEqual(s, 401)

        # Delete an existing user.
        r, s, h = self.delete(
            url_4_created_user,
            basic_auth="john.doe@gmail.com:123456",
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

        # Get both users.
        r, s, h = self.get("/api/v1.0/users")
        self.assertEqual(s, 200)
        self.assertEqual(r, {"users": [{"id": 1}, {"id": 2}]})

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
        r, s, h = self.post(
            "/api/v1.0/tokens",
            basic_auth="john.doe@gmail.com:123456",
        )
        self.assertEqual(s, 200)
        token = r["token"]

        # Request a token with the wrong password.
        r, s, h = self.post(
            "/api/v1.0/tokens",
            basic_auth="john.doe@gmail.com:789",
        )
        self.assertEqual(s, 401)

        # Access a token-restricted resource.
        r, s, h = self.get(
            "/api/v1.0/goals",
            token_auth=token,  # TODO: consider renaming this kwarg to `bearer_token`
        )
        self.assertEqual(s, 200)
        self.assertEqual(r, {"goals": []})

        # Access another token-restricted resource.
        r, s, h = self.get("/api/v1.0/user", token_auth=token)
        self.assertEqual(s, 200)
        self.assertEqual(r, {"id": 1, "email": "john.doe@gmail.com"})

        # Verify that a JWS token, which contains a non-existent user ID, is invalid.
        with patch("flask_sqlalchemy.BaseQuery.get_or_404", return_value=None) as m:
            r, s, h = self.get("/api/v1.0/goals", token_auth=token)
            self.assertEqual(s, 401)

        # Verify that a JWS token, which has expired, is invalid.
        with patch(
            "goal_tracker.Serializer.loads",
            side_effect=SignatureExpired("forced via mocking/patching"),
        ):
            r, s, h = self.get("/api/v1.0/goals", token_auth=token)
            self.assertEqual(s, 401)

        # Verify that a JWS token, whose signature has been tampered with, is invalid.
        with patch(
            "goal_tracker.Serializer.loads",
            side_effect=BadSignature("forced via mocking/patching"),
        ):
            r, s, h = self.get("/api/v1.0/goals", token_auth=token)
            self.assertEqual(s, 401)

    def test_goals_with_one_user(self):
        # Create a user and issue a corresponding access token.
        r, s, h = self.post(
            "/api/v1.0/users",
            data={"email": "john.doe@gmail.com", "password": "123456"},
        )
        r, s, h = self.post("/api/v1.0/tokens", basic_auth="john.doe@gmail.com:123456")
        token_4_john_doe = r["token"]

        # Access all of the user's goals.
        r, s, h = self.get("/api/v1.0/goals", token_auth=token_4_john_doe)
        self.assertEqual(s, 200)
        self.assertEqual(len(r["goals"]), 0)

        # Create a goal.
        r, s, h = self.post(
            "/api/v1.0/goals",
            data={"description": "Read a book about blockchain technology"},
            token_auth=token_4_john_doe,
        )
        self.assertEqual(s, 201)
        url_4_john_doe_goal_1 = h["Location"]
        john_doe_goal_1_description = r["description"]

        # Ensure that a user cannot create a duplicate of a goal that they already have.
        r, s, h = self.post(
            "/api/v1.0/goals",
            data={"description": john_doe_goal_1_description},
            token_auth=token_4_john_doe,
        )
        self.assertEqual(s, 403)

        # Attempt to create an incomplete goal.
        r, s, h = self.post(
            "/api/v1.0/goals",
            data={"irrelevant key": "irrelevant value"},
            token_auth=token_4_john_doe,
        )
        self.assertEqual(s, 400)

        # Create a goal in an invalid way, by providing an invalid description.
        r, s, h = self.post(
            "/api/v1.0/goals", data={"description": 17}, token_auth=token_4_john_doe
        )
        self.assertEqual(s, 400)

        r, s, h = self.post(
            "/api/v1.0/goals", data={"description": ""}, token_auth=token_4_john_doe
        )
        self.assertEqual(s, 400)
        self.assertEqual(
            r,
            {
                "error": "Bad Request",
                "message": "The description must be a non-empty string.",
            },
        )

        # Retrieve a single one of the user's goals.
        r, s, h = self.get(url_4_john_doe_goal_1, token_auth=token_4_john_doe)
        self.assertEqual(s, 200)

        # Retrieve all of the user's goals.
        r, s, h = self.get("/api/v1.0/goals", token_auth=token_4_john_doe)
        self.assertEqual(s, 200)
        self.assertEqual(len(r["goals"]), 1)

        # Edit a goal.
        r, s, h = self.put(
            url_4_john_doe_goal_1,
            data={"description": "Listen to an audiobook about blockchain technology"},
            token_auth=token_4_john_doe,
        )
        self.assertEqual(s, 200)
        john_doe_goal_1_description_edited = r["description"]

        # Edit a goal in an invalid way, by providing an invalid description.
        r, s, h = self.put(
            url_4_john_doe_goal_1,
            data={"description": 17},
            token_auth=token_4_john_doe,
        )
        self.assertEqual(s, 400)

        r, s, h = self.put(
            url_4_john_doe_goal_1, data={"description": ""}, token_auth=token_4_john_doe
        )
        self.assertEqual(s, 400)
        self.assertEqual(
            r,
            {
                "error": "Bad Request",
                "message": (
                    "If a description is provided in the request body, it must be a"
                    " non-empty string."
                ),
            },
        )

        # Edit a goal in an invalid way, by providing a duplicate description.
        r, s, h = self.put(
            url_4_john_doe_goal_1,
            data={"description": john_doe_goal_1_description_edited},
            token_auth=token_4_john_doe,
        )
        self.assertEqual(s, 403)

        # Delete a goal.
        r, s, h = self.delete(url_4_john_doe_goal_1, token_auth=token_4_john_doe)
        self.assertEqual(s, 204)

    def test_goals_with_two_users(self):
        # Create two users and issue corresponding access tokens.
        r, s, h = self.post(
            "/api/v1.0/users",
            data={"email": "john.doe@gmail.com", "password": "123456"},
        )
        r, s, h = self.post("/api/v1.0/tokens", basic_auth="john.doe@gmail.com:123456")
        token_4_john_doe = r["token"]

        r, s, h = self.post(
            "/api/v1.0/users",
            data={"email": "mary.smith@yahoo.com", "password": "123456"},
        )
        r, s, h = self.post(
            "/api/v1.0/tokens", basic_auth="mary.smith@yahoo.com:123456"
        )
        token_4_mary_smith = r["token"]

        # Create 2 goals for the first user.
        r, s, h = self.post(
            "/api/v1.0/goals",
            data={"description": "Read a book about blockchain technology"},
            token_auth=token_4_john_doe,
        )
        self.assertEqual(s, 201)
        url_4_john_doe_goal_1 = h["Location"]

        r, s, h = self.post(
            "/api/v1.0/goals",
            data={"description": "Take a course in self-defense"},
            token_auth=token_4_john_doe,
        )
        self.assertEqual(s, 201)
        url_4_john_doe_goal_2 = h["Location"]
        john_doe_goal_2_description = r["description"]

        # Ensure that different users MAY have goals with identical descriptions.
        r, s, h = self.post(
            "/api/v1.0/goals",
            data={"description": john_doe_goal_2_description},
            token_auth=token_4_mary_smith,
        )
        self.assertEqual(s, 201)
        url_4_mary_smith_goal_1 = h["Location"]

        # Retrieve all the goals that belong to the first user.
        r, s, h = self.get("/api/v1.0/goals", token_auth=token_4_john_doe)
        self.assertEqual(s, 200)
        self.assertEqual(len(r["goals"]), 2)
        john_doe_goal_ids = {g["id"] for g in r["goals"]}

        # Retrieve all the goals that belong to the second user.
        r, s, h = self.get("/api/v1.0/goals", token_auth=token_4_mary_smith)
        self.assertEqual(s, 200)
        self.assertEqual(len(r["goals"]), 1)
        mary_smith_goal_ids = {g["id"] for g in r["goals"]}

        # Ensure that distrinct users don't have any goal( resource/record)s in common.
        common_goal_ids = john_doe_goal_ids.intersection(mary_smith_goal_ids)
        self.assertEqual(common_goal_ids, set())

        # Ensure that
        # the first user MAY NOT retrieve a goal belonging to the second user.
        r, s, h = self.get(url_4_mary_smith_goal_1, token_auth=token_4_john_doe)
        self.assertEqual(s, 403)

        # Ensure that the first user MAY NOT edit a goal belonging to the second user.
        r, s, h = self.put(
            url_4_mary_smith_goal_1,
            data={"description": "This request SHOULD fail."},
            token_auth=token_4_john_doe,
        )
        self.assertEqual(s, 400)

        # Ensure that the first user MAY NOT delete a goal belonging to the second user.
        r, s, h = self.delete(url_4_mary_smith_goal_1, token_auth=token_4_john_doe)
        self.assertEqual(s, 400)


class TestIntervals(TestBase):
    """Test Interval resources."""

    def setUp(self):
        super().setUp()

        self.token_4_john_doe, self.token_4_mary_smith = self.create_users_and_tokens()

        __, self.john_doe_goal_1_payload = self.create_goal(
            self.token_4_john_doe, "Read a book about blockchain technology"
        )
        __, self.john_doe_goal_2_payload = self.create_goal(
            self.token_4_john_doe, "Take a course in self-defense"
        )
        __, self.mary_smith_goal_1_payload = self.create_goal(
            self.token_4_mary_smith, "Take a course in self-defense"
        )

    def create_users_and_tokens(self):
        for data in [
            {"email": "john.doe@gmail.com", "password": "123456"},
            {"email": "mary.smith@yahoo.com", "password": "789"},
        ]:
            r, s, h = self.post("/api/v1.0/users", data=data)

        r, s, h = self.post(
            "/api/v1.0/tokens",
            basic_auth="john.doe@gmail.com:123456",
        )
        token_4_john_doe = r["token"]

        r, s, h = self.post(
            "/api/v1.0/tokens",
            basic_auth="mary.smith@yahoo.com:789",
        )
        token_4_mary_smith = r["token"]

        return token_4_john_doe, token_4_mary_smith

    def create_goal(self, token, description):
        r, s, h = self.post(
            "/api/v1.0/goals",
            data={"description": description},
            token_auth=token,
        )
        return s, r

    def test_with_one_user(self):
        # Get all intervals.
        r, s, h = self.get("/api/v1.0/intervals", token_auth=self.token_4_john_doe)
        self.assertEqual(s, 200)

        # Create an Interval resource.
        req_payload = {
            "goal_id": 1,
            "start": "2020-11-05 08:45",
            "final": "2020-11-05 09:15",
        }
        r, s, h = self.post(
            "/api/v1.0/intervals", data=req_payload, token_auth=self.token_4_john_doe
        )
        self.assertEqual(s, 201)
        self.assertEqual(
            r,
            {
                "id": 1,
                "goal_id": 1,
                "start": "2020-11-05 08:45",
                "final": "2020-11-05 09:15",
            },
        )
        url_4_interval_1 = h["Location"]

        # (Now that the `intervals` table is not empty...) Get all intervals.
        r, s, h = self.get("/api/v1.0/intervals", token_auth=self.token_4_john_doe)
        self.assertEqual(s, 200)
        self.assertEqual(
            r,
            {
                "_meta": {
                    "total_items": 1,
                    "per_page": 10,
                    "total_pages": 1,
                    "page": 1,
                },
                "_links": {
                    "self": "/api/v1.0/intervals?per_page=10&page=1",
                    "next": None,
                    "prev": None,
                    "first": "/api/v1.0/intervals?per_page=10&page=1",
                    "last": "/api/v1.0/intervals?per_page=10&page=1",
                },
                "items": [
                    {
                        "id": 1,
                        "start": req_payload["start"],
                        "final": req_payload["final"],
                        "goal_id": req_payload["goal_id"],
                    }
                ],
            },
        )

        # Attempt to create an Interval resource in an invalid way.
        for req_payload in [
            {"goal_id": 17, "start": "2020-11-05 08:45", "final": "2020-11-05 09:15"},
            {
                "start": "2020-11-05 08:45",
                "final": "2020-11-05 09:15",
            },
            {"goal_id": 1, "start": "2020-11-05 08:45"},
            {
                "goal_id": 1,
                "final": "2020-11-05 09:15",
            },
            {"goal_id": 1, "start": "2020-11-05 08:45"},
            {"goal_id": 1, "final": "2020-11-05 09:15"},
            {"goal_id": 1, "start": "-11-05 08:45", "final": "2020-11-05 09:15"},
            {"goal_id": 1, "start": "2020-11-05 08:45", "final": "-11-05 09:15"},
            {"goal_id": 1, "start": "-11-05 08:45"},
        ]:
            r, s, h = self.post(
                "/api/v1.0/intervals",
                data=req_payload,
                token_auth=self.token_4_john_doe,
            )
            self.assertEqual(s, 400)

        # Access an Interval resource.
        r, s, h = self.get(url_4_interval_1, token_auth=self.token_4_john_doe)
        self.assertEqual(s, 200)

        # Attempt to access an Interval resource that doesn't exist.
        r, s, h = self.get(
            url_4_interval_1.replace("/1", "/17"), token_auth=self.token_4_john_doe
        )
        self.assertEqual(s, 400)

        # Attempt to edit an Interval resource that doesn't exist.
        r, s, h = self.put(
            url_4_interval_1.replace("/1", "/17"),
            data=req_payload,
            token_auth=self.token_4_john_doe,
        )
        self.assertEqual(s, 400)

        # Edit an Interval resource.
        for req_payload in [
            {"start": "2020-11-05 08:46", "final": "2020-11-05 09:16", "goal_id": 2},
            {"start": "2020-11-05 08:45", "goal_id": 1},
            {"final": "2020-11-05 09:15", "goal_id": 1},
        ]:
            r, s, h = self.put(
                url_4_interval_1, data=req_payload, token_auth=self.token_4_john_doe
            )
            self.assertEqual(s, 200)

        # Attempt to edit an Interval resource in an invalid way.
        for req_payload in [
            {"start": "2020-11-05 08:46", "final": "2020-11-05 09:16", "goal_id": "1"},
            {"start": "2020-11-05 08:46", "final": "2020-11-05 09:16", "goal_id": 3},
            {"goal_id": 1, "start": "-11-05 08:46"},
            {"goal_id": 1, "final": "-11-05 09:16"},
        ]:
            r, s, h = self.put(
                url_4_interval_1, data=req_payload, token_auth=self.token_4_john_doe
            )
            self.assertEqual(s, 400)

        # Attempt to delete an Interval resource that doesn't exist.
        r, s, h = self.delete(
            url_4_interval_1.replace("/1", "/17"), token_auth=self.token_4_john_doe
        )
        self.assertEqual(s, 400)

        # Delete an Interval resource.
        r, s, h = self.delete(url_4_interval_1, token_auth=self.token_4_john_doe)
        self.assertEqual(s, 204)

    def test_deleting_goal_deletes_also_its_intervals(self):
        # Create an Interval resource.
        goal_id = self.john_doe_goal_2_payload["id"]
        url_for_goal = f"/api/v1.0/goals/{goal_id}"

        req_payload = {
            "goal_id": goal_id,
            "start": "2020-11-05 08:45",
            "final": "2020-11-05 09:15",
        }
        r, s, h = self.post(
            "/api/v1.0/intervals", data=req_payload, token_auth=self.token_4_john_doe
        )

        # Delete the Goal resource that the Interval resource is associated with.
        r, s, h = self.delete(url_for_goal, token_auth=self.token_4_john_doe)
        self.assertEqual(s, 204)

        # Ensure that also the Interval resource was deleted.
        interval_rows = Interval.query.all()
        self.assertEqual(len(interval_rows), 0)

    def test_with_two_users(self):
        # Create an Interval resource for a goal of the first user's.
        req_payload = {
            "goal_id": 1,
            "start": "2020-11-05 08:45",
            "final": "2020-11-05 09:15",
        }
        r, s, h = self.post(
            "/api/v1.0/intervals", data=req_payload, token_auth=self.token_4_john_doe
        )
        self.assertEqual(s, 201)
        url_4_interval_1 = h["Location"]

        # Attempt to access an Interval resource by means of the wrong token.
        r, s, h = self.get(url_4_interval_1, token_auth=self.token_4_mary_smith)
        self.assertEqual(s, 400)

        # Attempt to edit an Interval resource by means of the wrong token.
        req_payload = {
            "start": "2020-11-05 08:46",
            "final": "2020-11-05 09:16",
            "goal_id": 2,
        }
        r, s, h = self.put(
            url_4_interval_1, data=req_payload, token_auth=self.token_4_mary_smith
        )
        self.assertEqual(s, 400)

        # Attempt to delete an Interval resource by means of the wrong token.
        r, s, h = self.delete(url_4_interval_1, token_auth=self.token_4_mary_smith)
        self.assertEqual(s, 400)
