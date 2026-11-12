from datetime import timedelta

import pytest
from fastapi.testclient import TestClient

from app.core.calculations import calculate_end_date, get_lagos_today
from app.core.config import get_settings
from app.core.database import get_db, get_engine, get_session_factory
from app.main import app


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.parametrize(
    "origin",
    [
        "http://localhost:3000",
        "https://meal-plan-trackerrrr.vercel.app",
    ],
)
def test_frontend_origins_are_allowed(client: TestClient, origin: str):
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin


def test_health_and_database_readiness(authenticated_client):
    client, _ = authenticated_client

    assert client.get("/api/v1/health").json() == {"status": "ok"}
    ready = client.get("/api/v1/ready")
    assert ready.status_code == 200
    assert ready.json() == {"status": "ready", "database": "connected"}


def test_register_login_and_protect_user_data(client: TestClient):
    registration = client.post(
        "/api/v1/auth/register",
        json={
            "fullName": "Student One",
            "email": "student@example.com",
            "password": "secure-password-123",
        },
    )
    assert registration.status_code == 201
    assert registration.json()["user"]["fullName"] == "Student One"

    duplicate = client.post(
        "/api/v1/auth/register",
        json={
            "fullName": "Student One",
            "email": "STUDENT@example.com",
            "password": "secure-password-123",
        },
    )
    assert duplicate.status_code == 409

    login = client.post(
        "/api/v1/auth/login",
        json={
            "email": "student@example.com",
            "password": "secure-password-123",
        },
    )
    assert login.status_code == 200
    token = login.json()["accessToken"]

    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.get(
        "/api/v1/auth/me", headers=auth_headers(token)
    ).json()["email"] == "student@example.com"
    assert client.post(
        "/api/v1/auth/login",
        json={"email": "student@example.com", "password": "wrong-password"},
    ).status_code == 401


def test_registration_requires_jwt_configuration(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.delenv("JWT_SECRET_KEY", raising=False)
    get_settings.cache_clear()

    response = client.post(
        "/api/v1/auth/register",
        json={
            "fullName": "Student One",
            "email": "student@example.com",
            "password": "secure-password-123",
        },
    )

    assert response.status_code == 503
    assert "JWT_SECRET_KEY" in response.json()["detail"]


def test_readiness_reports_missing_database_configuration(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    get_settings.cache_clear()
    get_session_factory.cache_clear()
    get_engine.cache_clear()
    app.dependency_overrides.pop(get_db)

    response = client.get("/api/v1/ready")

    assert response.status_code == 503
    assert "DATABASE_URL" in response.json()["detail"]


def test_budget_expense_crud_and_dashboard_contract(authenticated_client):
    client, token = authenticated_client
    headers = auth_headers(token)
    today = get_lagos_today()
    budget_response = client.post(
        "/api/v1/budgets",
        headers=headers,
        json={
            "totalCreditsKobo": 100_000,
            "durationDays": 10,
            "startDate": today.isoformat(),
        },
    )
    assert budget_response.status_code == 201
    budget = budget_response.json()
    assert budget["endDate"] == calculate_end_date(
        today, 10
    ).isoformat()

    blocked_period = client.post(
        "/api/v1/budgets",
        headers=headers,
        json={
            "totalCreditsKobo": 100_000,
            "durationDays": 10,
            "startDate": (today + timedelta(days=1)).isoformat(),
        },
    )
    assert blocked_period.status_code == 409

    expense_response = client.post(
        "/api/v1/expenses",
        headers=headers,
        json={
            "amountKobo": 80_000,
            "description": "Lunch",
            "transactionDate": today.isoformat(),
        },
    )
    assert expense_response.status_code == 201
    expense = expense_response.json()
    assert expense["budgetId"] == budget["id"]

    dashboard = client.get("/api/v1/dashboard", headers=headers)
    assert dashboard.status_code == 200
    dashboard_data = dashboard.json()
    assert dashboard_data["summary"]["remainingBalanceKobo"] == 20_000
    assert dashboard_data["summary"]["status"] == "active"
    assert dashboard_data["recentExpenses"][0]["description"] == "Lunch"
    assert "Your meal credit is running low" in [
        warning["title"] for warning in dashboard_data["warnings"]
    ]

    overspend = client.post(
        "/api/v1/expenses",
        headers=headers,
        json={
            "amountKobo": 20_001,
            "description": "Dinner",
            "transactionDate": today.isoformat(),
        },
    )
    assert overspend.status_code == 422

    updated = client.patch(
        f"/api/v1/expenses/{expense['id']}",
        headers=headers,
        json={
            "amountKobo": 90_000,
            "description": "Updated lunch",
            "transactionDate": today.isoformat(),
        },
    )
    assert updated.status_code == 200
    assert updated.json()["amountKobo"] == 90_000
    assert client.get("/api/v1/expenses", headers=headers).json()[0][
        "description"
    ] == "Updated lunch"

    deleted = client.delete(
        f"/api/v1/expenses/{expense['id']}", headers=headers
    )
    assert deleted.status_code == 204
    assert client.get("/api/v1/expenses", headers=headers).json() == []
    assert (
        client.get("/api/v1/dashboard", headers=headers).json()["summary"][
            "remainingBalanceKobo"
        ]
        == 100_000
    )


def test_users_cannot_access_another_users_expenses(authenticated_client):
    client, token = authenticated_client
    headers = auth_headers(token)
    today = get_lagos_today()
    budget = client.post(
        "/api/v1/budgets",
        headers=headers,
        json={
            "totalCreditsKobo": 50_000,
            "durationDays": 5,
            "startDate": today.isoformat(),
        },
    ).json()
    expense = client.post(
        "/api/v1/expenses",
        headers=headers,
        json={
            "amountKobo": 2_000,
            "description": "Breakfast",
            "transactionDate": today.isoformat(),
        },
    ).json()
    other_user = client.post(
        "/api/v1/auth/register",
        json={
            "fullName": "Other Student",
            "email": "other@example.com",
            "password": "secure-password-456",
        },
    ).json()
    other_headers = auth_headers(other_user["accessToken"])

    assert client.get("/api/v1/expenses", headers=other_headers).json() == []
    assert client.delete(
        f"/api/v1/expenses/{expense['id']}", headers=other_headers
    ).status_code == 404
    assert client.get("/api/v1/budgets/current", headers=headers).json()["id"] == budget["id"]
