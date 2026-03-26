from typing import Any

from sqlalchemy import select

from app.extensions import get_connection
from app.models.project import projects_table


def get_all_projects(tech_filter: str | None = None) -> list[dict[str, Any]]:
    """Fetch all projects, sorted by sort_order.

    Args:
        tech_filter: If set, filter projects containing this technology.

    Returns:
        A list of project dictionaries.
    """
    conn = get_connection()
    query = select(projects_table).order_by(projects_table.c.sort_order)

    result = conn.execute(query)
    rows = [dict(row._mapping) for row in result]

    if tech_filter:
        tech_lower = tech_filter.lower()
        rows = [
            row
            for row in rows
            if any(t.lower() == tech_lower for t in (row.get("technologies") or []))
        ]

    return rows


def get_featured_projects() -> list[dict[str, Any]]:
    """Fetch only featured projects, sorted by sort_order.

    Returns:
        A list of featured project dictionaries.
    """
    conn = get_connection()
    query = (
        select(projects_table)
        .where(projects_table.c.featured.is_(True))
        .order_by(projects_table.c.sort_order)
    )
    result = conn.execute(query)
    return [dict(row._mapping) for row in result]


def get_project_by_slug(slug: str) -> dict[str, Any] | None:
    """Fetch a single project by its slug.

    Args:
        slug: The URL-friendly slug of the project.

    Returns:
        A project dictionary or None if not found.
    """
    conn = get_connection()
    query = select(projects_table).where(projects_table.c.slug == slug)
    result = conn.execute(query)
    row = result.first()
    if row is None:
        return None
    return dict(row._mapping)
