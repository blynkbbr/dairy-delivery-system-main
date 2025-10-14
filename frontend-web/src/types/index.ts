export interface User {
  id: string;
  phone: string;
  email?: string;
  full_name?: string;
  role: 'user' | 'agent' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  prepaid_balance: number;
  payment_mode: 'prepaid' | 'postpaid';
  profile_image?: string;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  line1: string;
  line2?: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  label?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  unit: string;
  price: number;
  is_milk: boolean;
  status: 'active' | 'inactive';
  image_url?: string;
  stock_quantity: number;
  minimum_stock: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name?: string;
  product_unit?: string;
}

export interface Order {
  id: string;
  user_id: string;
  address_id: string;
  order_number: string;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
  tracking_number?: string;
  carrier?: string;
  notes?: string;
  confirmed_at?: string;
  delivered_at?: string;
  created_at: string;
  items?: OrderItem[];
  // Address details for display
  address_line1?: string;
  address_line2?: string;
  address_area?: string;
  address_city?: string;
  address_state?: string;
  address_pincode?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  address_id: string;
  product_id: string;
  default_quantity: number;
  delivery_days: number[]; // Array of weekday numbers (0-6)
  start_date: string;
  end_date?: string;
  billing_cycle: 'weekly' | 'monthly';
  payment_mode: 'prepaid' | 'postpaid';
  status: 'active' | 'paused' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface AppState {
  isLoading: boolean;
  error: string | null;
}

// Form types
export interface LoginFormData {
  phone: string;
  otp?: string;
}

export interface AdminLoginFormData {
  email: string;
  password: string;
}

export interface AddressFormData {
  line1: string;
  line2?: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  label?: string;
  is_default?: boolean;
}

export interface ProfileFormData {
  full_name?: string;
  email?: string;
  payment_mode?: 'prepaid' | 'postpaid';
}

export interface OrderFormData {
  address_id: string;
  notes?: string;
}

// API Error types
export interface ApiError {
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

// Notification types
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}