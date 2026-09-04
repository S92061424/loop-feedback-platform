import api from "./api";

export interface AskResponse {
  answer: string;
  sources: { id: string; content: string; channel: string; sentiment?: string }[];
}

export const askQuestion = async (question: string): Promise<AskResponse> => {
  const response = await api.post("/ask", { question });
  return response.data;
};