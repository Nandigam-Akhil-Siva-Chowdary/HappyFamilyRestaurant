import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaStar, FaUtensils } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { getImageUrl } from '../../utils/config';

const AdminChefs = () => {
  const [chefs, setChefs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChef, setEditingChef] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchChefs();

    // Check if we should auto-open the modal from URL parameter
    if (searchParams.get('add') === 'true') {
      setShowModal(true);
      // Remove the parameter from URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const fetchChefs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://happyfamilyrestaurant.onrender.com/api/chefs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setChefs(data);
    } catch (error) {
      toast.error('Failed to fetch chefs');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChef = async (chefId) => {
    if (!window.confirm('Are you sure you want to delete this chef?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://happyfamilyrestaurant.onrender.com/api/chefs/${chefId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Chef deleted successfully');
        fetchChefs();
      }
    } catch (error) {
      toast.error('Failed to delete chef');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Chef Management</h1>
          <p className="text-gray-600">Manage your restaurant's chefs</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-dark"
        >
          <FaPlus />
          Add New Chef
        </button>
      </div>

      {/* Chefs Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      ) : chefs.length === 0 ? (
        <div className="text-center py-12">
          <FaUtensils className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">No Chefs Found</h3>
          <p className="text-gray-600 mb-6">Add your first chef to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold"
          >
            Add First Chef
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chefs.map((chef, index) => (
            <motion.div
              key={chef._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="relative">
                <img
                  src={getImageUrl(chef.image) || '/api/placeholder/400/300'}
                  alt={chef.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-500" />
                    <span className="font-bold">{chef.rating.toFixed(1)}</span>
                  </div>
                </div>
                {!chef.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">On Leave</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{chef.name}</h3>
                    <p className="text-primary font-medium">{chef.specialty}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingChef(chef);
                        setShowModal(true);
                      }}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteChef(chef._id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{chef.bio}</p>

                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 bg-gray-100 rounded-full">
                    {chef.experience} years experience
                  </span>
                  <span className={`px-3 py-1 rounded-full ${chef.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {chef.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <ChefModal
          chef={editingChef}
          onClose={() => {
            setShowModal(false);
            setEditingChef(null);
          }}
          onSuccess={() => {
            fetchChefs();
            setShowModal(false);
            setEditingChef(null);
          }}
        />
      )}
    </div>
  );
};

// Chef Modal Component
const ChefModal = ({ chef, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: chef?.name || '',
    specialty: chef?.specialty || '',
    experience: chef?.experience || 1,
    bio: chef?.bio || '',
    rating: chef?.rating || 4.5,
    available: chef?.available ?? true,
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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
      const url = chef
        ? `https://happyfamilyrestaurant.onrender.com/api/chefs/${chef._id}`
        : 'https://happyfamilyrestaurant.onrender.com/api/chefs';

      const method = chef ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        toast.success(`Chef ${chef ? 'updated' : 'added'} successfully`);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {chef ? 'Edit Chef' : 'Add New Chef'}
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
              <label className="block mb-2 font-medium">Chef Name *</label>
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
              <label className="block mb-2 font-medium">Specialty *</label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                placeholder="e.g., Italian Cuisine, Pastry Chef"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">Experience (Years) *</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                min="0"
                max="50"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Rating (1-5)</label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                min="0"
                max="5"
                step="0.1"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Bio / Description</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 border rounded-lg"
              placeholder="Tell us about the chef's background, achievements, and style..."
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Chef Photo</label>
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              className="w-full p-3 border rounded-lg"
              accept="image/*"
            />
            {chef?.image && !formData.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Current Photo:</p>
                <img
                  src={getImageUrl(chef.image)}
                  alt="Current"
                  className="w-32 h-32 object-cover rounded mt-2"
                />
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="available"
              name="available"
              checked={formData.available}
              onChange={handleChange}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <label htmlFor="available" className="ml-2">
              Chef is currently available
            </label>
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
              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-dark disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : chef ? 'Update Chef' : 'Add Chef'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminChefs;