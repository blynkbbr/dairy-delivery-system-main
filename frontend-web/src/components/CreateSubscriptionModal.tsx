import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { X, Calendar, Clock, Package, Plus, Minus } from 'lucide-react';

import { subscriptionService, CreateSubscriptionData } from '../services/subscription.ts';
import { Product } from '../types';

interface CreateSubscriptionModalProps {
  products: Product[];
  onClose: () => void;
  onSuccess: () => void;
}

const CreateSubscriptionModal: React.FC<CreateSubscriptionModalProps> = ({
  products,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSubscriptionData>({
    product_id: 0,
    quantity: 1,
    frequency: 'daily',
    delivery_days: [],
    delivery_date: 1,
    start_date: new Date().toISOString().split('T')[0],
    delivery_time_slot: '8:00 AM - 10:00 AM'
  });

  const timeSlots = [
    '6:00 AM - 8:00 AM',
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM'
  ];

  const weekDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product_id) {
      toast.error('Please select a product');
      return;
    }

    if (formData.frequency === 'weekly' && (!formData.delivery_days || formData.delivery_days.length === 0)) {
      toast.error('Please select at least one delivery day for weekly subscriptions');
      return;
    }

    setLoading(true);
    try {
      await subscriptionService.createSubscription(formData);
      toast.success('Subscription created successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Create subscription error:', error);
      toast.error(error.response?.data?.error || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day: string) => {
    const currentDays = formData.delivery_days || [];
    const isSelected = currentDays.includes(day);
    
    if (isSelected) {
      setFormData({
        ...formData,
        delivery_days: currentDays.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        delivery_days: [...currentDays, day]
      });
    }
  };

  const selectedProduct = products.find(p => p.id === formData.product_id.toString());

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Subscription</h2>
            <p className="text-gray-600 mt-1">Set up recurring delivery for your favorite products</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product
            </label>
            <select
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value={0}>Choose a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - ₹{product.price}/{product.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity per delivery
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
              </button>
              
              {selectedProduct && (
                <span className="text-sm text-gray-600">
                  {selectedProduct.unit} (₹{(selectedProduct.price * formData.quantity).toFixed(2)} per delivery)
                </span>
              )}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Frequency
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' }
              ].map((freq) => (
                <button
                  key={freq.value}
                  type="button"
                  onClick={() => setFormData({ 
                    ...formData, 
                    frequency: freq.value as 'daily' | 'weekly' | 'monthly',
                    delivery_days: freq.value === 'weekly' ? [] : undefined,
                    delivery_date: freq.value === 'monthly' ? 1 : undefined
                  })}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    formData.frequency === freq.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Days Selection */}
          {formData.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Delivery Days
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`p-2 text-sm border rounded-lg text-center transition-colors ${
                      formData.delivery_days?.includes(day.value)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Date Selection */}
          {formData.frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date (Day of Month)
              </label>
              <select
                value={formData.delivery_date || 1}
                onChange={(e) => setFormData({ ...formData, delivery_date: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of each month
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Delivery Time
            </label>
            <select
              value={formData.delivery_time_slot || ''}
              onChange={(e) => setFormData({ ...formData, delivery_time_slot: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Any time</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Subscription Summary */}
          {selectedProduct && (
            <div className="bg-primary-50 rounded-lg p-4">
              <h3 className="font-medium text-primary-900 mb-2">Subscription Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-700">Product:</span>
                  <span className="text-primary-900 font-medium">{selectedProduct.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700">Quantity:</span>
                  <span className="text-primary-900 font-medium">{formData.quantity} {selectedProduct.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700">Frequency:</span>
                  <span className="text-primary-900 font-medium">
                    {formData.frequency === 'daily' ? 'Daily' :
                     formData.frequency === 'weekly' ? `Weekly${formData.delivery_days?.length ? ` (${formData.delivery_days.length} days)` : ''}` :
                     'Monthly'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700">Cost per delivery:</span>
                  <span className="text-primary-900 font-medium">₹{(selectedProduct.price * formData.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Subscription'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateSubscriptionModal;