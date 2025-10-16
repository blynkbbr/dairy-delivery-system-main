import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  MapPin, 
  Package, 
  CheckCircle, 
  Clock,
  TrendingUp, 
  LogOut,
  Menu,
  X,
  Navigation,
  Truck,
  User,
  Phone,
  Calendar
} from 'lucide-react';

import { useAuthStore } from '../store/index.ts';
import api from '../services/api.ts';

interface Delivery {
  id: string;
  customer_name: string;
  customer_phone?: string;
  address: string;
  product_name: string;
  quantity: number;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered';
  delivery_date: string;
  time_slot?: string;
  notes?: string;
}

interface RouteInfo {
  id: string;
  name: string;
  total_deliveries: number;
  completed_deliveries: number;
  distance: number;
  estimated_time: number;
}

const AgentDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [todayRoute, setTodayRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    completedToday: 0,
    pendingDeliveries: 0,
    efficiency: 0
  });

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/agent', 
      icon: LayoutDashboard, 
      exact: true 
    },
    { 
      name: 'Today\'s Route', 
      href: '/agent/route', 
      icon: Navigation 
    },
    { 
      name: 'Deliveries', 
      href: '/agent/deliveries', 
      icon: Package 
    },
    { 
      name: 'Profile', 
      href: '/agent/profile', 
      icon: User 
    }
  ];

  useEffect(() => {
    loadAgentData();
  }, []);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      
      // Load today's deliveries
      const deliveriesResponse = await api.get('/agent/deliveries/today');
      const deliveriesData = deliveriesResponse.data.data || [];
      setDeliveries(deliveriesData);

      // Load route information
      const routeResponse = await api.get('/agent/route/today');
      const routeData = routeResponse.data.data;
      setTodayRoute(routeData);

      // Calculate stats
      const completed = deliveriesData.filter((d: Delivery) => d.status === 'delivered').length;
      const efficiency = deliveriesData.length > 0 ? (completed / deliveriesData.length) * 100 : 0;

      setStats({
        totalDeliveries: deliveriesData.length,
        completedToday: completed,
        pendingDeliveries: deliveriesData.filter((d: Delivery) => ['pending', 'picked_up', 'in_transit'].includes(d.status)).length,
        efficiency
      });

    } catch (error) {
      console.error('Load agent data error:', error);
      // Use mock data for now
      const mockDeliveries = [
        {
          id: '1',
          customer_name: 'John Doe',
          customer_phone: '9876543210',
          address: '123 Main St, Area A, City',
          product_name: 'Fresh Milk',
          quantity: 2,
          status: 'pending' as const,
          delivery_date: new Date().toISOString(),
          time_slot: '08:00-10:00'
        },
        {
          id: '2',
          customer_name: 'Jane Smith',
          address: '456 Oak Ave, Area B, City',
          product_name: 'Yogurt',
          quantity: 1,
          status: 'delivered' as const,
          delivery_date: new Date().toISOString(),
          time_slot: '10:00-12:00'
        }
      ];
      
      setDeliveries(mockDeliveries);
      setTodayRoute({
        id: '1',
        name: 'Route A - Central District',
        total_deliveries: 15,
        completed_deliveries: 8,
        distance: 25,
        estimated_time: 180
      });
      
      setStats({
        totalDeliveries: 15,
        completedToday: 8,
        pendingDeliveries: 7,
        efficiency: 53.3
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDeliveryStatus = async (deliveryId: string, status: Delivery['status']) => {
    try {
      await api.put(`/agent/deliveries/${deliveryId}`, { status });
      
      // Update local state
      setDeliveries(prev => prev.map(delivery => 
        delivery.id === deliveryId 
          ? { ...delivery, status }
          : delivery
      ));
      
      // Recalculate stats
      loadAgentData();
    } catch (error) {
      console.error('Update delivery status error:', error);
    }
  };

  const isActive = (nav: typeof navigation[0]) => {
    if (nav.exact) {
      return location.pathname === nav.href;
    }
    return location.pathname.startsWith(nav.href);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'in_transit': return 'text-blue-600 bg-blue-100';
      case 'picked_up': return 'text-orange-600 bg-orange-100';
      default: return 'text-yellow-600 bg-yellow-100';
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
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Agent Portal</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.full_name || 'Agent'}</p>
              <p className="text-xs text-gray-400">Delivery Agent</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="flex items-center justify-between h-16 px-4 bg-white shadow-sm lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-600 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="hidden lg:block">
            <h2 className="text-2xl font-bold text-gray-900">
              {navigation.find(nav => isActive(nav))?.name || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<AgentDashboardHome stats={stats} todayRoute={todayRoute} deliveries={deliveries} onUpdateStatus={handleUpdateDeliveryStatus} />} />
            <Route path="/route" element={<div className="p-6"><h1>Route Management - Coming Soon</h1></div>} />
            <Route path="/deliveries" element={<div className="p-6"><h1>Deliveries Management - Coming Soon</h1></div>} />
            <Route path="/profile" element={<div className="p-6"><h1>Agent Profile - Coming Soon</h1></div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Agent Dashboard Home Component
const AgentDashboardHome: React.FC<{
  stats: any;
  todayRoute: RouteInfo | null;
  deliveries: Delivery[];
  onUpdateStatus: (id: string, status: Delivery['status']) => void;
}> = ({ stats, todayRoute, deliveries, onUpdateStatus }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
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
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedToday}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
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
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingDeliveries}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
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
              <p className="text-sm text-gray-600">Efficiency</p>
              <p className="text-2xl font-bold text-purple-600">{stats.efficiency.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Route */}
        {todayRoute && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Navigation className="h-5 w-5 text-blue-500" />
                Today's Route
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{todayRoute.name}</h4>
                  <p className="text-sm text-gray-600">
                    {todayRoute.completed_deliveries}/{todayRoute.total_deliveries} deliveries completed
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Distance</p>
                    <p className="font-medium text-gray-900">{todayRoute.distance} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Est. Time</p>
                    <p className="font-medium text-gray-900">{Math.floor(todayRoute.estimated_time / 60)}h {todayRoute.estimated_time % 60}m</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(todayRoute.completed_deliveries / todayRoute.total_deliveries) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Deliveries */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-500" />
              Recent Deliveries
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {deliveries.slice(0, 5).map((delivery) => (
              <div key={delivery.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{delivery.customer_name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                    {delivery.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {delivery.address}
                </div>
                
                <div className="text-sm text-gray-600">
                  {delivery.quantity}x {delivery.product_name}
                  {delivery.time_slot && ` • ${delivery.time_slot}`}
                </div>
                
                {delivery.status !== 'delivered' && (
                  <div className="mt-2 flex gap-2">
                    {delivery.status === 'pending' && (
                      <button
                        onClick={() => onUpdateStatus(delivery.id, 'picked_up')}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                      >
                        Mark Picked Up
                      </button>
                    )}
                    {delivery.status === 'picked_up' && (
                      <button
                        onClick={() => onUpdateStatus(delivery.id, 'in_transit')}
                        className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded"
                      >
                        Mark In Transit
                      </button>
                    )}
                    {delivery.status === 'in_transit' && (
                      <button
                        onClick={() => onUpdateStatus(delivery.id, 'delivered')}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AgentDashboard;