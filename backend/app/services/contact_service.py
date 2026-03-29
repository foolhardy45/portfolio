from typing import Any

from flask import current_app
from flask_mail import Message

from app.repositories import contact_repo


def submit_contact_message(name: str, email: str, message: str) -> dict[str, Any]:
    """Validate, save and send a contact form submission via email.

    Args:
        name: The sender's name.
        email: The sender's email address.
        message: The message content.

    Returns:
        The created message as a dictionary.

    Raises:
        RuntimeError: If the email fails to send.
    """
    result = contact_repo.create_contact_message(
        name=name,
        email=email,
        message=message,
    )

    recipient = current_app.config["MAIL_RECIPIENT"]
    msg = Message(
        subject=f"Nouveau message de {name} via le portfolio",
        recipients=[recipient],
        reply_to=email,
        body=(
            f"Nom : {name}\n"
            f"Email : {email}\n\n"
            f"Message :\n{message}"
        ),
    )
    from app import mail
    mail.send(msg)

    return result
