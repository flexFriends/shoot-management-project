import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import Sidebar from '../components/layout/Sidebar.jsx';
import ManagerDashboard from './ManagerDashboard.jsx';
import EmployeeDashboard from './EmployeeDashboard.jsx';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Route based on user role
  const isManager = user.role === 'MANAGER' || user.role === 'ADMIN';
  const isEmployee = user.role === 'EMPLOYEE';

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 overflow-auto">
        {isManager && <ManagerDashboard />}
        {isEmployee && <EmployeeDashboard />}
      </main>
    </div>
  );
}
