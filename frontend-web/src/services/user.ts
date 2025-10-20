import api from './api.ts';
import { User, Address, ApiResponse } from '../types';

interface UpdateProfileData {
  full_name: string;
  email: string;
  address: string;
  date_of_birth: string;
  payment_mode: 'prepaid' | 'cash_on_delivery';
}

export const userService = {
  // Update user profile
  updateProfile: async (data: Partial<UpdateProfileData>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/users/profile', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update profile');
    }
    return response.data.user || {} as User;
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get profile');
    }
    return response.data.user || {} as User;
  },

  // Get user addresses
  getAddresses: async (): Promise<Address[]> => {
    const response = await api.get<ApiResponse<Address[]>>('/users/addresses');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get addresses');
    }
    return response.data.addresses || [];
  },

  // Add new address
  addAddress: async (addressData: any): Promise<Address> => {
    const response = await api.post<ApiResponse<Address>>('/users/addresses', addressData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to add address');
    }
    return response.data.address || {} as Address;
  },

  // Update address
  updateAddress: async (id: string, addressData: any): Promise<Address> => {
    const response = await api.put<ApiResponse<Address>>(`/users/addresses/${id}`, addressData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update address');
    }
    return response.data.address || {} as Address;
  },

  // Delete address
  deleteAddress: async (id: string): Promise<boolean> => {
    const response = await api.delete<ApiResponse<any>>(`/users/addresses/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete address');
    }
    return true;
  },

  // Update payment mode
  updatePaymentMode: async (payment_mode: 'prepaid' | 'cash_on_delivery'): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/users/profile', { payment_mode });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update payment mode');
    }
    return response.data.user || {} as User;
  },

  // Get user orders
  getOrders: async () => {
    const response = await api.get<ApiResponse<any>>('/users/orders');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get orders');
    }
    return response.data.data || [];
  },

  // Get user subscriptions
  getSubscriptions: async () => {
    const response = await api.get<ApiResponse<any>>('/users/subscriptions');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get subscriptions');
    }
    return response.data.data || [];
  },
};