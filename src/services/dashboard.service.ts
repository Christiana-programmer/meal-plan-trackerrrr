import { apiRequest } from "@/services/api-client";
import type { DashboardData } from "@/types/dashboard";

export interface DashboardService {
  getDashboard(userId: string): Promise<DashboardData>;
}

export const dashboardService: DashboardService = {
  async getDashboard(_userId) {
    void _userId;
    return apiRequest<DashboardData>("/dashboard");
  },
};
