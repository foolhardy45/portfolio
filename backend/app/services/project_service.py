from typing import Any

from app.repositories import project_repo


def list_projects(tech_filter: str | None = None) -> list[dict[str, Any]]:
    """Return all projects with optional technology filter.

    Args:
        tech_filter: If set, filter by technology name.

    Returns:
        A list of project dictionaries.
    """
    return project_repo.get_all_projects(tech_filter=tech_filter)


def list_featured_projects() -> list[dict[str, Any]]:
    """Return only featured projects.

    Returns:
        A list of featured project dictionaries.
    """
    return project_repo.get_featured_projects()


def get_project_by_slug(slug: str) -> dict[str, Any] | None:
    """Return a single project by slug.

    Args:
        slug: The URL-friendly slug of the project.

    Returns:
        A project dictionary or None if not found.
    """
    return project_repo.get_project_by_slug(slug)
