# `01/set-up-the-flask-app-in-vs-code`

```
$ python3 --version
Python 3.8.3
$ python 3 -m venv venv
$ source venv/bin/activate
(venv) $ pip install --upgrade pip
(venv) $ pip install -r requirements.txt
```

# `02/backend/users-resource`

```
$ curl \
    --verbose \
    --header "Content-Type: application/json" \
    http://localhost:5000/api/v1.0/users
$ curl \
    --verbose \
    --header "Content-Type: application/json" \
    http://localhost:5000/api/v1.0/users/1

$ curl \
    --request POST \
    --verbose \
    --header "Content-Type: application/json" \
    --data '{"email": "john.doe@gmail.com"}' \
    http://localhost:5000/api/v1.0/users
$ curl \
    -v \
    -H "Content-Type: application/json" \
    http://localhost:5000/api/v1.0/users/1

$ curl \
    -X POST \
    -v \
    -H "Content-Type: application/json" \
    -d '{"email": "john.doe@gmail.com"}' \
    http://localhost:5000/api/v1.0/users
$ curl \
    -X POST \
    -v \
    -H "Content-Type: application/json" \
    -d '{"email": "mary.smith@yahoo.com"}' \
    http://localhost:5000/api/v1.0/users
$ curl \
    -v \
    -H "Content-Type: application/json" \
    http://localhost:5000/api/v1.0/users

$ curl \
    -X PUT \
    -v \
    -H "Content-Type: application/json" \
    -d '{"email": "b.b@yahoo.com"}' \
    http://localhost:5000/api/v1.0/users/2
$ curl \
    -v \
    -H "Content-Type: application/json" \
    http://localhost:5000/api/v1.0/users
$ curl \
    -X PUT \
    -v \
    -H "Content-Type: application/json" \
    -d '{"email": "john.doe@gmail.com"}' \
    http://localhost:5000/api/v1.0/users/2
$ curl \
    -v \
    -H "Content-Type: application/json" \
    http://localhost:5000/api/v1.0/users
$ curl \
    -X PUT \
    -v \
    -H "Content-Type: application/json" \
    -d '{"email": "mary.smith@yahoo.com"}' \
    http://localhost:5000/api/v1.0/users/2
$ curl \
    -v \
    -H "Content-Type: application/json" \
    http://localhost:5000/api/v1.0/users

$ curl \
    --request DELETE \
    --verbose \
    --header "Content-Type: application/json" \
    http://localhost:5000/api/v1.0/users/1
$ curl \
    -v \
    -H "Content-Type: application/json" \
    http://localhost:5000/api/v1.0/users
$ curl \
    --request DELETE \
    --verbose \
    --header "Content-Type: application/json" \
    http://localhost:5000/api/v1.0/users/2
$ curl \
    -v \
    -H "Content-Type: application/json" \
    http://localhost:5000/api/v1.0/users
```

# `03/backend/database`

Flask-Migrate provides all the migration-related commands as extensions to the `flask`
command. All the commands that are related to database migrations start with `flask db`.

```
# 1. initialize a migration repository
(venv) $ export FLASK_APP=goal_tracker.py
(venv) $ flask db init

# 2. treat the contents of the created `migrations` directory (= the scripts describing
#    changes to the database schema) as part of the application
(venv) $ git add migrations
(venv) $ git commit -m 'create the migrations resository'

# 3. create the first migration
(venv) $ flask db migrate -m 'users table'

# 4. apply the migration to the database
(venv) $ flask db upgrade

# 5. in the same way, the last migration can be undone by issuing
$    `(venv) $ flask db downgrade` which provides a very flexible framework,
#    in which you can work with changes to your database,
#    and the important aspect is that all these migrations preserve the data that you
#    have in your database
```

There are a few more useful commands that work with the migration history:
```
# 6. get the list of migrations
(venv) $ flask db history

# 7. 
(venv) $ flask db current
```

All commands from the previous section continue to work (without modification). The only
difference is that executing those commands is, of course, going to modify the database
(instead of an in-memory structure).

# `04/backend/securing-the-RESTful-web-service`

