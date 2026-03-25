import uuid
from typing import Any

from sqlalchemy import select

from app.extensions import get_connection
from app.models.project import projects_table


def get_all_projects(
    featured_only: bool = True,
    tech_filter: str | None = None,
) -> list[dict[str, Any]]:
    """Fetch projects from the database, sorted by display_order.

    Args:
        featured_only: If True, return only featured projects.
        tech_filter: If set, filter projects containing this technology.

    Returns:
        A list of project dictionaries.
    """
    conn = get_connection()
    query = select(projects_table).order_by(projects_table.c.display_order)

    if featured_only:
        query = query.where(projects_table.c.featured.is_(True))

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


def get_project_by_id(project_id: uuid.UUID) -> dict[str, Any] | None:
    """Fetch a single project by its ID.

    Args:
        project_id: The UUID of the project.

    Returns:
        A project dictionary or None if not found.
    """
    conn = get_connection()
    query = select(projects_table).where(projects_table.c.id == project_id)
    result = conn.execute(query)
    row = result.first()
    if row is None:
        return None
    return dict(row._mapping)
