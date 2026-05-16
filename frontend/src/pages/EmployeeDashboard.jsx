import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { workspaceApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';

const formatDate = (value) => {
  if (!value) return 'Not set';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const isSameDay = (left, right) => {
  if (!left || !right) return false;

  const leftDate = new Date(left);
  const rightDate = new Date(right);
  if (Number.isNaN(leftDate.getTime()) || Number.isNaN(rightDate.getTime())) return false;

  return leftDate.toISOString().slice(0, 10) === rightDate.toISOString().slice(0, 10);
};

const StatCard = ({ label, value, subtext }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    {subtext && <p className="mt-2 text-sm text-gray-500">{subtext}</p>}
  </div>
);

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const stats = dashboard?.stats || {};
  const allocatedWorkspaces = dashboard?.allocatedWorkspaces || [];
  const today = new Date();
  const todayWorkspaces = allocatedWorkspaces.filter((workspace) => isSameDay(workspace.shootDate, today));

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Employee dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Hi {user?.name}</h1>
        <p className="mt-2 text-gray-600">Your assigned workspaces for today and the full allocation list.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total allocated workspaces"
          value={stats.totalAllocatedWorkspaces || 0}
          subtext="All workspaces assigned to you"
        />
        <StatCard
          label="Today's active workspaces"
          value={stats.todayActiveWorkspaces || 0}
          subtext={formatDate(today)}
        />
        <StatCard
          label="Allocated today"
          value={stats.allocatedToday || 0}
          subtext="Workspaces assigned on this date"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's active workspaces</h2>
            <p className="text-sm text-gray-500 mt-1">Workspaces scheduled for today.</p>
          </div>

          <div className="p-6 space-y-3">
            {todayWorkspaces.length > 0 ? (
              todayWorkspaces.map((workspace) => (
                <Link
                  key={workspace.id}
                  to={`/workspaces/${workspace.id}`}
                  className="block rounded-xl border border-gray-200 px-4 py-4 transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{workspace.title}</p>
                      <p className="mt-1 text-sm text-gray-500">Allocated on {formatDate(workspace.allocatedAt)}</p>
                    </div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Today
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1">Shoot: {formatDate(workspace.shootDate)}</span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1">Tasks: {workspace.taskCount}</span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1">Status: {workspace.status}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-gray-500">No active workspace is scheduled for today.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">All allocated workspaces</h2>
            <p className="text-sm text-gray-500 mt-1">Every workspace assigned to you with the allocation date.</p>
          </div>

          <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
            {allocatedWorkspaces.length > 0 ? (
              allocatedWorkspaces.map((workspace) => (
                <Link
                  key={workspace.id}
                  to={`/workspaces/${workspace.id}`}
                  className="block rounded-xl border border-gray-200 px-4 py-4 transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{workspace.title}</p>
                      <p className="mt-1 text-sm text-gray-500">Allocated on {formatDate(workspace.allocatedAt)}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {workspace.priority}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1">Shoot: {formatDate(workspace.shootDate)}</span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1">Tasks: {workspace.taskCount}</span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1">Status: {workspace.status}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-gray-500">No workspaces have been assigned yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
