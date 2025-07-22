// src/api/axios.ts
import axios from "axios";

// Get the backend URL from environment variables.
// Vite uses `import.meta.env.VITE_` prefix.
// We provide a fallback for local development if the variable isn't set.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the auth token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export const isAxiosError = axios.isAxiosError;

export default api;
