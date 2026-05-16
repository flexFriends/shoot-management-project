import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { workspaceApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';

export default function EmployeeDashboard() {
  const user = useAuthStore((state) => state.user);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['employee-dashboard'],
    queryFn: async () => {
      const response = await workspaceApi.getEmployeeDashboard();
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats || {};
  const workspaces = dashboard?.workspaces || [];
  const recentTasks = dashboard?.recentTasks || [];

  const getEntityLabel = (entity, fallback = 'Unknown') => {
    if (!entity) return fallback;
    if (typeof entity === 'string' || typeof entity === 'number') return entity;
    return entity.name || entity.title || fallback;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO':
      case 'ASSIGNED':
        return 'bg-slate-100 text-slate-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'IN_REVIEW':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'TODO':
      case 'ASSIGNED':
        return '📋';
      case 'IN_PROGRESS':
        return '⚡';
      case 'IN_REVIEW':
        return '👀';
      case 'COMPLETED':
        return '✅';
      case 'REJECTED':
        return '❌';
      default:
        return '📌';
    }
  };

  const StatCard = ({ label, value, icon, color }) => (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-2xl p-6 border border-${color}-200 shadow-sm hover:shadow-lg transition transform hover:scale-105`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-${color}-600 text-sm font-medium uppercase tracking-wide`}>{label}</p>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-4xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">My Tasks 📝</h1>
        <p className="text-gray-600 mt-2">Hi {user?.name}! Here's your task overview and progress.</p>
      </div>

      {/* Main Content */}
      <div>
        {/* Overview Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Task Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <StatCard label="Total" value={stats.total} icon="📚" color="slate" />
            <StatCard label="Pending" value={stats.pending} icon="📋" color="yellow" />
            <StatCard label="In Progress" value={stats.inProgress} icon="⚡" color="blue" />
            <StatCard label="In Review" value={stats.inReview} icon="👀" color="purple" />
            <StatCard label="Completed" value={stats.completed} icon="✅" color="green" />
            <StatCard label="Rejected" value={stats.rejected} icon="❌" color="red" />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Progress</h3>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-40 h-40">
                  <svg className="transform -rotate-90" width="160" height="160">
                    <circle
                      cx="80"
                      cy="80"
                      r="75"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="75"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${stats.completionRate * 4.71} 471`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-4xl font-bold text-green-600">{stats.completionRate}%</p>
                    <p className="text-sm text-gray-600">Complete</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-700 font-medium">Completed Tasks</p>
                  <p className="text-green-600 font-bold">{stats.completed}/{stats.total}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all"
                    style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-gray-600 text-sm">Active Tasks</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.inProgress}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Awaiting Review</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.inReview}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks by Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {workspaces.map((workspace) => (
            <div key={workspace.workspaceId} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                <h3 className="text-lg font-bold text-white">{workspace.workspaceName}</h3>
                <p className="text-indigo-100 text-sm mt-1">{workspace.tasks.length} tasks</p>
              </div>
              <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
                {workspace.tasks.length > 0 ? (
                  workspace.tasks.map((task) => (
                    <Link
                      key={task.id}
                      to={`/workspaces/${workspace.workspaceId}/tasks/${task.id}`}
                      className={`block p-4 rounded-lg border-2 transition hover:shadow-md ${
                        getStatusColor(task.status).replace('bg-', 'border-').replace('text-', 'text-')
                      } hover:shadow-lg`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 line-clamp-2">{task.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                              {getStatusIcon(task.status)} {task.status}
                            </span>
                            <span className="text-xs text-gray-600 font-medium">{task.priority}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {task.dueDate && (
                            <p className="text-xs text-gray-600">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-center text-gray-600 py-8">No tasks in this workspace</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        {recentTasks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              <p className="text-indigo-100 text-sm mt-1">Your recently updated tasks</p>
            </div>
            <div className="divide-y divide-gray-200">
              {recentTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/workspaces/${task.workspace.id}/tasks/${task.id}`}
                  className="px-6 py-4 hover:bg-indigo-50 transition flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                      {getStatusIcon(task.status)} {task.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Assigned by {getEntityLabel(task.createdBy)} in {getEntityLabel(task.workspace)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
