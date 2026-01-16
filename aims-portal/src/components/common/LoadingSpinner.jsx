import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-4 border-purple-200 border-t-purple-600 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};

export default LoadingSpinner;