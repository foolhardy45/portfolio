import logging
import os

from flask import Blueprint, Response, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from marshmallow import ValidationError

from app.schemas.contact_schema import contact_schema
from app.services import contact_service

logger = logging.getLogger(__name__)

contact_bp = Blueprint("contact", __name__, url_prefix="/api")

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=os.environ.get("REDIS_URL", "memory://"),
)


@contact_bp.route("/contact", methods=["POST"])
@limiter.limit("5 per hour")
def submit_contact() -> tuple[Response, int]:
    """Validate, save and send a contact form submission."""
    json_data = request.get_json(silent=True)
    if not json_data:
        return jsonify({"error": "Request body must be JSON."}), 400

    try:
        data = contact_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 400

    try:
        contact_service.submit_contact_message(
            name=data["name"],
            email=data["email"],
            message=data["message"],
        )
    except Exception:
        logger.exception("Failed to send contact email")
        return jsonify({"error": "Échec de l'envoi du message. Veuillez réessayer plus tard."}), 500

    return jsonify({"message": "Message sent successfully."}), 201
