import React from 'react';
import { motion } from 'framer-motion';
import { FaUtensils, FaPizzaSlice, FaHamburger, FaCookieBite } from 'react-icons/fa';

const LoadingSpinner = () => {
  const foodIcons = [FaUtensils, FaPizzaSlice, FaHamburger, FaCookieBite];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#EFEBE9] to-[#D7CCC8]">
      <div className="relative">
        {foodIcons.map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute"
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.5,
              ease: "easeInOut"
            }}
            style={{
              left: `${Math.cos((index * Math.PI) / 2) * 60}px`,
              top: `${Math.sin((index * Math.PI) / 2) * 60}px`,
            }}
          >
            <Icon className="text-4xl text-primary" />
          </motion.div>
        ))}

        <motion.div
          className="w-32 h-32 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Preparing Your Order</h2>
        <p className="text-gray-600">Good food takes time...</p>

        <motion.div
          className="mt-4 flex justify-center space-x-2"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <div className="w-3 h-3 bg-secondary rounded-full"></div>
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <div className="w-3 h-3 bg-dark rounded-full"></div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;