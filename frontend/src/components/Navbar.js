import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaUtensils } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartAnimation, setCartAnimation] = useState(null);
  const [cartBounce, setCartBounce] = useState(false);
  const cart = useSelector(state => state.cart.items);
  const isAuthenticated = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const cartIconRef = useRef(null);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleCartAnimation = (e) => {
      setCartAnimation(e.detail);
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 600);
    };

    window.addEventListener('cartAnimation', handleCartAnimation);
    return () => window.removeEventListener('cartAnimation', handleCartAnimation);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/logo.svg" 
              alt="Happy Family Restaurant Logo" 
              className="h-10 w-10"
            />
            <span className="text-2xl font-bold text-gray-800">
             Happy <span className="text-primary">Family Restaurant</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <motion.div whileHover={{ y: -2 }}>
              <Link to="/" className="text-gray-700 hover:text-primary font-medium transition-colors">
                Home
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }}>
              <Link to="/menu" className="text-gray-700 hover:text-primary font-medium transition-colors">
                Menu
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }}>
              <Link to="/contact" className="text-gray-700 hover:text-primary font-medium transition-colors">
                Contact
              </Link>
            </motion.div>
            
            {isAuthenticated ? (
              <>
                <Link to="/admin" className="text-gray-700 hover:text-primary font-medium">
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary">
                    <FaUser />
                    <span>{user.name || 'Admin'}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <FaSignOutAlt />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-primary font-medium">
                Admin Login
              </Link>
            )}

            <Link to="/cart" className="relative">
              <motion.div
                ref={cartIconRef}
                animate={cartBounce ? {
                  scale: [1, 1.3, 1],
                  rotate: [0, -10, 10, 0]
                } : {}}
                transition={{ duration: 0.5 }}
              >
                <FaShoppingCart className="text-2xl text-gray-700 hover:text-primary transition-colors" />
              </motion.div>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>
            
            {/* Flying Cart Animation */}
            <AnimatePresence>
              {cartAnimation && (
                <motion.div
                  key="cart-fly"
                  initial={{
                    position: 'fixed',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: '#FF6B35',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    zIndex: 9999,
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: cartIconRef.current 
                      ? cartIconRef.current.getBoundingClientRect().left - window.innerWidth / 2 + 20
                      : window.innerWidth - 100,
                    y: cartIconRef.current 
                      ? cartIconRef.current.getBoundingClientRect().top - window.innerHeight / 2 - 20
                      : 20,
                    scale: [1, 0.8, 0.5, 0.3],
                    opacity: [1, 1, 0.8, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: 'easeInOut',
                  }}
                  onAnimationComplete={() => setCartAnimation(null)}
                >
                  {cartAnimation.image ? (
                    <img 
                      src={cartAnimation.image} 
                      alt={cartAnimation.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <FaShoppingCart className="text-white text-xl" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t"
          >
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link to="/menu" className="text-gray-700 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                Menu
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/admin" className="text-gray-700 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-primary"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-gray-700 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                  Admin Login
                </Link>
              )}
              <Link to="/cart" className="text-gray-700 hover:text-primary flex items-center" onClick={() => setIsMenuOpen(false)}>
                <FaShoppingCart className="mr-2" />
                Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;