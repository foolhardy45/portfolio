from marshmallow import Schema, fields, validate


class ContactSchema(Schema):
    """Schema for validating contact form submissions."""

    name = fields.String(
        required=True,
        validate=validate.Length(min=2, max=100),
        error_messages={"required": "Name is required."},
    )
    email = fields.Email(
        required=True,
        error_messages={
            "required": "Email is required.",
            "invalid": "Invalid email address.",
        },
    )
    message = fields.String(
        required=True,
        validate=validate.Length(
            min=10,
            max=5000,
            error="Message must be between 10 and 5000 characters.",
        ),
        error_messages={"required": "Message is required."},
    )


contact_schema = ContactSchema()
