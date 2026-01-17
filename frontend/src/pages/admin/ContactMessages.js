import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaUser, FaTrash, FaCheck, FaClock, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = filter === 'all' 
        ? 'https://happyfamilyrestaurant.onrender.com/api/contact'
        : `https://happyfamilyrestaurant.onrender.com/api/contact?read=${filter === 'read'}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        toast.error('Failed to fetch messages');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://happyfamilyrestaurant.onrender.com/api/contact/${messageId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Message marked as read');
        fetchMessages();
        if (selectedMessage && selectedMessage._id === messageId) {
          setSelectedMessage({ ...selectedMessage, read: true });
        }
      }
    } catch (error) {
      toast.error('Failed to update message');
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://happyfamilyrestaurant.onrender.com/api/contact/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Message deleted successfully');
        fetchMessages();
        if (selectedMessage && selectedMessage._id === messageId) {
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <p className="text-gray-600">Manage customer inquiries and feedback</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
            <FaFilter className="text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border-none outline-none bg-transparent"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread ({unreadCount})</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <FaEnvelope className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">No Messages Found</h3>
                <p className="text-gray-600">
                  {filter === 'unread' 
                    ? 'All messages have been read!' 
                    : filter === 'read'
                    ? 'No read messages yet'
                    : 'No contact messages yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {messages.map((message, index) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedMessage(message)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !message.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    } ${selectedMessage?._id === message._id ? 'bg-primary/10' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{message.name}</h3>
                          {!message.read && (
                            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                          <FaEnvelope className="text-xs" />
                          {message.email}
                        </p>
                        {message.phone && (
                          <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                            <FaPhone className="text-xs" />
                            {message.phone}
                          </p>
                        )}
                        <p className="text-gray-800 line-clamp-2">{message.message}</p>
                        <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                          <FaClock className="text-xs" />
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {!message.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(message._id);
                            }}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                            title="Mark as read"
                          >
                            <FaCheck />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMessage(message._id);
                          }}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          title="Delete message"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-1">
          {selectedMessage ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 sticky top-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{selectedMessage.name}</h2>
                    {!selectedMessage.read && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                        Unread
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 flex items-center gap-2 mb-1">
                    <FaEnvelope className="text-sm" />
                    {selectedMessage.email}
                  </p>
                  {selectedMessage.phone && (
                    <p className="text-gray-600 flex items-center gap-2 mb-1">
                      <FaPhone className="text-sm" />
                      {selectedMessage.phone}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm flex items-center gap-2">
                    <FaClock className="text-xs" />
                    {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold mb-2">Message:</h3>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="flex gap-2 mt-6">
                {!selectedMessage.read && (
                  <button
                    onClick={() => markAsRead(selectedMessage._id)}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <FaCheck />
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => deleteMessage(selectedMessage._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                >
                  <FaTrash />
                  Delete
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <FaEnvelope className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContactMessages;

