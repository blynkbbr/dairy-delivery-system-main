import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  ArrowUp,
  ArrowDown 
} from 'lucide-react';

import { orderService } from '../../services/order.ts';
import { productService } from '../../services/product.ts';

interface AnalyticsData {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  activeSubscriptions: number;
  recentOrders: any[];
  ordersByStatus: Record<string, number>;
  monthlyRevenue: number[];
}

const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    recentOrders: [],
    ordersByStatus: {},
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Load orders data
      const orders = await orderService.getOrders();
      
      // Load products data
      const products = await productService.getProducts();

      // Calculate analytics
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
      
      const ordersByStatus = orders.reduce((acc: Record<string, number>, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      // Mock some additional data (in real app, these would come from admin APIs)
      setData({
        totalUsers: 156, // Mock data
        totalOrders: orders.length,
        totalProducts: products.length,
        totalRevenue,
        activeSubscriptions: 23, // Mock data
        recentOrders: orders.slice(0, 5),
        ordersByStatus,
        monthlyRevenue: [15000, 18000, 22000, 25000, 28000, 32000] // Mock monthly data
      });
    } catch (error) {
      console.error('Load analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'out_for_delivery': return 'text-orange-600 bg-orange-100';
      case 'processing': return 'text-purple-600 bg-purple-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: data.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      positive: true
    },
    {
      title: 'Total Orders',
      value: data.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'bg-green-500',
      change: '+8%',
      positive: true
    },
    {
      title: 'Products',
      value: data.totalProducts.toLocaleString(),
      icon: Package,
      color: 'bg-yellow-500',
      change: '+3%',
      positive: true
    },
    {
      title: 'Revenue',
      value: `₹${data.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+15%',
      positive: true
    },
    {
      title: 'Active Subscriptions',
      value: data.activeSubscriptions.toLocaleString(),
      icon: Calendar,
      color: 'bg-indigo-500',
      change: '+20%',
      positive: true
    },
    {
      title: 'Growth Rate',
      value: '24.5%',
      icon: TrendingUp,
      color: 'bg-pink-500',
      change: '+2.1%',
      positive: true
    }
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.positive ? (
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.positive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          
          <div className="p-6">
            {data.recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent orders</p>
            ) : (
              <div className="space-y-4">
                {data.recentOrders.map((order, index) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-medium text-gray-900">#{order.order_number}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        ₹{parseFloat(order.total.toString()).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Order Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Order Status Distribution</h3>
          </div>
          
          <div className="p-6">
            {Object.keys(data.ordersByStatus).length === 0 ? (
              <p className="text-gray-500 text-center py-8">No order data</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(data.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (count / data.totalOrders) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Manage Users</p>
              <p className="text-sm text-blue-700">{data.totalUsers} total users</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
            <ShoppingCart className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Process Orders</p>
              <p className="text-sm text-green-700">{data.ordersByStatus.pending || 0} pending</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-left">
            <Package className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">Manage Products</p>
              <p className="text-sm text-yellow-700">{data.totalProducts} products</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="font-medium text-purple-900">View Reports</p>
              <p className="text-sm text-purple-700">Analytics & insights</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;