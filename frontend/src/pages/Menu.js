import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../utils/config';
import { useSearchParams } from 'react-router-dom';
import MenuItemCard from '../components/MenuItemCard';
import { FaFilter, FaSearch } from 'react-icons/fa';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();

    // Check for category in URL params
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    filterItems();
  }, [selectedCategory, searchTerm, menuItems]);

  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu`);
      const data = await response.json();
      setMenuItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu/categories/all`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterItems = () => {
    let filtered = menuItems;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const categoryNames = {
    'starters': 'Starters',
    'biryanis': 'Biryanis',
    'main-course': 'Main Course',
    'soft-drinks': 'Soft Drinks',
    'specials': 'Specials'
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">Our Menu</h1>
          <p className="text-gray-600 text-lg">Delicious dishes crafted with love</p>
        </motion.div>

        {/* Filters and Search */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-grow max-w-md">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                placeholder="Search dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-4">
              <FaFilter className="text-gray-600" />
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchParams({});
                  }}
                  className={`px-4 py-2 rounded-full transition-all ${selectedCategory === 'all' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  All
                </motion.button>
                {categories.map(category => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSearchParams({ category });
                    }}
                    className={`px-4 py-2 rounded-full capitalize transition-all ${selectedCategory === category ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {categoryNames[category] || category}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Menu Items Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredItems.length} of {menuItems.length} items
              </p>
            </div>

            {/* Menu Items Grid */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-2xl font-bold mb-4">No items found</h3>
                <p className="text-gray-600">Try a different search or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <MenuItemCard item={item} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Category Sections */}
        {!isLoading && selectedCategory === 'all' && (
          <div className="mt-16">
            {categories.map(category => {
              const categoryItems = menuItems.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category} className="mb-12">
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="text-3xl font-bold mb-6 capitalize border-b pb-2"
                  >
                    {categoryNames[category] || category}
                  </motion.h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryItems.slice(0, 6).map((item, idx) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <MenuItemCard item={item} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;