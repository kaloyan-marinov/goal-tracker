# Table of Contents

This repository's documentation is organized as follows.

1. [Introduction](#introduction)

2. [Motivation](#motivation)

3. [The functionality provided by the web application](#the-functionality-provided-by-the-web-application)

4. [How to set up the project for local development](#how-to-set-up-the-project-for-local-development)

5. [Different options for serving our backend application](#different-options-for-serving-our-backend-application)

6. [Future plans](#future-plans)

# Introduction

`GoalTracker` is a web application, which aims to help you _form a clear, focused idea of who you are today and who you want to be tomorrow_.

I decided to build such an application after watching a YouTube video titled "Seneca - How To Manage Your Time (Stoicism)". That video was posted on August 26, 2019 in the "Philosophies for Life" channel on YouTube. More specifically, my motivation for building `GoalTracker` came about as a combination of (a) thoughts about work-life balance that are at the forefront of my mind, and (b) ideas that are presented in the video.

# Motivation

Seneca’s essay “On the shortness of life” offers us an urgent reminder about the non-renewability of our most important resource - our time. Time is our least renewable and therefore most valuable resource. To wit:

- on the one hand, if you have time (such as 20, 30, or 40 years left in your life) but run out of money, _it is possible (albeit not always easy) for you to earn more money_;

- on the other hand, if you have money but your life is approaching its end, _there don't exist any ways for you to earn more time_.

Furthermore, we all work hard to essentially earn two things: money and time that we can spend as we see fit. In view of that as well as of the non-renewability of time, it logically follows that we should not waste the free time we earn. Unfortunately, achieving that in today's world is easier said than done, because:

(a) a prominent part of contemporary life is what can be aptly described as "open-ended forms of entertainment", which are pervasive and omnipresent; while open-ended forms of entertainment (such as TV series, video games, social media, etc.) are not inherently bad, we can easily allow them to consume too much of our waking hours; and

(b) spending our free time "as we see fit" can include things that range from spending quality time with people we love or exercising regularly; to traveling; to developing a useful skill or seeking out new opportunities.

# The functionality provided by the web application

In a nutshell, `GoalTracker` aims to help you protect your hard-earned free time from leaking out uncontrollably.

For any activity that is meaningful to your vision of life, you can create a corresponding entity called a _Goal_. Whether the underlying activity is continuous in nature (such as spending time with your family) or term-limited (such as attaining a Grade Point Average of at least 3.5 in the next semester) remains entirely within your control.

In addition to that, there is another important feature that `GoalTracker` provides - namely, it allows you to create _Interval_ records, which encapsulate how much time you have spent in pursuit of each of your _Goals_.

In summary, `GoalTracker` enables you to maintain enough self-awareness to remember the lessons of your past, so as to be more effective today.

- Firstly, by making _Goal_ and _Interval_ records within your personal `GoalTracker` account, you shine a light on the things that make excessive demands on your time.

- Secondly and if need be, you can re-prioritize your _Goals_ in order to begin investing more of your hard-earned free time in those _Goals_ that are truly valuable to your own vision of life.

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

        - option A - without coverage (which, obviously, can't and won't produce a coverage report in HTML format)

            ```
            (venv) $ python -m unittest discover -v tests/
            
            [or, in VS Code (Version: 1.53.0),
            use the IDE's GUI by clicking on "Run All Tests";
            once the tests have been executed, click on "Show Test Output"]
            ```

        - option B - with coverage but don't produce an HTML report

            ```
            (venv) $ FLASK_APP=dev_server.py flask test
            [
                the last command outputs a coverage report in plaintext format
                within the terminal, and creates a file called `.coverage`
            ]
            ```
        
        - option C - with coverage and produce an HTML report

            ```
            (venv) $ coverage run -m unittest discover -v tests/
            [
                the last command creates a file called `.coverage`
            ]
            
            (venv) $ coverage html --omit="venv/*","tests/*","__pycache__/*"
            [
                the last command doesn't output anything in the terminal,
                but it creates a folder called `htmlcov`
            ]
            
            [open the `htmlcov/index.html` file in your web browser]       
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

    - download the Node.js runtime and install it on your system:

        ```
        $ node --version
        v14.15.0
        $ npm --version
        6.14.8
        ```

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

# Different options for serving our backend application

This section is relevant only if you wish to set up the project for local development _specifically_ in VS Code. The core information within this section is based on the "Setting Up a Flask Application in Visual Studio Code" article by [Miguel Grinberg](https://blog.miguelgrinberg.com/post/about-me); that article is available at https://blog.miguelgrinberg.com/post/setting-up-a-flask-application-in-visual-studio-code

As the article explains in its "Better Debug Configuration" section:

- if you run your application outside of VS Code and your application crashes, it would:
    - either show the in-browser debugger when you are in debug mode,
    - or else just show an Internal Server Error page [in your browser] and log the exception to the terminal and/or log file;
    
- when working in/with VS Code, it would be desirable to have crashes reported in the VS Code debugger; unfortunately, one's first attempt at achieving that in VS Code is obstructed by an old bug in Flask

- the problem is that Flask does not properly configure the bubbling up of errors into an external debugger

Next, we are going to document 4 different options for starting a process that serves our backend application: the first 2 of those options are done outside VS Code (and, obviously, can't and won't cause crashes to be reported in the VS Code debugger), whereas the last 2 options are done from within VS Code but only the very last one causes crashes to be reported in the VS Code debugger. Those options are as follows:

- option 1 - the "new way" of serving our backend application from the command line is to invoke `flask run`:
    ```
    (venv) $ FLASK_APP=dev_server.py flask run



     * Serving Flask app "dev_server.py"
     * Environment: production
    WARNING: This is a development server. Do not use it in a production deployment.
    Use a production WSGI server instead.
     * Debug mode: off
    goal_tracker/__init__.py - config_name=development
    dev_server.py - app.config['SQLALCHEMY_DATABASE_URI']=<the-value-of-GOAL_TRACKER_CONFIG-in-your-.env-file>
    * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
    ```

- option 2 - the "old way" of serving our backend application from the command line is to start by using a `if __name__ == "__main__": app.run()` codeblock in our module where a `Flask` (application) object is created, and go on to invoke `python <that-module-s-name>`:
    ```
    (venv) $ python dev_server.py 



    goal_tracker/__init__.py - config_name=development
    dev_server.py - app.config['SQLALCHEMY_DATABASE_URI']=<the-value-of-GOAL_TRACKER_CONFIG-in-your-.env-file>
     * Serving Flask app "goal_tracker" (lazy loading)
     * Environment: production
    WARNING: This is a development server. Do not use it in a production deployment.
    Use a production WSGI server instead.
     * Debug mode: on
     * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
    ```

- option 3 - the "new way" of serving our backend application from VS Code is first to click on "Run and Debug" and then to launch the "[new way] Python Flask" run configuration:
    ```
    (venv) $  cd <absolute-path-to-your-local-clone-of-this-repo> ; /usr/bin/env <absolute-path-to-your-local-clone-of-this-repo>/venv/bin/python3 ~/.vscode/extensions/ms-python.python-2021.2.636928669/pythonFiles/lib/python/debugpy/launcher 57576 -- -m flask run --no-debugger --no-reload 
     * Serving Flask app "dev_server.py"
     * Environment: development
     * Debug mode: off
    goal_tracker/__init__.py - config_name=development
    dev_server.py - app.config['SQLALCHEMY_DATABASE_URI']=<the-value-of-GOAL_TRACKER_CONFIG-in-your-.env-file>
     * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
    ```

- option 4 - the "old way" of serving our backend application from VS Code is first to click on "Run and Debug" and then to launch the "[old way] Python Flask" run configuration:
    ```
    [use VS Code to launch "[old way] Python Flask"]



    (venv) goal-tracker $  cd <absolute-path-to-your-local-clone-of-this-repo>/goal-tracker-public ; /usr/bin/env <absolute-path-to-your-local-clone-of-this-repo>/goal-tracker-public/venv/bin/python3 ~/.vscode/extensions/ms-python.python-2021.2.636928669/pythonFiles/lib/python/debugpy/launcher 57609 -- -m dev_server 
    goal_tracker/__init__.py - config_name=development
    dev_server.py - app.config['SQLALCHEMY_DATABASE_URI']=<the-value-of-GOAL_TRACKER_CONFIG-in-your-.env-file>
     * Serving Flask app "goal_tracker" (lazy loading)
     * Environment: production
    WARNING: This is a development server. Do not use it in a production deployment.
    Use a production WSGI server instead.
     * Debug mode: on
     * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
    ```

# Future plans

- Transition from a SQLite database to a MySQL database

- Add styling to the frontend application

- Implement a mobile client
