import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.config import get_settings
from app.core.database import get_db, get_engine, get_session_factory
from app.main import app
from app.models import Budget, Expense, User
from app.models.base import Base


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    monkeypatch.setenv(
        "JWT_SECRET_KEY",
        "test-secret-key-for-mealwise-api-at-least-32-characters",
    )
    get_settings.cache_clear()
    get_engine.cache_clear()
    get_session_factory.cache_clear()
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)

    def override_get_db():
        with Session(engine, expire_on_commit=False) as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
    engine.dispose()
    get_session_factory.cache_clear()
    get_engine.cache_clear()
    get_settings.cache_clear()


@pytest.fixture
def authenticated_client(client: TestClient) -> tuple[TestClient, str]:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "fullName": "Test Student",
            "email": "student@example.com",
            "password": "secure-password-123",
        },
    )
    assert response.status_code == 201
    return client, response.json()["accessToken"]
