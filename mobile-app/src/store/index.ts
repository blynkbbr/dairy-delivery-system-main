import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { 
  AuthState, 
  CartState, 
  AppState, 
  User, 
  CartItem, 
  Product 
} from '../types';
import { apiService } from '../services/api';
import { STORAGE_KEYS } from '../constants';

// Authentication Store
interface AuthActions {
  login: (phoneNumber: string) => Promise<void>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (phoneNumber: string) => {
        set({ isLoading: true });
        try {
          const response = await apiService.login({ phone_number: phoneNumber });
          if (response.success) {
            // OTP sent successfully, don't set authenticated yet
            set({ isLoading: false });
          } else {
            throw new Error(response.message || 'Failed to send OTP');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      verifyOTP: async (phoneNumber: string, otp: string) => {
        set({ isLoading: true });
        try {
          const response = await apiService.verifyOTP({ 
            phone_number: phoneNumber, 
            otp 
          });
          
          if (response.success && response.token && response.user) {
            set({ 
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false 
            });
          } else {
            throw new Error(response.message || 'Invalid OTP');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await apiService.logout();
        } catch (error) {
          // Continue with logout even if API call fails
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },

      loadUser: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        try {
          const user = await apiService.getProfile();
          set({ user, isLoading: false });
        } catch (error) {
          // If loading user fails, clear auth
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Cart Store
interface CartActions {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
}

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      // State
      items: [],
      total: 0,
      itemCount: 0,

      // Actions
      addItem: (product: Product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find(item => item.product_id === product.id);

        let newItems: CartItem[];
        
        if (existingItem) {
          // Update existing item
          newItems = items.map(item =>
            item.product_id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  total_price: (item.quantity + quantity) * item.unit_price
                }
              : item
          );
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `cart_${Date.now()}`,
            product_id: product.id,
            product,
            quantity,
            unit_price: product.price,
            total_price: product.price * quantity
          };
          newItems = [...items, newItem];
        }

        const total = newItems.reduce((sum, item) => sum + item.total_price, 0);
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

        set({ items: newItems, total, itemCount });
      },

      removeItem: (productId: string) => {
        const { items } = get();
        const newItems = items.filter(item => item.product_id !== productId);
        
        const total = newItems.reduce((sum, item) => sum + item.total_price, 0);
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

        set({ items: newItems, total, itemCount });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const { items } = get();
        const newItems = items.map(item =>
          item.product_id === productId
            ? {
                ...item,
                quantity,
                total_price: quantity * item.unit_price
              }
            : item
        );

        const total = newItems.reduce((sum, item) => sum + item.total_price, 0);
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

        set({ items: newItems, total, itemCount });
      },

      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0 });
      },

      getItemQuantity: (productId: string) => {
        const { items } = get();
        const item = items.find(item => item.product_id === productId);
        return item?.quantity || 0;
      },
    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// App Store
interface AppActions {
  setLoading: (loading: boolean) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  showNotification: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  hideNotification: () => void;
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  // State
  isLoading: false,
  isOnline: true,
  notification: undefined,

  // Actions
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setOnlineStatus: (isOnline: boolean) => {
    set({ isOnline });
  },

  showNotification: (type, message) => {
    set({ notification: { type, message } });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      set({ notification: undefined });
    }, 5000);
  },

  hideNotification: () => {
    set({ notification: undefined });
  },
}));

// Utility hooks for common patterns
export const useUser = () => {
  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);
  return { user, updateUser };
};

export const useAuth = () => {
  const { isAuthenticated, login, verifyOTP, logout, loadUser, isLoading } = useAuthStore();
  return { isAuthenticated, login, verifyOTP, logout, loadUser, isLoading };
};

export const useCart = () => {
  const { items, total, itemCount, addItem, removeItem, updateQuantity, clearCart, getItemQuantity } = useCartStore();
  return { items, total, itemCount, addItem, removeItem, updateQuantity, clearCart, getItemQuantity };
};

export const useNotification = () => {
  const { notification, showNotification, hideNotification } = useAppStore();
  return { notification, showNotification, hideNotification };
};