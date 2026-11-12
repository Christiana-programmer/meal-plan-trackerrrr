import type { Budget } from "@/types/budget";
import type { Expense } from "@/types/expense";
import type {
  BudgetStatus,
  DashboardSummary,
  DashboardWarning,
} from "@/types/dashboard";

const LAGOS_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Lagos",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

function dateToUtcDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function formatNaira(kobo: number) {
  return nairaFormatter.format(kobo / 100);
}

export function getLagosDate(now = new Date()) {
  const parts = LAGOS_DATE_FORMATTER.formatToParts(now);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

export function addDays(date: string, days: number) {
  const result = new Date(dateToUtcDay(date) + days * 86_400_000);
  return [
    result.getUTCFullYear(),
    String(result.getUTCMonth() + 1).padStart(2, "0"),
    String(result.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function daysBetween(startDate: string, endDate: string) {
  return Math.round(
    (dateToUtcDay(endDate) - dateToUtcDay(startDate)) / 86_400_000,
  );
}

export function isValidIsoDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  return (
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day
  );
}

export function calculateEndDate(startDate: string, durationDays: number) {
  if (!isValidIsoDate(startDate)) {
    throw new Error("Budget start date must be a valid calendar date.");
  }
  if (!Number.isInteger(durationDays) || durationDays < 1) {
    throw new Error("Budget duration must be a positive whole number of days.");
  }

  return addDays(startDate, durationDays - 1);
}

export function calculateTotalSpent(expenses: Expense[]) {
  return expenses.reduce((total, expense) => total + expense.amountKobo, 0);
}

export function calculateRemainingBalance(
  totalCreditsKobo: number,
  expenses: Expense[],
) {
  return Math.max(0, totalCreditsKobo - calculateTotalSpent(expenses));
}

export function calculateRemainingDays(
  endDate: string,
  currentDate = getLagosDate(),
) {
  return Math.max(0, daysBetween(currentDate, endDate) + 1);
}

export function calculateDailyAllowance(
  remainingBalanceKobo: number,
  remainingDays: number,
) {
  if (remainingDays <= 0) {
    return 0;
  }

  return Math.round(remainingBalanceKobo / remainingDays);
}

export function calculateBudgetStatus(
  budget: Budget,
  remainingBalanceKobo: number,
  currentDate = getLagosDate(),
): BudgetStatus {
  if (budget.startDate > currentDate) {
    return "upcoming";
  }
  if (currentDate > budget.endDate) {
    return "completed";
  }
  if (remainingBalanceKobo === 0) {
    return "exhausted";
  }
  return "active";
}

export function calculateDashboardSummary(
  budget: Budget | null,
  expenses: Expense[],
  currentDate = getLagosDate(),
): DashboardSummary {
  if (!budget) {
    return {
      totalCreditsKobo: 0,
      totalSpentKobo: 0,
      remainingBalanceKobo: 0,
      remainingDays: 0,
      daysUntilStart: 0,
      dailyAllowanceKobo: 0,
      progressPercent: 0,
      status: "completed",
    };
  }

  const totalSpentKobo = calculateTotalSpent(expenses);
  const remainingBalanceKobo = calculateRemainingBalance(
    budget.totalCreditsKobo,
    expenses,
  );
  const status = calculateBudgetStatus(budget, remainingBalanceKobo, currentDate);
  const remainingDays =
    status === "active" || status === "exhausted"
      ? calculateRemainingDays(budget.endDate, currentDate)
      : 0;
  const daysUntilStart =
    status === "upcoming" ? daysBetween(currentDate, budget.startDate) : 0;
  const dailyAllowanceKobo =
    status === "upcoming"
      ? Math.round(budget.totalCreditsKobo / budget.durationDays)
      : status === "active"
        ? calculateDailyAllowance(remainingBalanceKobo, remainingDays)
        : 0;

  return {
    totalCreditsKobo: budget.totalCreditsKobo,
    totalSpentKobo,
    remainingBalanceKobo,
    remainingDays,
    daysUntilStart,
    dailyAllowanceKobo,
    progressPercent:
      budget.totalCreditsKobo > 0
        ? Math.min(100, (totalSpentKobo / budget.totalCreditsKobo) * 100)
        : 0,
    status,
  };
}

export function calculateBudgetWarnings(
  budget: Budget | null,
  summary: DashboardSummary,
  expenses: Expense[],
  currentDate = getLagosDate(),
): DashboardWarning[] {
  if (!budget) {
    return [];
  }

  if (summary.status === "exhausted") {
    return [
      {
        level: "critical",
        title: "Meal credit exhausted",
        message:
          "There’s no balance left for this period. Add your next meal credit to start a new budget period.",
      },
    ];
  }

  if (summary.status === "completed") {
    return [
      {
        level: "warning",
        title: "This budget period has ended",
        message:
          "Review your remaining balance and add your next meal credit when you receive it.",
      },
    ];
  }

  if (summary.status !== "active") {
    return [];
  }

  const warnings: DashboardWarning[] = [];
  const spentPercent =
    budget.totalCreditsKobo > 0
      ? summary.totalSpentKobo / budget.totalCreditsKobo
      : 0;

  if (spentPercent >= 0.8) {
    warnings.push({
      level: "warning",
      title: "Your meal credit is running low",
      message: `You’ve used ${Math.round(spentPercent * 100)}% of this period’s credit. Your remaining balance is ${formatNaira(summary.remainingBalanceKobo)}.`,
    });
  }

  const spentBeforeTodayKobo = calculateTotalSpent(
    expenses.filter((expense) => expense.transactionDate < currentDate),
  );
  const spentTodayKobo = calculateTotalSpent(
    expenses.filter((expense) => expense.transactionDate === currentDate),
  );
  const startOfDayBalanceKobo = Math.max(
    0,
    budget.totalCreditsKobo - spentBeforeTodayKobo,
  );
  const startOfDayGuideKobo = calculateDailyAllowance(
    startOfDayBalanceKobo,
    summary.remainingDays,
  );
  const spendingExceededDailyGuide = spentTodayKobo > startOfDayGuideKobo;

  if (spendingExceededDailyGuide) {
    warnings.push({
      level: "warning",
      title: "Today’s spending is above your daily guide",
      message: `You’ve recorded ${formatNaira(spentTodayKobo)} today. Your suggested amount at the start of the day was ${formatNaira(startOfDayGuideKobo)}. You can spend more, but it leaves less to spread across the remaining days.`,
    });
  }

  const elapsedDays = Math.min(
    budget.durationDays,
    budget.durationDays - summary.remainingDays + 1,
  );
  const expectedSpentKobo = Math.round(
    (budget.totalCreditsKobo * elapsedDays) / budget.durationDays,
  );
  const spendingAheadByKobo = summary.totalSpentKobo - expectedSpentKobo;
  const paceWarningThresholdKobo = Math.max(
    50_000,
    Math.round(budget.totalCreditsKobo * 0.1),
  );

  if (
    spendingAheadByKobo > paceWarningThresholdKobo &&
    !spendingExceededDailyGuide
  ) {
    warnings.push({
      level: "warning",
      title: "Spending is ahead of your plan",
      message: `You’ve spent ${formatNaira(spendingAheadByKobo)} more than the expected pace for this point in the period. Your daily guide is ${formatNaira(summary.dailyAllowanceKobo)}.`,
    });
  }

  return warnings;
}
