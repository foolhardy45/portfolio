from flask.testing import FlaskClient


def test_list_projects_empty(client: FlaskClient) -> None:
    """GET /api/projects should return empty data when no projects exist."""
    response = client.get("/api/projects")
    assert response.status_code == 200

    data = response.get_json()
    assert data["data"] == []
    assert data["count"] == 0


def test_list_projects_returns_all(client: FlaskClient, seeded_projects: list) -> None:
    """GET /api/projects should return all projects by default."""
    response = client.get("/api/projects")
    assert response.status_code == 200

    data = response.get_json()
    assert data["count"] == 3
    assert len(data["data"]) == 3


def test_list_projects_featured(client: FlaskClient, seeded_projects: list) -> None:
    """GET /api/projects?featured=true should return only featured projects."""
    response = client.get("/api/projects?featured=true")
    assert response.status_code == 200

    data = response.get_json()
    assert data["count"] == 2
    assert all(p["featured"] is True for p in data["data"])


def test_list_projects_filter_by_tech(client: FlaskClient, seeded_projects: list) -> None:
    """GET /api/projects?tech=angular should filter by technology."""
    response = client.get("/api/projects?tech=angular")
    assert response.status_code == 200

    data = response.get_json()
    assert data["count"] == 1
    assert data["data"][0]["title"] == "Portfolio"


def test_get_project_by_slug(client: FlaskClient, seeded_projects: list) -> None:
    """GET /api/projects/<slug> should return the project."""
    response = client.get("/api/projects/portfolio")
    assert response.status_code == 200

    data = response.get_json()
    assert data["data"]["title"] == "Portfolio"
    assert data["data"]["slug"] == "portfolio"


def test_get_project_slug_not_found(client: FlaskClient) -> None:
    """GET /api/projects/<slug> should return 404 for unknown slug."""
    response = client.get("/api/projects/does-not-exist")
    assert response.status_code == 404
