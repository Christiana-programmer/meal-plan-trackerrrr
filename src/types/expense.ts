export type Expense = {
  id: string;
  userId: string;
  budgetId: string;
  amountKobo: number;
  description: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateExpenseInput = {
  amountKobo: number;
  description: string;
  transactionDate: string;
};

export type UpdateExpenseInput = CreateExpenseInput;
