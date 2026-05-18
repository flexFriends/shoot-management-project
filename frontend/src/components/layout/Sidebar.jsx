import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import toast from 'react-hot-toast';
import NotificationCenter from '../common/NotificationCenter.jsx';

export default function Sidebar({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';
  const isHR = user?.role === 'HR';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const menuItemClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
      isActive(path)
        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50'
    }`;

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🎬</span>
          </div>
          <span className="text-lg font-bold text-gray-900">Shoot</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none text-2xl"
            aria-label="Toggle Menu"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Backdrop Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Main Sidebar Drawer */}
      <div
        className={`
        fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-lg flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
      >
        {/* Logo/Brand Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">🎬</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Shoot</h1>
              <p className="text-xs text-gray-600">Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <NotificationCenter />
            </div>
            <button onClick={closeSidebar} className="md:hidden text-gray-500 text-xl hover:text-gray-700">
              ✕
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="mx-4 mt-4 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl">
          <p className="text-xs text-gray-600 font-semibold">👤 Logged in as</p>
          <p className="font-bold text-gray-900 mt-1 truncate">{user?.name || 'User'}</p>
          <p className="text-xs text-indigo-600 font-semibold mt-2 px-2 py-1 bg-indigo-100 rounded-lg inline-block">
            {user?.role === 'ADMIN' && '👑 Admin'}
            {user?.role === 'MANAGER' && '📋 Manager'}
            {user?.role === 'HR' && '👥 HR'}
            {user?.role === 'EMPLOYEE' && '👤 Employee'}
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-4">
          {/* Dashboard */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-3 ml-1">Menu</p>
            <Link to="/dashboard" className={menuItemClass('/dashboard')} onClick={closeSidebar}>
              <span className="text-xl">📊</span>
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Manager/Admin Menu */}
          {isManager && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-3 mt-6 ml-1">Management</p>
              <Link to="/workspaces" className={menuItemClass('/workspaces')} onClick={closeSidebar}>
                <span className="text-xl">🎥</span>
                <span>Shoots</span>
              </Link>
              <Link to="/workspaces/create" className={menuItemClass('/workspaces/create')} onClick={closeSidebar}>
                <span className="text-xl">➕</span>
                <span>Create Shoot</span>
              </Link>
              <Link to="/tasks" className={menuItemClass('/tasks')} onClick={closeSidebar}>
                <span className="text-xl">✅</span>
                <span>Tasks</span>
              </Link>
              {isManager && user?.role === 'ADMIN' && (
                <Link to="/manage-users" className={menuItemClass('/manage-users')} onClick={closeSidebar}>
                  <span className="text-xl">👥</span>
                  <span>Users</span>
                </Link>
              )}
            </div>
          )}

          {/* Employee Menu */}
          {isEmployee && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-3 mt-6 ml-1">Work</p>
              <Link to="/workspaces" className={menuItemClass('/workspaces')} onClick={closeSidebar}>
                <span className="text-xl">🎥</span>
                <span>My Shoots</span>
              </Link>
              <Link to="/tasks" className={menuItemClass('/tasks')} onClick={closeSidebar}>
                <span className="text-xl">📝</span>
                <span>My Tasks</span>
              </Link>
            </div>
          )}

          {/* HR Menu */}
          {isHR && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-3 mt-6 ml-1">HR</p>
              <Link to="/manage-users" className={menuItemClass('/manage-users')} onClick={closeSidebar}>
                <span className="text-xl">👥</span>
                <span>Manage Users</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2 shadow-md"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}