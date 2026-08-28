import api from "./api";

export interface DashboardStats {
  totalItems: number;
  newThisWeek: number;
  percentNegative: number;
  sentimentBreakdown: { POS: number; NEU: number; NEG: number };
  volumeOverTime: { date: string; count: number }[];
  topThemes: { name: string; count: number }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get("/dashboard");
  return response.data;
};