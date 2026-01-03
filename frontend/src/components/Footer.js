import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Happy Family Restaurant</h3>
            <p className="text-gray-300 mb-4">
              Serving delicious homemade food since 2010. Experience the taste of tradition.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary">
                <FaTwitter size={20} />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-bold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaPhone className="text-primary" />
                <span>+91 9949177958</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-primary" />
                <span>Karempudi road, near Chandra shopping mall, Vinukonda.</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaClock className="text-primary" />
                <span>10:00 AM - 11:00 PM Daily</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/menu" className="text-gray-300 hover:text-primary">Menu</a></li>
              <li><a href="/#about" className="text-gray-300 hover:text-primary">About Us</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-primary">Contact</a></li>
              <li><a href="/#chefs" className="text-gray-300 hover:text-primary">Our Chefs</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xl font-bold mb-4">Stay Updated</h4>
            <p className="text-gray-300 mb-4">Subscribe to our newsletter for updates.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-grow px-4 py-2 rounded-l-lg text-gray-900 focus:outline-none"
              />
              <button className="bg-primary px-4 py-2 rounded-r-lg font-semibold hover:bg-orange-600">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            &copy; {new Date().getFullYear()} Happy Family Restaurant. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;