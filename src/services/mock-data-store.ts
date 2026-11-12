import { createMockTrackerData, type MockTrackerData } from "@/lib/mock-data";
import type { Budget } from "@/types/budget";
import type { Expense } from "@/types/expense";

const STORAGE_PREFIX = "mealwise.mock-tracker.v1";

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${encodeURIComponent(userId)}`;
}

function isBudget(value: unknown): value is Budget {
  if (!value || typeof value !== "object") {
    return false;
  }

  const budget = value as Record<string, unknown>;
  return (
    typeof budget.id === "string" &&
    typeof budget.userId === "string" &&
    typeof budget.totalCreditsKobo === "number" &&
    typeof budget.durationDays === "number" &&
    typeof budget.startDate === "string" &&
    typeof budget.endDate === "string" &&
    typeof budget.createdAt === "string"
  );
}

function isExpense(value: unknown): value is Expense {
  if (!value || typeof value !== "object") {
    return false;
  }

  const expense = value as Record<string, unknown>;
  return (
    typeof expense.id === "string" &&
    typeof expense.userId === "string" &&
    typeof expense.budgetId === "string" &&
    typeof expense.amountKobo === "number" &&
    typeof expense.description === "string" &&
    typeof expense.transactionDate === "string" &&
    typeof expense.createdAt === "string" &&
    typeof expense.updatedAt === "string"
  );
}

type StoredMockTrackerData = Omit<
  MockTrackerData,
  "previousBudgets" | "previousExpenses"
> &
  Partial<Pick<MockTrackerData, "previousBudgets" | "previousExpenses">>;

function isMockTrackerData(value: unknown): value is StoredMockTrackerData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;
  return (
    (data.budget === null || isBudget(data.budget)) &&
    Array.isArray(data.expenses) &&
    data.expenses.every(isExpense) &&
    (data.previousBudgets === undefined ||
      (Array.isArray(data.previousBudgets) &&
        data.previousBudgets.every(isBudget))) &&
    (data.previousExpenses === undefined ||
      (Array.isArray(data.previousExpenses) &&
        data.previousExpenses.every(isExpense)))
  );
}

export function getMockTrackerData(userId: string): MockTrackerData {
  if (typeof window === "undefined") {
    throw new Error("Mock tracker data is only available in the browser.");
  }

  const key = storageKey(userId);
  const savedData = window.localStorage.getItem(key);
  if (!savedData) {
    const initialData = createMockTrackerData();
    window.localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }

  let parsedData: unknown;
  try {
    parsedData = JSON.parse(savedData);
  } catch {
    throw new Error(
      "Saved demo data could not be read. Clear the mealwise demo data in browser storage and try again.",
    );
  }

  if (!isMockTrackerData(parsedData)) {
    throw new Error(
      "Saved demo data has an unexpected format. Clear the mealwise demo data in browser storage and try again.",
    );
  }

  let migratedData: MockTrackerData = {
    budget: parsedData.budget,
    expenses: parsedData.expenses,
    previousBudgets: parsedData.previousBudgets ?? [],
    previousExpenses: parsedData.previousExpenses ?? [],
  };

  const hadLegacyStore =
    parsedData.previousBudgets === undefined ||
    parsedData.previousExpenses === undefined;
  const hadSeededDemoBudget =
    migratedData.budget?.id === `budget-${userId}`;

  if (hadSeededDemoBudget && migratedData.budget) {
    migratedData = {
      ...migratedData,
      budget: null,
      expenses: [],
    };
  }

  if (hadLegacyStore || hadSeededDemoBudget) {
    saveMockTrackerData(userId, migratedData);
  }

  return migratedData;
}

export function saveMockTrackerData(userId: string, data: MockTrackerData) {
  if (typeof window === "undefined") {
    throw new Error("Mock tracker data is only available in the browser.");
  }

  window.localStorage.setItem(storageKey(userId), JSON.stringify(data));
}
