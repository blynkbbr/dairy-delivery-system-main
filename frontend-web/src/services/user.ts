import api from './api.ts';
import { User, ApiResponse } from '../types';

interface UpdateProfileData {
  full_name: string;
  email: string;
  address: string;
  date_of_birth: string;
  payment_mode: 'prepaid' | 'cash_on_delivery';
}

export const userService = {
  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.put<ApiResponse<{ user: User }>>('/user/profile', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update profile');
    }
    return response.data.data?.user || response.data.user || {} as User;
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/user/profile');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get profile');
    }
    return response.data.data?.user || response.data.user || {} as User;
  },

  // Update delivery address
  updateAddress: async (address: string): Promise<User> => {
    const response = await api.put<ApiResponse<{ user: User }>>('/user/address', { address });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update address');
    }
    return response.data.data?.user || response.data.user || {} as User;
  },

  // Update payment mode
  updatePaymentMode: async (payment_mode: 'prepaid' | 'cash_on_delivery'): Promise<User> => {
    const response = await api.put<ApiResponse<{ user: User }>>('/user/payment-mode', { payment_mode });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update payment mode');
    }
    return response.data.data?.user || response.data.user || {} as User;
  },

  // Get user orders
  getOrders: async () => {
    const response = await api.get<ApiResponse<any>>('/user/orders');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get orders');
    }
    return response.data.data || [];
  },

  // Get user subscriptions
  getSubscriptions: async () => {
    const response = await api.get<ApiResponse<any>>('/user/subscriptions');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get subscriptions');
    }
    return response.data.data || [];
  },
};