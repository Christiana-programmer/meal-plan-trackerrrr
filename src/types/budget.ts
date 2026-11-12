export type Budget = {
  id: string;
  userId: string;
  totalCreditsKobo: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  createdAt: string;
};

export type CreateBudgetInput = {
  totalCreditsKobo: number;
  durationDays: number;
  startDate: string;
};
