from datetime import datetime, timezone

from flask import Blueprint, jsonify
from sqlalchemy import text

from app.extensions import get_engine

health_bp = Blueprint("health", __name__, url_prefix="/api")


@health_bp.route("/health", methods=["GET"])
def healthcheck():
    """Return the API health status and verify database connectivity."""
    db_ok = True
    try:
        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        db_ok = False

    status = "healthy" if db_ok else "degraded"
    code = 200 if db_ok else 503

    return (
        jsonify(
            {
                "status": status,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "database": "connected" if db_ok else "disconnected",
            }
        ),
        code,
    )
