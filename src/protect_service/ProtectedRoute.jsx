import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './authContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Или любой другой индикатор загрузки
  }

  if (!user) {
    console.log(user)
    return <Navigate to="/" />;
  }

  if (requiredRole && (!user.roles || !user.roles.includes(requiredRole))) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
