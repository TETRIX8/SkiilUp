import React from 'react';
import { motion } from 'framer-motion';
import { Code } from 'lucide-react';

export const AKProjectBadge = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <motion.a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-1">
          <Code className="h-3 w-3 text-white" />
        </div>
        <span className="text-xs font-medium text-gray-700">
          A-K Project
        </span>
      </motion.a>
    </motion.div>
  );
}; 