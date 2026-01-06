const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['starters', 'biryanis', 'main-course', 'soft-drinks', 'specials']
  },
  image: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  available: {
    type: Boolean,
    default: true
  },
  spicyLevel: {
    type: String,
    enum: ['mild', 'medium', 'spicy', 'extra-spicy'],
    default: 'medium'
  },
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);