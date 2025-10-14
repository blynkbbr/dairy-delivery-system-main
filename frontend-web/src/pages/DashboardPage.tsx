import React from 'react';
import { useAuthStore } from '../store/index.ts';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.full_name || 'User'}! 🥛
          </h1>
          <p className="text-gray-600 mb-6">
            Your dashboard is being built with love. Check back soon for awesome features!
          </p>
          
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-lg">
              <h3 className="font-medium text-primary-900">Coming Soon:</h3>
              <ul className="mt-2 text-sm text-primary-700 space-y-1">
                <li>• Daily milk subscription management</li>
                <li>• Order tracking and history</li>
                <li>• Delivery schedule customization</li>
                <li>• Payment and billing overview</li>
              </ul>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-8 btn-secondary"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;