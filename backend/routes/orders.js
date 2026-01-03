const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');  // Fix: Destructure auth

// Create new order
router.post('/', async (req, res) => {
  try {
    const { customerName, tableNumber, items, paymentMethod, orderType } = req.body;
    
    let totalAmount = 0;
    const orderItems = [];
    
    // Calculate total and prepare items
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.itemId);
      if (!menuItem) {
        return res.status(404).json({ error: `Item ${item.itemId} not found` });
      }
      
      if (!menuItem.available) {
        return res.status(400).json({ error: `${menuItem.name} is out of stock` });
      }
      
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        itemId: item.itemId,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions,
        spiceLevel: item.spiceLevel
      });
    }
    
    const order = new Order({
      orderId: `ORD-${uuidv4().slice(0, 8).toUpperCase()}`,
      customerName,
      tableNumber,
      items: orderItems,
      totalAmount,
      paymentMethod,
      orderType
    });
    
    await order.save();
    
    // Emit socket event for real-time update
    if (req.io) {
      req.io.emit('new-order', order);
    }
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (protected - needs auth)
router.get('/', auth, async (req, res) => {
  try {
    const { today } = req.query;
    
    let query = {};
    if (today === 'true') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      query = { createdAt: { $gte: todayStart, $lte: todayEnd } };
    }
    
    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(100);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (protected - needs auth)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    order.status = status;
    
    if (status === 'accepted') {
      order.acceptedAt = new Date();
    } else if (status === 'served') {
      order.completedAt = new Date();
    }
    
    await order.save();
    
    // Emit socket event for status update
    if (req.io) {
      req.io.emit('order-updated', order);
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get hourly chart data for today (protected - needs auth)
// This route must come before /stats to avoid route matching issues
router.get('/stats/chart', auth, async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    // Get all today's orders
    const todayOrders = await Order.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      status: { $ne: 'cancelled' }
    });
    
    // Initialize hourly data arrays (24 hours)
    const hourlyOrders = new Array(24).fill(0);
    const hourlyRevenue = new Array(24).fill(0);
    
    // Process each order
    todayOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyOrders[hour]++;
      hourlyRevenue[hour] += order.totalAmount;
    });
    
    // Generate labels for hours
    const labels = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      return `${hour}:00`;
    });
    
    res.json({
      labels,
      orders: hourlyOrders,
      revenue: hourlyRevenue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order statistics (protected - needs auth) - Today's data only
router.get('/stats', auth, async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    // Today's orders count
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });
    
    // Today's pending orders
    const todayPendingOrders = await Order.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      status: 'pending'
    });
    
    // Today's revenue
    const todayRevenue = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: todayStart, $lte: todayEnd },
          status: { $ne: 'cancelled' } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    res.json({
      totalOrders: todayOrders,
      pendingOrders: todayPendingOrders,
      todayOrders: todayOrders,
      totalRevenue: todayRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;