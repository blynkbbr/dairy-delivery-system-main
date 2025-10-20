import api from './api.ts';
import { Subscription } from '../types';

export interface CreateSubscriptionData {
  product_id: number;
  quantity: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  delivery_days?: string[]; // For weekly subscriptions
  delivery_date?: number; // For monthly subscriptions (day of month)
  start_date: string;
  delivery_time_slot?: string;
}

export interface UpdateSubscriptionData {
  quantity?: number;
  frequency?: 'daily' | 'weekly' | 'monthly';
  delivery_days?: string[];
  delivery_date?: number;
  delivery_time_slot?: string;
  status?: 'active' | 'paused' | 'cancelled';
  notes?: string;
}

export const subscriptionService = {
  // Get all user subscriptions
  getSubscriptions: async (): Promise<Subscription[]> => {
    const response = await api.get('/subscriptions');
    return response.data.data || [];
  },

  // Get single subscription by ID
  getSubscription: async (id: number): Promise<Subscription> => {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data.data;
  },

  // Create new subscription
  createSubscription: async (data: CreateSubscriptionData): Promise<Subscription> => {
    const response = await api.post('/subscriptions', data);
    return response.data.data;
  },

  // Update subscription
  updateSubscription: async (id: number, data: UpdateSubscriptionData): Promise<Subscription> => {
    const response = await api.put(`/subscriptions/${id}`, data);
    return response.data.data;
  },

  // Pause subscription
  pauseSubscription: async (id: number): Promise<void> => {
    await api.put(`/subscriptions/${id}`, { status: 'paused' });
  },

  // Resume subscription
  resumeSubscription: async (id: number): Promise<void> => {
    await api.put(`/subscriptions/${id}`, { status: 'active' });
  },

  // Cancel subscription
  cancelSubscription: async (id: number): Promise<void> => {
    await api.put(`/subscriptions/${id}`, { status: 'cancelled' });
  },

  // Delete subscription
  deleteSubscription: async (id: number): Promise<void> => {
    await api.delete(`/subscriptions/${id}`);
  }
};