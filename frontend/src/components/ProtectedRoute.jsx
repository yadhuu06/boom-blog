import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAdmin = false }) => {
  const { token, user } = useSelector((state) => state.auth);
  if (!token) {
    return <Navigate to="/login" />;
  }
  if (isAdmin && !user?.is_admin) {
    return <Navigate to="/" />;
  }
  return children;
};

export default ProtectedRoute;