import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { getImageUrl } from '../../utils/config';

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchMenuItems();
    
    // Check if we should auto-open the modal from URL parameter
    if (searchParams.get('add') === 'true') {
      setShowModal(true);
      // Remove the parameter from URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/menu', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      toast.error('Failed to fetch menu items');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvailability = async (itemId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/menu/${itemId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ available: !currentStatus })
      });

      if (response.ok) {
        toast.success(`Item ${!currentStatus ? 'made available' : 'marked as out of stock'}`);
        fetchMenuItems();
      }
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const deleteMenuItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Menu item deleted successfully');
        fetchMenuItems();
      }
    } catch (error) {
      toast.error('Failed to delete menu item');
    }
  };

  const categories = [
    { value: 'starters', label: 'Starters' },
    { value: 'biryanis', label: 'Biryanis' },
    { value: 'main-course', label: 'Main Course' },
    { value: 'desserts', label: 'Desserts' },
    { value: 'soft-drinks', label: 'Soft Drinks' },
    { value: 'specials', label: 'Specials' }
  ];

  const categoryStats = {};
  menuItems.forEach(item => {
    if (!categoryStats[item.category]) {
      categoryStats[item.category] = { total: 0, available: 0 };
    }
    categoryStats[item.category].total++;
    if (item.available) categoryStats[item.category].available++;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-gray-600">Manage your restaurant's menu items</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-orange-600"
        >
          <FaPlus />
          Add New Item
        </button>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {categories.map(category => {
          const stats = categoryStats[category.value] || { total: 0, available: 0 };
          return (
            <div key={category.value} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold mb-2">{category.label}</h3>
              <div className="flex justify-between">
                <span className="text-gray-600">Total: {stats.total}</span>
                <span className="text-green-600">✓ {stats.available}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Menu Items Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Image</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : menuItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No menu items found. Add your first item!
                  </td>
                </tr>
              ) : (
                menuItems.map((item, index) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <img
                        src={getImageUrl(item.image) || '/api/placeholder/100/100'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm text-gray-600 truncate max-w-xs">{item.description}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-sm capitalize">
                        {item.category.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-bold">₹{item.price}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleAvailability(item._id, item.available)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                          item.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.available ? <FaToggleOn /> : <FaToggleOff />}
                        {item.available ? 'Available' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setShowModal(true);
                          }}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteMenuItem(item._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <MenuModal
          item={editingItem}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            fetchMenuItems();
            setShowModal(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

// Menu Modal Component
const MenuModal = ({ item, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    category: item?.category || 'starters',
    spicyLevel: item?.spicyLevel || 'medium',
    preparationTime: item?.preparationTime || 15,
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'image' && formData[key]) {
        formDataToSend.append('image', formData[key]);
      } else if (key !== 'image') {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const token = localStorage.getItem('token');
      const url = item
        ? `http://localhost:5000/api/menu/${item._id}`
        : 'http://localhost:5000/api/menu';
      
      const method = item ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        toast.success(`Menu item ${item ? 'updated' : 'added'} successfully`);
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Operation failed');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'starters', label: 'Starters' },
    { value: 'biryanis', label: 'Biryanis' },
    { value: 'main-course', label: 'Main Course' },
    { value: 'desserts', label: 'Desserts' },
    { value: 'soft-drinks', label: 'Soft Drinks' },
    { value: 'specials', label: 'Specials' }
  ];

  const spiceLevels = [
    { value: 'mild', label: 'Mild' },
    { value: 'medium', label: 'Medium' },
    { value: 'spicy', label: 'Spicy' },
    { value: 'extra-spicy', label: 'Extra Spicy' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {item ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">Item Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 font-medium">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Spice Level</label>
              <select
                name="spicyLevel"
                value={formData.spicyLevel}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                {spiceLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Prep Time (mins)</label>
              <input
                type="number"
                name="preparationTime"
                value={formData.preparationTime}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Item Image</label>
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              className="w-full p-3 border rounded-lg"
              accept="image/*"
            />
            {item?.image && !formData.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Current Image:</p>
                <img
                  src={getImageUrl(item.image)}
                  alt="Current"
                  className="w-32 h-32 object-cover rounded mt-2"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminMenu;