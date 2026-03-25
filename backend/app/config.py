import os


class Config:
    """Base configuration."""

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://user:password@localhost:5432/portfolio",
    )
    CORS_ORIGINS = ["http://localhost:4200"]
    RATELIMIT_STORAGE_URI = "memory://"


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True


class TestingConfig(Config):
    """Testing configuration."""

    TESTING = True
    DATABASE_URL = "sqlite:///:memory:"


class ProductionConfig(Config):
    """Production configuration."""

    DEBUG = False


config_by_name: dict[str, type[Config]] = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}
