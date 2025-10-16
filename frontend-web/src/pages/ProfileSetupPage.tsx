import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, MapPin, Mail, Phone, Calendar } from 'lucide-react';

import { useAuthStore } from '../store/index.ts';
import { userService } from '../services/user.ts';

const profileSchema = yup.object({
  full_name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address'),
  address: yup
    .string()
    .required('Address is required')
    .min(10, 'Please enter a complete address'),
  date_of_birth: yup
    .string()
    .required('Date of birth is required'),
  payment_mode: yup
    .string()
    .required('Payment mode is required')
    .oneOf(['prepaid', 'cash_on_delivery'], 'Invalid payment mode'),
});

interface ProfileFormData {
  full_name: string;
  email: string;
  address: string;
  date_of_birth: string;
  payment_mode: 'prepaid' | 'cash_on_delivery';
}

const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      address: user?.address || '',
      date_of_birth: '',
      payment_mode: 'cash_on_delivery',
    },
  });

  const handleSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      const updatedUser = await userService.updateProfile(data);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="text-3xl">🥛</div>
            <h1 className="text-2xl font-bold text-gray-900">DairyFresh</h1>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Complete Your Profile
          </h2>
          <p className="text-gray-600">
            Please provide your details to get started with fresh dairy deliveries
          </p>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
        >
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...form.register('full_name')}
                  type="text"
                  placeholder="Enter your full name"
                  className={`input pl-10 ${form.formState.errors.full_name ? 'input-error' : ''}`}
                />
              </div>
              {form.formState.errors.full_name && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.full_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...form.register('email')}
                  type="email"
                  placeholder="Enter your email address"
                  className={`input pl-10 ${form.formState.errors.email ? 'input-error' : ''}`}
                />
              </div>
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Phone (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={user?.phone || ''}
                  disabled
                  className="input pl-10 bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pt-3 pl-3 flex items-start pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  {...form.register('address')}
                  rows={3}
                  placeholder="Enter your complete delivery address"
                  className={`input pl-10 pt-3 resize-none ${form.formState.errors.address ? 'input-error' : ''}`}
                />
              </div>
              {form.formState.errors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...form.register('date_of_birth')}
                  type="date"
                  className={`input pl-10 ${form.formState.errors.date_of_birth ? 'input-error' : ''}`}
                />
              </div>
              {form.formState.errors.date_of_birth && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.date_of_birth.message}
                </p>
              )}
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Payment Mode *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative">
                  <input
                    {...form.register('payment_mode')}
                    type="radio"
                    value="cash_on_delivery"
                    className="sr-only"
                  />
                  <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    form.watch('payment_mode') === 'cash_on_delivery'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="text-center">
                      <div className="text-2xl mb-2">💵</div>
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-sm text-gray-600 mt-1">Pay when delivered</div>
                    </div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    {...form.register('payment_mode')}
                    type="radio"
                    value="prepaid"
                    className="sr-only"
                  />
                  <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    form.watch('payment_mode') === 'prepaid'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="text-center">
                      <div className="text-2xl mb-2">💳</div>
                      <div className="font-medium">Prepaid</div>
                      <div className="text-sm text-gray-600 mt-1">Pay in advance</div>
                    </div>
                  </div>
                </label>
              </div>
              {form.formState.errors.payment_mode && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.payment_mode.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary btn-lg"
            >
              {isLoading ? (
                <>
                  <div className="spinner mr-2" />
                  Setting up your profile...
                </>
              ) : (
                'Complete Setup'
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6 text-sm text-gray-600"
        >
          <p>
            Your information is secure and will only be used for delivery purposes.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;