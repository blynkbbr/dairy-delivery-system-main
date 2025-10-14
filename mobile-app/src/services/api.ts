import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS, ERROR_MESSAGES } from '../constants';
import type {
  ApiResponse,
  AuthResponse,
  User,
  Product,
  Order,
  Subscription,
  Address,
  SubscriptionDelivery,
  Route,
  Invoice,
  PaginatedResponse,
  LoginForm,
  OTPVerificationForm,
  ProfileForm,
  AddressForm,
  SubscriptionForm,
} from '../types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
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
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, clear storage and redirect to login
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.AUTH_TOKEN,
            STORAGE_KEYS.USER_DATA,
          ]);
          // You can emit an event here to redirect to login
          throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);
        }
        
        if (error.code === 'ECONNABORTED' || !error.response) {
          throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
        }
        
        const message = error.response?.data?.error || 
                       error.response?.data?.message || 
                       ERROR_MESSAGES.SERVER_ERROR;
        
        throw new Error(message);
      }
    );
  }

  // Authentication endpoints
  async login(data: LoginForm): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    return response.data;
  }

  async verifyOTP(data: OTPVerificationForm & { phone_number: string }): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      data
    );
    
    if (response.data.success && response.data.token) {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      if (response.data.user) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(response.data.user)
        );
      }
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    }
  }

  // User endpoints
  async getProfile(): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>(
      API_ENDPOINTS.USERS.PROFILE
    );
    return response.data.data!;
  }

  async updateProfile(data: ProfileForm): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>(
      API_ENDPOINTS.USERS.UPDATE_PROFILE,
      data
    );
    return response.data.data!;
  }

  async getAddresses(): Promise<Address[]> {
    const response = await this.client.get<ApiResponse<Address[]>>(
      API_ENDPOINTS.USERS.ADDRESSES
    );
    return response.data.data!;
  }

  async createAddress(data: AddressForm): Promise<Address> {
    const response = await this.client.post<ApiResponse<Address>>(
      API_ENDPOINTS.USERS.CREATE_ADDRESS,
      data
    );
    return response.data.data!;
  }

  async updateAddress(id: string, data: Partial<AddressForm>): Promise<Address> {
    const response = await this.client.put<ApiResponse<Address>>(
      API_ENDPOINTS.USERS.UPDATE_ADDRESS(id),
      data
    );
    return response.data.data!;
  }

  async deleteAddress(id: string): Promise<void> {
    await this.client.delete(API_ENDPOINTS.USERS.DELETE_ADDRESS(id));
  }

  // Product endpoints
  async getProducts(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Product>> {
    const response = await this.client.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.LIST,
      { params }
    );
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.client.get<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.DETAIL(id)
    );
    return response.data.data!;
  }

  async getProductCategories(): Promise<string[]> {
    const response = await this.client.get<ApiResponse<string[]>>(
      API_ENDPOINTS.PRODUCTS.CATEGORIES
    );
    return response.data.data!;
  }

  // Order endpoints
  async getOrders(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Order>> {
    const response = await this.client.get<PaginatedResponse<Order>>(
      API_ENDPOINTS.ORDERS.LIST,
      { params }
    );
    return response.data;
  }

  async createOrder(data: {
    address_id: string;
    items: Array<{
      product_id: string;
      quantity: number;
    }>;
    delivery_date?: string;
  }): Promise<Order> {
    const response = await this.client.post<ApiResponse<Order>>(
      API_ENDPOINTS.ORDERS.CREATE,
      data
    );
    return response.data.data!;
  }

  async getOrder(id: string): Promise<Order> {
    const response = await this.client.get<ApiResponse<Order>>(
      API_ENDPOINTS.ORDERS.DETAIL(id)
    );
    return response.data.data!;
  }

  async cancelOrder(id: string): Promise<Order> {
    const response = await this.client.post<ApiResponse<Order>>(
      API_ENDPOINTS.ORDERS.CANCEL(id)
    );
    return response.data.data!;
  }

  // Subscription endpoints
  async getSubscriptions(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Subscription>> {
    const response = await this.client.get<PaginatedResponse<Subscription>>(
      API_ENDPOINTS.SUBSCRIPTIONS.LIST,
      { params }
    );
    return response.data;
  }

  async createSubscription(data: SubscriptionForm): Promise<Subscription> {
    const response = await this.client.post<ApiResponse<Subscription>>(
      API_ENDPOINTS.SUBSCRIPTIONS.CREATE,
      data
    );
    return response.data.data!;
  }

  async getSubscription(id: string): Promise<Subscription> {
    const response = await this.client.get<ApiResponse<Subscription>>(
      API_ENDPOINTS.SUBSCRIPTIONS.DETAIL(id)
    );
    return response.data.data!;
  }

  async updateSubscription(id: string, data: Partial<SubscriptionForm>): Promise<Subscription> {
    const response = await this.client.put<ApiResponse<Subscription>>(
      API_ENDPOINTS.SUBSCRIPTIONS.UPDATE(id),
      data
    );
    return response.data.data!;
  }

  async pauseSubscription(id: string): Promise<Subscription> {
    const response = await this.client.post<ApiResponse<Subscription>>(
      API_ENDPOINTS.SUBSCRIPTIONS.PAUSE(id)
    );
    return response.data.data!;
  }

  async resumeSubscription(id: string): Promise<Subscription> {
    const response = await this.client.post<ApiResponse<Subscription>>(
      API_ENDPOINTS.SUBSCRIPTIONS.RESUME(id)
    );
    return response.data.data!;
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    const response = await this.client.post<ApiResponse<Subscription>>(
      API_ENDPOINTS.SUBSCRIPTIONS.CANCEL(id)
    );
    return response.data.data!;
  }

  async getSubscriptionDeliveries(
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<SubscriptionDelivery>> {
    const response = await this.client.get<PaginatedResponse<SubscriptionDelivery>>(
      API_ENDPOINTS.SUBSCRIPTIONS.DELIVERIES(id),
      { params }
    );
    return response.data;
  }

  // Agent-specific endpoints
  async getAgentDeliveries(params?: {
    date?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SubscriptionDelivery>> {
    const response = await this.client.get<PaginatedResponse<SubscriptionDelivery>>(
      API_ENDPOINTS.DELIVERIES.AGENT_LIST,
      { params }
    );
    return response.data;
  }

  async updateDeliveryStatus(
    id: string,
    data: {
      status: 'out_for_delivery' | 'delivered' | 'missed';
      notes?: string;
    }
  ): Promise<SubscriptionDelivery> {
    const response = await this.client.put<ApiResponse<SubscriptionDelivery>>(
      API_ENDPOINTS.DELIVERIES.UPDATE_STATUS(id),
      data
    );
    return response.data.data!;
  }

  async uploadDeliveryPhoto(id: string, photoUri: string): Promise<SubscriptionDelivery> {
    const formData = new FormData();
    formData.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'delivery.jpg',
    } as any);

    const response = await this.client.post<ApiResponse<SubscriptionDelivery>>(
      API_ENDPOINTS.DELIVERIES.UPLOAD_PHOTO(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  }

  async getAgentRoutes(params?: {
    date?: string;
    status?: string;
  }): Promise<Route[]> {
    const response = await this.client.get<ApiResponse<Route[]>>(
      API_ENDPOINTS.ROUTES.AGENT_LIST,
      { params }
    );
    return response.data.data!;
  }

  async getRoute(id: string): Promise<Route> {
    const response = await this.client.get<ApiResponse<Route>>(
      API_ENDPOINTS.ROUTES.DETAIL(id)
    );
    return response.data.data!;
  }

  async startRoute(id: string): Promise<Route> {
    const response = await this.client.post<ApiResponse<Route>>(
      API_ENDPOINTS.ROUTES.START(id)
    );
    return response.data.data!;
  }

  async completeRoute(id: string): Promise<Route> {
    const response = await this.client.post<ApiResponse<Route>>(
      API_ENDPOINTS.ROUTES.COMPLETE(id)
    );
    return response.data.data!;
  }

  async updateRouteStop(
    routeId: string,
    stopId: string,
    data: {
      status: 'completed' | 'failed';
      actual_arrival?: string;
      notes?: string;
    }
  ): Promise<void> {
    await this.client.put(
      API_ENDPOINTS.ROUTES.UPDATE_STOP(routeId, stopId),
      data
    );
  }

  // Billing endpoints
  async getBillingSummary(): Promise<{
    current_balance: number;
    pending_invoices: number;
    last_payment_date?: string;
    last_payment_amount?: number;
  }> {
    const response = await this.client.get<ApiResponse<any>>(
      API_ENDPOINTS.BILLING.SUMMARY
    );
    return response.data.data!;
  }

  async getInvoices(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Invoice>> {
    const response = await this.client.get<PaginatedResponse<Invoice>>(
      API_ENDPOINTS.BILLING.INVOICES,
      { params }
    );
    return response.data;
  }

  async topUpBalance(amount: number): Promise<{
    transaction_id: string;
    new_balance: number;
  }> {
    const response = await this.client.post<ApiResponse<any>>(
      API_ENDPOINTS.BILLING.TOP_UP,
      { amount }
    );
    return response.data.data!;
  }
}

export const apiService = new ApiService();
export default apiService;