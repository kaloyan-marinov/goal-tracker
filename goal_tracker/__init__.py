import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer

from config import config


# Create instances of necessary Flask extensions.
db = SQLAlchemy()
migrate = Migrate()


# Import the models so that they are registered with SQLAlchemy.
from . import models


def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get("GOAL_TRACKER_CONFIG", "development")
    print(f"goal_tracker/__init__.py - config_name={config_name}")

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize the Flask extensions.
    db.init_app(app)
    migrate.init_app(app, db)

    # fmt: off
    '''
    Since we don't have an extension to initialize in the global scope,
    we are going to do things directly in the Application Factory Function
    - namely, we add a TimedJSONWebSignatureSerializer attribute to the application instance.
    
    (This isn't the only way to do things, but adding it as an attribute to the
    application ensures that, wherever you have access to `current_app`, you
    will also have access to the TimedJSONWebSignatureSerializer instance.)
    '''
    # fmt: on
    app.token_serializer = Serializer(app.config["SECRET_KEY"], expires_in=3600)

    # Register `Blueprint`(s) with the application instance.
    # (By themselves, `Blueprint`s are "inactive".)
    from .api import api_bp

    app.register_blueprint(api_bp, url_prefix="/api/v1.0")

    return app
