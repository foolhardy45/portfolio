from marshmallow import Schema, fields


class ProjectSchema(Schema):
    """Schema for serializing project data."""

    id = fields.UUID(dump_only=True)
    title = fields.String(required=True)
    slug = fields.String(required=True)
    short_description = fields.String(data_key="shortDescription", allow_none=True, load_default=None)
    description = fields.String(allow_none=True, load_default=None)
    technologies = fields.List(fields.String(), required=True)
    image_url = fields.String(data_key="imageUrl", allow_none=True, load_default=None)
    github_url = fields.String(data_key="githubUrl", allow_none=True, load_default=None)
    demo_url = fields.String(data_key="demoUrl", allow_none=True, load_default=None)
    featured = fields.Boolean(load_default=False)
    sort_order = fields.Integer(data_key="sortOrder", load_default=0)
    created_at = fields.DateTime(data_key="createdAt", dump_only=True)
    updated_at = fields.DateTime(data_key="updatedAt", dump_only=True)


project_schema = ProjectSchema()
projects_schema = ProjectSchema(many=True)
