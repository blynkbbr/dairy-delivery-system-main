import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, ArrowLeft, Shield, Settings } from 'lucide-react';

import { useAuthStore } from '../store/index.ts';
import { authService } from '../services/auth.ts';
import { AdminLoginFormData } from '../types';

const schema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(3, 'Password must be at least 3 characters'),
});

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, setLoading, isLoading } = useAuthStore();

  const form = useForm<AdminLoginFormData>({
    resolver: yupResolver(schema),
  });

  const handleLogin = async (data: AdminLoginFormData) => {
    try {
      setLoading(true);
      const response = await authService.adminLogin(data);
      login(response.user, response.token);
      toast.success(`Welcome back, ${response.user.full_name}!`);
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-3 bg-primary-600 rounded-xl">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          </div>
          
          <p className="text-gray-400">
            Sign in to access the admin dashboard
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8"
        >
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...form.register('email')}
                  type="email"
                  placeholder="admin@dairydelivery.com"
                  className={`w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    form.formState.errors.email ? 'border-red-400' : ''
                  }`}
                />
              </div>
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-red-400">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...form.register('password')}
                  type="password"
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    form.formState.errors.password ? 'border-red-400' : ''
                  }`}
                />
              </div>
              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {isLoading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Signing In...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-8 border-t border-white/20">
            <div className="bg-primary-600/20 border border-primary-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-primary-100 mb-2">Demo Credentials</h4>
                  <div className="text-xs text-primary-200 space-y-1">
                    <div><strong>Email:</strong> admin@dairydelivery.com</div>
                    <div><strong>Password:</strong> admin123</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-sm text-gray-400"
        >
          <p>Authorized personnel only</p>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              ← Customer Login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLoginPage;