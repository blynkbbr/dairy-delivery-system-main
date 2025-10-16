import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Calendar, 
  Package, 
  Pause, 
  Play, 
  Trash2, 
  Clock, 
  Edit,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

import { subscriptionService } from '../services/subscription.ts';
import { productService } from '../services/product.ts';
import { Subscription, Product } from '../types';
import CreateSubscriptionModal from '../components/CreateSubscriptionModal.tsx';
import EditSubscriptionModal from '../components/EditSubscriptionModal.tsx';

const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    loadSubscriptions();
    loadProducts();
  }, [statusFilter]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getSubscriptions();
      
      // Filter by status if needed
      const filtered = statusFilter === 'all' 
        ? data 
        : data.filter(sub => sub.status === statusFilter);
      
      setSubscriptions(filtered);
    } catch (error: any) {
      console.error('Load subscriptions error:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      // Only show products available for subscription
      setProducts(data.filter(p => p.is_subscription_available));
    } catch (error: any) {
      console.error('Load products error:', error);
    }
  };

  const handlePauseSubscription = async (id: string) => {
    try {
      await subscriptionService.pauseSubscription(parseInt(id));
      toast.success('Subscription paused');
      loadSubscriptions();
    } catch (error: any) {
      toast.error('Failed to pause subscription');
    }
  };

  const handleResumeSubscription = async (id: string) => {
    try {
      await subscriptionService.resumeSubscription(parseInt(id));
      toast.success('Subscription resumed');
      loadSubscriptions();
    } catch (error: any) {
      toast.error('Failed to resume subscription');
    }
  };

  const handleCancelSubscription = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    try {
      await subscriptionService.cancelSubscription(parseInt(id));
      toast.success('Subscription cancelled');
      loadSubscriptions();
    } catch (error: any) {
      toast.error('Failed to cancel subscription');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
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
          ? `Weekly on ${deliveryDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}`
          : 'Weekly';
      case 'monthly':
        return deliveryDate ? `Monthly on ${deliveryDate}${getOrdinalSuffix(deliveryDate)}` : 'Monthly';
      default:
        return frequency;
    }
  };

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd'; 
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const formatNextDelivery = (nextDelivery?: string) => {
    if (!nextDelivery) return 'TBD';
    
    const date = new Date(nextDelivery);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
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
                <h1 className="text-2xl font-bold text-gray-900">My Subscriptions</h1>
                <p className="text-gray-600 mt-1">
                  Manage your recurring dairy deliveries
                </p>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 btn-primary"
              >
                <Plus className="h-4 w-4" />
                New Subscription
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
                { value: 'cancelled', label: 'Cancelled' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-4 py-2 text-sm rounded-full transition-colors ${
                    statusFilter === filter.value
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subscriptions List */}
        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter === 'all' ? 'No subscriptions yet' : `No ${statusFilter} subscriptions`}
            </h3>
            <p className="text-gray-600 mb-6">
              Set up recurring deliveries for your favorite dairy products
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Subscription
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {subscriptions.map((subscription, index) => (
              <motion.div
                key={subscription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-4xl">🥛</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {subscription.product?.name || 'Unknown Product'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(subscription.status)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Quantity:</span>
                          <p className="text-gray-900">{subscription.quantity} {subscription.product?.unit || 'unit'}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Frequency:</span>
                          <p className="text-gray-900">
                            {formatFrequency(subscription.frequency, subscription.delivery_days, subscription.delivery_date)}
                          </p>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Next Delivery:</span>
                          <p className="text-gray-900 flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {formatNextDelivery(subscription.next_delivery)}
                          </p>
                        </div>
                      </div>

                      {subscription.delivery_time_slot && (
                        <div className="mt-3 text-sm">
                          <span className="font-medium text-gray-700">Delivery Time:</span>
                          <p className="text-gray-900 flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            {subscription.delivery_time_slot}
                          </p>
                        </div>
                      )}

                      {subscription.notes && (
                        <div className="mt-3 text-sm">
                          <span className="font-medium text-gray-700">Notes:</span>
                          <p className="text-gray-600 italic">{subscription.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-6">
                      <button
                        onClick={() => setEditingSubscription(subscription)}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit subscription"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      {subscription.status === 'active' ? (
                        <button
                          onClick={() => handlePauseSubscription(subscription.id)}
                          className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Pause subscription"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : subscription.status === 'paused' ? (
                        <button
                          onClick={() => handleResumeSubscription(subscription.id)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Resume subscription"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      ) : null}

                      {subscription.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelSubscription(subscription.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel subscription"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {subscription.status === 'active' && (
                  <div className="bg-green-50 px-6 py-3 border-t border-green-100">
                    <p className="text-sm text-green-800">
                      💡 Your next delivery is scheduled for {formatNextDelivery(subscription.next_delivery)}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Subscription Modal */}
      {showCreateModal && (
        <CreateSubscriptionModal
          products={products}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadSubscriptions();
          }}
        />
      )}

      {/* Edit Subscription Modal */}
      {editingSubscription && (
        <EditSubscriptionModal
          subscription={editingSubscription}
          products={products}
          onClose={() => setEditingSubscription(null)}
          onSuccess={() => {
            setEditingSubscription(null);
            loadSubscriptions();
          }}
        />
      )}
    </div>
  );
};

export default SubscriptionsPage;