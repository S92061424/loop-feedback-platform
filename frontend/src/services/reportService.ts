import api from "./api";

export interface Report {
  _id: string;
  title: string;
  contentJson: { narrative: string; stats: any };
  createdAt: string;
}

export const generateReport = async (periodDays: number = 30): Promise<Report> => {
  const response = await api.post("/reports/generate", { periodDays });
  return response.data;
};

export const listReports = async (): Promise<Report[]> => {
  const response = await api.get("/reports");
  return response.data;
};