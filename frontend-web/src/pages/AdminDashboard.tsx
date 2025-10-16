import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Calendar,
  TrendingUp, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

import { useAuthStore } from '../store/index.ts';
import AdminAnalytics from '../components/admin/AdminAnalytics.tsx';
import AdminUsers from '../components/admin/AdminUsers.tsx';
import AdminProducts from '../components/admin/AdminProducts.tsx';
import AdminOrders from '../components/admin/AdminOrders.tsx';
import AdminSubscriptions from '../components/admin/AdminSubscriptions.tsx';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { 
      name: 'Analytics', 
      href: '/admin', 
      icon: LayoutDashboard, 
      exact: true 
    },
    { 
      name: 'Users', 
      href: '/admin/users', 
      icon: Users 
    },
    { 
      name: 'Products', 
      href: '/admin/products', 
      icon: Package 
    },
    { 
      name: 'Orders', 
      href: '/admin/orders', 
      icon: ShoppingCart 
    },
    { 
      name: 'Subscriptions', 
      href: '/admin/subscriptions', 
      icon: Calendar 
    }
  ];

  const isActive = (nav: typeof navigation[0]) => {
    if (nav.exact) {
      return location.pathname === nav.href;
    }
    return location.pathname.startsWith(nav.href);
  };

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
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
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
                      ? 'bg-primary-600 text-white'
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
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.full_name || 'Admin'}</p>
              <p className="text-xs text-gray-400">{user?.email || 'admin@dairy.com'}</p>
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
              {navigation.find(nav => isActive(nav))?.name || 'Analytics'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.full_name || 'Admin'}
            </span>
          </div>
        </div>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<AdminAnalytics />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/products" element={<AdminProducts />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/subscriptions" element={<AdminSubscriptions />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;