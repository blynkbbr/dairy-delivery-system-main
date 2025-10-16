import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Plus, Minus, Shield, Clock } from 'lucide-react';

import { useCartStore } from '../store/index.ts';
import { productService } from '../services/product.ts';
import { Product } from '../types';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addItem, items, getItem } = useCartStore();

  const categories = [
    { id: 'all', name: 'All Products', emoji: '🥛' },
    { id: 'milk', name: 'Milk', emoji: '🥛' },
    { id: 'yogurt', name: 'Curd', emoji: '🍶' },
    { id: 'cheese', name: 'Cheese', emoji: '🧀' },
    { id: 'butter', name: 'Butter', emoji: '🧈' },
    { id: 'ghee', name: 'Ghee', emoji: '🫘' },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const getCartItemQuantity = (productId: string) => {
    const item = getItem(productId);
    return item?.quantity || 0;
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const cartQuantity = getCartItemQuantity(product.id);
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
      >
        {/* Product Image */}
        <div className="h-48 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
          <div className="text-6xl opacity-50">🥛</div>
        </div>

        <div className="p-4">
          {/* Product Info */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
            
            {/* Price and Unit */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold text-primary-600">₹{product.price}</span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                per {product.unit}
              </span>
            </div>

            {/* Features */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Fresh</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Daily</span>
              </div>
            </div>
          </div>

          {/* Add to Cart / Quantity Controls */}
          {cartQuantity === 0 ? (
            <button
              onClick={() => handleAddToCart(product)}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center justify-between bg-primary-50 rounded-lg p-2">
              <button
                onClick={() => addItem(product, -1)}
                className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary-600 hover:bg-primary-100 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              
              <span className="font-semibold text-primary-800">
                {cartQuantity} in cart
              </span>
              
              <button
                onClick={() => addItem(product, 1)}
                className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fresh products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Fresh Dairy Products</h1>
            <p className="text-gray-600 mt-1">Farm-fresh dairy delivered to your doorstep</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🥛</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              We're restocking our fresh dairy products. Please check back soon!
            </p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}

        {/* Cart Summary */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-primary-600 text-white px-6 py-4 rounded-full shadow-lg"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">
                {items.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
              <span className="text-primary-200">•</span>
              <span className="font-semibold">
                ₹{items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
