import React from 'react';
import { useAuth } from '../utils/auth';
import Dashboard from '../components/dashboard/DashBoard';
import UserProfile from '../components/dashboard/UserProfile';

const DashboardPage = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="alert alert-error">
        Debes iniciar sesión para acceder al dashboard.
      </div>
    );
  }

  return (
    <div>
      <Dashboard />
      <UserProfile />
    </div>
  );
};

export default DashboardPage;