import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { socket } from '../../App';
import { 
  FaCheck, FaTimes, FaClock, FaUtensils, 
  FaCheckCircle, FaBell, FaPrint 
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
// import useSound from 'use-sound';
// import beepSound from '../../assets/beep.mp3';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState({});
//   const [playBeep] = useSound(beepSound);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchOrders();
    fetchStats();

    // Socket event listeners
    socket.on('new-order', (order) => {
      // Show toast notification
      toast.custom((t) => (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg shadow-2xl max-w-md border-2 border-green-300"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <FaBell className="text-white text-2xl" />
            </motion.div>
            <div className="flex-1">
              <h4 className="font-bold text-lg">🎉 New Order Received!</h4>
              <p className="text-sm mt-1">Order ID: <span className="font-mono font-bold">{order.orderId}</span></p>
              <p className="text-sm">Table: {order.tableNumber} | Amount: ₹{order.totalAmount}</p>
              <p className="text-xs mt-1 opacity-90">{order.items.length} item(s)</p>
            </div>
          </div>
        </motion.div>
      ), {
        duration: 6000,
      });
      
      // Play beep sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      
      // Browser notification (if permission granted)
      if (Notification.permission === 'granted') {
        new Notification('New Order Received! 🎉', {
          body: `Order ${order.orderId} - Table ${order.tableNumber}\nAmount: ₹${order.totalAmount}`,
          icon: '/logo.svg',
          badge: '/logo.svg',
          tag: `order-${order._id}`,
          requireInteraction: true,
          vibrate: [200, 100, 200],
        });
      }
      
      // Update orders list
      setOrders(prev => [order, ...prev]);
      fetchStats();
    });

    socket.on('order-updated', (updatedOrder) => {
      setOrders(prev => 
        prev.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    return () => {
      socket.off('new-order');
      socket.off('order-updated');
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://happyfamilyrestaurant4.onrender.com/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('https://happyfamilyrestaurant4.onrender.com/api/orders/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`https://happyfamilyrestaurant4.onrender.com/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        toast.success(`Order ${status}`);
        fetchOrders();
      }
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'served': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const printOrder = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Order ${order.orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .order-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Happy Family Restaurant</h1>
            <h2>Kitchen Order Ticket</h2>
          </div>
          <div class="order-info">
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Table:</strong> ${order.tableNumber}</p>
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Time:</strong> ${new Date(order.createdAt).toLocaleTimeString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Special Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price}</td>
                  <td>${item.specialInstructions || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Total Amount: ₹${order.totalAmount}</p>
          </div>
          <p style="margin-top: 30px;">===============================</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6">
      {/* Hidden audio element for beep sound */}
      <audio ref={audioRef} src="/beep.mp3" preload="auto" />
      
      {/* Browser Notification Permission Request */}
      {Notification.permission === 'default' && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 rounded-lg">
          <p className="text-blue-800">
            Enable browser notifications to get real-time order alerts?
            <button
              onClick={() => Notification.requestPermission()}
              className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Enable
            </button>
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Orders</p>
              <h3 className="text-3xl font-bold">{stats.totalOrders || 0}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaUtensils className="text-blue-600 text-2xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Pending</p>
              <h3 className="text-3xl font-bold">{stats.pendingOrders || 0}</h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FaClock className="text-yellow-600 text-2xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Today's Orders</p>
              <h3 className="text-3xl font-bold">{stats.todayOrders || 0}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FaCheckCircle className="text-green-600 text-2xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Revenue</p>
              <h3 className="text-3xl font-bold">₹{stats.totalRevenue || 0}</h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl font-bold text-purple-600">₹</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Recent Orders</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Order ID</th>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Table</th>
                <th className="p-4 text-left">Items</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4">
                    <span className="font-mono font-bold">{order.orderId}</span>
                    <br />
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="p-4">{order.customerName}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-gray-100 rounded-full">
                      Table {order.tableNumber}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-primary hover:underline"
                    >
                      {order.items.length} items
                    </button>
                  </td>
                  <td className="p-4 font-bold">₹{order.totalAmount}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order._id, 'accepted')}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            title="Accept Order"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order._id, 'cancelled')}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            title="Cancel Order"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'preparing')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'ready')}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg"
                        >
                          Mark as Ready
                        </button>
                      )}
                      <button
                        onClick={() => printOrder(order)}
                        className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        title="Print Order"
                      >
                        <FaPrint />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold">Order Details</h3>
                <p className="text-gray-500">ID: {selectedOrder.orderId}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-bold mb-2">Customer Information</h4>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Table:</strong> {selectedOrder.tableNumber}</p>
                  <p><strong>Order Type:</strong> {selectedOrder.orderType}</p>
                  <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold mb-2">Order Status</h4>
                <div className="flex items-center space-x-4">
                  <span className={`px-4 py-2 rounded-full text-lg ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                  <span className="text-gray-500">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-bold mb-4">Order Items</h4>
              <div className="space-y-4">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      {item.spiceLevel && (
                        <p className="text-sm text-gray-600">
                          Spice: <span className="capitalize">{item.spiceLevel}</span>
                        </p>
                      )}
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-600">
                          Instructions: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{item.price * item.quantity}</p>
                      <p className="text-sm text-gray-600">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center border-t pt-4">
              <div>
                <p className="text-gray-600">Order Total</p>
                <p className="text-3xl font-bold">₹{selectedOrder.totalAmount}</p>
              </div>
              <button
                onClick={() => printOrder(selectedOrder)}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold flex items-center space-x-2"
              >
                <FaPrint />
                <span>Print Order</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;