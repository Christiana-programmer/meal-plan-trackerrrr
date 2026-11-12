# Mealwise API

FastAPI backend for the Campus Meal Plan Balance Tracker. It uses Neon
PostgreSQL, SQLAlchemy, and Alembic. Currency values cross the API boundary as
integer kobo, matching the frontend domain types.

## Setup

1. Create a Neon project and copy its connection string.
2. From this `backend` directory, create a local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Set `DATABASE_URL` to the Neon connection string, including
   `sslmode=require`. Keep `.env` local; never commit database credentials.
4. Set `JWT_SECRET_KEY` to a random secret of at least 32 characters. For
   example, generate one with Python:

   ```powershell
   python -c "import secrets; print(secrets.token_urlsafe(48))"
   ```

5. Create and activate a virtual environment, then install the API:

   ```powershell
   py -3.13 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -e ".[dev]"
   ```

6. Apply the database migration and start the API:

   ```powershell
   alembic upgrade head
   uvicorn app.main:app --reload
   ```

The API listens on `http://localhost:8000`. Interactive endpoint documentation
is available at `/docs`; `/api/v1/health` checks the process and
`/api/v1/ready` checks the Neon connection.

## API surface

Except for health checks, endpoints require the bearer token returned from
register or login:

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | Create an account and return its access token |
| POST | `/api/v1/auth/login` | Authenticate and return an access token |
| GET | `/api/v1/auth/me` | Read the authenticated profile |
| GET | `/api/v1/dashboard` | Return the dashboard contract, warnings, and history |
| GET | `/api/v1/budgets/current` | Return the latest credit period or `null` |
| GET | `/api/v1/budgets/history` | Return previous periods and their expenses |
| POST | `/api/v1/budgets` | Add a credit period when the previous one is closed |
| GET | `/api/v1/expenses` | List expenses for the current period |
| POST | `/api/v1/expenses` | Record a meal expense |
| PATCH | `/api/v1/expenses/{id}` | Edit a current-period expense |
| DELETE | `/api/v1/expenses/{id}` | Delete a current-period expense |

JSON field names use camelCase to match the frontend contracts in
`../src/types/`. Register and login return
`{ "user": { "id", "fullName", "email" }, "accessToken", "tokenType" }`;
the frontend stores the token for the current browser session and sends it as
`Authorization: Bearer <accessToken>`.
`GET /api/v1/dashboard` returns the existing `DashboardData` shape.

The API validates users, budget periods, dates, and expense balances on the
server. It stores password hashes (Argon2), never raw passwords. Expense
creation is serialized per user in PostgreSQL so concurrent requests cannot
spend the same remaining credit twice.

## Tests

Tests use an isolated in-memory SQLite database and do not require Neon:

```powershell
pytest
```

Set `CORS_ORIGINS` to a comma-separated list of exact frontend origins. The
default allows `http://localhost:3000`, `http://localhost:3001`, and
`https://meal-plan-trackerrrr.vercel.app`. Set the same list in the deployed
API's environment settings so the hosted frontend can call it. Production
secrets and `DATABASE_URL` should be provided by the deployment environment,
not source control.
