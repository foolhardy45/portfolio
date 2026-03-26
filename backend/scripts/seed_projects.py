"""Idempotent seed script for projects.

Usage:
    cd backend
    python -m scripts.seed_projects
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import insert, select

from app import create_app
from app.extensions import get_engine
from app.models.project import projects_table

SEED_PROJECTS = [
    {
        "id": uuid.UUID("11111111-1111-1111-1111-111111111111"),
        "title": "Portfolio",
        "slug": "portfolio",
        "short_description": "Site portfolio personnel avec bento grid et design Slate & Amber.",
        "description": "Mon portfolio développeur — Angular 20, Flask 3.1, PostgreSQL. "
        "Design dark premium avec bento grid, Spartan UI, Tailwind CSS 4.",
        "technologies": ["Angular", "TypeScript", "Flask", "Python", "PostgreSQL", "Docker", "Tailwind CSS", "Spartan UI"],
        "image_url": None,
        "github_url": "https://github.com/tayrell/portfolio",
        "demo_url": None,
        "featured": True,
        "sort_order": 1,
    },
    {
        "id": uuid.UUID("22222222-2222-2222-2222-222222222222"),
        "title": "Consilia Data",
        "slug": "consilia-data",
        "short_description": "Plateforme de gestion de données métier.",
        "description": "Application de gestion et visualisation de données métier. "
        "Backend Python avec SQLAlchemy Core et PostgreSQL.",
        "technologies": ["Python", "Flask", "PostgreSQL", "SQLAlchemy", "Docker"],
        "image_url": None,
        "github_url": None,
        "demo_url": None,
        "featured": True,
        "sort_order": 2,
    },
    {
        "id": uuid.UUID("33333333-3333-3333-3333-333333333333"),
        "title": "TaskFlow",
        "slug": "taskflow",
        "short_description": "Application de gestion de tâches avec Kanban board.",
        "description": "Projet personnel de gestion de tâches en mode Kanban. "
        "Interface réactive et drag-and-drop.",
        "technologies": ["Angular", "TypeScript", "Node.js", "MongoDB"],
        "image_url": None,
        "github_url": None,
        "demo_url": None,
        "featured": False,
        "sort_order": 3,
    },
]


def seed() -> None:
    """Insert seed projects if they don't already exist."""
    app = create_app()
    with app.app_context():
        engine = get_engine()
        now = datetime.now(timezone.utc)

        with engine.connect() as conn:
            for project in SEED_PROJECTS:
                existing = conn.execute(
                    select(projects_table.c.id).where(
                        projects_table.c.slug == project["slug"]
                    )
                ).first()

                if existing is None:
                    conn.execute(
                        insert(projects_table).values(
                            **project,
                            created_at=now,
                            updated_at=now,
                        )
                    )
                    print(f"  + {project['title']}")
                else:
                    print(f"  = {project['title']} (already exists)")

            conn.commit()

    print("Seed complete.")


if __name__ == "__main__":
    seed()
