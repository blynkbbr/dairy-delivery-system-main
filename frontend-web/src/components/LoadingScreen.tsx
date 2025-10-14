import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 loading-screen flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="text-6xl text-white mb-4 milk-splash">🥛</div>
          <h1 className="text-2xl font-bold text-white mb-2">DairyFresh</h1>
          <p className="text-blue-100">Loading your fresh experience...</p>
        </motion.div>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-32 h-1 bg-white/30 rounded-full mx-auto overflow-hidden"
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-full w-full bg-white rounded-full"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;