import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Ensure base URL ends with /api so endpoint paths can be written without /api prefix
if (!API_URL.endsWith('/api')) {
  API_URL = API_URL.replace(/\/+$/,'') + '/api';
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
