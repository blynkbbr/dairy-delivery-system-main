import api from './api.ts';
import { Order, ApiResponse } from '../types';

interface CreateOrderData {
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  delivery_fee: number;
  total: number;
  payment_mode: string;
  notes?: string;
}

export const orderService = {
  // Create new order
  createOrder: async (data: CreateOrderData): Promise<Order> => {
    const response = await api.post<ApiResponse<Order>>('/orders', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create order');
    }
    return response.data.data || {} as Order;
  },

  // Get user orders
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get<ApiResponse<Order[]>>('/orders');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get orders');
    }
    return response.data.data || [];
  },

  // Get single order
  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get order');
    }
    return response.data.data || {} as Order;
  },

  // Cancel order
  cancelOrder: async (id: string): Promise<Order> => {
    const response = await api.post<ApiResponse<Order>>(`/orders/${id}/cancel`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to cancel order');
    }
    return response.data.data || {} as Order;
  },

  // Update order status (admin only)
  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update order status');
    }
    return response.data.data || {} as Order;
  },
};