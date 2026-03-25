from flask import Blueprint, jsonify, request, abort
from uuid import UUID

from app.services import project_service
from app.schemas.project_schema import project_schema, projects_schema

projects_bp = Blueprint("projects", __name__, url_prefix="/api")


@projects_bp.route("/projects", methods=["GET"])
def list_projects():
    """Return a list of projects with optional filters.

    Query params:
        tech: Filter by technology name.
        all: If 'true', return all projects (not just featured).
    """
    tech_filter = request.args.get("tech")
    show_all = request.args.get("all", "").lower() == "true"

    projects = project_service.list_projects(
        featured_only=not show_all,
        tech_filter=tech_filter,
    )

    return jsonify(projects_schema.dump(projects))


@projects_bp.route("/projects/<uuid:project_id>", methods=["GET"])
def get_project(project_id: UUID):
    """Return a single project by ID."""
    project = project_service.get_project(project_id)
    if project is None:
        abort(404)

    return jsonify(project_schema.dump(project))
