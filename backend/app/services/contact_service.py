from typing import Any

from app.repositories import contact_repo


def submit_contact_message(name: str, email: str, message: str) -> dict[str, Any]:
    """Validate and save a new contact message.

    Args:
        name: The sender's name.
        email: The sender's email address.
        message: The message content.

    Returns:
        The created message as a dictionary.
    """
    return contact_repo.create_contact_message(
        name=name,
        email=email,
        message=message,
    )
