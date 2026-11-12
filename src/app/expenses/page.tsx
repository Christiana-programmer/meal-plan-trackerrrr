import type { Metadata } from "next";
import { ExpenseHistoryClient } from "@/components/expenses/expense-history-client";

export const metadata: Metadata = {
  title: "Expense history | mealwise",
};

export default function ExpensesPage() {
  return <ExpenseHistoryClient />;
}
