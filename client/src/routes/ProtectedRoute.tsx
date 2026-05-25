import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { DashboardLayout } from '../layouts/DashboardLayout';

interface RouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, user, loadProfile, isLoading } = useAuthStore();

  useEffect(() => {
    // Re-verify and load profile in background if token exists but user object is empty
    if (isAuthenticated && !user) {
      loadProfile();
    }
  }, [isAuthenticated, user, loadProfile]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render within standard page shell once auth checks complete
  return <DashboardLayout>{children}</DashboardLayout>;
};

export const AdminRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, user, loadProfile } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      loadProfile();
    }
  }, [isAuthenticated, user, loadProfile]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role !== 'admin') {
    // Redirect standard student away from administrative dashboards
    return <Navigate to="/" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};
