import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi, workspaceApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { data: workspacesData, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await workspaceApi.getAll();
      return response.data.data;
    },
  });

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Studio Shoot Management
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Welcome, <strong>{user.name}</strong> ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Workspaces</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {workspacesData?.workspaces?.length || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Your Role</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{user.role}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Account Status</p>
            <p className="text-lg font-bold text-green-600 mt-2">Active</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Last Login</p>
            <p className="text-sm text-gray-700 mt-2">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Workspaces Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Workspaces</h2>
            {(user.role === 'MANAGER' || user.role === 'ADMIN') && (
              <button
                onClick={() => navigate('/workspaces/create')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                + New Workspace
              </button>
            )}
          </div>

          <div className="p-6">
            {isLoading ? (
              <p className="text-gray-500">Loading workspaces...</p>
            ) : workspacesData?.workspaces?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workspacesData.workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    onClick={() => navigate(`/workspaces/${ws.id}`)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg cursor-pointer transition"
                  >
                    <h3 className="font-semibold text-gray-900">{ws.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{ws.description}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                        {ws.status}
                      </span>
                      <span className="text-xs text-gray-600">
                        {ws.taskCount} tasks
                      </span>
                    </div>
                    {ws.taskCount > 0 && (
                      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${ws.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                No workspaces yet.
                {(user.role === 'MANAGER' || user.role === 'ADMIN') &&
                  ' Create one to get started!'}
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.role === 'MANAGER' && (
              <>
                <button
                  onClick={() => navigate('/workspaces')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition"
                >
                  <p className="font-semibold text-gray-900">View All Workspaces</p>
                  <p className="text-sm text-gray-600">See all projects and their status</p>
                </button>
                <button
                  onClick={() => navigate('/workspaces/create')}
                  className="p-4 border border-indigo-600 border-2 rounded-lg hover:bg-indigo-50 text-left transition"
                >
                  <p className="font-semibold text-indigo-600">Create New Workspace</p>
                  <p className="text-sm text-gray-600">Start a new shoot project</p>
                </button>
              </>
            )}
            {user.role === 'EMPLOYEE' && (
              <button
                onClick={() => navigate('/workspaces')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition"
              >
                <p className="font-semibold text-gray-900">View My Workspaces</p>
                <p className="text-sm text-gray-600">Check your assigned projects</p>
              </button>
            )}
            {user.role === 'ADMIN' && (
              <button
                onClick={() => navigate('/admin/users')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition"
              >
                <p className="font-semibold text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-600">View and manage team members</p>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
