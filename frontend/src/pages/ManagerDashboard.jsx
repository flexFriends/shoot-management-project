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

  // Get only employees assigned to this manager
  if (employees && Array.isArray(employees)) {
    employees.forEach((employee) => {
      if (employee?.id && !employeeMap.has(employee.id)) {
        employeeMap.set(employee.id, employee);
      }
    });
  }

  // Also get employees from workspace members (for tasks)
  workspaceList.forEach((workspace) => {
    (workspace.members || []).forEach((member) => {
      const memberUser = member.user;
      // Only include if it's in the employees list (already filtered by backend)
      if (memberUser?.id && employees.some(e => e.id === memberUser.id)) {
        if (!employeeMap.has(memberUser.id)) {
          employeeMap.set(memberUser.id, memberUser);
        }
      }
    });
  });

  const scheduleEmployees = Array.from(employeeMap.values()).sort((left, right) => {
    const leftName = left?.name || left?.email || '';
    const rightName = right?.name || right?.email || '';
    return leftName.localeCompare(rightName);
  });

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
      className={`rounded-xl border p-4 shadow-sm transition hover:shadow-md sm:p-5 ${onClick ? 'cursor-pointer' : ''} ${color === 'slate' ? 'border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100' : color === 'green' ? 'border-green-200 bg-gradient-to-br from-green-50 to-green-100' : color === 'yellow' ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100' : 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100'}`}
    >
      <p className={`text-sm font-medium uppercase tracking-wide mb-2 ${color === 'slate' ? 'text-slate-600' : color === 'green' ? 'text-green-600' : color === 'yellow' ? 'text-yellow-700' : 'text-indigo-600'}`}>{label}</p>
      <p className="text-3xl font-bold text-gray-900 sm:text-4xl">{value}</p>
      {subtext && <p className={`mt-1 text-sm ${color === 'slate' ? 'text-slate-600' : color === 'green' ? 'text-green-600' : color === 'yellow' ? 'text-yellow-700' : 'text-indigo-600'}`}>{subtext}</p>}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Welcome, {user?.name}!</h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">Here's your team's task performance at a glance</p>
      </div>

      {/* Main Content */}
      <div>
        {/* Shoots Snapshot */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">Shoots Snapshot</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
            <StatCard
              label="Total Shoots"
              value={workspaceStatusStats.total}
              color="slate"
              onClick={() => navigate('/workspaces')}
            />
            <StatCard
              label="Active Shoots"
              value={workspaceStatusStats.active}
              color="green"
              onClick={() => navigate('/workspaces?status=ACTIVE')}
            />
            <StatCard
              label="Shoots in Draft"
              value={workspaceStatusStats.draft}
              color="yellow"
              onClick={() => navigate('/workspaces?status=DRAFT')}
            />
          </div>
        </div>

        {/* Employee Schedule */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-4 sm:px-6">
            <h2 className="text-lg font-bold text-white sm:text-xl">Employee Schedule</h2>
            <p className="mt-1 text-xs text-slate-200 sm:text-sm">Next 7 days based on workspace shoot dates</p>
          </div>

          {scheduleEmployees.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="sticky left-0 z-10 bg-gray-50 px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 border-b border-gray-200 sm:px-6">
                        Employee
                      </th>
                      {nextSevenDays.map((day) => (
                        <th
                          key={day.toISOString()}
                          className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 border-b border-gray-200 sm:px-4"
                        >
                          {formatScheduleDate(day)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleEmployees.map((employee) => (
                      <tr key={employee.id} className="transition hover:bg-slate-50">
                        <td className="sticky left-0 z-10 whitespace-nowrap border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-sm font-bold text-white">
                              {employee.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{employee.name}</p>
                              <p className="max-w-[12rem] truncate text-xs text-gray-500 xl:max-w-[16rem]">{employee.email}</p>
                            </div>
                          </div>
                        </td>

                        {nextSevenDays.map((day) => {
                          const dayKey = day.toISOString().slice(0, 10);
                          const scheduledWorkspaces = getScheduleForEmployeeAndDay(employee.id, dayKey);

                          return (
                            <td key={`${employee.id}-${dayKey}`} className="border-b border-gray-100 px-2 py-4 text-center align-top sm:px-3">
                              {scheduledWorkspaces.length > 0 ? (
                                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                                  ✓ {scheduledWorkspaces.length}
                                </div>
                              ) : (
                                <span className="text-gray-300 text-sm">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="divide-y divide-gray-200 lg:hidden">
                {scheduleEmployees.map((employee) => (
                  <div key={employee.id} className="p-4 sm:p-6">
                    {/* Employee Header */}
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 font-bold text-white">
                        {employee.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{employee.name}</p>
                        <p className="max-w-[14rem] truncate text-xs text-gray-500 sm:max-w-none">{employee.email}</p>
                      </div>
                    </div>

                    {/* Schedule Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {nextSevenDays.map((day) => {
                        const dayKey = day.toISOString().slice(0, 10);
                        const scheduledWorkspaces = getScheduleForEmployeeAndDay(employee.id, dayKey);
                        const dayShort = day.toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                        });

                        return (
                          <div
                            key={`${employee.id}-${dayKey}`}
                              className={`rounded-lg border-2 p-3 text-center ${scheduledWorkspaces.length > 0
                                ? 'border-emerald-200 bg-emerald-50'
                                : 'border-gray-200 bg-gray-50'
                              }`}
                          >
                            <p className="text-xs font-semibold text-gray-600 mb-1">{dayShort}</p>
                            {scheduledWorkspaces.length > 0 ? (
                              <p className="text-lg font-bold text-emerald-700">✓</p>
                            ) : (
                              <p className="text-lg text-gray-300">—</p>
                            )}
                            {scheduledWorkspaces.length > 0 && (
                              <p className="mt-1 text-xs text-emerald-600">{scheduledWorkspaces.length} shoot{scheduledWorkspaces.length > 1 ? 's' : ''}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-600 md:p-12">
              <p className="text-lg">📭 No employees found</p>
              <p className="text-sm mt-2">Employees will appear here once assigned to shoots</p>
            </div>
          )}
        </div>

        {/* Task Assignments */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-indigo-700 to-blue-700 px-4 py-4 sm:px-6">
            <h2 className="text-lg font-bold text-white sm:text-xl">Task Assignments</h2>
            <p className="mt-1 text-xs text-indigo-100 sm:text-sm">See which employee is assigned to each task in every shoot</p>
          </div>

          {workspaces.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {workspaces.map((workspace) => (
                <div key={workspace.id} className="p-4 sm:p-6">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{workspace.title}</h3>
                      <p className="text-sm text-gray-500">{workspace.taskCount} task{workspace.taskCount === 1 ? '' : 's'}</p>
                    </div>
                  </div>

                  {workspace.tasks?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {workspace.tasks.map((task) => (
                        <div key={task.id} className="rounded-xl border border-gray-200 bg-slate-50 p-4">
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">{task.title}</p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className="text-xs text-gray-500">{task.priority} priority</span>
                                {task.orientation && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                    task.orientation === 'VERTICAL'
                                      ? 'bg-pink-100 text-pink-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {task.orientation === 'VERTICAL' ? 'Vertical' : 'Horizontal'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : task.status === 'IN_REVIEW' ? 'bg-amber-100 text-amber-700' : task.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'}`}>
                              {task.status}
                            </span>
                          </div>

                          <div className="space-y-1 text-sm text-gray-700">
                            <p>
                              <span className="font-medium text-gray-900">Assigned to:</span>{' '}
                              {task.assignee?.name || 'Unassigned'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {task.assignee?.email || 'No employee assigned'}
                            </p>
                            {task.dueDate && (
                              <p className="text-xs text-gray-500">
                                Due: {new Date(task.dueDate).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No tasks found for this workspace.</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-600 md:p-12">
              <p className="text-lg">No task assignments yet</p>
              <p className="text-sm mt-2">Task details will appear here once you start assigning employees</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
