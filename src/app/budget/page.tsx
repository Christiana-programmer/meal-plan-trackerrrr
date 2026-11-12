import type { Metadata } from "next";
import { BudgetDetailsClient } from "@/components/budget/budget-details-client";

export const metadata: Metadata = {
  title: "Budget details | mealwise",
};

export default function BudgetPage() {
  return <BudgetDetailsClient />;
}
