import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, String, Table, Text, Uuid

from app.extensions import metadata

contact_messages_table = Table(
    "contact_messages",
    metadata,
    Column("id", Uuid, primary_key=True, default=uuid.uuid4),
    Column("name", String(200), nullable=False),
    Column("email", String(320), nullable=False),
    Column("message", Text, nullable=False),
    Column("read", Boolean, nullable=False, default=False),
    Column(
        "created_at",
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    ),
)
