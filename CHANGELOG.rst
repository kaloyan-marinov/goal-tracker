v0.1 (2021/04/04)
-----------------

``GoalTracker`` is a web application, which aims to help you keep track of how much time you spend in pursuit of your goals.

Its implementation is composed of a backend sub-project and a frontend sub-project.

The backend sub-project uses the following technologies:

- Python

- Flask, Flask-Migrate, Flask-HTTPAuth, ``werkzeug.security``

- the Python Standard Library's ``unittest`` module, the ``coverage`` package

- MySQL

The frontend sub-project uses the following technologies:

- JavaScript

- React

- React-Router

- Redux

- Axios

- Redux-Thunk

v0.2 (2021/08/20)
-----------------

- implement a test suite for the frontend sub-project using Jest (which was a major omission in the previous version)

-------

- add ``dispatch`` to the dependency array of each ``React.useEffect`` call

- switch from handling JavaScript ``Promise``-s by means of ``.then()`` / ``.catch()`` chains to handling them by means of "the ``try``-``await``-``catch`` pattern"

- convert the ``authReducer`` reducer into a pure function, by relocating the following side effects out of that reducer: ``localStorage.setItem('goal-tracker-token', token)`` and ``localStorage.removeItem('goal-tracker-token')``

- prevent a successful registration from immediately logging the user in

- fix the way in which the ``goalsReducer`` handles certain actions

- fix the way in which the ``intervalsReducer`` handles certain actions

- change ``<PrivateRoute>`` to use the ``children`` instead of the ``component`` prop

-------

- implement pagination of ``Interval`` resources

v0.3 (2021/08/22)
-----------------

- add ``CHANGELOG.rst``
