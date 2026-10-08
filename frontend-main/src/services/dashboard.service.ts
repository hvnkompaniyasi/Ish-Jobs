import api from "./api";
import type { DashboardData, DashboardPeriod } from "@/types";

export const dashboardService = {
  async getEmployerDashboard(period: DashboardPeriod = "30d"): Promise<DashboardData> {
    const { data } = await api.get<DashboardData>("/dashboard/employer", {
      params: { period },
    });
    return data;
  },
};
