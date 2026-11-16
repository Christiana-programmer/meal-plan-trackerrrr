# Campus Meal Plan Tracker

Frontend for the Campus Meal Plan Balance Tracker, built with Next.js, React,
TypeScript, and Tailwind CSS. It connects to the FastAPI backend in `backend/`,
which stores account, budget, and expense data in Neon PostgreSQL.

For a plain-language guide to the features and user journey, see
[USER_GUIDE.md](./USER_GUIDE.md).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## App behavior

- Users register and sign in through the API. Passwords are hashed by the
  backend and are never saved in browser storage.
- The bearer token is kept in `sessionStorage` for the current browser tab.
- Users can add meal credits, record expenses, and review current and previous
  budget periods. Data is persisted in Neon through the API.
- Financial values are stored as integer kobo in the frontend. The dashboard
  formats them as Nigerian Naira and calculates balances and allowances from
  the budget and expenses.
- The daily allowance is set at the start of each Lagos calendar day from the
  remaining credit divided by the days left. It stays fixed until the next
  day; expenses reduce the amount still available for the current day. Unused
  credit is redistributed across the remaining days at the next day boundary.
- The dashboard warns when spending for today passes that day’s recommended
  guide, when at least 80% of a credit has been spent, when spending is more
  than 10% of the total credit (or ₦500, whichever is higher) ahead of the
  time-based budget pace, and when a credit is exhausted. A new credit period
  can be entered once the previous one is exhausted or complete.
- The API validates expense amounts, dates, and budget balances server-side.

## API integration boundary

React components use service interfaces from `src/services/` rather than
accessing browser storage directly:

- `AuthService` handles account registration, login and browser-session state.
- `BudgetService` exposes current-budget and create-budget operations.
- `ExpenseService` exposes list, create, update and delete operations.
- `DashboardService` returns the typed dashboard response.
- `api-client.ts` applies the base URL, bearer token and API error handling.

The FastAPI backend and Neon setup instructions are in
[`backend/`](./backend/README.md). The frontend services call that API; the
frontend must never connect directly to PostgreSQL or Neon.

## Run frontend and backend

The backend uses `backend/.env` for `DATABASE_URL`, `JWT_SECRET_KEY`, and
`CORS_ORIGINS`. The frontend API base URL defaults to
`http://127.0.0.1:8000`; override it in the ignored root `.env.local` using
[`.env.example`](./.env.example). Start the services in separate terminals:

```powershell
# From backend/
uvicorn app.main:app --reload
```

```powershell
# From the project root
npm run dev
```

The Neon `production` branch migration has been applied. Do not run frontend
tests or development against production data with test accounts.

Dashboard calculations live in `src/lib/calculations.ts`, separate from the
display components. The frontend calculation is for demonstration; the API
must validate expenses and calculate authoritative balances independently.

## Expense and budget pages

- `/expenses` shows the current credit period's expenses and supports editing
  and deleting entries. Changes recalculate the current balance and warnings.
- `/budget` shows current credit totals, period dates, daily guide, status, and
  previous credit periods.

## Tests

Run `npm test` for calculation, validation, and expense service-flow tests.

## Available scripts

- `npm run dev` — start the development server.
- `npm run build` — create a production build.
- `npm run start` — serve a production build.
- `npm run lint` — run ESLint.
- `npm test` — run the frontend unit and service tests.
