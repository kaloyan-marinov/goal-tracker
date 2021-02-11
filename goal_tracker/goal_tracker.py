import os
import subprocess
import sys

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer

from config import config


app = Flask(__name__)
config_name = os.environ.get("GOAL_TRACKER_CONFIG", "development")
print(f"goal_tracker/goal_tracker.py - config_name={config_name}")
app.config.from_object(config[config_name])
print(
    f"goal_tracker/goal_tracker.py - app.config['SQLALCHEMY_DATABASE_URI']={app.config['SQLALCHEMY_DATABASE_URI']}"
)


@app.cli.command()
def test():
    """Run unit tests."""
    tests = subprocess.call(["python", "-c", "import tests; tests.run()"])
    sys.exit(tests)


db = SQLAlchemy(app)

migrate = Migrate(app, db)

token_serializer = Serializer(app.config["SECRET_KEY"], expires_in=3600)


from .models import User, Goal, Interval

from .api import api_bp


app.register_blueprint(api_bp, url_prefix="/api/v1.0")
