import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft, 
  MapPin, 
  CreditCard,
  Truck,
  CheckCircle,
  Clock
} from 'lucide-react';

import { useCartStore, useAuthStore } from '../store/index.ts';
import { orderService } from '../services/order.ts';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, total, addItem, removeItem, updateQuantity, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  
  const deliveryFee = total >= 500 ? 0 : 50;
  const finalTotal = total + deliveryFee;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user?.address || !user?.full_name) {
      toast.error('Please complete your profile first');
      navigate('/profile-setup');
      return;
    }

    try {
      setIsLoading(true);
      const orderData = {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price
        })),
        delivery_fee: deliveryFee,
        total: finalTotal,
        payment_mode: user.payment_mode
      };
      
      const order = await orderService.createOrder(orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${order.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            to="/products" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
          
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some fresh dairy products to get started!</p>
            <Link 
              to="/products" 
              className="btn-primary"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/products" 
              className="inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Cart Items ({items.length})
                </h2>
                
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🥛</span>
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{item.product.description}</p>
                        <p className="text-sm text-primary-600 font-medium">
                          ₹{item.product.price} per {item.product.unit}
                        </p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center text-primary-600 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Price & Remove */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-red-500 hover:text-red-700 text-sm mt-1 flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm sticky top-8">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                {/* Delivery Info */}
                {user?.address && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">Delivery Address</p>
                        <p className="text-gray-600">{user.address}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Price Breakdown */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">₹{total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className={`${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  
                  {total < 500 && (
                    <p className="text-xs text-amber-600">
                      Add ₹{(500 - total).toFixed(2)} more for free delivery!
                    </p>
                  )}
                  
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span className="text-gray-900">Total</span>
                      <span className="text-primary-600">₹{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Payment Method */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {user?.payment_mode === 'prepaid' ? 'Prepaid Account' : 'Cash on Delivery'}
                    </span>
                  </div>
                </div>
                
                {/* Delivery Info */}
                <div className="mb-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4" />
                    <span>Free delivery on orders above ₹500</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Delivered within 2-4 hours</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Fresh and quality guaranteed</span>
                  </div>
                </div>
                
                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isLoading || items.length === 0}
                  className="w-full btn-primary btn-lg"
                >
                  {isLoading ? (
                    <>
                      <div className="spinner mr-2" />
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
                
                {/* Security Note */}
                <p className="text-xs text-center text-gray-500 mt-3">
                  Your order is secure and your data is protected
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
