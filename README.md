🍽️ Family Restaurant MERN Stack
https://img.shields.io/badge/MERN-Stack-green
https://img.shields.io/badge/React-18.2-blue
https://img.shields.io/badge/Node.js-22.0-green
https://img.shields.io/badge/License-MIT-yellow

A complete restaurant management system with customer-facing website and admin dashboard built with MERN stack (MongoDB, Express.js, React, Node.js).

✨ Features
👨‍🍳 Customer Website
Interactive Menu - Browse categorized items (Starters, Biryanis, Desserts, etc.)

Smart Cart - Add items with customization (spice levels, special instructions)

Live Ordering - Real-time order placement with instant order ID

Responsive Design - Mobile-first UI with Tailwind CSS

Contact System - Email notifications to admin

⚡ Admin Dashboard
Real-time Orders - Instant notifications with sound alerts

Menu Management - Full CRUD operations with image upload

Stock Control - Toggle item availability

Chef Profiles - Manage chef information

Analytics - Charts and statistics dashboard

Print Orders - Kitchen order tickets

🛠️ Tech Stack
Frontend:

React 18 + Redux Toolkit

Tailwind CSS + Framer Motion

Socket.io-client + Chart.js

React Hot Toast + React Icons

Backend:

Node.js + Express.js

MongoDB + Mongoose

JWT Authentication

Multer (File upload)

Socket.io (Real-time)

Nodemailer (Email)

🚀 Quick Start
Prerequisites
Node.js (v14+)

MongoDB (Local or Atlas)

npm or yarn

Installation
Clone Repository

bash
git clone https://github.com/yourusername/family-restaurant-mern.git
cd family-restaurant-mern
Backend Setup

bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm start
Frontend Setup

bash
cd frontend
npm install
npm start
Create Admin User

bash
# Using Postman or curl:
POST https://happyfamilyrestaurant4.onrender.com/api/auth/register
{
  "name": "Admin",
  "email": "admin@restaurant.com",
  "password": "yourpassword"
}
📁 Project Structure
text
family-restaurant-mern/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth middleware
│   ├── uploads/         # Uploaded images
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── redux/       # State management
│   │   └── utils/       # Helper functions
│   └── public/          # Static assets
└── README.md
🔐 API Endpoints
Method	Endpoint	Description
POST	/api/auth/register	Register admin
POST	/api/auth/login	Login
GET	/api/menu	Get all menu items
POST	/api/orders	Place order
GET	/api/orders	Get all orders (Admin)
POST	/api/contact	Submit contact form
🌐 Live Demo
Frontend: https://happy-family-restaurant.vercel.app/
Backend API: https://happyfamilyrestaurant4.onrender.com
Admin Login: admin@restaurant.com / yourpassword

📸 Screenshots
https://screenshots/home.png
https://screenshots/menu.png
https://screenshots/admin.png

🔧 Environment Variables
Backend (.env):

env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/family-restaurant
JWT_SECRET=your_super_secret_key
NODE_ENV=development
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
🤝 Contributing
Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit changes (git commit -m 'Add AmazingFeature')

Push to branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
Distributed under MIT License. See LICENSE for more information.

👥 Authors
Your Name - GitHub

🙏 Acknowledgments
React.js Community

Tailwind CSS Team

MongoDB Documentation

All open-source contributors

⭐ Star this repo if you find it useful!