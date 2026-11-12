"use client";

import { useCallback, useEffect, useState } from "react";
import { AddExpenseDialog } from "@/components/dashboard/add-expense-dialog";
import { BudgetStatusBadge } from "@/components/dashboard/budget-status-badge";
import { ConfirmDeleteDialog } from "@/components/expenses/confirm-delete-dialog";
import { ProtectedDashboardRoute } from "@/components/layout/protected-dashboard-route";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  calculateBudgetStatus,
  calculateRemainingBalance,
  daysBetween,
  getLagosDate,
} from "@/lib/calculations";
import { formatDate, formatNaira } from "@/lib/formatters";
import { dashboardService } from "@/services/dashboard.service";
import { expenseService } from "@/services/expense.service";
import type { Budget } from "@/types/budget";
import type { Expense, UpdateExpenseInput } from "@/types/expense";

type ExpenseHistoryData = {
  budget: Budget | null;
  expenses: Expense[];
};

function transactionDateLabel(date: string, today: string) {
  const difference = daysBetween(date, today);
  if (difference === 0) {
    return "Today";
  }
  if (difference === 1) {
    return "Yesterday";
  }
  return formatDate(date);
}

function ExpenseHistoryContent({ userId }: { userId: string }) {
  const [data, setData] = useState<ExpenseHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const today = getLagosDate();

  const loadExpenses = useCallback(async () => {
    const [dashboard, expenses] = await Promise.all([
      dashboardService.getDashboard(userId),
      expenseService.list(userId),
    ]);
    setData({ budget: dashboard.budget, expenses });
  }, [userId]);

  function retryLoading() {
    setError("");
    setLoading(true);
    setRefreshVersion((version) => version + 1);
  }

  useEffect(() => {
    let active = true;

    Promise.all([
      dashboardService.getDashboard(userId),
      expenseService.list(userId),
    ])
      .then(([dashboard, expenses]) => {
        if (active) {
          setData({ budget: dashboard.budget, expenses });
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Expense history could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [refreshVersion, userId]);

  async function handleUpdate(input: UpdateExpenseInput) {
    if (!editingExpense) {
      return;
    }
    await expenseService.update(userId, editingExpense.id, input);
    await loadExpenses();
    setEditingExpense(null);
    setNotice("Expense updated. Your budget totals have been recalculated.");
  }

  async function handleDelete() {
    if (!deletingExpense) {
      return;
    }
    setDeleteError("");
    setIsDeleting(true);
    try {
      await expenseService.delete(userId, deletingExpense.id);
      await loadExpenses();
      setDeletingExpense(null);
      setNotice("Expense deleted. Your budget totals have been recalculated.");
    } catch (cause) {
      setDeleteError(
        cause instanceof Error
          ? cause.message
          : "The expense could not be deleted. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-7">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-muted">{formatDate(today)}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Expense history
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Review and manage the meals recorded for your current credit
              period.
            </p>
          </div>
          {data?.budget ? (
            <span className="self-start sm:self-auto">
              <BudgetStatusBadge
                status={calculateBudgetStatus(
                  data.budget,
                  calculateRemainingBalance(
                    data.budget.totalCreditsKobo,
                    data.expenses,
                  ),
                  today,
                )}
              />
            </span>
          ) : null}
        </header>

        {notice ? (
          <p role="status" className="rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary">
            {notice}
          </p>
        ) : null}

        {error ? (
          <div role="alert" className="rounded-2xl bg-danger-soft p-5 text-sm text-danger">
            <p>{error}</p>
            <Button
              className="mt-3"
              variant="secondary"
              onClick={retryLoading}
            >
              Try again
            </Button>
          </div>
        ) : loading ? (
          <section className="rounded-2xl border border-border bg-surface px-6 py-16 text-center" role="status">
            <p className="text-sm text-muted">Loading expenses…</p>
          </section>
        ) : !data?.budget ? (
          <section className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
            <p className="text-sm font-semibold">No current credit period</p>
            <p className="mt-2 text-sm text-muted">
              Add a meal credit from your dashboard to start recording expenses.
            </p>
          </section>
        ) : data.expenses.length === 0 ? (
          <section className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Icon name="transactions" className="size-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">No expenses yet</h2>
            <p className="mt-2 text-sm text-muted">
              Your meal purchases will appear here after you record them.
            </p>
          </section>
        ) : (
          <section
            aria-labelledby="expense-history-heading"
            className="overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
              <div>
                <h2 id="expense-history-heading" className="text-lg font-semibold">
                  Transactions
                </h2>
                <p className="mt-1 text-xs text-muted">
                  {data.expenses.length}{" "}
                  {data.expenses.length === 1 ? "expense" : "expenses"} · newest
                  first
                </p>
              </div>
              <p className="hidden text-sm font-semibold sm:block">
                {formatNaira(
                  data.expenses.reduce(
                    (total, expense) => total + expense.amountKobo,
                    0,
                  ),
                )}{" "}
                spent
              </p>
            </div>

            <ul className="divide-y divide-border">
              {data.expenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
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
                        {transactionDateLabel(expense.transactionDate, today)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <p className="text-sm font-semibold">
                      −{formatNaira(expense.amountKobo)}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        className="min-h-10 px-3 text-primary"
                        onClick={() => setEditingExpense(expense)}
                        aria-label={`Edit ${expense.description}`}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        className="min-h-10 px-3 text-danger"
                        onClick={() => {
                          setDeleteError("");
                          setDeletingExpense(expense);
                        }}
                        aria-label={`Delete ${expense.description}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {editingExpense && data?.budget ? (
        <AddExpenseDialog
          expense={editingExpense}
          startDate={data.budget.startDate}
          endDate={data.budget.endDate}
          today={today}
          onClose={() => setEditingExpense(null)}
          onSave={handleUpdate}
        />
      ) : null}
      {deletingExpense ? (
        <ConfirmDeleteDialog
          description={deletingExpense.description}
          isDeleting={isDeleting}
          error={deleteError}
          onCancel={() => setDeletingExpense(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  );
}

export function ExpenseHistoryClient() {
  return (
    <ProtectedDashboardRoute>
      {(userId) => <ExpenseHistoryContent userId={userId} />}
    </ProtectedDashboardRoute>
  );
}
