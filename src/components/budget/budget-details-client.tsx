"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BudgetStatusBadge } from "@/components/dashboard/budget-status-badge";
import { ProtectedDashboardRoute } from "@/components/layout/protected-dashboard-route";
import { Button } from "@/components/ui/button";
import { dashboardService } from "@/services/dashboard.service";
import { calculateRemainingBalance } from "@/lib/calculations";
import { formatDate, formatNaira } from "@/lib/formatters";
import type { DashboardData } from "@/types/dashboard";

function BudgetDetailsContent({ userId }: { userId: string }) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  function retryLoading() {
    setError("");
    setIsLoading(true);
    setRetry((value) => value + 1);
  }

  useEffect(() => {
    let active = true;
    dashboardService
      .getDashboard(userId)
      .then((result) => {
        if (active) {
          setDashboard(result);
          setError("");
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Budget details could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [retry, userId]);

  return (
    <div className="flex flex-col gap-7">
      <header>
        <p className="text-sm font-medium text-muted">Meal plan</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Budget details
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          See your current credit period and how your meal spending is tracking.
        </p>
      </header>

      {error ? (
        <section
          role="alert"
          className="rounded-2xl border border-danger/20 bg-danger-soft p-5"
        >
          <p className="text-sm text-danger">{error}</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={retryLoading}
          >
            Try again
          </Button>
        </section>
      ) : isLoading ? (
        <section
          role="status"
          className="rounded-2xl border border-border bg-surface px-6 py-16 text-center text-sm text-muted"
        >
          Loading budget details…
        </section>
      ) : dashboard?.budget ? (
        <>
          <section className="rounded-3xl bg-[#1d603e] p-6 text-white sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white/75">
                  Current meal credit
                </p>
                <h2 className="mt-2 text-4xl font-semibold tracking-tight">
                  {formatNaira(dashboard.summary.totalCreditsKobo)}
                </h2>
              </div>
              <BudgetStatusBadge status={dashboard.summary.status} />
            </div>
            <div className="mt-8 grid gap-5 border-t border-white/15 pt-6 sm:grid-cols-3">
              <div>
                <p className="text-xs text-white/70">Spent so far</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatNaira(dashboard.summary.totalSpentKobo)}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/70">Available balance</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatNaira(dashboard.summary.remainingBalanceKobo)}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/70">Daily spending guide</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatNaira(dashboard.summary.dailyAllowanceKobo)}
                </p>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="current-period-heading"
            className="rounded-2xl border border-border bg-surface p-5 sm:p-7"
          >
            <h2
              id="current-period-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Current period
            </h2>
            <dl className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-xs font-medium text-muted">Start date</dt>
                <dd className="mt-1 text-sm font-semibold">
                  {formatDate(dashboard.budget.startDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">End date</dt>
                <dd className="mt-1 text-sm font-semibold">
                  {formatDate(dashboard.budget.endDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Duration</dt>
                <dd className="mt-1 text-sm font-semibold">
                  {dashboard.budget.durationDays} days
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Days remaining</dt>
                <dd className="mt-1 text-sm font-semibold">
                  {dashboard.summary.remainingDays}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Recommended daily allowance</dt>
                <dd className="mt-1 text-sm font-semibold">
                  {formatNaira(dashboard.summary.dailyAllowanceKobo)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Budget status</dt>
                <dd className="mt-1">
                  <BudgetStatusBadge status={dashboard.summary.status} />
                </dd>
              </div>
            </dl>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Back to dashboard
              </Link>
              <Link
                href="/expenses"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:bg-background"
              >
                View expenses
              </Link>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
          <h2 className="text-lg font-semibold">No meal credit yet</h2>
          <p className="mt-2 text-sm text-muted">
            Add your first credit from the dashboard to see its details here.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Go to dashboard
          </Link>
        </section>
      )}

      {dashboard && dashboard.previousBudgets.length > 0 ? (
        <section
          aria-labelledby="budget-history-heading"
          className="overflow-hidden rounded-2xl border border-border bg-surface"
        >
          <div className="border-b border-border px-5 py-5 sm:px-6">
            <h2
              id="budget-history-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Previous credit periods
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {[...dashboard.previousBudgets]
              .sort((left, right) =>
                right.createdAt.localeCompare(left.createdAt),
              )
              .map((budget) => {
                const expenses = dashboard.previousExpenses.filter(
                  (expense) => expense.budgetId === budget.id,
                );
                const spentKobo = expenses.reduce(
                  (total, expense) => total + expense.amountKobo,
                  0,
                );
                const remainingBalanceKobo = calculateRemainingBalance(
                  budget.totalCreditsKobo,
                  expenses,
                );

                return (
                  <li
                    key={budget.id}
                    className="flex flex-col justify-between gap-2 px-5 py-4 sm:flex-row sm:items-center sm:px-6"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {formatDate(budget.startDate)} –{" "}
                        {formatDate(budget.endDate)}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {budget.durationDays} days · {expenses.length}{" "}
                        {expenses.length === 1 ? "expense" : "expenses"}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-sm font-semibold">
                        {formatNaira(budget.totalCreditsKobo)} credit
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatNaira(spentKobo)} spent ·{" "}
                        {formatNaira(remainingBalanceKobo)} remaining
                      </p>
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function BudgetDetailsClient() {
  return (
    <ProtectedDashboardRoute>
      {(userId) => <BudgetDetailsContent userId={userId} />}
    </ProtectedDashboardRoute>
  );
}