```
$ curl \
    -v \
    -H "Content-Type: application/json" \
    http://localhost:5000/api/v1.0/users
$ curl \
    -X POST \
    -v \
    -H "Content-Type: application/json" \
    -d '{"email": "john.doe@gmail.com", "password": "123456"}' \
    http://localhost:5000/api/v1.0/users
$ curl \
    -X POST \
    -v \
    -H "Content-Type: application/json" \
    -d '{"email": "mary.smith@yahoo.com", "password": "123456"}' \
    http://localhost:5000/api/v1.0/users
$ curl \
    -v \
    -H "Content-Type: application/json" \
    http://localhost:5000/api/v1.0/users

$ curl \
    -v \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"email": "testing@example.com", "password": "testing"}' \
    http://localhost:5000/api/v1.0/users

$ curl \
    --verbose \
    --request PUT \
    --header "Content-Type: application/json" \
    --data '{"email": "testing@testing.com"}' \
    http://localhost:5000/api/v1.0/users/3
$ curl \
    --verbose \
    --request PUT \
    --header "Content-Type: application/json" \
    --data '{"email": "testing@testing.com"}' \
    --user testing@example.com:testing \
    http://localhost:5000/api/v1.0/users/2
$ curl \
    --verbose \
    --request PUT \
    --header "Content-Type: application/json" \
    --data '{"email": "testing@testing.com"}' \
    --user testing@example.com:testing \
    http://localhost:5000/api/v1.0/users/3

$ curl \
    --verbose \
    --request DELETE \
    --header "Content-Type: application/json" \
    http://localhost:5000/api/v1.0/users/2
$ curl \
    --verbose \
    --request DELETE \
    --header "Content-Type: application/json" \
    --user testing@testing.com:testing \
    http://localhost:5000/api/v1.0/users/2
$ curl \
    --verbose \
    --request DELETE \
    --header "Content-Type: application/json" \
    --user testing@testing.com:testing \
    http://localhost:5000/api/v1.0/users/3
```

# `05/backend/securing-with-jws-tokens`

```
$ curl \
    -v \
    -X POST \
    http://localhost:5000/api/v1.0/tokens

$ curl \
    -v \
    -X POST \
    --user john.doe@gmail.com:123456 \
    http://localhost:5000/api/v1.0/tokens
$ export T1=<the_returned_JWS_token>
$ curl \
    -v \
    -H "Authorization: Bearer $T1" \
    http://localhost:5000/welcome
$ curl \
    -v \
    -H "Authorization: Bearer <any_tampering_of_T1_no_matter_how_small> \
    http://localhost:5000/welcome

$ curl \
    -v \
    -X POST \
    --user mary.smith@yahoo.com:123456 \
    http://localhost:5000/api/v1.0/tokens
$ export T2=<the_returned_JWS_token>
$ curl \
    -v \
    -H "Authorization: Bearer $T2" \
    http://localhost:5000/welcome
$ curl \
    -v \
    -H "Authorization: Bearer <any_tampering_of_T2_no_matter_how_small> \
    http://localhost:5000/welcome
```

# `06/backend/unit-tests`

Executing the following command creates an `htmlcov` directory:
```
(venv) $ python tests.py
```
but neither does executing the tests through VS Code, nor does executing
```
(venv) $ python -m unittest discover -v .
```

To get a report of unittest coverage, first issue
```
$ coverage run -m unittest tests.py
$ coverage html --omit="venv/*",tests.py,"__pycache__/*"
```
and then go on to open `htmlcov/goal_tracker.py.html`.

# `07/backend/goals-resources`

[Nothing to record.]

# `2020/11/06/07-53/08/backend/intervals`

```
$ rm goal_tracker.db

$ export FLASK_APP=goal_tracker.py
$ flask db history
$ flask db current
$ flask db upgrade
$ flask db current
```

