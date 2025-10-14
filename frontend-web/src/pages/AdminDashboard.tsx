import React from 'react';
import { useAuthStore } from '../store';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Admin Dashboard 🚀
          </h1>
          <p className="text-gray-300 mb-6">
            Welcome {user?.full_name}! Your admin dashboard is under construction.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-primary-600 rounded-lg p-6">
              <h3 className="text-primary-100 text-sm font-medium">Total Users</h3>
              <p className="text-white text-2xl font-bold">1,234</p>
            </div>
            <div className="bg-green-600 rounded-lg p-6">
              <h3 className="text-green-100 text-sm font-medium">Active Orders</h3>
              <p className="text-white text-2xl font-bold">56</p>
            </div>
            <div className="bg-yellow-600 rounded-lg p-6">
              <h3 className="text-yellow-100 text-sm font-medium">Products</h3>
              <p className="text-white text-2xl font-bold">24</p>
            </div>
            <div className="bg-purple-600 rounded-lg p-6">
              <h3 className="text-purple-100 text-sm font-medium">Revenue</h3>
              <p className="text-white text-2xl font-bold">₹45,678</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="font-medium text-white">Coming Soon:</h3>
              <ul className="mt-2 text-sm text-gray-300 space-y-1">
                <li>• User management and analytics</li>
                <li>• Product catalog management</li>
                <li>• Order processing and tracking</li>
                <li>• Delivery route optimization</li>
                <li>• Financial reports and billing</li>
              </ul>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-8 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;