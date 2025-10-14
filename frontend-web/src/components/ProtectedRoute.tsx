import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/index.ts';
import LoadingScreen from './LoadingScreen.tsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    // Redirect to dashboard if not admin
    return <Navigate to="/dashboard" replace />;
  }

  if (user?.status !== 'active') {
    // Handle inactive users
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Suspended</h2>
          <p className="text-gray-600 mb-6">
            Your account has been suspended. Please contact support for assistance.
          </p>
          <button
            onClick={() => useAuthStore.getState().logout()}
            className="btn-primary"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;