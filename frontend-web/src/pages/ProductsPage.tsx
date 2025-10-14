import React from 'react';

const ProductsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Products Coming Soon</h1>
        <p className="text-gray-600">Browse and order fresh dairy products</p>
      </div>
    </div>
  );
};

export default ProductsPage;