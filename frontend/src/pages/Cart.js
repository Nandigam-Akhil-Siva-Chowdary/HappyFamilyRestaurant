import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../redux/slices/cartSlice';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/config';

const Cart = () => {
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    tableNumber: '',
    specialInstructions: ''
  });
  const cart = useSelector(state => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (!customerDetails.name || !customerDetails.tableNumber) {
      toast.error('Please fill in your name and table number');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const orderData = {
      customerName: customerDetails.name,
      tableNumber: parseInt(customerDetails.tableNumber),
      items: cart.map(item => ({
        itemId: item._id,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        spiceLevel: item.spiceLevel
      })),
      paymentMethod: 'cash',
      orderType: 'dine-in'
    };

    try {
      const response = await fetch('https://happyfamilyrestaurant4.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        toast.success(`Order placed successfully! Order ID: ${order.orderId}`);
        dispatch(clearCart());
        navigate('/');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to place order');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center p-6"
      >
        <div className="text-center">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FaShoppingCart className="text-6xl text-gray-300 mb-4" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some delicious items from our menu!</p>
          <button
            onClick={() => navigate('/menu')}
            className="px-8 py-3 bg-primary text-white rounded-full font-semibold text-lg hover:bg-dark transition-colors"
          >
            Browse Menu
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8 text-center">Your Order</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Order Items ({cart.length})</h2>

              <div className="space-y-4">
                {cart.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={getImageUrl(item.image) || '/api/placeholder/100/100'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        {item.spiceLevel && (
                          <p className="text-sm text-gray-600">
                            Spice: <span className="capitalize">{item.spiceLevel}</span>
                          </p>
                        )}
                        {item.specialInstructions && (
                          <p className="text-sm text-gray-600">
                            {item.specialInstructions}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full md:w-auto md:justify-start md:space-x-6 mt-4 md:mt-0">
                      <div className="flex items-center space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => dispatch(updateQuantity({
                            id: item._id,
                            quantity: Math.max(1, item.quantity - 1)
                          }))}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <FaMinus />
                        </motion.button>
                        <motion.span
                          key={item.quantity}
                          initial={{ scale: 1.5 }}
                          animate={{ scale: 1 }}
                          className="font-bold text-lg min-w-[30px] text-center"
                        >
                          {item.quantity}
                        </motion.span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => dispatch(updateQuantity({
                            id: item._id,
                            quantity: item.quantity + 1
                          }))}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <FaPlus />
                        </motion.button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg">₹{item.price * item.quantity}</p>
                        <p className="text-sm text-gray-500">₹{item.price} each</p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => dispatch(removeFromCart(item._id))}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => dispatch(clearCart())}
                  className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear Cart
                </motion.button>
                <div className="text-right">
                  <p className="text-gray-600">Total Amount</p>
                  <p className="text-3xl font-bold">₹{totalAmount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-bold mb-6">Customer Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium">Your Name *</label>
                  <input
                    type="text"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({
                      ...customerDetails,
                      name: e.target.value
                    })}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Table Number *</label>
                  <input
                    type="number"
                    value={customerDetails.tableNumber}
                    onChange={(e) => setCustomerDetails({
                      ...customerDetails,
                      tableNumber: e.target.value
                    })}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Enter table number"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">
                    Additional Instructions (Optional)
                  </label>
                  <textarea
                    value={customerDetails.specialInstructions}
                    onChange={(e) => setCustomerDetails({
                      ...customerDetails,
                      specialInstructions: e.target.value
                    })}
                    className="w-full p-3 border rounded-lg"
                    rows="4"
                    placeholder="Any special requests..."
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total Payable</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlaceOrder}
                  className="w-full py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-dark transition-colors"
                >
                  Place Order - ₹{totalAmount}
                </motion.button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Your order will be prepared immediately and served at your table
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Cart;