from flask.testing import FlaskClient


def test_contact_success(client: FlaskClient) -> None:
    """POST /api/contact with valid data should return 201."""
    response = client.post(
        "/api/contact",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "message": "Ceci est un message de test suffisamment long.",
        },
    )
    assert response.status_code == 201

    data = response.get_json()
    assert data["message"] == "Message sent successfully."


def test_contact_missing_fields(client: FlaskClient) -> None:
    """POST /api/contact with missing fields should return 400."""
    response = client.post("/api/contact", json={"name": "Test"})
    assert response.status_code == 400

    data = response.get_json()
    assert data["error"] == "Validation failed"
    assert "email" in data["details"]
    assert "message" in data["details"]


def test_contact_invalid_email(client: FlaskClient) -> None:
    """POST /api/contact with invalid email should return 400."""
    response = client.post(
        "/api/contact",
        json={
            "name": "Test User",
            "email": "not-an-email",
            "message": "Ceci est un message de test suffisamment long.",
        },
    )
    assert response.status_code == 400

    data = response.get_json()
    assert "email" in data["details"]


def test_contact_message_too_short(client: FlaskClient) -> None:
    """POST /api/contact with a message too short should return 400."""
    response = client.post(
        "/api/contact",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "message": "Court",
        },
    )
    assert response.status_code == 400

    data = response.get_json()
    assert "message" in data["details"]


def test_contact_no_json_body(client: FlaskClient) -> None:
    """POST /api/contact without JSON body should return 400."""
    response = client.post("/api/contact", data="not json")
    assert response.status_code == 400
