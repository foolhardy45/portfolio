from flask.testing import FlaskClient


def test_list_projects_empty(client: FlaskClient) -> None:
    """GET /api/projects should return an empty list when no projects exist."""
    response = client.get("/api/projects")
    assert response.status_code == 200
    assert response.get_json() == []


def test_list_projects_featured_only(client: FlaskClient, seeded_projects: list) -> None:
    """GET /api/projects should return only featured projects by default."""
    response = client.get("/api/projects")
    assert response.status_code == 200

    data = response.get_json()
    assert len(data) == 2
    assert all(p["featured"] is True for p in data)


def test_list_projects_all(client: FlaskClient, seeded_projects: list) -> None:
    """GET /api/projects?all=true should return all projects."""
    response = client.get("/api/projects?all=true")
    assert response.status_code == 200

    data = response.get_json()
    assert len(data) == 3


def test_list_projects_filter_by_tech(client: FlaskClient, seeded_projects: list) -> None:
    """GET /api/projects?tech=angular&all=true should filter by technology."""
    response = client.get("/api/projects?tech=angular&all=true")
    assert response.status_code == 200

    data = response.get_json()
    assert len(data) == 1
    assert data[0]["title"] == "Portfolio"


def test_get_project_by_id(client: FlaskClient, seeded_projects: list) -> None:
    """GET /api/projects/<id> should return the project."""
    project_id = str(seeded_projects[0]["id"])
    response = client.get(f"/api/projects/{project_id}")
    assert response.status_code == 200

    data = response.get_json()
    assert data["title"] == "Portfolio"


def test_get_project_not_found(client: FlaskClient) -> None:
    """GET /api/projects/<id> should return 404 for unknown ID."""
    response = client.get("/api/projects/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
