import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Phone, ArrowLeft, Shield, Clock } from 'lucide-react';

import { useAuthStore } from '../store/index.ts';
import { authService } from '../services/auth.ts';
import { LoginFormData } from '../types';
import actionTracker from '../utils/actionTracker';

const phoneSchema = yup.object({
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
});

const otpSchema = yup.object({
  phone: yup.string().required(),
  otp: yup
    .string()
    .required('OTP is required')
    .length(6, 'OTP must be 6 digits'),
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    actionTracker.trackPageView('login');
  }, []);
  
  // Use local state instead of global state to prevent re-renders
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // Use ref to persist state across potential re-renders
  const stateRef = useRef({ showOtpInput: false, phoneNumber: '', otpSent: false });
  
  // Update ref when state changes
  useEffect(() => {
    stateRef.current = { showOtpInput, phoneNumber, otpSent };
    console.log('State updated:', stateRef.current);
  }, [showOtpInput, phoneNumber, otpSent]);
  
  const combinedForm = useForm<LoginFormData>({
    resolver: yupResolver(showOtpInput ? otpSchema : phoneSchema),
    defaultValues: {
      phone: '',
      otp: '',
    },
  });

  const handleSendOtp = async (phone: string) => {
    try {
      setIsLoading(true);
      const result = await authService.sendOtp(phone);

      // Update state to show OTP input
      setPhoneNumber(phone);
      setOtpSent(true);
      setShowOtpInput(true);

      // Update form with phone number for OTP verification
      combinedForm.setValue('phone', phone);

      actionTracker.trackFormSubmit('send_otp_form', 'login', { phone: phone.substring(0, 3) + '***' + phone.substring(7) });
      toast.success('OTP sent successfully! Please enter the OTP below.');

    } catch (error: any) {
      actionTracker.trackAction('otp_send_failed', { error: error.message, phone: phone.substring(0, 3) + '***' + phone.substring(7) });
      toast.error(error.response?.data?.message || error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response = await authService.verifyOtp(data);

      login(response.user, response.token);
      actionTracker.trackFormSubmit('verify_otp_form', 'login', { userId: response.user.id, role: response.user.role });
      toast.success(`Welcome ${response.user.full_name || 'back'}!`);

      // Redirect based on role or collect profile if new user
      if (response.user.role === 'admin') {
        actionTracker.trackNavigation('login', 'admin_dashboard');
        navigate('/admin');
      } else if (response.user.role === 'agent') {
        actionTracker.trackNavigation('login', 'agent_dashboard');
        navigate('/agent');
      } else if (!response.user.full_name || !response.user.email) {
        // User needs to complete profile
        actionTracker.trackNavigation('login', 'profile_setup');
        navigate('/profile-setup');
      } else {
        actionTracker.trackNavigation('login', 'dashboard');
        navigate('/dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Invalid OTP';
      actionTracker.trackAction('otp_verification_failed', { error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormSubmit = async (data: LoginFormData) => {
    if (!showOtpInput) {
      // Send OTP
      await handleSendOtp(data.phone);
    } else {
      // Verify OTP
      await handleVerifyOtp(data);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="text-3xl">🥛</div>
            <h1 className="text-2xl font-bold text-gray-900">DairyFresh</h1>
          </div>
          
          <p className="text-gray-600">
            {!showOtpInput 
              ? 'Enter your phone number to get started'
              : `Enter the OTP sent to ${phoneNumber}`
            }
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
        >
          <form onSubmit={combinedForm.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Phone Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...combinedForm.register('phone')}
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  disabled={showOtpInput}
                  className={`input pl-10 ${combinedForm.formState.errors.phone ? 'input-error' : ''} ${showOtpInput ? 'bg-gray-100' : ''}`}
                />
              </div>
              {combinedForm.formState.errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {combinedForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            {/* OTP Input - Show only after OTP is sent */}
            {showOtpInput && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  {...combinedForm.register('otp')}
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  className={`input text-center text-2xl tracking-widest ${combinedForm.formState.errors.otp ? 'input-error' : ''}`}
                />
                {combinedForm.formState.errors.otp && (
                  <p className="mt-1 text-sm text-red-600">
                    {combinedForm.formState.errors.otp.message}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary btn-lg"
            >
              {isLoading ? (
                <>
                  <div className="spinner mr-2" />
                  {showOtpInput ? 'Verifying...' : 'Sending OTP...'}
                </>
              ) : (
                showOtpInput ? 'Verify OTP' : 'Send OTP'
              )}
            </button>

            {/* Additional buttons for OTP step */}
            {showOtpInput && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    actionTracker.trackClick('change_number_button', 'login');
                    setShowOtpInput(false);
                    setOtpSent(false);
                    setPhoneNumber('');
                    combinedForm.reset();
                  }}
                  className="flex-1 btn-secondary"
                >
                  Change Number
                </button>
                <button
                  type="button"
                  onClick={() => {
                    actionTracker.trackClick('resend_otp_button', 'login');
                    handleSendOtp(phoneNumber);
                  }}
                  disabled={isLoading}
                  className="flex-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Resend OTP
                </button>
              </div>
            )}
          </form>

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="flex flex-col items-center">
                <Shield className="h-6 w-6 text-green-500 mb-2" />
                <span className="text-xs text-gray-600">Secure Login</span>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="h-6 w-6 text-primary-500 mb-2" />
                <span className="text-xs text-gray-600">Quick Setup</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-sm text-gray-600"
        >
          <p>
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">
              Privacy Policy
            </a>
          </p>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link to="/admin-login" className="text-primary-600 hover:text-primary-700 font-medium" onClick={() => actionTracker.trackNavigation('login', 'admin_login')}>
              Admin Login →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;