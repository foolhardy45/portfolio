from marshmallow import Schema, fields


class ProjectSchema(Schema):
    """Schema for serializing project data."""

    id = fields.UUID(dump_only=True)
    title = fields.String(required=True)
    description = fields.String(required=True)
    technologies = fields.List(fields.String(), required=True)
    image_url = fields.String(allow_none=True, load_default=None)
    github_url = fields.String(allow_none=True, load_default=None)
    live_url = fields.String(allow_none=True, load_default=None)
    featured = fields.Boolean(load_default=False)
    display_order = fields.Integer(load_default=0)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


project_schema = ProjectSchema()
projects_schema = ProjectSchema(many=True)
