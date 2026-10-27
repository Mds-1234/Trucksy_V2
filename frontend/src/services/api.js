import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const cleanBaseURL = rawBaseURL.trim().replace(/\/+$/, "");
const baseURL = cleanBaseURL.endsWith("/api") ? cleanBaseURL : `${cleanBaseURL}/api`;

const api = axios.create({
  baseURL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hasToken = !!localStorage.getItem("token");
    const isAuthRequest = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/signup");
    if (error.response?.status === 401 && hasToken && !isAuthRequest) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
