import { apiRequest } from "@/services/api-client";
import type { Budget, CreateBudgetInput } from "@/types/budget";

export interface BudgetService {
  getCurrent(userId: string): Promise<Budget | null>;
  create(userId: string, input: CreateBudgetInput): Promise<Budget>;
}

export const budgetService: BudgetService = {
  async getCurrent(_userId) {
    void _userId;
    return apiRequest<Budget | null>("/budgets/current");
  },

  async create(_userId, input) {
    void _userId;
    return apiRequest<Budget>("/budgets", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