```
$ curl \
    -v \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"email": "john.doe@gmail.com", "password": "123456"}' \
    http://localhost:5000/api/v1.0/users
$ curl \
    -v \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"email": "mary.smith@yahoo.com", "password": "789"}' \
    http://localhost:5000/api/v1.0/users

$ curl \
    -v \
    -X POST \
    -H "Content-Type: application/json" \
    --user "john.doe@gmail.com:123456" \
    http://localhost:5000/api/v1.0/tokens
$ export T1=<the_returned_JWS_token>
$ curl \
    -v \
    -X POST \
    -H "Content-Type: application/json" \
    --user "mary.smith@yahoo.com:789" \
    http://localhost:5000/api/v1.0/tokens
$ export T2=<the_returned_JWS_token>

$ curl \
    -v \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $T1" \
    -d '{"description": "Read a book about blockchain technology"}' \
    http://localhost:5000/api/v1.0/goals
$ curl \
    -v \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $T1" \
    -d '{"description": "Take a course in self-defense"}' \
    http://localhost:5000/api/v1.0/goals

$ curl \
    -v \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $T2" \
    -d '{"description": "Take a course in self-defense"}' \
    http://localhost:5000/api/v1.0/goals
```

```
$ flask db migrate -m 'intervals table (related to the goals table in many-to-1 manner)'

$ flask db history
$ flask db current

$ flask db upgade
$ flask db history
$ flask db current
```

Each of the following POST requests to `http://localhost:5000/api/v1.0/intervals` fails:
```
$ curl \
    -v \
    -X POST \
    -d '{"goal_id": 1}' \
    http://localhost:5000/api/v1.0/intervals

$ curl \
    -v \
    -X POST \
    -H "Authorization: Bearer $T2" \
    -d '{"goal_id": 1}' \
    http://localhost:5000/api/v1.0/intervals

$ curl \
    -v \
    -X POST \
    -H "Authorization: Bearer $T2" \
    -H "Content-Type: application/json" \
    -d '{"goal_id": 1}' \
    http://localhost:5000/api/v1.0/intervals

$ curl \
    -v \
    -X POST \
    -H "Authorization: Bearer $T1" \
    -H "Content-Type: application/json" \
    -d '{"goal_id": 1}' \
    http://localhost:5000/api/v1.0/intervals
$ curl \
    -v \
    -X POST \
    -H "Authorization: Bearer $T1" \
    -H "Content-Type: application/json" \
    -d '{"goal_id": 1, "start": "2020-11-05 08:45"}' \
    http://localhost:5000/api/v1.0/intervals
$ curl \
    -v \
    -X POST \
    -H "Authorization: Bearer $T1" \
    -H "Content-Type: application/json" \
    -d '{"goal_id": 1, "final": "2020-11-05 08:45"}' \
    http://localhost:5000/api/v1.0/intervals

$ curl \
    -v \
    -X POST \
    -H "Authorization: Bearer $T1" \
    -H "Content-Type: application/json" \
    -d '{"goal_id": 1, "start": "-11-05 08:45", "final": "2020-11-05 09:16"}' \
    http://localhost:5000/api/v1.0/intervals
```
whereas each of the following ones works:
```
$ curl \
    -v \
    -X POST \
    -H "Authorization: Bearer $T1" \
    -H "Content-Type: application/json" \
    -d '{"goal_id": 1, "start": "2020-11-05 08:45", "final": "2020-11-05 09:15"}' \
    http://localhost:5000/api/v1.0/intervals

$ curl \
    -v \
    -X POST \
    -H "Authorization: Bearer $T2" \
    -H "Content-Type: application/json" \
    -d '{"goal_id": 3, "start": "2020-11-06 08:45", "final": "2020-11-06 09:15"}' \
    http://localhost:5000/api/v1.0/intervals

$ curl \
    -v \
    -X POST \
    -H "Authorization: Bearer $T1" \
    -H "Content-Type: application/json" \
    -d '{"goal_id": 2, "start": "2020-11-07 08:45", "final": "2020-11-07 09:15"}' \
    http://localhost:5000/api/v1.0/intervals

$ curl \
    -v \
    -X POST \
    -H "Authorization: Bearer $T1" \
    -H "Content-Type: application/json" \
    -d '{"goal_id": 2, "start": "3333-11-07 08:45", "final": "3333-11-07 09:15"}' \
    http://localhost:5000/api/v1.0/intervals
```

At this point, it is possible and advisable to issue a `sqlite3 goal_tracker.db` and to
run the following query:
```
SELECT users.email, goals.description, intervals.id, intervals.start, intervals.final
FROM users
    JOIN goals ON users.id = goals.user_id
    JOIN intervals ON goals.id = intervals.goal_id;
```

