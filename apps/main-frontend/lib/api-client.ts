import axios from "axios";
import { authSchema } from "@/types";

const primaryBackendClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PRIMARY_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const workerBackendClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_WORKER_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const websocketClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getToken = () => {
  if (typeof window !== "undefined") return localStorage.getItem("auth-token");
};

export const register = async (data: typeof authSchema) => {
  const response = await apiClient.primary.post("/api/auth/register", data);
  console.log(response.data);
  return response.data;
};

export const login = async (data: typeof authSchema) => {
  const response = await apiClient.primary.post("/api/auth/login", data);
  console.log(response.data);
  return response.data;
};

export const logout = async () => {
  localStorage.removeItem("auth-token");
};

export const googleSignin = async () => {
  const PRIMARY_BACKEND_URL = process.env.NEXT_PUBLIC_PRIMARY_BACKEND_URL!;
  window.location.href = `${PRIMARY_BACKEND_URL}/api/auth/google/oauth`;
};

export const getPracticeData = async () => {
  const token = getToken();
  const response = await apiClient.primary.get("/api/practice", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getProfile = async () => {
  const token = getToken();
  const response = await apiClient.primary.get("/api/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const apiClient = {
  primary: primaryBackendClient,
  worker: workerBackendClient,
  websocket: websocketClient,
};
