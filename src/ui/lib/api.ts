// API Helper and URL configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const endpoints = {
  redactText: `${API_BASE_URL}/redact`,
  redactFile: `${API_BASE_URL}/redact-pdf/`,
  login: `${API_BASE_URL}/login`,
  register: `${API_BASE_URL}/submit-form`,
  users: `${API_BASE_URL}/users`,
  feedback: `${API_BASE_URL}/feedback`,
  triggerRetrain: `${API_BASE_URL}/retrain`,
  history: `${API_BASE_URL}/history`,
  health: `${API_BASE_URL}/health`,
  metrics: `${API_BASE_URL}/metrics`,
};

export const getAuthHeaders = (customHeaders: Record<string, string> = {}): Record<string, string> => {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { ...customHeaders };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};
