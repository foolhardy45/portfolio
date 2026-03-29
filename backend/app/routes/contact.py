from flask import Blueprint, Response, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from marshmallow import ValidationError

from app.schemas.contact_schema import contact_schema
from app.services import contact_service

contact_bp = Blueprint("contact", __name__, url_prefix="/api")

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="memory://",
)


@contact_bp.route("/contact", methods=["POST"])
@limiter.limit("5 per hour")
def submit_contact() -> tuple[Response, int]:
    """Validate and save a contact form submission."""
    json_data = request.get_json(silent=True)
    if not json_data:
        return jsonify({"error": "Request body must be JSON."}), 400

    try:
        data = contact_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 400

    contact_service.submit_contact_message(
        name=data["name"],
        email=data["email"],
        message=data["message"],
    )

    return jsonify({"message": "Message sent successfully."}), 201
