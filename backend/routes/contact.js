const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { auth, isAdmin } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Name, email, and message are required fields' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }
    
    // Check if mongoose is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. Connection state:', mongoose.connection.readyState);
      return res.status(503).json({ 
        error: 'Database connection not available. Please try again later.' 
      });
    }
    
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      message: message.trim()
    });
    
    await contact.save();
    
    // Try to send email notification to admin (optional - don't fail if email isn't configured)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        
        const mailOptions = {
          to: process.env.EMAIL_USER,
          from: email,
          subject: 'New Contact Form Submission',
          html: `
            <h1>New Contact Form Submission</h1>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <hr>
            <p>Submitted on: ${new Date().toLocaleString()}</p>
          `
        };
        
        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error('Email sending failed (message still saved):', emailError.message);
      }
    }
    
    res.status(201).json({ 
      message: 'Thank you for your message! We will get back to you soon.' 
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    // More detailed error response for debugging
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    res.status(500).json({ 
      error: error.message || 'Failed to save contact message. Please try again later.' 
    });
  }
});

// Get all contact messages (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const { read } = req.query;
    let filter = {};
    
    if (read !== undefined) {
      filter.read = read === 'true';
    }
    
    const messages = await Contact.find(filter).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read (admin only)
router.patch('/:id/read', auth, isAdmin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    
    if (!contact) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete message (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contact messages stats (admin only)
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const totalMessages = await Contact.countDocuments();
    const unreadMessages = await Contact.countDocuments({ read: false });
    const readMessages = await Contact.countDocuments({ read: true });
    
    res.json({
      totalMessages,
      unreadMessages,
      readMessages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;