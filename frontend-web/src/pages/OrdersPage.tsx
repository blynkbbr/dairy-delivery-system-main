import React from 'react';

const OrdersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">📦</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Orders Coming Soon</h1>
        <p className="text-gray-600">Track your order history and deliveries</p>
      </div>
    </div>
  );
};

export default OrdersPage;