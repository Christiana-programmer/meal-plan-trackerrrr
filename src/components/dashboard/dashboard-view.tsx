"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AddExpenseDialog } from "@/components/dashboard/add-expense-dialog";
import { BudgetStatusBadge } from "@/components/dashboard/budget-status-badge";
import { CreateBudgetDialog } from "@/components/dashboard/create-budget-dialog";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { dashboardService } from "@/services/dashboard.service";
import { budgetService } from "@/services/budget.service";
import { expenseService } from "@/services/expense.service";
import {
  calculateTotalSpent,
  daysBetween,
  getLagosDate,
} from "@/lib/calculations";
import { formatDate, formatNaira, formatNairaCompact } from "@/lib/formatters";
import type { DashboardData } from "@/types/dashboard";
import type { CreateBudgetInput } from "@/types/budget";
import type { CreateExpenseInput } from "@/types/expense";
import type { MockUser } from "@/types/user";

type DashboardViewProps = {
  user: MockUser;
  onLogout: () => void;
};

const metricCards = [
  {
    key: "totalCreditsKobo",
    label: "Total meal credits",
    description: "For this budget period",
    icon: "budget",
    color: "bg-[#f0f3ff] text-[#4564b7]",
  },
  {
    key: "totalSpentKobo",
    label: "Total spent",
    description: "Recorded expenses",
    icon: "transactions",
    color: "bg-[#fff4e8] text-[#a75c16]",
  },
] as const;

const statusDescriptions = {
  upcoming: "Your new budget is ready for its start date.",
  active: "You’re within your budget period. Keep it up.",
  exhausted: "Your meal credits have been used for this period.",
  completed: "This budget period has ended.",
};

function getTransactionDateLabel(date: string, today: string) {
  const difference = daysBetween(date, today);
  if (difference === 0) {
    return "Today";
  }
  if (difference === 1) {
    return "Yesterday";
  }
  return formatDate(date);
}

function MetricCard({
  label,
  description,
  value,
  icon,
  color,
  detail,
}: {
  label: string;
  description: string;
  value: string;
  icon: "budget" | "transactions" | "overview";
  color: string;
  detail?: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <span className={`flex size-10 items-center justify-center rounded-xl ${color}`}>
          <Icon name={icon} className="size-[18px]" />
        </span>
      </div>
      <p className="mt-2 text-xs text-muted">
        {detail ?? description}
      </p>
    </article>
  );
}

