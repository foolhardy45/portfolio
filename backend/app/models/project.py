import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, DateTime, Integer, JSON,
    String, Table, Text, Uuid,
)

from app.extensions import metadata

projects_table = Table(
    "projects",
    metadata,
    Column("id", Uuid, primary_key=True, default=uuid.uuid4),
    Column("title", String(200), nullable=False),
    Column("slug", String(200), unique=True, nullable=False),
    Column("short_description", String(300), nullable=True),
    Column("description", Text, nullable=True),
    Column("technologies", JSON, nullable=False, default=list),
    Column("image_url", String(500), nullable=True),
    Column("github_url", String(500), nullable=True),
    Column("demo_url", String(500), nullable=True),
    Column("featured", Boolean, nullable=False, default=False),
    Column("sort_order", Integer, nullable=False, default=0),
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
