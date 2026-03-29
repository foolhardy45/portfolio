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

    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "true").lower() == "true"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER")
    MAIL_RECIPIENT = os.getenv("MAIL_DEFAULT_SENDER")


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True


class TestingConfig(Config):
    """Testing configuration."""

    TESTING = True
    DATABASE_URL = "sqlite:///:memory:"
    MAIL_SUPPRESS_SEND = True
    MAIL_DEFAULT_SENDER = "test@test.com"
    MAIL_RECIPIENT = "test@test.com"


class ProductionConfig(Config):
    """Production configuration."""

    DEBUG = False


config_by_name: dict[str, type[Config]] = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}
