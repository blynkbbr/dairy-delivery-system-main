import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Calendar,
  MapPin,
  CreditCard,
  Plus,
  ArrowRight,
  Truck,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

import { useAuthStore, useCartStore } from '../store/index.ts';
import { orderService } from '../services/order.ts';
import { productService } from '../services/product.ts';
import { subscriptionService } from '../services/subscription.ts';
import { Order, Product, Subscription } from '../types';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { items: cartItems, itemCount: cartCount } = useCartStore();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    activeSubscriptions: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load recent orders
      const orders = await orderService.getOrders();
      setRecentOrders(orders.slice(0, 3)); // Get 3 most recent orders
      
      // Calculate stats
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length,
        totalSpent: orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0)
      });
      
      // Load featured products
      const products = await productService.getProducts();
      setFeaturedProducts(products.slice(0, 4)); // Get 4 featured products
      
      // Load subscriptions
      const userSubscriptions = await subscriptionService.getSubscriptions();
      setSubscriptions(userSubscriptions);
      
      // Update stats with subscription data
      setStats(prevStats => ({
        ...prevStats,
        activeSubscriptions: userSubscriptions.filter(s => s.status === 'active').length
      }));
      
    } catch (error: any) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'out_for_delivery': return 'text-orange-600';
      case 'processing': return 'text-purple-600';
      case 'confirmed': return 'text-blue-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.full_name || 'User'}! 🥛
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your fresh dairy deliveries and subscriptions
                </p>
              </div>
              
              {cartCount > 0 && (
                <Link 
                  to="/cart"
                  className="flex items-center gap-2 bg-primary-100 hover:bg-primary-200 text-primary-700 px-4 py-2 rounded-full transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{cartCount} item{cartCount !== 1 ? 's' : ''} in cart</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Truck className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <Link to="/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View all
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">No orders yet</p>
                  <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
                    Start shopping →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">#{order.order_number}</span>
                          <span className={`text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          ₹{parseFloat(order.total.toString()).toFixed(2)} • {order.items?.length || 0} items
                        </p>
                      </div>
                      <Link 
                        to={`/orders/${order.id}`}
                        className="text-primary-600 hover:text-primary-700 p-1"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Profile Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Status</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className={`h-5 w-5 ${user?.full_name ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-gray-700">Personal Information</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className={`h-5 w-5 ${user?.address ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-gray-700">Delivery Address</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className={`h-5 w-5 ${user?.payment_mode ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-gray-700">Payment Method</span>
                </div>
              </div>
              {(!user?.full_name || !user?.address) && (
                <Link to="/profile-setup" className="mt-4 block w-full btn-primary text-center">
                  Complete Profile
                </Link>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                <Link to="/products" className="flex flex-col items-center gap-2 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                  <ShoppingCart className="h-6 w-6 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">Shop Now</span>
                </Link>
                
                <Link to="/orders" className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <Package className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">My Orders</span>
                </Link>
                
                <Link to="/subscriptions" className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Subscriptions</span>
                </Link>
                
                <Link to="/profile" className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <MapPin className="h-6 w-6 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Profile</span>
                </Link>
                
                <button 
                  onClick={logout}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Clock className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Featured Products</h2>
                <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View all
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to="/products"
                    className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">🥛</div>
                      <h3 className="font-medium text-gray-900 text-sm mb-1">{product.name}</h3>
                      <p className="text-primary-600 font-semibold">₹{product.price}</p>
                      <p className="text-xs text-gray-500">per {product.unit}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
