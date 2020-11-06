```
$ python3 --version
Python 3.8.3
$ python 3 -m venv venv
$ source venv/bin/activate
(venv) $ pip install --upgrade pip
(venv) $ pip install -r requirements.txt
```

```
$ curl --include --header "Content-Type: application/json" http://localhost:5000/api/v1.0/users
$ curl --include --header "Content-Type: application/json" http://localhost:5000/api/v1.0/users/1
$ curl --include --header "Content-Type: application/json" http://localhost:5000/api/v1.0/users/2

$ curl --include --header "Content-Type: application/json" http://localhost:5000/api/v1.0/users/3

$ curl --request POST --include --header "Content-Type: application/json" --data '{"name": "A B", "email_address": "a.b@gmail.com"}' http://localhost:5000/api/v1.0/users
$ curl -i -H "Content-Type: application/json" http://localhost:5000/api/v1.0/users
$ curl -i -H "Content-Type: application/json" http://localhost:5000/api/v1.0/users/3

$ curl --request PUT --include --header "Content-Type: application/json" --data '{"name": "A B"}' http://localhost:5000/api/v1.0/users/2
$ curl -i -H "Content-Type: application/json" http://localhost:5000/api/v1.0/users
$ curl -X PUT -i -H "Content-Type: application/json" -d '{"email_address": "a.b@yahoo.com"}' http://localhost:5000/api/v1.0/users/2
$ curl -i -H "Content-Type: application/json" http://localhost:5000/api/v1.0/users
$ curl -X PUT -i -H "Content-Type: application/json" -d '{"name": "Mary Smith", "email_address": "mary.smith@yahoo.com"}' http://localhost:5000/api/v1.0/users/2
$ curl -i -H "Content-Type: application/json" http://localhost:5000/api/v1.0/users

$ curl --request DELETE --include --header "Content-Type: application/json" http://localhost:5000/api/v1.0/users/1
$ curl -i -H "Content-Type: application/json" http://localhost:5000/api/v1.0/users
```