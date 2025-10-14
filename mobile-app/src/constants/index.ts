import { Dimensions } from 'react-native';

// Screen dimensions
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

// Colors
export const COLORS = {
  // Primary colors
  primary: '#2563EB', // Blue
  primaryDark: '#1E40AF',
  primaryLight: '#3B82F6',
  
  // Secondary colors  
  secondary: '#FDE047', // Yellow
  secondaryDark: '#EAB308',
  secondaryLight: '#FEF08A',
  
  // Accent colors
  accent: '#10B981', // Green
  accentDark: '#047857',
  accentLight: '#34D399',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  surface: '#FFFFFF',
  
  // Text colors
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
} as const;

// Typography
export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Border radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api' 
    : 'https://your-production-api.com/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    VERIFY_OTP: '/auth/verify-otp',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
  },
  
  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    ADDRESSES: '/users/addresses',
    CREATE_ADDRESS: '/users/addresses',
    UPDATE_ADDRESS: (id: string) => `/users/addresses/${id}`,
    DELETE_ADDRESS: (id: string) => `/users/addresses/${id}`,
  },
  
  // Products
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CATEGORIES: '/products/categories',
  },
  
  // Orders
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    TRACK: (id: string) => `/orders/${id}/track`,
  },
  
  // Subscriptions
  SUBSCRIPTIONS: {
    LIST: '/subscriptions',
    CREATE: '/subscriptions',
    DETAIL: (id: string) => `/subscriptions/${id}`,
    UPDATE: (id: string) => `/subscriptions/${id}`,
    PAUSE: (id: string) => `/subscriptions/${id}/pause`,
    RESUME: (id: string) => `/subscriptions/${id}/resume`,
    CANCEL: (id: string) => `/subscriptions/${id}/cancel`,
    DELIVERIES: (id: string) => `/subscriptions/${id}/deliveries`,
  },
  
  // Deliveries (for agents)
  DELIVERIES: {
    AGENT_LIST: '/deliveries/agent',
    UPDATE_STATUS: (id: string) => `/deliveries/${id}/status`,
    UPLOAD_PHOTO: (id: string) => `/deliveries/${id}/photo`,
  },
  
  // Routes (for agents)
  ROUTES: {
    AGENT_LIST: '/routes/agent',
    DETAIL: (id: string) => `/routes/${id}`,
    START: (id: string) => `/routes/${id}/start`,
    COMPLETE: (id: string) => `/routes/${id}/complete`,
    UPDATE_STOP: (routeId: string, stopId: string) => `/routes/${routeId}/stops/${stopId}`,
  },
  
  // Billing
  BILLING: {
    SUMMARY: '/billing/summary',
    INVOICES: '/billing/invoices',
    PAYMENTS: '/billing/payments',
    TOP_UP: '/billing/top-up',
  },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART_DATA: 'cart_data',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  NOTIFICATION_TOKEN: 'notification_token',
  LOCATION_PERMISSION: 'location_permission',
} as const;

// Default values
export const DEFAULTS = {
  CART_ITEM_QUANTITY: 1,
  PAGINATION_LIMIT: 20,
  IMAGE_QUALITY: 0.8,
  LOCATION_ACCURACY: 100, // meters
  NOTIFICATION_TIMEOUT: 5000, // milliseconds
} as const;

// Validation
export const VALIDATION = {
  PHONE_NUMBER: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 10,
    PATTERN: /^[6-9]\d{9}$/,
  },
  OTP: {
    LENGTH: 6,
    PATTERN: /^\d{6}$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  ADDRESS: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 200,
  },
  POSTAL_CODE: {
    LENGTH: 6,
    PATTERN: /^\d{6}$/,
  },
} as const;

// Time constants
export const TIME = {
  OTP_EXPIRY: 5 * 60 * 1000, // 5 minutes in milliseconds
  TOKEN_REFRESH_THRESHOLD: 60 * 1000, // 1 minute in milliseconds
  POLLING_INTERVAL: 30 * 1000, // 30 seconds for route updates
  DEBOUNCE_DELAY: 300, // milliseconds
} as const;

// Order status colors
export const ORDER_STATUS_COLORS = {
  pending: COLORS.warning,
  confirmed: COLORS.info,
  out_for_delivery: COLORS.accent,
  delivered: COLORS.success,
  cancelled: COLORS.error,
} as const;

// Delivery status colors
export const DELIVERY_STATUS_COLORS = {
  scheduled: COLORS.info,
  out_for_delivery: COLORS.accent,
  delivered: COLORS.success,
  missed: COLORS.error,
} as const;

// Route status colors
export const ROUTE_STATUS_COLORS = {
  scheduled: COLORS.info,
  in_progress: COLORS.accent,
  completed: COLORS.success,
} as const;

// Days of the week
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const DAYS_OF_WEEK_SHORT = [
  'Sun',
  'Mon',
  'Tue', 
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const;

// Product categories
export const PRODUCT_CATEGORIES = [
  'Milk',
  'Yogurt',
  'Cheese',
  'Butter',
  'Cream',
  'Ice Cream',
  'Other',
] as const;

// Notification types
export const NOTIFICATION_TYPES = {
  ORDER_PLACED: 'order_placed',
  ORDER_CONFIRMED: 'order_confirmed',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  DELIVERY_MISSED: 'delivery_missed',
  SUBSCRIPTION_PAUSED: 'subscription_paused',
  SUBSCRIPTION_RESUMED: 'subscription_resumed',
  PAYMENT_DUE: 'payment_due',
  PAYMENT_RECEIVED: 'payment_received',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVALID_CREDENTIALS: 'Invalid phone number or OTP.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  LOCATION_PERMISSION: 'Location permission is required for delivery tracking.',
  CAMERA_PERMISSION: 'Camera permission is required to take photos.',
  INVALID_PHONE: 'Please enter a valid 10-digit phone number.',
  INVALID_OTP: 'Please enter a valid 6-digit OTP.',
  REQUIRED_FIELD: 'This field is required.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  ORDER_PLACED: 'Order placed successfully!',
  SUBSCRIPTION_CREATED: 'Subscription created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  ADDRESS_SAVED: 'Address saved successfully!',
  DELIVERY_COMPLETED: 'Delivery marked as completed!',
} as const;