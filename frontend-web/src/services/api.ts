import axios, { AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/index.ts';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const { response } = error;
    
    if (response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout();
      toast.error('Session expired. Please login again.');
      window.location.href = '/login';
    } else if (response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (response?.status === 404) {
      toast.error('The requested resource was not found.');
    } else if (response?.status >= 500) {
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