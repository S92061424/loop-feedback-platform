import api from "./api";

export interface Feedback {
  _id: string;
  content: string;
  channel: string;
  sentiment?: string;
  status: string;
  customerLabel?: string;
  createdAt: string;
}

export interface FeedbackListParams {
  page?: number;
  limit?: number;
  channel?: string;
  sentiment?: string;
  status?: string;
}

export const getFeedbackList = async (params: FeedbackListParams = {}) => {
  const response = await api.get("/feedback", { params });
  return response.data as {
    items: Feedback[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
};

export const createFeedbackItem = async (data: {
  content: string;
  channel: string;
  customerLabel?: string;
}) => {
  const response = await api.post("/feedback", data);
  return response.data;
};