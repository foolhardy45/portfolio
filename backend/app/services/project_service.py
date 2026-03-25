import uuid
from typing import Any

from app.repositories import project_repo


def list_projects(
    featured_only: bool = True,
    tech_filter: str | None = None,
) -> list[dict[str, Any]]:
    """Return a list of projects with optional filters.

    Args:
        featured_only: If True, return only featured projects.
        tech_filter: If set, filter by technology name.

    Returns:
        A list of project dictionaries.
    """
    return project_repo.get_all_projects(
        featured_only=featured_only,
        tech_filter=tech_filter,
    )


def get_project(project_id: uuid.UUID) -> dict[str, Any] | None:
    """Return a single project by ID.

    Args:
        project_id: The UUID of the project.

    Returns:
        A project dictionary or None if not found.
    """
    return project_repo.get_project_by_id(project_id)
