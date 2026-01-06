import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaClock, FaLeaf, FaStar, FaUtensils, FaArrowRight, FaHamburger, FaIceCream, FaGlassMartini, FaFire } from "react-icons/fa";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});

  useEffect(() => {
    fetchCategories();
    fetchCategoryCounts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://happyfamilyrestaurant4.onrender.com/api/menu/categories/all');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCategoryCounts = async () => {
    try {
      const response = await fetch('https://happyfamilyrestaurant4.onrender.com/api/menu');
      const data = await response.json();
      const counts = {};
      data.forEach(item => {
        counts[item.category] = (counts[item.category] || 0) + 1;
      });
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  };

  const categoryIcons = {
    'starters': <FaHamburger />,
    'biryanis': <FaFire />,
    'main-course': <FaUtensils />,
    'soft-drinks': <FaGlassMartini />,
    'specials': <FaStar />
  };

  const categoryNames = {
    'starters': 'Starters',
    'biryanis': 'Biryanis',
    'main-course': 'Main Course',
    'soft-drinks': 'Soft Drinks',
    'specials': 'Specials'
  };

  const categoryColors = {
    'starters': 'bg-gradient-to-br from-amber-600 to-yellow-800',
    'biryanis': 'bg-gradient-to-br from-red-500 to-red-700',
    'main-course': 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    'soft-drinks': 'bg-gradient-to-br from-blue-400 to-blue-600',
    'specials': 'bg-gradient-to-br from-purple-400 to-purple-600'
  };

  const features = [
    { icon: <FaClock />, title: 'Fast Service', desc: 'Quick preparation' },
    { icon: <FaLeaf />, title: 'Fresh Ingredients', desc: '100% organic' },
    { icon: <FaStar />, title: 'Best Quality', desc: '5-star rated' },
    { icon: <FaUtensils />, title: 'Dine-In Available', desc: 'Comfortable seating' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-dark text-white overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Happy <span className="text-secondary">Family restaurant</span>
            </h1>
            <p className="text-xl mb-8">
              Experience authentic homemade flavors crafted with love by our family chefs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/menu"
                  className="bg-white text-primary px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  View Menu <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><FaArrowRight /></motion.span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/contact"
                  className="border-2 border-white text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white hover:text-primary transition-all shadow-lg"
                >
                  Contact Us
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-64 h-64 bg-secondary rounded-full -mr-32 -mb-32 opacity-20"
        />
      </section>

      {/* Features Section */}
      <section className="py-16 bg-light">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white p-6 rounded-2xl shadow-lg text-center"
              >
                <div className="text-4xl text-primary mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold">Our Categories</h2>
            <Link to="/menu" className="text-primary font-bold hover:underline flex items-center gap-2">
              View All <FaArrowRight />
            </Link>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading categories...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category, index) => (
                <Link key={category} to={`/menu?category=${encodeURIComponent(category)}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`${categoryColors[category] || 'bg-gradient-to-br from-gray-400 to-gray-600'} p-6 rounded-2xl shadow-lg text-center text-white cursor-pointer hover:shadow-xl transition-shadow`}
                  >
                    <div className="text-4xl mb-3 flex justify-center">
                      {categoryIcons[category] || <FaUtensils />}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{categoryNames[category] || category}</h3>
                    <p className="text-white/90 text-sm">{categoryCounts[category] || 0} items</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl font-bold mb-6"
          >
            Ready to Order?
          </motion.h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Browse our menu and place your order online. We'll have it ready for you!
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/menu"
              className="inline-block bg-primary text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-dark transition-all shadow-xl"
            >
              Order Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;