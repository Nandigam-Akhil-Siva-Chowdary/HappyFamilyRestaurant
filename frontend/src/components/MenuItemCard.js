import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaPlus, FaFire } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/config';

const MenuItemCard = ({ item }) => {
  const [showModal, setShowModal] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [spiceLevel, setSpiceLevel] = useState('medium');
  const [quantity, setQuantity] = useState(1);
  const [animateCart, setAnimateCart] = useState(false);
  const buttonRef = useRef(null);
  const dispatch = useDispatch();

  const showSpiceLevel = item?.category && ['starters', 'biryanis', 'main-course'].includes(item.category.toLowerCase());

  const handleAddToCart = () => {
    if (!item.available) {
      toast.error(`${item.name} is out of stock!`);
      return;
    }
    setShowModal(true);
  };

  const confirmAddToCart = () => {
    const cartItem = {
      ...item,
      quantity,
      specialInstructions,
      spiceLevel
    };

    // Trigger cart animation
    setAnimateCart(true);
    setTimeout(() => setAnimateCart(false), 100);

    // Dispatch to cart
    dispatch(addToCart(cartItem));

    // Show success toast with animation
    toast.success(`${item.name} added to cart! 🎉`, {
      icon: '🛒',
      duration: 2000,
    });

    setShowModal(false);
    setSpecialInstructions('');
    setSpiceLevel('medium');
    setQuantity(1);

    // Trigger global cart animation event
    window.dispatchEvent(new CustomEvent('cartAnimation', {
      detail: {
        image: getImageUrl(item.image),
        name: item.name
      }
    }));
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= item.rating ? 'text-yellow-400' : 'text-gray-300'}
        />
      );
    }
    return stars;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${!item.available ? 'opacity-60' : ''
          }`}
      >
        <div className="relative">
          <img
            src={getImageUrl(item.image) || '/api/placeholder/400/300'}
            alt={item.name}
            className="w-full h-48 object-cover"
          />
          {!item.available && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="text-white text-xl font-bold">Out of Stock</span>
            </div>
          )}
          <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full text-xl font-bold shadow-md">
            ₹{item.price}
          </div>
          {item.spicyLevel === 'extra-spicy' && (
            <div className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full">
              <FaFire />
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
            <div className="flex">{renderStars()}</div>
          </div>

          <p className="text-gray-600 mb-4">{item.description}</p>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                {item.category}
              </span>
              <span className="text-sm text-gray-500">
                {item.preparationTime} mins
              </span>
            </div>

            <motion.button
              ref={buttonRef}
              onClick={handleAddToCart}
              disabled={!item.available}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={animateCart ? {
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              } : {}}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${item.available
                ? 'bg-primary text-white hover:bg-dark shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              <motion.div
                animate={animateCart ? {
                  rotate: [0, 360],
                  scale: [1, 1.3, 1]
                } : {}}
                transition={{ duration: 0.5 }}
              >
                <FaPlus />
              </motion.div>
              <span>Add to Cart</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Customization Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4">Customize {item.name}</h3>

            <div className="space-y-4">
              {showSpiceLevel && (
                <div>
                  <label className="block mb-2 font-medium">Spice Level</label>
                  <div className="flex space-x-2">
                    {['mild', 'medium', 'spicy', 'extra-spicy'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setSpiceLevel(level)}
                        className={`px-4 py-2 rounded-lg capitalize ${spiceLevel === level
                          ? 'bg-primary text-white'
                          : 'bg-gray-100'
                          }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block mb-2 font-medium">Quantity</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Special Instructions
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows="3"
                  placeholder="E.g., No onions, extra sauce..."
                />
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddToCart}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-semibold"
                >
                  Add to Cart - ₹{item.price * quantity}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default MenuItemCard;