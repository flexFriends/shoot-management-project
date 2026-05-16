import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import Sidebar from '../components/layout/Sidebar.jsx';
import ManagerDashboard from './ManagerDashboard.jsx';
import EmployeeDashboard from './EmployeeDashboard.jsx';
import HRDashboard from './HRDashboard.jsx';

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
  const isHR = user.role === 'HR';

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      {/* FIX: Set margin-left to 0 on mobile, and 64 on desktop. Add top padding on mobile for the header. */}
      <main className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0 overflow-auto transition-all duration-300">
        {isManager && <ManagerDashboard />}
        {isEmployee && <EmployeeDashboard />}
        {isHR && <HRDashboard />}
      </main>
    </div>
  );
}