import type { Budget } from "@/types/budget";
import type { Expense } from "@/types/expense";

export type BudgetStatus = "upcoming" | "active" | "exhausted" | "completed";

export type DashboardSummary = {
  totalCreditsKobo: number;
  totalSpentKobo: number;
  remainingBalanceKobo: number;
  remainingDays: number;
  daysUntilStart: number;
  dailyAllowanceKobo: number;
  progressPercent: number;
  status: BudgetStatus;
};

export type DashboardWarning = {
  level: "warning" | "critical";
  title: string;
  message: string;
};

export type DashboardData = {
  budget: Budget | null;
  previousBudgets: Budget[];
  previousExpenses: Expense[];
  recentExpenses: Expense[];
  summary: DashboardSummary;
  warnings: DashboardWarning[];
};
