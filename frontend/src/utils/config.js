// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://happyfamilyrestaurant.onrender.com';

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If imagePath already includes http, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise, prepend the API base URL
  return `${API_BASE_URL}${imagePath}`;
};

