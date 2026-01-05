import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaShoppingCart, FaUtensils, FaUsers, FaChartLine, 
  FaMoneyBill, FaClock, FaStar, FaExclamationTriangle, FaBell,
  FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import { socket } from '../../App';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    menuItems: 0,
    availableItems: 0,
    chefs: 0,
    messages: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const audioRef = useRef(null);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch orders stats
      const ordersResponse = await fetch('https://happyfamilyrestaurant4.onrender.com/api/orders/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ordersStats = ordersResponse.ok ? await ordersResponse.json() : {};
      
      // Fetch menu stats
      const menuResponse = await fetch('https://happyfamilyrestaurant4.onrender.com/api/menu/stats/count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const menuStats = menuResponse.ok ? await menuResponse.json() : {};
      
      // Fetch chefs count
      const chefsResponse = await fetch('https://happyfamilyrestaurant4.onrender.com/api/chefs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const chefs = chefsResponse.ok ? await chefsResponse.json() : [];
      
      // Fetch contact messages stats
      const contactResponse = await fetch('https://happyfamilyrestaurant4.onrender.com/api/contact/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const contactStats = contactResponse.ok ? await contactResponse.json() : {};
      
      setStats({
        totalOrders: ordersStats.totalOrders || 0,
        pendingOrders: ordersStats.pendingOrders || 0,
        todayOrders: ordersStats.todayOrders || 0,
        totalRevenue: ordersStats.totalRevenue || 0,
        menuItems: menuStats.totalItems || 0,
        availableItems: menuStats.availableItems || 0,
        chefs: chefs.length || 0,
        messages: contactStats.unreadMessages || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://happyfamilyrestaurant4.onrender.com/api/orders?today=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Get only the 5 most recent orders
        setRecentOrders(data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };


  useEffect(() => {
    // Fetch dashboard stats
    fetchDashboardStats();
    fetchRecentOrders();
    
    // Request notification permission on mount
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Socket event listeners for real-time order notifications
    socket.on('new-order', (order) => {
      // Show toast notification
      toast.custom((t) => (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg shadow-2xl max-w-md border-2 border-green-300 cursor-pointer"
          onClick={() => window.location.href = '/admin/orders'}
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
              <p className="text-xs mt-1 opacity-90">Click to view →</p>
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
      
      // Refresh stats
      fetchDashboardStats();
      fetchRecentOrders();
    });
    
    return () => {
      socket.off('new-order');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statCards = [
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: <FaShoppingCart />,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      link: '/admin/orders',
      trend: '+12%'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <FaClock />,
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-50',
      iconBg: 'bg-yellow-500',
      link: '/admin/orders',
      trend: null
    },
    {
      title: "Today's Revenue",
      value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: <FaMoneyBill />,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      iconBg: 'bg-green-500',
      link: '/admin/orders',
      trend: '+8%'
    },
    {
      title: 'Menu Items',
      value: stats.menuItems,
      icon: <FaUtensils />,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
      link: '/admin/menu',
      trend: null
    },
    {
      title: 'Available Items',
      value: stats.availableItems,
      icon: <FaStar />,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-emerald-500',
      link: '/admin/menu',
      trend: null
    },
    {
      title: 'Out of Stock',
      value: stats.menuItems - stats.availableItems,
      icon: <FaExclamationTriangle />,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      iconBg: 'bg-red-500',
      link: '/admin/menu',
      trend: null
    },
    {
      title: 'Active Chefs',
      value: stats.chefs,
      icon: <FaUsers />,
      gradient: 'from-indigo-500 to-indigo-600',
      bgGradient: 'from-indigo-50 to-indigo-100',
      iconBg: 'bg-indigo-500',
      link: '/admin/chefs',
      trend: null
    },
    {
      title: 'New Messages',
      value: stats.messages,
      icon: <FaChartLine />,
      gradient: 'from-pink-500 to-rose-600',
      bgGradient: 'from-pink-50 to-rose-50',
      iconBg: 'bg-pink-500',
      link: '/admin/contact',
      trend: stats.messages > 0 ? `+${stats.messages}` : null
    }
  ];


  return (
    <div className="p-6">
      {/* Hidden audio element for beep sound */}
      <audio ref={audioRef} src="/beep.mp3" preload="auto" />
      
      {/* Browser Notification Permission Request */}
      {Notification.permission === 'default' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-blue-100 border border-blue-400 rounded-lg"
        >
          <p className="text-blue-800 flex items-center gap-2">
            <FaBell className="text-blue-600" />
            Enable browser notifications to get real-time order alerts?
            <button
              onClick={() => Notification.requestPermission()}
              className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Enable
            </button>
          </p>
        </motion.div>
      )}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Today's Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today - {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats Grid - Beautiful Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <Link to={stat.link}>
              <div className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20`}>
                {/* Decorative gradient overlay */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -mr-16 -mt-16`}></div>
                
                <div className="relative p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                      <h3 className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</h3>
                      {stat.trend && (
                        <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                          <FaArrowUp className="text-xs" />
                          <span>{stat.trend}</span>
                        </div>
                      )}
                    </div>
                    <div className={`p-4 ${stat.iconBg} text-white rounded-xl shadow-lg transform rotate-3 hover:rotate-6 transition-transform`}>
                      <div className="text-2xl">
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom accent line */}
                  <div className={`h-1 bg-gradient-to-r ${stat.gradient} rounded-full mt-4`}></div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders - Full Width */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-primary to-orange-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Recent Orders Today</h3>
              <Link 
                to="/admin/orders" 
                className="text-white hover:text-gray-100 font-semibold flex items-center gap-2 transition-colors"
              >
                View All
                <FaArrowUp className="rotate-45" />
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all border border-gray-100 hover:border-primary/20"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'ready' ? 'bg-green-100 text-green-700' :
                        order.status === 'served' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        <FaShoppingCart />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{order.orderId}</p>
                        <p className="text-sm text-gray-600">{order.customerName} • Table {order.tableNumber}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-800">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</p>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'ready' ? 'bg-green-100 text-green-800' :
                        order.status === 'served' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaShoppingCart className="text-3xl text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No orders today yet</p>
                <p className="text-gray-400 text-sm mt-2">Orders will appear here when customers place them</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/menu?add=true"
            className="bg-primary text-white p-4 rounded-lg text-center hover:bg-orange-600 transition-colors"
          >
            Add New Menu Item
          </Link>
          <Link
            to="/admin/chefs?add=true"
            className="bg-dark text-white p-4 rounded-lg text-center hover:bg-gray-800 transition-colors"
          >
            Add New Chef
          </Link>
          <Link
            to="/admin/orders"
            className="bg-green-500 text-white p-4 rounded-lg text-center hover:bg-green-600 transition-colors"
          >
            Manage Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;