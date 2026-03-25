import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, JSON, String, Table, Text, Uuid

from app.extensions import metadata

projects_table = Table(
    "projects",
    metadata,
    Column("id", Uuid, primary_key=True, default=uuid.uuid4),
    Column("title", String(200), nullable=False),
    Column("description", Text, nullable=False),
    Column("technologies", JSON, nullable=False, default=list),
    Column("image_url", String(500), nullable=True),
    Column("github_url", String(500), nullable=True),
    Column("live_url", String(500), nullable=True),
    Column("featured", Boolean, nullable=False, default=False),
    Column("display_order", Integer, nullable=False, default=0),
    Column(
        "created_at",
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    ),
    Column(
        "updated_at",
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    ),
)
