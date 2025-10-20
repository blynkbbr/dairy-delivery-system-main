import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Eye,
  RotateCcw
} from 'lucide-react';

import { orderService } from '../services/order.ts';
import { Order } from '../types';
import actionTracker from '../utils/actionTracker';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const statusOptions = [
    { id: 'all', name: 'All Orders', color: 'gray' },
    { id: 'pending', name: 'Pending', color: 'yellow' },
    { id: 'confirmed', name: 'Confirmed', color: 'blue' },
    { id: 'processing', name: 'Processing', color: 'purple' },
    { id: 'out_for_delivery', name: 'Out for Delivery', color: 'orange' },
    { id: 'delivered', name: 'Delivered', color: 'green' },
    { id: 'cancelled', name: 'Cancelled', color: 'red' },
  ];

  useEffect(() => {
    actionTracker.trackPageView('orders');
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'out_for_delivery': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(s => s.id === status);
    return option?.color || 'gray';
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">Track and manage your dairy deliveries</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status.id}
                onClick={() => {
                  setSelectedStatus(status.id);
                  actionTracker.trackClick('status_filter', 'orders', { filter: status.id });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedStatus === status.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {status.id !== 'all' && getStatusIcon(status.id)}
                {status.name}
                {status.id === 'all' && (
                  <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full ml-1">
                    {orders.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedStatus === 'all' ? 'No orders yet' : `No ${selectedStatus} orders`}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus === 'all' 
                ? 'Start shopping for fresh dairy products!' 
                : `You don't have any ${selectedStatus} orders at the moment.`
              }
            </p>
            <Link to="/products" className="btn-primary" onClick={() => actionTracker.trackNavigation('orders', 'products')}>
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">#{order.order_number}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.created_at)}
                        </div>
                        {order.tracking_number && (
                          <div className="flex items-center gap-1">
                            <Truck className="h-4 w-4" />
                            {order.tracking_number}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                        ${getStatusColor(order.status) === 'green' ? 'bg-green-100 text-green-800' :
                        getStatusColor(order.status) === 'blue' ? 'bg-blue-100 text-blue-800' :
                        getStatusColor(order.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        getStatusColor(order.status) === 'orange' ? 'bg-orange-100 text-orange-800' :
                        getStatusColor(order.status) === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status.replace('_', ' ')}
                      </div>
                      <p className="text-lg font-bold text-gray-900 mt-2">
                        ₹{parseFloat(order.total.toString()).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Delivery Address */}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">Delivery Address</p>
                        <p className="text-gray-600">{order.delivery_address}</p>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="flex items-start gap-2">
                      <CreditCard className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">Payment Method</p>
                        <p className="text-gray-600">
                          {order.payment_mode === 'cash_on_delivery' ? 'Cash on Delivery' : 'Prepaid'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="h-4 w-4" />
                        <span>{order.items?.length || 0} item(s)</span>
                        •
                        <span>Subtotal: ₹{parseFloat(order.subtotal.toString()).toFixed(2)}</span>
                        {parseFloat(order.delivery_fee.toString()) > 0 && (
                          <>
                            •
                            <span>Delivery: ₹{parseFloat(order.delivery_fee.toString()).toFixed(2)}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Link
                          to={`/orders/${order.id}`}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                          onClick={() => actionTracker.trackNavigation('orders', 'order_details', { orderId: order.id })}
                        >
                          <Eye className="h-3 w-3" />
                          View Details
                        </Link>
                        
                        {order.status === 'pending' && (
                          <button
                            onClick={() => {
                              // Implement cancel order
                              actionTracker.trackClick('cancel_order_button', 'orders', { orderId: order.id });
                              toast('Cancel order feature coming soon');
                            }}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            <XCircle className="h-3 w-3" />
                            Cancel
                          </button>
                        )}
                        
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => {
                              // Implement reorder
                              actionTracker.trackClick('reorder_button', 'orders', { orderId: order.id });
                              toast('Reorder feature coming soon');
                            }}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Reorder
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