Each of the following GET requests to `http://localhost:5000/api/v1.0/intervals` fails:
```
$ curl \
    -v \
    -X GET \
    http://localhost:5000/api/v1.0/intervals
```
whereas each of the following ones works:
```
$ curl \
    -v \
    -X GET \
    -H "Authorization: Bearer $T1" \
    http://localhost:5000/api/v1.0/intervals
$ curl \
    -v \
    -X GET \
    -H "Authorization: Bearer $T2" \
    http://localhost:5000/api/v1.0/intervals
```

Each of the following GET requests to
`http://localhost:5000/api/v1.0/intervals/<int:interval_id>` fails:
```
$ curl \
    -v \
    -X GET \
    http://localhost:5000/api/v1.0/intervals/1

$ curl \
    -v \
    -X GET \
    -H "Authorization: Bearer $T2" \
    http://localhost:5000/api/v1.0/intervals/1
```
whereas each of the following ones works:
```
$ curl \
    -v \
    -X GET \
    -H "Authorization: Bearer $T1" \
    http://localhost:5000/api/v1.0/intervals/1
$ curl \
    -v \
    -X GET \
    -H "Authorization: Bearer $T2" \
    http://localhost:5000/api/v1.0/intervals/2
```

Each of the following PUT requests to
`http://localhost:5000/api/v1.0/intervals/<int:inteval_id>` fails:
```
$ curl \
    -v \
    -X PUT \
    -d '{"final": "2020-11-05 09:15"}' \
    http://localhost:5000/api/v1.0/intervals/1

$ curl \
    -v \
    -X PUT \
    -H "Authorization: Bearer $T2" \
    -d '{"final": "2020-11-05 09:15"}' \
    http://localhost:5000/api/v1.0/intervals/1

$ curl \
    -v \
    -X PUT \
    -H "Authorization: Bearer $T2" \
    -H "Content-Type: application/json" \
    -d '{"final": "2020-11-05 09:15"}' \
    http://localhost:5000/api/v1.0/intervals/1

$ curl \
    -v \
    -X PUT \
    -H "Authorization: Bearer $T1" \
    -H "Content-Type: application/json" \
    -d '{"start": "2020-11-04 18:00", "final": "2020-11-04 19:00"}' \
    http://localhost:5000/api/v1.0/intervals/2

$ curl \
    -v \
    -X PUT \
    -H "Authorization: Bearer $T1" \
    -H "Content-Type: application/json" \
    -d '{"goal_id": "1", "start": "1111-11-04 18:00"}' \
    http://localhost:5000/api/v1.0/intervals/4
```
whereas each of the following ones works:
```
$ curl \
    -v \
    -X PUT \
    -H "Authorization: Bearer $T1" \
    -H "Content-Type: application/json" \
    -d '{"final": "2020-11-05 09:00"}' \
    http://localhost:5000/api/v1.0/intervals/1
$ curl \
    -v \
    -X PUT \
    -H "Authorization: Bearer $T2" \
    -H "Content-Type: application/json" \
    -d '{"start": "2020-11-04 18:00", "final": "2020-11-04 19:00"}' \
    http://localhost:5000/api/v1.0/intervals/2
$ curl \
    -v \
    -X PUT \
    -H "Authorization: Bearer $T1" \
    -H "Content-Type: application/json" \
    -d '{"start": "2020-11-04 18:00", "final": "2020-11-04 19:00"}' \
    http://localhost:5000/api/v1.0/intervals/3

$ curl \
    -v \
    -X PUT \
    -H "Authorization: Bearer $T1" \
    -H "Content-Type: application/json" \
    -d '{"goal_id": 1, "start": "1111-11-04 18:00"}' \
    http://localhost:5000/api/v1.0/intervals/4
```

Each of the following DELETE requests to
`http://localhost:5000/api/v1.0/intervals/<int:interval_id>` fails:
```
$ curl \
    -v \
    -X DELETE \
    http://localhost:5000/api/v1.0/intervals/4
$ curl \
    -v \
    -X DELETE \
    -H "Authorization: Bearer $T2" \
    http://localhost:5000/api/v1.0/intervals/4
```
but the following one works:
```
$ curl \
    -v \
    -X DELETE \
    -H "Authorization: Bearer $T1" \
    http://localhost:5000/api/v1.0/intervals/4
```