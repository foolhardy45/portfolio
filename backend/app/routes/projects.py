from flask import Blueprint, Response, jsonify, request, abort

from app.services import project_service
from app.schemas.project_schema import project_schema, projects_schema

projects_bp = Blueprint("projects", __name__, url_prefix="/api")


@projects_bp.route("/projects", methods=["GET"])
def list_projects() -> tuple[Response, int] | Response:
    """Return a list of projects.

    Query params:
        tech: Filter by technology name.
        featured: If 'true', return only featured projects.
    """
    tech_filter = request.args.get("tech")
    featured_only = request.args.get("featured", "").lower() == "true"

    if featured_only:
        projects = project_service.list_featured_projects()
    else:
        projects = project_service.list_projects(tech_filter=tech_filter)

    dumped = projects_schema.dump(projects)
    return jsonify({"data": dumped, "count": len(dumped)})


@projects_bp.route("/projects/<slug>", methods=["GET"])
def get_project(slug: str) -> tuple[Response, int] | Response:
    """Return a single project by slug."""
    project = project_service.get_project_by_slug(slug)
    if project is None:
        abort(404)

    return jsonify({"data": project_schema.dump(project)})
