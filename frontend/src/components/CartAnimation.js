import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';

const CartAnimation = ({ trigger, itemImage, itemName }) => {
  const [animations, setAnimations] = useState([]);

  useEffect(() => {
    if (trigger) {
      // Create a new animation
      const id = Date.now();
      setAnimations(prev => [...prev, id]);
      
      // Remove animation after it completes
      setTimeout(() => {
        setAnimations(prev => prev.filter(animId => animId !== id));
      }, 1000);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {animations.map(animId => (
        <motion.div
          key={animId}
          initial={{ 
            position: 'fixed',
            zIndex: 9999,
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: '#FF6B35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
          animate={{
            x: [null, window.innerWidth - 100],
            y: [null, 20],
            scale: [1, 0.5, 0.3],
            opacity: [1, 1, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.8,
            ease: 'easeInOut',
          }}
          style={{
            left: '50%',
            top: '50%',
          }}
        >
          {itemImage ? (
            <img 
              src={itemImage} 
              alt={itemName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <FaShoppingCart className="text-white text-xl" />
          )}
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

export default CartAnimation;

