import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { workspaceApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';

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

const getDateKey = (dateValue) => {
  const date = toDateOnly(dateValue);
  return date ? date.toISOString().slice(0, 10) : null;
};

const formatScheduleDate = (dateValue) =>
  dateValue.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const buildNextSevenDays = () => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let index = 0; index < 7; index++) {
    const day = new Date(today);
    day.setDate(today.getDate() + index);
    day.setHours(0, 0, 0, 0);
    days.push(day);
  }

  return days;
};

export default function ManagerDashboard() {
  const user = useAuthStore((state) => state.user);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['manager-dashboard'],
    queryFn: async () => {
      const response = await workspaceApi.getManagerDashboard();
      return response.data.data;
    },
  });

  const { data: workspacesData, isLoading: isWorkspaceStatsLoading } = useQuery({
    queryKey: ['manager-workspace-stats'],
    queryFn: async () => {
      const response = await workspaceApi.getAll(1, 200);
      return response.data.data?.workspaces || [];
    },
  });

  if (isLoading || isWorkspaceStatsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = dashboard?.overall || {};
  const employees = dashboard?.employees || [];
  const workspaces = dashboard?.workspaces || [];
  const workspaceList = workspacesData || [];
  const nextSevenDays = buildNextSevenDays();
  const employeeMap = new Map();

  workspaceList.forEach((workspace) => {
    (workspace.members || []).forEach((member) => {
      const memberUser = member.user;
      if (memberUser?.id && !employeeMap.has(memberUser.id)) {
        employeeMap.set(memberUser.id, memberUser);
      }
    });
  });

  employees.forEach((employee) => {
    if (employee?.id && !employeeMap.has(employee.id)) {
      employeeMap.set(employee.id, employee);
    }
  });

  const scheduleEmployees = Array.from(employeeMap.values()).sort((left, right) =>
    left.name.localeCompare(right.name)
  );

  const workspaceStatusStats = workspaceList.reduce(
    (acc, workspace) => {
      const displayStatus = getDisplayWorkspaceStatus(workspace);
      if (displayStatus === 'ACTIVE') acc.active += 1;
      if (displayStatus === 'DRAFT') acc.draft += 1;
      return acc;
    },
    {
      total: workspaceList.length,
      active: 0,
      draft: 0,
    }
  );

  const StatCard = ({ label, value, subtext, color = 'indigo', onClick }) => (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-xl p-6 border border-${color}-200 shadow-sm hover:shadow-md transition ${onClick ? 'cursor-pointer' : ''}`}
    >
      <p className={`text-${color}-600 text-sm font-medium uppercase tracking-wide mb-2`}>{label}</p>
      <p className={`text-4xl font-bold text-gray-900 mb-1`}>{value}</p>
      {subtext && <p className={`text-sm text-${color}-600`}>{subtext}</p>}
    </div>
  );

  const getScheduleForEmployeeAndDay = (employeeId, dayKey) => {
    return workspaceList.filter((workspace) => {
      const workspaceDayKey = getDateKey(workspace.shootDate);
      if (workspaceDayKey !== dayKey) return false;

      return (workspace.members || []).some((member) => member.userId === employeeId || member.user?.id === employeeId);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Welcome, {user?.name}! 👋</h1>
        <p className="text-gray-600 mt-2">Here's your team's task performance at a glance</p>
      </div>

      {/* Main Content */}
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Workspace Snapshot</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total Workspaces"
              value={workspaceStatusStats.total}
              color="slate"
              onClick={() => navigate('/workspaces')}
            />
            <StatCard
              label="Active Workspaces"
              value={workspaceStatusStats.active}
              color="green"
              onClick={() => navigate('/workspaces?status=ACTIVE')}
            />
            <StatCard
              label="Workspaces in Draft"
              value={workspaceStatusStats.draft}
              color="yellow"
              onClick={() => navigate('/workspaces?status=DRAFT')}
            />
          </div>
        </div>

        {/* Employee Schedule */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Employee Schedule</h2>
            <p className="text-slate-200 text-sm mt-1">Next 7 days based on workspace shoot dates</p>
          </div>

          {scheduleEmployees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-separate border-spacing-0">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="sticky left-0 z-10 bg-gray-50 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      Employee
                    </th>
                    {nextSevenDays.map((day) => (
                      <th
                        key={day.toISOString()}
                        className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200"
                      >
                        {formatScheduleDate(day)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scheduleEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-slate-50 transition">
                      <td className="sticky left-0 z-10 bg-white px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold">
                            {employee.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{employee.name}</p>
                            <p className="text-xs text-gray-500">{employee.email}</p>
                          </div>
                        </div>
                      </td>

                      {nextSevenDays.map((day) => {
                        const dayKey = day.toISOString().slice(0, 10);
                        const scheduledWorkspaces = getScheduleForEmployeeAndDay(employee.id, dayKey);

                        return (
                          <td key={`${employee.id}-${dayKey}`} className="px-3 py-4 border-b border-gray-100 align-top">
                            {scheduledWorkspaces.length > 0 ? (
                              <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                                  Scheduled {scheduledWorkspaces.length > 1 ? `(${scheduledWorkspaces.length})` : ''}
                                </div>
                                <div className="space-y-1.5">
                                  {scheduledWorkspaces.slice(0, 2).map((workspace) => (
                                    <div
                                      key={workspace.id}
                                      className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-900"
                                    >
                                      <p className="font-semibold leading-tight line-clamp-2">{workspace.title}</p>
                                      <p className="text-[11px] text-emerald-700 mt-1">Shoot day</p>
                                    </div>
                                  ))}
                                  {scheduledWorkspaces.length > 2 && (
                                    <p className="text-[11px] text-gray-500 px-1">
                                      +{scheduledWorkspaces.length - 2} more workspace{scheduledWorkspaces.length - 2 > 1 ? 's' : ''}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex h-full min-h-[72px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                                No schedule
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-600">
              No employees found for the schedule table.
            </div>
          )}
        </div>

        

        {/* Completion Rate */}
        {/* <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Completion Rate</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">{stats.completionRate || 0}%</p>
              <p className="text-sm text-gray-600">{stats.completed} of {stats.totalTasks} completed</p>
            </div>
          </div>
        </div> */}

        {/* Employee Performance */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Employee Performance</h2>
            <p className="text-indigo-100 text-sm mt-1">Task assignments and completion status</p>
          </div>

          {employees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">In Progress</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">In Review</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Completed</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Rejected</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((emp) => {
                    const rate = emp.total > 0 ? Math.round((emp.completed / emp.total) * 100) : 0;
                    const pending = (emp.assigned || 0) + (emp.inProgress || 0);

                    return (
                      <tr 
                        key={emp.id}
                        onClick={() => setSelectedEmployee(selectedEmployee?.id === emp.id ? null : emp)}
                        className="hover:bg-indigo-50 transition cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                              {emp.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{emp.name}</p>
                              <p className="text-xs text-gray-600">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block bg-slate-100 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                            {emp.total}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {pending}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {emp.inProgress || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {emp.inReview || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {emp.completed || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {emp.rejected || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${rate}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-bold ${
                              rate >= 80 ? 'text-green-600' : rate >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-600">No employees assigned to tasks yet.</p>
            </div>
          )}
        </div> */}

        {/* Selected Employee Details */}
        {selectedEmployee && (
          <div className="mt-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{selectedEmployee.name}'s Performance Summary</h3>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <p className="text-gray-600 text-sm font-medium">Total Assigned</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{selectedEmployee.total}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{selectedEmployee.completed || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{(selectedEmployee.assigned || 0) + (selectedEmployee.inProgress || 0)}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <p className="text-gray-600 text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{selectedEmployee.rejected || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
