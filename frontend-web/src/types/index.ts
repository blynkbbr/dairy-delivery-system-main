export interface User {
  id: string;
  phone: string;
  email?: string;
  full_name?: string;
  address?: string;
  date_of_birth?: string;
  role: 'user' | 'agent' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  prepaid_balance: number;
  payment_mode: 'prepaid' | 'cash_on_delivery';
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
  price: number;
  unit: string;
  category: string;
  image_url?: string;
  is_available: boolean;
  is_subscription_available: boolean;
  stock_quantity: number;
  discount_percentage: number;
  min_order_quantity: number;
  max_order_quantity: number;
  nutritional_info?: string;
  storage_instructions?: string;
  shelf_life_days?: number;
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
  order_number: string;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
  payment_mode: 'prepaid' | 'cash_on_delivery';
  delivery_address: string;
  tracking_number?: string;
  notes?: string;
  confirmed_at?: string;
  delivered_at?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface Subscription {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product; // Include product details
  quantity: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  delivery_days?: string[]; // Array of day names for weekly (e.g., ['monday', 'wednesday'])
  delivery_date?: number; // Day of month for monthly subscriptions (1-31)
  delivery_time_slot?: string;
  start_date: string;
  end_date?: string;
  next_delivery?: string;
  status: 'active' | 'paused' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
  addresses?: T;
  address?: T;
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