function LoadingPanel({ message }: { message: string }) {
  return (
    <div
      className="flex min-h-[300px] items-center justify-center rounded-3xl border border-border bg-surface px-6 text-center"
      role="status"
    >
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

export function DashboardView({ user, onLogout }: DashboardViewProps) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [notice, setNotice] = useState("");
  const [balancesHidden, setBalancesHidden] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    dashboardService
      .getDashboard(user.id)
      .then((result) => {
        if (isCurrent) {
          setDashboard(result);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (isCurrent) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Your dashboard could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [refreshVersion, user.id]);

  async function handleSaveExpense(input: CreateExpenseInput) {
    await expenseService.create(user.id, input);
    setNotice("Expense saved. Your budget totals have been updated.");
    setRefreshVersion((version) => version + 1);
  }

  async function handleCreateBudget(input: CreateBudgetInput) {
    await budgetService.create(user.id, input);
    setNotice("New meal credit saved. Your budget period has started.");
    setRefreshVersion((version) => version + 1);
  }

  const today = getLagosDate();
  const firstName = user.fullName.trim().split(/\s+/)[0] || "there";
  const canAddCredit =
    !isLoading &&
    (!dashboard?.budget ||
      dashboard.summary.status === "exhausted" ||
      dashboard.summary.status === "completed");
  const canRecordExpense =
    dashboard?.summary.status === "active" &&
    dashboard.summary.remainingBalanceKobo > 0;
  const primaryActionLabel = canAddCredit
    ? "Add meal credit"
    : canRecordExpense
      ? "Record expense"
      : "Credit period not active";

  return (
    <DashboardShell user={user} onLogout={onLogout}>
      <div className="flex flex-col gap-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-muted">
              {formatDate(today)}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Here’s how your meal plan is looking today.
            </p>
          </div>
          {dashboard?.budget ? (
            <Button
              className="w-full gap-2 sm:w-auto"
              onClick={() => {
                if (canAddCredit) {
                  setBudgetDialogOpen(true);
                } else if (canRecordExpense) {
                  setExpenseDialogOpen(true);
                }
              }}
              disabled={
                isLoading ||
                (!canAddCredit && !canRecordExpense)
              }
            >
              <Icon name="plus" className="size-[18px]" />
              {primaryActionLabel}
            </Button>
          ) : null}
        </div>

        {notice ? (
          <p
            className="rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary"
            role="status"
          >
            {notice}
          </p>
        ) : null}

        {dashboard?.warnings.map((warning) => (
          <div
            key={warning.title}
            className={`flex items-start gap-3 rounded-2xl border p-4 sm:p-5 ${
              warning.level === "critical"
                ? "border-danger/20 bg-danger-soft"
                : "border-[#ead5b6] bg-[#fff8ec]"
            }`}
            role={warning.level === "critical" ? "alert" : "status"}
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                warning.level === "critical"
                  ? "bg-danger/10 text-danger"
                  : "bg-[#f5e8cf] text-[#8b5a16]"
              }`}
            >
              !
            </span>
            <div>
              <p
                className={`text-sm font-semibold ${
                  warning.level === "critical"
                    ? "text-danger"
                    : "text-[#754b12]"
                }`}
              >
                {warning.title}
              </p>
              <p
                className={`mt-1 text-sm leading-6 ${
                  warning.level === "critical"
                    ? "text-danger"
                    : "text-[#754b12]"
                }`}
              >
                {warning.message}
              </p>
            </div>
          </div>
        ))}

        {error ? (
          <div
            className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-danger/20 bg-danger-soft p-5 sm:flex-row sm:items-center"
            role="alert"
          >
            <p className="text-sm leading-6 text-danger">{error}</p>
            <Button
              variant="secondary"
              onClick={() => setRefreshVersion((version) => version + 1)}
            >
              Try again
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <LoadingPanel message="Loading your meal budget…" />
        ) : dashboard?.budget ? (
          <>
            <section
              aria-labelledby="daily-guide-heading"
              className="relative overflow-hidden rounded-3xl bg-[#1d603e] p-6 text-white shadow-[0_24px_70px_-38px_rgba(22,70,43,0.65)] sm:p-8 lg:p-10"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 -top-32 size-80 rounded-full border border-white/10"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 -top-20 size-56 rounded-full border border-white/10"
              />
              <div className="relative grid gap-8 lg:grid-cols-[1fr_300px] lg:items-end">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-medium text-white/75">
                      {dashboard.summary.status === "upcoming"
                        ? "Starting daily allowance"
                        : "Left in today’s guide"}
                    </p>
                    <BudgetStatusBadge status={dashboard.summary.status} />
                  </div>
                  <h2
                    id="daily-guide-heading"
                    className="mt-3 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl"
                  >
                    {formatNaira(
                      dashboard.summary.dailyAllowanceRemainingKobo,
                    )}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    {dashboard.summary.status === "upcoming"
                      ? "Your initial daily guide for this budget."
                      : dashboard.summary.status === "active"
                        ? `Daily budget (fixed today): ${formatNaira(dashboard.summary.dailyAllowanceKobo)}. Unused credit is spread across the days left tomorrow.`
                        : dashboard.summary.status === "exhausted"
                          ? `Daily budget set for today: ${formatNaira(dashboard.summary.dailyAllowanceKobo)}. No meal credit remains to spend.`
                          : "This budget period has ended."}
                  </p>

                  <div className="mt-8 max-w-xl">
                    <div className="flex items-center justify-between gap-3 text-xs text-white/80">
                      <span>Budget used</span>
                      <span>
                        {Math.round(dashboard.summary.progressPercent)}%
                      </span>
                    </div>
                    <div
                      role="img"
                      aria-label={`${Math.round(dashboard.summary.progressPercent)} percent of meal credits used`}
                      className="mt-2 h-2 overflow-hidden rounded-full bg-white/20"
                    >
                      <div
                        className="h-full rounded-full bg-white transition-[width]"
                        style={{
                          width: `${dashboard.summary.progressPercent}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  aria-label="Meal credit balances"
                  className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white/75">
                      Credit balances
                    </p>
                    <button
                      type="button"
                      aria-label={balancesHidden ? "Show balances" : "Hide balances"}
                      aria-pressed={balancesHidden}
                      onClick={() => setBalancesHidden((hidden) => !hidden)}
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <Icon
                        name={balancesHidden ? "eyeOff" : "eye"}
                        className="size-5"
                      />
                    </button>
                  </div>
                  <dl id="dashboard-credit-balances" className="mt-3 grid gap-4">
                    <div>
                      <dt className="text-xs text-white/70">Available balance</dt>
                      <dd
                        aria-label={
                          balancesHidden
                            ? "Hidden"
                            : formatNaira(dashboard.summary.remainingBalanceKobo)
                        }
                        className="mt-1 text-2xl font-semibold tracking-tight"
                      >
                        {balancesHidden
                          ? "••••••"
                          : formatNaira(dashboard.summary.remainingBalanceKobo)}
                      </dd>
                    </div>
                    <div className="border-t border-white/15 pt-4">
                      <dt className="text-xs text-white/70">Total meal credit</dt>
                      <dd
                        aria-label={
                          balancesHidden
                            ? "Hidden"
                            : formatNaira(dashboard.summary.totalCreditsKobo)
                        }
                        className="mt-1 text-lg font-semibold"
                      >
                        {balancesHidden
                          ? "••••••"
                          : formatNaira(dashboard.summary.totalCreditsKobo)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </section>

            <section
              aria-label="Budget summary"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {metricCards.map((card) => (
                <MetricCard
                  key={card.key}
                  label={card.label}
                  description={card.description}
                  value={
                    card.key === "totalCreditsKobo" && balancesHidden
                      ? "••••••"
                      : formatNaira(dashboard.summary[card.key])
                  }
                  icon={card.icon}
                  color={card.color}
                />
              ))}
              <MetricCard
                label={
                  dashboard.summary.status === "upcoming"
                    ? "Budget starts"
                    : "Days remaining"
                }
                description="Inclusive of today"
                value={
                  dashboard.summary.status === "upcoming"
                    ? `${dashboard.summary.daysUntilStart} ${dashboard.summary.daysUntilStart === 1 ? "day" : "days"}`
                    : String(dashboard.summary.remainingDays)
                }
                icon="overview"
                color="bg-primary-soft text-primary"
                detail={
                  dashboard.summary.status === "completed"
                    ? "Budget period has ended"
                    : dashboard.summary.status === "exhausted"
                      ? "Credits are exhausted"
                      : dashboard.summary.status === "upcoming"
                        ? "Until your budget begins"
                        : "Including today"
                }
              />
            </section>

            <div className="grid items-start gap-5 xl:grid-cols-[1.4fr_0.9fr]">
              <section
                id="transactions"
                aria-labelledby="transactions-heading"
                className="scroll-mt-24 rounded-2xl border border-border bg-surface"
              >
                <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
                  <div>
                    <h2
                      id="transactions-heading"
                      className="text-lg font-semibold tracking-tight"
                    >
                      Recent transactions
                    </h2>
                    <p className="mt-1 text-xs text-muted">
                      Your latest cafeteria spending
                    </p>
                  </div>
                  <Link
                    href="/expenses"
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-primary-soft"
                  >
                    View all
                    <Icon name="arrow" className="size-4" />
                  </Link>
                </div>

                {dashboard.recentExpenses.length ? (
                  <ul className="divide-y divide-border">
                    {dashboard.recentExpenses.map((expense) => (
                      <li
                        key={expense.id}
                        className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-muted">
                            <Icon name="transactions" className="size-[18px]" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {expense.description}
                            </p>
                            <p className="mt-1 text-xs text-muted">
                              {getTransactionDateLabel(
                                expense.transactionDate,
                                today,
                              )}
                            </p>
                          </div>
                        </div>
                        <p className="shrink-0 text-sm font-semibold">
                          −{formatNaira(expense.amountKobo)}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm font-semibold">No expenses yet</p>
                    <p className="mt-2 text-sm text-muted">
                      Record your first meal purchase to see it here.
                    </p>
                    <Button
                      className="mt-5"
                      onClick={() => setExpenseDialogOpen(true)}
                      disabled={!canRecordExpense}
                    >
                      Record an expense
                    </Button>
                  </div>
                )}
              </section>

              <section
                id="budget"
                aria-labelledby="budget-heading"
                className="scroll-mt-24 rounded-2xl border border-border bg-surface p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      id="budget-heading"
                      className="text-lg font-semibold tracking-tight"
                    >
                      Budget overview
                    </h2>
                    <p className="mt-1 text-xs text-muted">
                      Your current meal plan period
                    </p>
                  </div>
                  <BudgetStatusBadge status={dashboard.summary.status} />
                </div>

                <p
                  aria-label={
                    balancesHidden
                      ? "Hidden"
                      : formatNaira(dashboard.summary.totalCreditsKobo)
                  }
                  className="mt-7 text-3xl font-semibold tracking-tight"
                >
                  {balancesHidden
                    ? "••••••"
                    : formatNairaCompact(dashboard.summary.totalCreditsKobo)}
                </p>
                <p className="mt-1 text-sm text-muted">Total meal credits</p>

                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5">
                  <div>
                    <dt className="text-xs text-muted">Starts</dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {formatDate(dashboard.budget.startDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Ends</dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {formatDate(dashboard.budget.endDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Duration</dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {dashboard.budget.durationDays} days
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Spent so far</dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {formatNairaCompact(dashboard.summary.totalSpentKobo)}
                    </dd>
                  </div>
                </dl>

                <p className="mt-5 rounded-xl bg-background px-4 py-3 text-xs leading-5 text-muted">
                  {statusDescriptions[dashboard.summary.status]}
                </p>
              </section>
            </div>

            {dashboard.previousBudgets.length > 0 ? (
              <section
                aria-labelledby="previous-credits-heading"
                className="rounded-2xl border border-border bg-surface"
              >
                <div className="border-b border-border px-5 py-5 sm:px-6">
                  <h2
                    id="previous-credits-heading"
                    className="text-lg font-semibold tracking-tight"
                  >
                    Previous credits
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    Earlier budget periods and spending are kept for reference.
                  </p>
                </div>
                <ul className="divide-y divide-border">
                  {[...dashboard.previousBudgets]
                    .sort((left, right) =>
                      right.createdAt.localeCompare(left.createdAt),
                    )
                    .slice(0, 3)
                    .map((budget) => {
                      const spentKobo = calculateTotalSpent(
                        dashboard.previousExpenses.filter(
                          (expense) => expense.budgetId === budget.id,
                        ),
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
                              {budget.durationDays} days
                            </p>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-sm font-semibold">
                              {formatNaira(budget.totalCreditsKobo)} credit
                            </p>
                            <p className="mt-1 text-xs text-muted">
                              {formatNaira(spentKobo)} spent
                            </p>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </section>
            ) : null}
          </>
        ) : (
          <section className="rounded-3xl border border-border bg-surface px-6 py-16 text-center">
            <p className="text-sm font-semibold text-primary">First things first</p>
            <h2 className="mt-2 text-2xl font-semibold">
              Add your first meal credit
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
              Enter the feeding money you received and how long it needs to
              last. We’ll calculate a daily guide and track each meal expense.
            </p>
            <Button
              className="mt-6 gap-2"
              onClick={() => setBudgetDialogOpen(true)}
            >
              <Icon name="plus" className="size-[18px]" />
              Add meal credit
            </Button>
          </section>
        )}
      </div>

      {isExpenseDialogOpen && dashboard?.budget ? (
        <AddExpenseDialog
          startDate={dashboard.budget.startDate}
          endDate={dashboard.budget.endDate}
          today={today}
          onClose={() => setExpenseDialogOpen(false)}
          onSave={handleSaveExpense}
        />
      ) : null}
      {isBudgetDialogOpen ? (
        <CreateBudgetDialog
          today={today}
          onClose={() => setBudgetDialogOpen(false)}
          onSave={handleCreateBudget}
        />
      ) : null}
    </DashboardShell>
  );
}
