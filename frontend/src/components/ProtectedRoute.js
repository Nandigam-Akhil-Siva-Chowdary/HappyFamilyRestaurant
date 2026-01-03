import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const isAuth = localStorage.getItem('token');
  
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;