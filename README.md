# Table of Contents

This repository's documentation is organized as follows.

1. [Introduction](#introduction)

2. [How to set up the project for local development](#how-to-set-up-the-project-for-local-development)

3. [Future plans](#future-plans)

# Introduction

`GoalTracker` is a web application that ... [TBD]

# How to set up the project for local development

1. clone this repository, and navigate into your local repository

2. at the the root of your local repository, create a `.env` file with the following structure:
    ```
    GOAL_TRACKER_CONFIG=development

    SECRET_KEY=<specify-a-good-secret-key-here>
    DATABASE_URL=sqlite:///<absolute-path-starting-with-a-leading-slash-and-pointing-to-an-SQLite-file>
    ```

    (For deployment, you should generate a "good secret key" and store that value in `SECRET_KEY` within the `.env` file; to achieve that, take a look at the "How to generate good secret keys" section on https://flask.palletsprojects.com/en/1.1.x/quickstart/ . For local development, something like `keep-this-value-known-only-to-the-deployment-machine` should suffice.)

3. set up the backend

    - create a Python virtual environment, activate it, and install all dependencies:
        ```
        $ python3 --version
        Python 3.8.3

        $ python3 -m venv venv

        $ source venv/bin/activate
        (venv) $ pip install --upgrade pip
        (venv) $ pip install -r requirements.txt
        ```

    - run the tests:

        ```
        (venv) $ FLASK_APP=dev_server.py flask test
        ```
    
    - create an empty SQLite database and apply all database migrations:
        ```
        (venv) $ FLASK_APP=goal_tracker:create_app flask db upgrade
        ```

    - verify that the previous step was successful by issuing `$ sqlite3 <the-value-of-GOAL_TRACKER_CONFIG-in-your-.env-file>` and then issuing:
        ```
        SQLite version 3.32.3 2020-06-18 14:16:19
        Enter ".help" for usage hints.
        sqlite> .tables
        alembic_version  goals            intervals        users          
        sqlite> .schema users
        CREATE TABLE users (
                id INTEGER NOT NULL, 
                email VARCHAR(128), password_hash VARCHAR(128), 
                PRIMARY KEY (id)
        );
        CREATE UNIQUE INDEX ix_users_email ON users (email);
        sqlite> .schema goals
        CREATE TABLE goals (
                id INTEGER NOT NULL, 
                description VARCHAR(256), 
                user_id INTEGER, 
                PRIMARY KEY (id), 
                FOREIGN KEY(user_id) REFERENCES users (id)
        );
        sqlite> .schema intervals
        CREATE TABLE intervals (
                id INTEGER NOT NULL, 
                start DATETIME, 
                final DATETIME, 
                goal_id INTEGER, 
                PRIMARY KEY (id), 
                FOREIGN KEY(goal_id) REFERENCES goals (id)
        );
        sqlite> .quit
        ```

    - deactivate the Python virtual environment
        ```
        (venv) $ deactivate
        $ 
        ```

4. set up the frontend

    - install the Node.js dependenies:

        ```
        $ cd client
        client $ npm install
        ```

5. start serving the backend application and the frontend application

    - launch a terminal instance and, in it, start a process responsible for serving the backend application:

        ```
        $ source venv/bin/activate
        (venv) $ FLASK_APP=dev_server.py flask run
         * Serving Flask app "dev_server.py"
         * Environment: production
        WARNING: This is a development server. Do not use it in a production deployment.
        Use a production WSGI server instead.
         * Debug mode: off
        goal_tracker/__init__.py - config_name=development
        dev_server.py - app.config['SQLALCHEMY_DATABASE_URI']=<the-value-of-DATABASE_URL-in-your-.env-file>
         * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
        ```

        at this point, it is a good idea to verify that the backend is up and running - launch another terminal instance and, in it, issue:
        ```
        $ curl -v localhost:5000/api/v1.0/users
        *   Trying 127.0.0.1...
        * TCP_NODELAY set
        * Connected to localhost (127.0.0.1) port 5000 (#0)
        > GET /api/v1.0/users HTTP/1.1
        > Host: localhost:5000
        > User-Agent: curl/7.64.1
        > Accept: */*
        > 
        * HTTP 1.0, assume close after body
        < HTTP/1.0 200 OK
        < Content-Type: application/json
        < Content-Length: 13
        < Server: Werkzeug/1.0.1 Python/3.8.3
        < Date: Mon, 15 Mar 2021 15:54:51 GMT
        < 
        {"users":[]}
        * Closing connection 0

        $ exit
        ```

    - launch a separate terminal instance and, in it, start a process responsible for serving the frontend application:

        ```
        $ cd client
        client $ npm start

        > client@0.1.0 start <absolute-path-to-your-local-clone-of-this-repo>/client
        > react-scripts start

        ```
        and a tab in your operating system's default web browser should open up and load the address localhost:3000/

# `06/backend/unit-tests`

executing the tests through VS Code

executing
```
(venv) $ python -m unittest discover -v .
```

To get a report of unittest coverage, first issue

```
$ coverage run -m unittest tests/tests.py
$ coverage html --omit="venv/*","tests/*","__pycache__/*"
```

and then go on to open `htmlcov/index.html`.

# `2021/02/04/06_53/28/backend/use-an-application-factory-function`

1. You can run the tests in several (at-least-at-this-stage-insignificantly-different) ways:
  
    (a) _with coverage and produce an HTML report_

    ```
    (venv) goal-tracker $ coverage run -m unittest discover -v tests/



    test_with_one_user (tests.TestIntervals) ... goal_tracker/__init__.py - config_name=testing
    tests/tests.py - self.app.config['SQLALCHEMY_DATABASE_URI']=sqlite://
    tests/tests.py - self.app.config['TESTING']=True
    ok
    ...
    ----------------------------------------------------------------------
    Ran 8 tests in 4.252s

    OK
    ```

    ```
    (venv) goal-tracker $ coverage html --omit="venv/*","tests/*","__pycache__/*"



    [the last command doesn't output anything in the terminal,
    but it creates a folder called `htmlcov`]
    ```

    open the `htmlcov/index.html` file in your web browser

    (b) _with coverage but without producing an HTML report_
    ```
    (venv) goal-tracker $ FLASK_APP=dev_server.py flask test



    goal_tracker/__init__.py - config_name=development
    dev_server.py - app.config['SQLALCHEMY_DATABASE_URI']=sqlite:///<the-value-of-GOAL_TRACKER_CONFIG-in-your-.env-file>
    test_with_one_user (tests.tests.TestIntervals) ... goal_tracker/__init__.py - config_name=testing
    tests/tests.py - self.app.config['SQLALCHEMY_DATABASE_URI']=sqlite://
    tests/tests.py - self.app.config['TESTING']=True
    ok
    ...
    ----------------------------------------------------------------------
    Ran 8 tests in 5.004s

    OK

    Name                       Stmts   Miss Branch BrPart  Cover
    ------------------------------------------------------------
    config.py                     16      0      0      0   100%
    goal_tracker/__init__.py      21      1      2      1    91%
    goal_tracker/api.py          234      4     88      5    97%
    goal_tracker/auth.py          36      0      6      0   100%
    goal_tracker/models.py        34      3      0      0    91%
    goal_tracker/utils.py          6      0      0      0   100%
    ------------------------------------------------------------
    TOTAL                        347      8     96      6    97%
    ```

    (c) _without coverage and without producing an HTML report_

    To achieve that, you can either use the command line:
    ```
    (venv) goal-tracker $ python -m unittest discover -v tests/



    test_with_one_user (tests.TestIntervals) ... goal_tracker/__init__.py - config_name=testing
    tests/tests.py - self.app.config['SQLALCHEMY_DATABASE_URI']=sqlite://
    tests/tests.py - self.app.config['TESTING']=True
    ok
    ...
    ----------------------------------------------------------------------
    Ran 8 tests in 3.883s

    OK
    ```
    or VS Code:
    ```
    [in VS Code (Version: 1.53.0), use the IDE's GUI by clicking on "Run All Tests"]



    [still in IDE's GUI, click on "Show Test Output"]
    test_with_one_user (tests.TestIntervals) ... goal_tracker/__init__.py - config_name=testing
    tests/tests.py - self.app.config['SQLALCHEMY_DATABASE_URI']=sqlite://
    tests/tests.py - self.app.config['TESTING']=True
    ok
    ...
    ----------------------------------------------------------------------
    Ran 8 tests in 5.096s

    OK
    ```

2. You can use the Flask development server to run/start//serve the application. That can be achieved in several (at-least-at-this-stage-insignificantly-different) ways:

    (a) the "new way" of running/starting//serving a Flask application (i.e. invoking `flask run`) on the command line:
    ```
    (venv) goal-tracker $ FLASK_APP=goal_tracker_dev_server.py flask run



    * Serving Flask app "goal_tracker_dev_server.py"
    * Environment: production
    WARNING: This is a development server. Do not use it in a production deployment.
    Use a production WSGI server instead.
    * Debug mode: off
    goal_tracker/__init__.py - config_name=development
    goal_tracker_dev_server.py - app.config['SQLALCHEMY_DATABASE_URI']=sqlite:////<absolute-path-to->/goal-tracker/goal_tracker.db
    * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
    ```

    (b) the "old way" of running/starting//serving a Flask application (i.e. using `if __name__ == "__main__": app.run()` in a module where a `Flask` (application) object is created, and invoking `python`) on the command line:
    ```
    (venv) goal-tracker $ python goal_tracker_dev_server.py 



    goal_tracker/__init__.py - config_name=development
    goal_tracker_dev_server.py - app.config['SQLALCHEMY_DATABASE_URI']=sqlite:////<absolute-path-to->/goal-tracker/goal_tracker.db
    * Serving Flask app "goal_tracker" (lazy loading)
    * Environment: production
    WARNING: This is a development server. Do not use it in a production deployment.
    Use a production WSGI server instead.
    * Debug mode: on
    * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
    ```

    (c) the "new way" of running/starting//serving a Flask application from VS Code:
    ```
    [use VS Code to launch "[new way] Python Flask"]



    (venv) goal-tracker $  cd /<absolute-path-to->/goal-tracker ; /usr/bin/env /<absolute-path-to->/goal-tracker/venv/bin/python3 ~/.vscode/extensions/ms-python.python-2021.1.502429796/pythonFiles/lib/python/debugpy/launcher 49168 -- -m flask run --no-debugger --no-reload 
    * Serving Flask app "goal_tracker_dev_server.py"
    * Environment: development
    * Debug mode: off
    goal_tracker/__init__.py - config_name=development
    goal_tracker_dev_server.py - app.config['SQLALCHEMY_DATABASE_URI']=sqlite:////<absolute-path-to->/goal-tracker/goal_tracker.db
    * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
    ```

    (d) the "old way" of running/starting//serving a Flask application from VS Code:
    ```
    [use VS Code to launch "[old way] Python Flask"]



    (venv) goal-tracker $  cd /<absolute-path-to->/goal-tracker ; /usr/bin/env /<absolute-path-to->/goal-tracker/venv/bin/python3 ~/.vscode/extensions/ms-python.python-20.1.502429796/pythonFiles/lib/python/debugpy/launcher 49196 -- -m goal_tracker_dev_server 
    goal_tracker/__init__.py - config_name=development
    goal_tracker_dev_server.py - app.config['SQLALCHEMY_DATABASE_URI']=sqlite:////<absolute-path-to->/goal-tracker/goal_tracker.db
    * Serving Flask app "goal_tracker" (lazy loading)
    * Environment: development
    * Debug mode: on
    * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
    ```

# Future plans

... [TBD]