import api from "./api";

export interface Theme {
  _id: string;
  name: string;
  count: number;
}

export const getThemes = async (): Promise<Theme[]> => {
  const response = await api.get("/themes");
  return response.data;
};