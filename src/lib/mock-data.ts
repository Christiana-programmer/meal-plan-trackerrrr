import type { Budget } from "@/types/budget";
import type { Expense } from "@/types/expense";

export type MockTrackerData = {
  budget: Budget | null;
  expenses: Expense[];
  previousBudgets: Budget[];
  previousExpenses: Expense[];
};



export function createMockTrackerData(): MockTrackerData {
  return {
    budget: null,
    expenses: [],
    previousBudgets: [],
    previousExpenses: [],
  };
}
