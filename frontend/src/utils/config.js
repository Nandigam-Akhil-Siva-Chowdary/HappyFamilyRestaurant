// API Configuration
export const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://happyfamilyrestaurant1.onrender.com";

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If imagePath is already a full URL (from Cloudinary or otherwise)
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // For backward compatibility with local paths
  if (imagePath.startsWith("/uploads/")) {
    return `${API_BASE_URL}${imagePath}`;
  }

  // Default to returning as-is
  return imagePath;
};
