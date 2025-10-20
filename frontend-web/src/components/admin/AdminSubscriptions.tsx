import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Search,
  Filter,
  Eye,
  Pause,
  Play,
  XCircle,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Package
} from 'lucide-react';
import api from '../../services/api.ts';
import actionTracker from '../../utils/actionTracker';

interface Subscription {
  id: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
  };
  quantity: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  delivery_days?: string[];
  delivery_date?: number;
  status: 'active' | 'paused' | 'cancelled';
  start_date: string;
  next_delivery?: string;
  created_at: string;
}

const AdminSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState('all');

  useEffect(() => {
    actionTracker.trackPageView('admin_subscriptions');
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      // This would need to be implemented as an admin endpoint
      const response = await api.get('/admin/subscriptions');
      setSubscriptions(response.data.data || []);
    } catch (error) {
      console.error('Load subscriptions error:', error);
      // For now, use mock data
      setSubscriptions([
        {
          id: '1',
          user: {
            id: '1',
            full_name: 'John Doe',
            email: 'john@example.com',
            phone: '9876543210'
          },
          product: {
            id: '1',
            name: 'Fresh Milk',
            price: 60,
            unit: 'liter'
          },
          quantity: 2,
          frequency: 'daily',
          status: 'active',
          start_date: '2024-01-01',
          next_delivery: '2024-01-16',
          created_at: '2024-01-01'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'active' | 'paused' | 'cancelled') => {
    try {
      await api.put(`/admin/subscriptions/${id}`, { status });
      actionTracker.trackAction('subscription_status_update', {
        component: 'AdminSubscriptions',
        subscriptionId: id,
        newStatus: status,
        page: 'admin_subscriptions'
      });
      setSubscriptions(prev =>
        prev.map(sub => sub.id === id ? { ...sub, status } : sub)
      );
    } catch (error) {
      console.error('Update subscription status error:', error);
      actionTracker.trackAction('subscription_status_update_failed', {
        component: 'AdminSubscriptions',
        subscriptionId: id,
        attemptedStatus: status,
        error: (error as Error).message
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatFrequency = (frequency: string, deliveryDays?: string[], deliveryDate?: number) => {
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return deliveryDays?.length 
          ? `Weekly (${deliveryDays.join(', ')})`
          : 'Weekly';
      case 'monthly':
        return deliveryDate ? `Monthly (${deliveryDate}th)` : 'Monthly';
      default:
        return frequency;
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = 
      subscription.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    const matchesFrequency = frequencyFilter === 'all' || subscription.frequency === frequencyFilter;
    
    return matchesSearch && matchesStatus && matchesFrequency;
  });

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    paused: subscriptions.filter(s => s.status === 'paused').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paused</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.paused}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
          <p className="text-gray-600">Manage customer subscriptions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by customer or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Frequencies</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.user.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {subscription.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {subscription.quantity} × ₹{subscription.product.price}/{subscription.product.unit}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatFrequency(subscription.frequency, subscription.delivery_days, subscription.delivery_date)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                      {getStatusIcon(subscription.status)}
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subscription.next_delivery 
                      ? new Date(subscription.next_delivery).toLocaleDateString()
                      : 'TBD'
                    }
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {subscription.status === 'active' && (
                        <button
                          onClick={() => handleUpdateStatus(subscription.id, 'paused')}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Pause subscription"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      )}
                      
                      {subscription.status === 'paused' && (
                        <button
                          onClick={() => handleUpdateStatus(subscription.id, 'active')}
                          className="text-green-600 hover:text-green-900"
                          title="Resume subscription"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      
                      {subscription.status !== 'cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(subscription.id, 'cancelled')}
                          className="text-red-600 hover:text-red-900"
                          title="Cancel subscription"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => actionTracker.trackClick('view_subscription_button', 'admin_subscriptions', { component: 'AdminSubscriptions', subscriptionId: subscription.id })}
                        className="text-blue-600 hover:text-blue-900"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSubscriptions.length === 0 && (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminSubscriptions;