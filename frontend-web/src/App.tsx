import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/index.ts';

// Pages
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import AdminLoginPage from './pages/AdminLoginPage.tsx';
import ProfileSetupPage from './pages/ProfileSetupPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import CartPage from './pages/CartPage.tsx';
import OrdersPage from './pages/OrdersPage.tsx';
import SubscriptionsPage from './pages/SubscriptionsPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import AgentDashboard from './pages/AgentDashboard.tsx';

// Components
import LoadingScreen from './components/LoadingScreen.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

function App() {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Show loading screen on initial load
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                user?.role === 'admin' ? <Navigate to="/admin" replace /> : 
                user?.role === 'agent' ? <Navigate to="/agent" replace /> : 
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route 
            path="/admin-login" 
            element={
              isAuthenticated && user?.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <AdminLoginPage />
              )
            } 
          />
          <Route 
            path="/profile-setup" 
            element={
              isAuthenticated ? (
                <ProfileSetupPage />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Protected User Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products" 
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/subscriptions" 
            element={
              <ProtectedRoute>
                <SubscriptionsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Protected Agent Routes */}
          <Route 
            path="/agent/*" 
            element={
              <ProtectedRoute agentOnly>
                <AgentDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;