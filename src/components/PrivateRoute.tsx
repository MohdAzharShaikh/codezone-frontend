// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext'; // NEW: Import useAppContext

// A component that checks if user is logged in
const PrivateRoute: React.FC = () => {
  const { isLoggedIn } = useAppContext(); // Get login status from context

  // If user is logged in, render the child routes/components
  // Otherwise, redirect to the login page
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;