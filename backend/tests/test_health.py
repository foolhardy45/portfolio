from flask.testing import FlaskClient


def test_health_returns_200(client: FlaskClient) -> None:
    """GET /api/health should return 200 with status healthy."""
    response = client.get("/api/health")
    assert response.status_code == 200

    data = response.get_json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert data["database"] == "connected"


def test_health_json_content_type(client: FlaskClient) -> None:
    """GET /api/health should return JSON content type."""
    response = client.get("/api/health")
    assert response.content_type == "application/json"
