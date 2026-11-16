import { describe, expect, it } from "vitest";
import {
  calculateBudgetStatus,
  calculateBudgetWarnings,
  calculateDailyAllowance,
  calculateDashboardSummary,
  calculateEndDate,
  calculateRemainingDays,
} from "@/lib/calculations";
import type { Budget } from "@/types/budget";
import type { Expense } from "@/types/expense";

const budget: Budget = {
  id: "budget-1",
  userId: "user-1",
  totalCreditsKobo: 100_000,
  durationDays: 10,
  startDate: "2026-05-01",
  endDate: "2026-05-10",
  createdAt: "2026-05-01T00:00:00.000Z",
};

function expense(
  amountKobo: number,
  transactionDate = "2026-05-01",
): Expense {
  return {
    id: `expense-${amountKobo}`,
    userId: budget.userId,
    budgetId: budget.id,
    amountKobo,
    description: "Lunch",
    transactionDate,
    createdAt: "2026-05-01T12:00:00.000Z",
    updatedAt: "2026-05-01T12:00:00.000Z",
  };
}

describe("budget calculations", () => {
  it("calculates an inclusive end date from the duration", () => {
    expect(calculateEndDate("2026-05-01", 10)).toBe("2026-05-10");
  });

  it("counts the end date as a remaining day and avoids negative days", () => {
    expect(calculateRemainingDays("2026-05-10", "2026-05-10")).toBe(1);
    expect(calculateRemainingDays("2026-05-10", "2026-05-11")).toBe(0);
    expect(calculateDailyAllowance(50_000, 0)).toBe(0);
  });

  it.each([
    ["upcoming", "2026-04-30", 100_000],
    ["active", "2026-05-01", 100_000],
    ["exhausted", "2026-05-01", 0],
    ["completed", "2026-05-11", 100_000],
  ] as const)("returns %s status", (status, currentDate, balance) => {
    expect(calculateBudgetStatus(budget, balance, currentDate)).toBe(status);
  });

  it("calculates remaining credit and warns at the 80% threshold", () => {
    const expenses = [expense(80_000)];
    const summary = calculateDashboardSummary(budget, expenses, "2026-05-01");
    const warnings = calculateBudgetWarnings(
      budget,
      summary,
      expenses,
      "2026-05-01",
    );

    expect(summary.remainingBalanceKobo).toBe(20_000);
    expect(summary.dailyAllowanceKobo).toBe(10_000);
    expect(summary.dailyAllowanceRemainingKobo).toBe(0);
    expect(warnings.map(({ title }) => title)).toContain(
      "Your meal credit is running low",
    );
    expect(warnings.map(({ title }) => title)).toContain(
      "Today’s spending is above your daily guide",
    );
  });

  it("keeps today's guide fixed while reducing the amount left for today", () => {
    const beforeExpense = calculateDashboardSummary(budget, [], "2026-05-01");
    const afterExpense = calculateDashboardSummary(
      budget,
      [expense(3_000)],
      "2026-05-01",
    );

    expect(beforeExpense.dailyAllowanceKobo).toBe(10_000);
    expect(afterExpense.dailyAllowanceKobo).toBe(10_000);
    expect(afterExpense.dailyAllowanceRemainingKobo).toBe(7_000);

    const afterAnotherExpense = calculateDashboardSummary(
      budget,
      [expense(3_000), expense(2_000)],
      "2026-05-01",
    );
    expect(afterAnotherExpense.dailyAllowanceKobo).toBe(10_000);
    expect(afterAnotherExpense.dailyAllowanceRemainingKobo).toBe(5_000);
  });

  it("redistributes unused credit across remaining days at the next day boundary", () => {
    const yesterdayExpense = expense(5_000, "2026-05-01");
    const nextDaySummary = calculateDashboardSummary(
      budget,
      [yesterdayExpense],
      "2026-05-02",
    );

    expect(nextDaySummary.dailyAllowanceKobo).toBe(10_556);
    expect(nextDaySummary.dailyAllowanceRemainingKobo).toBe(10_556);
  });
});
