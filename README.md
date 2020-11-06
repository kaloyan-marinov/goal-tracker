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
$ curl --verbose --header "Content-Type: application/json" http://localhost:5000/api/v1.0/users
$ curl --verbose --header "Content-Type: application/json" http://localhost:5000/api/v1.0/users/1

$ curl --request POST --verbose --header "Content-Type: application/json" --data '{"email": "john.doe@gmail.com"}' http://localhost:5000/api/v1.0/users
$ curl -v -H "Content-Type: application/json" http://localhost:5000/api/v1.0/users/1

$ curl -X POST -v -H "Content-Type: application/json" -d '{"email": "john.doe@gmail.com"}' http://localhost:5000/api/v1.0/users
$ curl -X POST -v -H "Content-Type: application/json" -d '{"email": "mary.smith@yahoo.com"}' http://localhost:5000/api/v1.0/users
$ curl -v -H "Content-Type: application/json" http://localhost:5000/api/v1.0/users

$ curl -X PUT -v -H "Content-Type: application/json" -d '{"email": "b.b@yahoo.com"}' http://localhost:5000/api/v1.0/users/2
$ curl -v -H "Content-Type: application/json" http://localhost:5000/api/v1.0/users
$ curl -X PUT -v -H "Content-Type: application/json" -d '{"email": "john.doe@gmail.com"}' http://localhost:5000/api/v1.0/users/2
$ curl -v -H "Content-Type: application/json" http://localhost:5000/api/v1.0/users
$ curl -X PUT -v -H "Content-Type: application/json" -d '{"email": "mary.smith@yahoo.com"}' http://localhost:5000/api/v1.0/users/2
$ curl -v -H "Content-Type: application/json" http://localhost:5000/api/v1.0/users

$ curl --request DELETE --verbose --header "Content-Type: application/json" http://localhost:5000/api/v1.0/users/1
$ curl -v -H "Content-Type: application/json" http://localhost:5000/api/v1.0/users
$ curl --request DELETE --verbose --header "Content-Type: application/json" http://localhost:5000/api/v1.0/users/2
$ curl -v -H "Content-Type: application/json" http://localhost:5000/api/v1.0/users
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
