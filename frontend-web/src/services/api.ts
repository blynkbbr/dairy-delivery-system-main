import axios, { AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/index';
import logger from '../utils/logger';

// Create axios instance
const api = axios.create({
  baseURL: (globalThis as any).process?.env?.REACT_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const startTime = Date.now();
    (config as any).metadata = { startTime };

    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    logger.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data,
    });

    return config;
  },
  (error) => {
    logger.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const startTime = (response.config as any).metadata?.startTime;
    const duration = startTime ? Date.now() - startTime : 0;

    logger.info(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      method: response.config.method,
      url: response.config.url,
      duration: `${duration}ms`,
      data: response.data,
    });

    return response;
  },
  (error: AxiosError) => {
    const { response } = error;
    const startTime = (error.config as any)?.metadata?.startTime;
    const duration = startTime ? Date.now() - startTime : 0;

    logger.error(`API Error Response: ${response?.status || 'Network Error'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: response?.status,
      method: error.config?.method,
      url: error.config?.url,
      duration: `${duration}ms`,
      error: error.message,
      data: response?.data,
    });

    if (response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout();
      toast.error('Session expired. Please login again.');
      window.location.href = '/login';
    } else if (response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (response?.status === 404) {
      toast.error('The requested resource was not found.');
    } else if (response && response.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    } else if (!response) {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default api;