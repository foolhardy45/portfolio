import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import insert

from app.extensions import get_connection
from app.models.contact import contact_messages_table


def create_contact_message(name: str, email: str, message: str) -> dict[str, Any]:
    """Insert a new contact message into the database.

    Args:
        name: The sender's name.
        email: The sender's email address.
        message: The message content.

    Returns:
        The created message as a dictionary.
    """
    conn = get_connection()
    message_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    conn.execute(
        insert(contact_messages_table).values(
            id=message_id,
            name=name,
            email=email,
            message=message,
            read=False,
            created_at=now,
        )
    )
    conn.commit()

    return {
        "id": message_id,
        "name": name,
        "email": email,
        "message": message,
        "read": False,
        "created_at": now,
    }
