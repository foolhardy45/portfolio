import uuid
from collections.abc import Generator
from datetime import datetime, timezone

import pytest
from flask import Flask
from flask.testing import FlaskClient
from sqlalchemy import insert

from app import create_app
from app.extensions import get_engine, metadata
from app.models.project import projects_table


@pytest.fixture()
def app() -> Generator[Flask, None, None]:
    """Create and configure a test application instance."""
    application = create_app("testing")

    # Create all tables in the in-memory SQLite database
    engine = get_engine()
    metadata.create_all(engine)

    yield application

    metadata.drop_all(engine)


@pytest.fixture()
def client(app: Flask) -> FlaskClient:
    """Return a test client for the app."""
    return app.test_client()


@pytest.fixture()
def seeded_projects(app: Flask) -> list[dict]:
    """Seed the database with sample projects and return them."""
    now = datetime.now(timezone.utc)
    projects = [
        {
            "id": uuid.uuid4(),
            "title": "Portfolio",
            "description": "Site portfolio personnel",
            "technologies": ["Angular", "Flask", "PostgreSQL"],
            "image_url": None,
            "github_url": "https://github.com/tayrell/portfolio",
            "live_url": None,
            "featured": True,
            "display_order": 1,
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": uuid.uuid4(),
            "title": "Consilia Data",
            "description": "Plateforme de gestion de données",
            "technologies": ["Python", "Flask", "PostgreSQL"],
            "image_url": None,
            "github_url": None,
            "live_url": None,
            "featured": True,
            "display_order": 2,
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": uuid.uuid4(),
            "title": "Side Project",
            "description": "Un projet non mis en avant",
            "technologies": ["React", "Node.js"],
            "image_url": None,
            "github_url": None,
            "live_url": None,
            "featured": False,
            "display_order": 3,
            "created_at": now,
            "updated_at": now,
        },
    ]

    with app.app_context():
        engine = get_engine()
        with engine.connect() as conn:
            for project in projects:
                conn.execute(insert(projects_table).values(**project))
            conn.commit()

    return projects
