import api from './api.ts';
import { User, LoginFormData, AdminLoginFormData, ApiResponse } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface OtpResponse {
  phone: string;
  message: string;
}

export const authService = {
  // Send OTP to phone number
  sendOtp: async (phone: string): Promise<OtpResponse> => {
    try {
      const response = await api.post<ApiResponse<OtpResponse>>('/auth/send-otp', { phone });
      console.log('Raw OTP response:', response.data);
      
      // Handle different response formats
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
      
      return response.data.data || { phone, message: response.data.message || 'OTP sent' };
    } catch (error: any) {
      console.error('sendOtp service error:', error);
      
      // If it's an axios error, extract the response data
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to send OTP');
      }
      
      // Re-throw the original error
      throw error;
    }
  },

  // Verify OTP and login
  verifyOtp: async (data: LoginFormData): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/verify-otp', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Invalid OTP');
    }
    return {
      token: response.data.token || '',
      user: response.data.user || {} as User
    };
  },

  // Admin login with email and password
  adminLogin: async (data: AdminLoginFormData): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/admin-login', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Invalid credentials');
    }
    return {
      token: response.data.data?.token || '',
      user: response.data.data?.user || {} as User
    };
  },

  // Google Sign-in
  googleLogin: async (token: string, phone?: string): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/google', { 
      token, 
      phone 
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Google sign-in failed');
    }
    return {
      token: response.data.data?.token || '',
      user: response.data.data?.user || {} as User
    };
  },

  // Logout (client-side only for now)
  logout: async (): Promise<void> => {
    // In the future, this could call a server endpoint to blacklist the token
    return Promise.resolve();
  },
};