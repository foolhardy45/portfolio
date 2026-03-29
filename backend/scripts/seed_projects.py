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
        "title": "Portfolio Personnel",
        "slug": "portfolio",
        "short_description": "Ce site — design bento grid, dark mode, animations.",
        "description": "Mon portfolio personnel construit from scratch avec Angular 20, Flask et PostgreSQL. Design bento grid inspiré de Linear.app et Aceternity UI, palette Slate & Amber, effets de glow et animations soignées.",
        "technologies": ["Angular", "TypeScript", "Flask", "Python", "PostgreSQL", "Docker", "Tailwind CSS"],
        "github_url": "https://github.com/foolhardy45/portfolio",
        "demo_url": None,
        "featured": True,
        "sort_order": 1,
    },
    {
        "title": "SYNK",
        "slug": "synk",
        "short_description": "Plateforme de gestion de stages étudiants.",
        "description": "Application web permettant aux gestionnaires pédagogiques de suivre et gérer les stages des étudiants. Centralisation des conventions, entreprises et tuteurs avec authentification JWT. Projet réalisé en équipe en SAÉ S5 (BUT3). Mon rôle : frontend Angular, intégration API, certaines routes backend, infrastructure Docker.",
        "technologies": ["Angular", "TypeScript", "Spring Boot", "Java", "PostgreSQL", "Docker", "JWT"],
        "github_url": "https://github.com/foolhardy45/synk-front",
        "demo_url": None,
        "featured": True,
        "sort_order": 2,
    },
    {
        "title": "ERUA DATA",
        "slug": "erua-data",
        "short_description": "Graphe de connaissances reliant artistes et œuvres.",
        "description": "Application web permettant aux chercheurs en histoire de l'art d'explorer les relations entre artistes, œuvres et mouvements artistiques via un graphe interactif. Navigation par liens entre entités, recherche et visualisation des connexions. Projet réalisé en SAÉ S4 (BUT2). Mon rôle : développement complet du frontend Angular et de la visualisation du graphe.",
        "technologies": ["Angular", "TypeScript", "REST API"],
        "github_url": "https://github.com/foolhardy45/erua-data-front",
        "demo_url": None,
        "featured": True,
        "sort_order": 3,
    },
    {
        "title": "IUT Café",
        "slug": "iut-cafe",
        "short_description": "Application de gestion de café — catalogue et commandes.",
        "description": "Application fullstack de gestion d'un café : authentification, catalogue produits et système de commandes. Frontend Angular, backend Flask avec JWT et SQLAlchemy, conteneurisé avec Docker. Projet réalisé en duo en R5A5 (BUT3). Mon rôle : développement frontend Angular.",
        "technologies": ["Angular", "TypeScript", "Flask", "Python", "SQLite", "Docker"],
        "github_url": "https://github.com/foolhardy45/iut-cafe",
        "demo_url": None,
        "featured": False,
        "sort_order": 4,
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
