import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import toast from 'react-hot-toast';

export default function Sidebar({ onNavigate }) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const isActive = (path) => location.pathname === path;

  const menuItemClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
      isActive(path)
        ? 'bg-indigo-600 text-white shadow-lg'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">📽️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Shoot</h1>
            <p className="text-xs text-gray-600">Studio Management</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">Logged in as</p>
        <p className="font-semibold text-gray-900">{user?.name}</p>
        <p className="text-xs text-indigo-600 font-medium mt-1">
          {isManager ? '👔 Manager' : '👤 Employee'}
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Dashboard */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2">Main</p>
          <Link to="/dashboard" className={menuItemClass('/dashboard')}>
            <span className="text-lg">📊</span>
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Manager-Only Menu */}
        {isManager && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2 mt-4">Manager</p>
            <Link to="/workspaces" className={menuItemClass('/workspaces')}>
              <span className="text-lg">🏢</span>
              <span>Workspaces</span>
            </Link>
            <Link to="/workspaces/create" className={menuItemClass('/workspaces/create')}>
              <span className="text-lg">➕</span>
              <span>New Workspace</span>
            </Link>
            <Link to="/tasks" className={menuItemClass('/tasks')}>
              <span className="text-lg">✅</span>
              <span>All Tasks</span>
            </Link>
          </div>
        )}

        {/* Employee-Only Menu */}
        {isEmployee && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2 mt-4">Work</p>
            <Link to="/workspaces" className={menuItemClass('/workspaces')}>
              <span className="text-lg">🏢</span>
              <span>My Workspaces</span>
            </Link>
            <Link to="/tasks" className={menuItemClass('/tasks')}>
              <span className="text-lg">📝</span>
              <span>My Tasks</span>
            </Link>
          </div>
        )}

        {/* Common Menu */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2 mt-4">Other</p>
          <Link to="/profile" className={menuItemClass('/profile')}>
            <span className="text-lg">⚙️</span>
            <span>Profile</span>
          </Link>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
