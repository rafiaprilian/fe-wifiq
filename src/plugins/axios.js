import axios from "axios";
import Cookies from "js-cookie";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "ngrok-skip-browser-warning": "true", 
  },
});

// Inject token SETIAP request (AMAN production)
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper storage URL
axiosInstance.getStorageUrl = (path) => {
  return `${import.meta.env.VITE_STORAGE_URL}/${path}`;
};
