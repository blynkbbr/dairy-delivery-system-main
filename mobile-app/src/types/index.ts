export interface User {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  role: 'user' | 'agent' | 'admin';
  status: 'active' | 'inactive';
  created_at: string;
  last_login_at?: string;
}

export interface Address {
  id: string;
  user_id: string;
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  image_url?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  user_id: string;
  address_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled';
  order_date: string;
  delivery_date?: string;
  delivered_at?: string;
  items: OrderItem[];
  address: Address;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  product_id: string;
  address_id: string;
  default_quantity: number;
  delivery_days: number[];
  start_date: string;
  end_date?: string;
  status: 'active' | 'paused' | 'cancelled';
  product: Product;
  address: Address;
}

export interface SubscriptionDelivery {
  id: string;
  subscription_id: string;
  user_id: string;
  address_id: string;
  product_id: string;
  delivery_date: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'scheduled' | 'out_for_delivery' | 'delivered' | 'missed';
  delivered_at?: string;
  product: Product;
  address: Address;
}

export interface Route {
  id: string;
  agent_id: string;
  route_date: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  total_distance: number;
  estimated_duration: number;
  started_at?: string;
  completed_at?: string;
  stops: RouteStop[];
}

export interface RouteStop {
  id: string;
  route_id: string;
  delivery_id: string;
  stop_order: number;
  address: Address;
  estimated_arrival: string;
  actual_arrival?: string;
  status: 'pending' | 'completed' | 'failed';
  delivery_photo?: string;
  notes?: string;
  delivery: SubscriptionDelivery;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  billing_period_start: string;
  billing_period_end: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  due_date: string;
  paid_at?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Login: undefined;
  OTPVerification: { phoneNumber: string };
  Main: undefined;
  CustomerTabs: undefined;
  AgentTabs: undefined;
};

export type CustomerTabParamList = {
  Home: undefined;
  Products: undefined;
  Cart: undefined;
  Orders: undefined;
  Subscriptions: undefined;
  Profile: undefined;
};

export type AgentTabParamList = {
  Dashboard: undefined;
  Routes: undefined;
  Deliveries: undefined;
  Profile: undefined;
};

export type ProductStackParamList = {
  ProductList: undefined;
  ProductDetail: { productId: string };
};

export type OrderStackParamList = {
  OrderList: undefined;
  OrderDetail: { orderId: string };
  OrderTracking: { orderId: string };
};

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form types
export interface LoginForm {
  phone_number: string;
}

export interface OTPVerificationForm {
  otp: string;
}

export interface ProfileForm {
  name: string;
  email?: string;
}

export interface AddressForm {
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

export interface SubscriptionForm {
  product_id: string;
  address_id: string;
  default_quantity: number;
  delivery_days: number[];
  start_date: string;
  end_date?: string;
}

// Store types
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
  isOnline: boolean;
  notification?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  };
}

// Utility types
export type DeliveryDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0, Monday = 1, etc.

export interface Location {
  latitude: number;
  longitude: number;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}