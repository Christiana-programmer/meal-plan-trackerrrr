import { beforeEach, describe, expect, it, vi } from "vitest";
import { budgetService } from "@/services/budget.service";
import { dashboardService } from "@/services/dashboard.service";
import { expenseService } from "@/services/expense.service";

const apiRequest = vi.hoisted(() => vi.fn());

vi.mock("@/services/api-client", () => ({
  apiRequest,
}));

describe("API-backed frontend services", () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it("uses authenticated API routes for budget and dashboard reads", async () => {
    apiRequest.mockResolvedValueOnce(null).mockResolvedValueOnce({
      budget: null,
      previousBudgets: [],
      previousExpenses: [],
      recentExpenses: [],
      summary: {
        totalCreditsKobo: 0,
        totalSpentKobo: 0,
        remainingBalanceKobo: 0,
        remainingDays: 0,
        daysUntilStart: 0,
        dailyAllowanceKobo: 0,
        progressPercent: 0,
        status: "completed",
      },
      warnings: [],
    });

    await expect(budgetService.getCurrent("ignored-user-id")).resolves.toBeNull();
    await dashboardService.getDashboard("ignored-user-id");

    expect(apiRequest).toHaveBeenNthCalledWith(1, "/budgets/current");
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/dashboard");
  });

  it("routes expense create, list, update, and delete through the API client", async () => {
    apiRequest
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce(undefined);

    await expenseService.list("ignored-user-id");
    await expenseService.create("ignored-user-id", {
      amountKobo: 250_000,
      description: "Lunch",
      transactionDate: "2026-11-12",
    });
    await expenseService.update("ignored-user-id", "expense/one", {
      amountKobo: 300_000,
      description: "Updated lunch",
      transactionDate: "2026-11-12",
    });
    await expenseService.delete("ignored-user-id", "expense/one");

    expect(apiRequest).toHaveBeenNthCalledWith(1, "/expenses");
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/expenses", {
      method: "POST",
      body: JSON.stringify({
        amountKobo: 250_000,
        description: "Lunch",
        transactionDate: "2026-11-12",
      }),
    });
    expect(apiRequest).toHaveBeenNthCalledWith(
      3,
      "/expenses/expense%2Fone",
      {
        method: "PATCH",
        body: JSON.stringify({
          amountKobo: 300_000,
          description: "Updated lunch",
          transactionDate: "2026-11-12",
        }),
      },
    );
    expect(apiRequest).toHaveBeenNthCalledWith(
      4,
      "/expenses/expense%2Fone",
      { method: "DELETE" },
    );
  });

  it("sends new budget input using the backend contract", async () => {
    apiRequest.mockResolvedValueOnce({});
    const input = {
      totalCreditsKobo: 1_000_000,
      durationDays: 30,
      startDate: "2026-11-12",
    };

    await budgetService.create("ignored-user-id", input);

    expect(apiRequest).toHaveBeenCalledWith("/budgets", {
      method: "POST",
      body: JSON.stringify(input),
    });
  });
});
