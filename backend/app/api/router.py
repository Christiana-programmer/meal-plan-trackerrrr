from fastapi import APIRouter

from app.api.routes import auth, budgets, dashboard, expenses, health

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(health.router, tags=["health"])
