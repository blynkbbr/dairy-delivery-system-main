import api from './api.ts';
import { Product, ApiResponse } from '../types';

export const productService = {
  // Get all products
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>('/products');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get products');
    }
    return response.data.data || [];
  },

  // Get product by ID
  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get product');
    }
    return response.data.data || {} as Product;
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>(`/products?category=${category}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get products');
    }
    return response.data.data || [];
  },

  // Search products
  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>(`/products/search?q=${encodeURIComponent(query)}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to search products');
    }
    return response.data.data || [];
  },
};