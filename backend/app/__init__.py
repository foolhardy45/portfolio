import logging
import os

from flask import Flask
from flask_cors import CORS
from flask_mail import Mail
from flask_migrate import Migrate

from app.config import config_by_name
from app.extensions import db, init_db, metadata
from app.errors.handlers import register_error_handlers
from app.routes import register_routes
from app.routes.contact import limiter

# Ensure table definitions are imported so metadata is populated
import app.models  # noqa: F401

mail = Mail()
migrate = Migrate()


def create_app(config_name: str | None = None) -> Flask:
    """Application factory.

    Args:
        config_name: One of 'development', 'testing', 'production'.
                     Defaults to the FLASK_ENV environment variable.

    Returns:
        A configured Flask application instance.
    """
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Logging
    logging.basicConfig(
        level=logging.DEBUG if app.debug else logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    # Extensions
    CORS(app, origins=app.config["CORS_ORIGINS"])
    init_db(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)

    # Routes & error handlers
    register_routes(app)
    register_error_handlers(app)

    return app
