import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import toast from 'react-hot-toast';

export default function Sidebar({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const menuItemClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
      isActive(path)
        ? 'bg-indigo-600 text-white shadow-lg'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">📽️</span>
          </div>
          <span className="text-lg font-bold text-gray-900">Shoot</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none text-2xl"
          aria-label="Toggle Menu"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Backdrop Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Main Sidebar Drawer */}
      <div className={`
        fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        
        {/* Logo/Brand Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📽️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Shoot</h1>
              <p className="text-xs text-gray-600">Studio Management</p>
            </div>
          </div>
          {/* Close button inside sidebar for mobile ease-of-use */}
          <button onClick={closeSidebar} className="md:hidden text-gray-500 text-xl hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">Logged in as</p>
          <p className="font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
          <p className="text-xs text-indigo-600 font-medium mt-1">
            {isManager ? '👔 Manager' : '👤 Employee'}
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Dashboard */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2">Main</p>
            <Link to="/dashboard" className={menuItemClass('/dashboard')} onClick={closeSidebar}>
              <span className="text-lg">📊</span>
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Manager-Only Menu */}
          {isManager && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2 mt-4">Manager</p>
              <Link to="/workspaces" className={menuItemClass('/workspaces')} onClick={closeSidebar}>
                <span className="text-lg">🏢</span>
                <span>Shoots</span>
              </Link>
              <Link to="/workspaces/create" className={menuItemClass('/workspaces/create')} onClick={closeSidebar}>
                <span className="text-lg">➕</span>
                <span>New Shoot</span>
              </Link>
              <Link to="/tasks" className={menuItemClass('/tasks')} onClick={closeSidebar}>
                <span className="text-lg">✅</span>
                <span>All Tasks</span>
              </Link>
            </div>
          )}

          {/* Employee-Only Menu */}
          {isEmployee && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2 mt-4">Work</p>
              <Link to="/workspaces" className={menuItemClass('/workspaces')} onClick={closeSidebar}>
                <span className="text-lg">🏢</span>
                <span>My Shoots</span>
              </Link>
              <Link to="/tasks" className={menuItemClass('/tasks')} onClick={closeSidebar}>
                <span className="text-lg">📝</span>
                <span>My Tasks</span>
              </Link>
            </div>
          )}

          {/* Common Menu */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2 mt-4">Other</p>
            <Link to="/profile" className={menuItemClass('/profile')} onClick={closeSidebar}>
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
    </>
  );
}