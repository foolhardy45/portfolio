from flask import Flask, g
from sqlalchemy import MetaData, create_engine, Engine

metadata = MetaData()

# Adapter so Flask-Migrate can access engine + metadata
_engine: Engine | None = None


class CoreDatabase:
    """Adapter to make SQLAlchemy Core MetaData work with Flask-Migrate."""

    def __init__(self, meta: MetaData) -> None:
        self.metadata = meta

    def get_engine(self) -> Engine:
        """Return the current engine."""
        if _engine is None:
            raise RuntimeError("Database not initialized. Call init_db(app) first.")
        return _engine


db = CoreDatabase(metadata)


def init_db(app: Flask) -> None:
    """Create the SQLAlchemy engine and store it on the app."""
    global _engine
    _engine = create_engine(app.config["DATABASE_URL"])
    app.extensions["sqlalchemy_engine"] = _engine

    @app.teardown_appcontext
    def _close_connection(exception: BaseException | None) -> None:
        conn = g.pop("db_conn", None)
        if conn is not None:
            conn.close()


def get_engine() -> Engine:
    """Get the SQLAlchemy engine."""
    if _engine is None:
        raise RuntimeError("Database not initialized.")
    return _engine


def get_connection():
    """Get a database connection scoped to the current request."""
    if "db_conn" not in g:
        g.db_conn = get_engine().connect()
    return g.db_conn
