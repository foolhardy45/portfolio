from flask import Flask, jsonify
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException


def register_error_handlers(app: Flask) -> None:
    """Register JSON error handlers on the Flask app."""

    @app.errorhandler(ValidationError)
    def handle_validation_error(error: ValidationError):
        return jsonify({"error": "Validation failed", "details": error.messages}), 400

    @app.errorhandler(400)
    def handle_bad_request(error: HTTPException):
        return jsonify({"error": error.description or "Bad request"}), 400

    @app.errorhandler(404)
    def handle_not_found(error: HTTPException):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(error: HTTPException):
        return jsonify({"error": "Method not allowed"}), 405

    @app.errorhandler(429)
    def handle_rate_limit(error: HTTPException):
        return jsonify({"error": "Too many requests. Please try again later."}), 429

    @app.errorhandler(500)
    def handle_internal_error(error: HTTPException):
        app.logger.error("Internal server error: %s", error)
        return jsonify({"error": "Internal server error"}), 500
