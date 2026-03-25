from flask import Flask

from app.routes.health import health_bp
from app.routes.projects import projects_bp
from app.routes.contact import contact_bp


def register_routes(app: Flask) -> None:
    """Register all API blueprints."""
    app.register_blueprint(health_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(contact_bp)
