import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit, Trash2, MoreVertical, Filter } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock user data
  const users = [
    {
      id: 1,
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '+91 9876543210',
      status: 'active',
      role: 'user',
      created_at: '2024-01-15',
      total_orders: 12,
      total_spent: 2500
    },
    {
      id: 2,
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+91 9876543211',
      status: 'active',
      role: 'user',
      created_at: '2024-02-10',
      total_orders: 8,
      total_spent: 1800
    },
    {
      id: 3,
      full_name: 'Admin User',
      email: 'admin@dairy.com',
      phone: '+91 9876543212',
      status: 'active',
      role: 'admin',
      created_at: '2024-01-01',
      total_orders: 0,
      total_spent: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'agent': return 'text-blue-600 bg-blue-100';
      case 'user': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage users and their permissions</p>
        </div>
        <button className="flex items-center gap-2 btn-primary">
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">User</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Contact</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Role</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Stats</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Joined</th>
                <th className="text-right py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {user.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-900">{user.phone}</p>
                  </td>
                  
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <p className="text-gray-900">{user.total_orders} orders</p>
                      <p className="text-gray-500">₹{user.total_spent.toLocaleString()}</p>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{users.length}</span> of{' '}
          <span className="font-medium">{users.length}</span> results
        </p>
        
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            Previous
          </button>
          <button className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;