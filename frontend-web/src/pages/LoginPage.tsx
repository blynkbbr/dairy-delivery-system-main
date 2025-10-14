import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Phone, ArrowLeft, Shield, Clock } from 'lucide-react';

import { useAuthStore } from '../store';
import { authService } from '../services/auth';
import { LoginFormData } from '../types';

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
  const { login, setLoading, isLoading } = useAuthStore();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');

  const phoneForm = useForm<{ phone: string }>({
    resolver: yupResolver(phoneSchema),
  });

  const otpForm = useForm<LoginFormData>({
    resolver: yupResolver(otpSchema),
    defaultValues: {
      phone: phoneNumber,
    },
  });

  const handleSendOtp = async (data: { phone: string }) => {
    try {
      setLoading(true);
      await authService.sendOtp(data.phone);
      setPhoneNumber(data.phone);
      setStep('otp');
      otpForm.setValue('phone', data.phone);
      toast.success('OTP sent successfully! Check console in development mode.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (data: LoginFormData) => {
    try {
      setLoading(true);
      const response = await authService.verifyOtp(data);
      login(response.user, response.token);
      toast.success(`Welcome ${response.user.full_name || 'back'}!`);
      
      // Redirect based on role
      if (response.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
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
            {step === 'phone' 
              ? 'Enter your phone number to get started'
              : 'Enter the OTP sent to your phone'
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
          {step === 'phone' ? (
            <form onSubmit={phoneForm.handleSubmit(handleSendOtp)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...phoneForm.register('phone')}
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    className={`input pl-10 ${phoneForm.formState.errors.phone ? 'input-error' : ''}`}
                  />
                </div>
                {phoneForm.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {phoneForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary btn-lg"
              >
                {isLoading ? (
                  <>
                    <div className="spinner mr-2" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  OTP sent to {phoneNumber}
                </p>
                <input
                  {...otpForm.register('otp')}
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  className={`input text-center text-2xl tracking-widest ${otpForm.formState.errors.otp ? 'input-error' : ''}`}
                />
                {otpForm.formState.errors.otp && (
                  <p className="mt-1 text-sm text-red-600">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="flex-1 btn-secondary"
                >
                  Change Number
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 btn-primary"
                >
                  {isLoading ? (
                    <>
                      <div className="spinner mr-2" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleSendOtp({ phone: phoneNumber })}
                disabled={isLoading}
                className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Resend OTP
              </button>
            </form>
          )}

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
            <Link to="/admin-login" className="text-primary-600 hover:text-primary-700 font-medium">
              Admin Login →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;