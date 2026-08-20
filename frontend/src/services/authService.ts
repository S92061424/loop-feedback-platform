import api from "./api";

export interface SignupData {
  name: string;
  email: string;
  password: string;
  workspaceName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const signup = async (data: SignupData) => {
  const response = await api.post("/auth/signup", data);
  return response.data;
};

export const login = async (data: LoginData) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};