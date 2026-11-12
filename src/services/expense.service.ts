import { apiRequest } from "@/services/api-client";
import type {
  CreateExpenseInput,
  Expense,
  UpdateExpenseInput,
} from "@/types/expense";

export interface ExpenseService {
  list(userId: string): Promise<Expense[]>;
  create(userId: string, input: CreateExpenseInput): Promise<Expense>;
  update(
    userId: string,
    expenseId: string,
    input: UpdateExpenseInput,
  ): Promise<Expense>;
  delete(userId: string, expenseId: string): Promise<void>;
}

export const expenseService: ExpenseService = {
  async list(_userId) {
    void _userId;
    return apiRequest<Expense[]>("/expenses");
  },

  async create(_userId, input) {
    void _userId;
    return apiRequest<Expense>("/expenses", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(_userId, expenseId, input) {
    void _userId;
    return apiRequest<Expense>(`/expenses/${encodeURIComponent(expenseId)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async delete(_userId, expenseId) {
    void _userId;
    await apiRequest<void>(
      `/expenses/${encodeURIComponent(expenseId)}`,
      { method: "DELETE" },
    );
  },
};
