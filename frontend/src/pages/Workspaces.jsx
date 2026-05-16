import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { workspaceApi } from '../api/index.js';
import Sidebar from '../components/layout/Sidebar.jsx';

const toDateOnly = (dateValue) => {
  if (!dateValue) return null;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

const getDisplayWorkspaceStatus = (workspace) => {
  if (!workspace) return 'DRAFT';

  if (workspace.status === 'COMPLETED' || workspace.status === 'ARCHIVED' || workspace.status === 'IN_PROGRESS') {
    return workspace.status;
  }

  const shootDate = toDateOnly(workspace.shootDate);
  if (!shootDate) return workspace.status || 'DRAFT';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return shootDate <= today ? 'ACTIVE' : 'DRAFT';
};

const getStatusBadgeClasses = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'DRAFT':
      return 'bg-yellow-100 text-yellow-800';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800';
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

export default function Workspaces() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const handleCreateWorkspace = () => {
    navigate('/workspaces/create');
  };

  const { data, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await workspaceApi.getAll();
      return response.data.data;
    },
  });

  const searchParams = new URLSearchParams(location.search);
  const statusFilter = searchParams.get('status') || null;

  const formatCreatedDate = (dateValue) => {
    if (!dateValue) return '';
    try {
      return new Date(dateValue).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Workspaces 🏢</h1>
              <p className="text-gray-600 mt-2">Manage your studios and projects</p>
            </div>
            {isManager && (
              <button
                onClick={handleCreateWorkspace}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
              >
                <span>+</span>
                <span>New Workspace</span>
              </button>
            )}
          </div>

          {/* Workspaces Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading workspaces...</p>
            </div>
          ) : (
            (() => {
              const all = data?.workspaces || [];
              const filtered = statusFilter ? all.filter((ws) => getDisplayWorkspaceStatus(ws) === statusFilter) : all;

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-lg">No workspaces{statusFilter ? ` for ${statusFilter}` : ''}.</p>
                    {isManager && (
                      <button
                        onClick={handleCreateWorkspace}
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                      >
                        Create Workspace
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div>
                  {statusFilter && (
                    <div className="mb-4 flex items-center gap-4">
                      <div className="text-sm text-gray-600">Filter: <span className="font-semibold text-gray-900">{statusFilter}</span></div>
                      <button
                        onClick={() => navigate('/workspaces')}
                        className="text-sm px-3 py-1 bg-slate-100 rounded-md text-slate-700 hover:bg-slate-200"
                      >
                        Clear filter
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((ws) => {
                      const displayStatus = getDisplayWorkspaceStatus(ws);
                      const totalTasks = ws.tasks?.length || ws.taskCount || 0;
                      const completedTasks = ws.tasks?.filter((task) => task.status === 'COMPLETED').length || ws.completedTaskCount || 0;
                      const pendingTasks = Math.max(totalTasks - completedTasks, 0);

                      return (
                        <div
                          key={ws.id}
                          onClick={() => navigate(`/workspaces/${ws.id}`)}
                          className="bg-white rounded-lg shadow-sm hover:shadow-lg transition cursor-pointer border border-gray-200 p-6 group"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl text-white">
                              🎬
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(displayStatus)}`}>
                                {displayStatus}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase tracking-wide">
                                  T {totalTasks}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold uppercase tracking-wide">
                                  C {completedTasks}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-semibold uppercase tracking-wide">
                                  P {pendingTasks}
                                </span>
                              </div>
                            </div>
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition">
                            {ws.title}
                          </h3>
                          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{ws.description}</p>
                          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              <span className="font-semibold text-gray-900">{ws.members?.length || 0}</span> members
                            </span>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">
                                <span className="font-semibold text-gray-900">{totalTasks}</span> tasks
                              </div>
                              <div className="text-xs text-gray-400 mt-1">Created: <span className="font-medium text-gray-700">{formatCreatedDate(ws.createdAt)}</span></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </main>
    </div>
  );
}
