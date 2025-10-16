import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, CartState, AppState, User, CartItem, Product } from '../types';

// Auth Store
interface AuthStore extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
      
      setUser: (user) => {
        set({ user });
      },
      
      setLoading: (isLoading) => {
        set({ isLoading });
      },
    }),
    {
      name: 'dairy-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Cart Store
interface CartStore extends CartState {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItem: (productId: string) => CartItem | undefined;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.product.id === product.id);
          
          if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            let updatedItems;
            
            if (newQuantity <= 0) {
              // Remove item if quantity becomes 0 or negative
              updatedItems = state.items.filter(item => item.product.id !== product.id);
            } else {
              updatedItems = state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: newQuantity }
                  : item
              );
            }
            
            return {
              ...state,
              items: updatedItems,
              total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
              itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            };
          } else if (quantity > 0) {
            const updatedItems = [...state.items, { product, quantity }];
            
            return {
              ...state,
              items: updatedItems,
              total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
              itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            };
          }
          
          // If quantity is 0 or negative and item doesn't exist, do nothing
          return state;
        });
      },
      
      removeItem: (productId) => {
        set((state) => {
          const updatedItems = state.items.filter(item => item.product.id !== productId);
          
          return {
            ...state,
            items: updatedItems,
            total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
            itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          };
        });
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set((state) => {
          const updatedItems = state.items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          );
          
          return {
            ...state,
            items: updatedItems,
            total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
            itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          };
        });
      },
      
      clearCart: () => {
        set({
          items: [],
          total: 0,
          itemCount: 0,
        });
      },
      
      getItem: (productId) => {
        return get().items.find(item => item.product.id === productId);
      },
    }),
    {
      name: 'dairy-cart',
    }
  )
);

// App Store
interface AppStore extends AppState {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  isLoading: false,
  error: null,
  
  setLoading: (isLoading) => {
    set({ isLoading });
  },
  
  setError: (error) => {
    set({ error });
  },
}));