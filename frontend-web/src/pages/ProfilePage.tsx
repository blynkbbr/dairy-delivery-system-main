import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  Plus,
  Trash2,
  Home,
  Building,
  Navigation,
  Crosshair,
  Loader
} from 'lucide-react';

import { useAuthStore } from '../store/index.ts';
import api from '../services/api.ts';

interface Address {
  id: string;
  line1: string;
  line2?: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  landmark?: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  addresses: Address[];
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  
  const [addressForm, setAddressForm] = useState({
    line1: '',
    line2: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    is_default: false
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/profile');
      const profileData = response.data.data || response.data;
      setProfile(profileData);
      setProfileForm({
        full_name: profileData.full_name || '',
        email: profileData.email || '',
        phone: profileData.phone || ''
      });
    } catch (error: any) {
      console.error('Load profile error:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await api.put('/user/profile', profileForm);
      toast.success('Profile updated successfully');
      setEditing(false);
      loadProfile();
    } catch (error: any) {
      toast.error('Failed to update profile');
    }
  };

  const handleAddAddress = async () => {
    try {
      await api.post('/user/addresses', addressForm);
      toast.success('Address added successfully');
      setAddingAddress(false);
      setAddressForm({
        line1: '',
        line2: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        is_default: false
      });
      loadProfile();
    } catch (error: any) {
      toast.error('Failed to add address');
    }
  };

  const handleUpdateAddress = async (id: string, data: Partial<Address>) => {
    try {
      await api.put(`/user/addresses/${id}`, data);
      toast.success('Address updated successfully');
      setEditingAddress(null);
      loadProfile();
    } catch (error: any) {
      toast.error('Failed to update address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    try {
      await api.delete(`/user/addresses/${id}`);
      toast.success('Address deleted successfully');
      loadProfile();
    } catch (error: any) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await api.put(`/user/addresses/${id}`, { is_default: true });
      toast.success('Default address updated');
      loadProfile();
    } catch (error: any) {
      toast.error('Failed to update default address');
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get address details
          // For now, we'll just show the coordinates
          // In a real app, you'd use Google Maps Geocoding API or similar
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          if (response.ok) {
            const data = await response.json();
            setAddressForm(prev => ({
              ...prev,
              line1: data.locality || '',
              area: data.principalSubdivision || '',
              city: data.city || '',
              state: data.principalSubdivision || '',
              pincode: data.postcode || ''
            }));
            toast.success('Location detected successfully!');
          } else {
            throw new Error('Failed to get address from coordinates');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          toast.error('Failed to get address details from location');
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGettingLocation(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location access denied. Please allow location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
            break;
          default:
            toast.error('An unknown error occurred while retrieving location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">Profile not found</h1>
          <button onClick={logout} className="mt-4 btn-primary">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account information and addresses</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUpdateProfile}
                    className="flex items-center gap-2 text-green-600 hover:text-green-700"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{profile.full_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{profile.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{profile.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Addresses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Delivery Addresses</h2>
              <button
                onClick={() => setAddingAddress(true)}
                className="flex items-center gap-2 btn-primary"
              >
                <Plus className="h-4 w-4" />
                Add Address
              </button>
            </div>

            {/* Add Address Form */}
            {addingAddress && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-900">Add New Address</h3>
                  <button
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {gettingLocation ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Crosshair className="h-4 w-4" />
                    )}
                    {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Address Line 1*"
                    value={addressForm.line1}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, line1: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  
                  <input
                    type="text"
                    placeholder="Address Line 2"
                    value={addressForm.line2}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, line2: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  
                  <input
                    type="text"
                    placeholder="Area/Locality*"
                    value={addressForm.area}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, area: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  
                  <input
                    type="text"
                    placeholder="City*"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  
                  <input
                    type="text"
                    placeholder="State*"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  
                  <input
                    type="text"
                    placeholder="Pincode*"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <input
                  type="text"
                  placeholder="Landmark (optional)"
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, landmark: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
                />
                
                <div className="flex items-center gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addressForm.is_default}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, is_default: e.target.checked }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Set as default address
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={handleAddAddress} className="btn-primary">
                    Save Address
                  </button>
                  <button 
                    onClick={() => setAddingAddress(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Address List */}
            <div className="space-y-4">
              {profile.addresses && profile.addresses.length > 0 ? (
                profile.addresses.map((address) => (
                  <div key={address.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {address.is_default && (
                              <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-gray-900">
                            {address.line1}{address.line2 && `, ${address.line2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.area}, {address.city}, {address.state} - {address.pincode}
                          </p>
                          {address.landmark && (
                            <p className="text-sm text-gray-500">Near: {address.landmark}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!address.is_default && (
                          <button
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            Set Default
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-800">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses found</h3>
                  <p className="text-gray-600">Add your first delivery address to get started</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
