import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { taskApi, workspaceApi } from '../api/index.js';
import Sidebar from '../components/layout/Sidebar.jsx';

export default function Tasks() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Fetch all tasks
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['all-tasks', selectedStatus],
    queryFn: async () => {
      // Get all workspaces first
      const wsResponse = await workspaceApi.getAll();
      const workspaces = wsResponse.data.data?.workspaces || [];

      // Fetch tasks from all workspaces
      const allTasks = [];
      for (const ws of workspaces) {
        try {
          const taskResponse = await workspaceApi.getById(ws.id);
          const wsTasks = taskResponse.data.data?.tasks || [];
          allTasks.push(
            ...wsTasks.map((task) => ({
              ...task,
              workspaceId: ws.id,
              workspaceTitle: ws.title,
            }))
          );
        } catch (error) {
          console.error(`Error fetching tasks for workspace ${ws.id}:`, error);
        }
      }

      // Filter by status
      if (selectedStatus === 'all') {
        return allTasks;
      }
      return allTasks.filter((task) => task.status === selectedStatus);
    },
  });

  const tasks = tasksData || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO':
      case 'ASSIGNED':
        return 'border-l-4 border-l-slate-400 bg-slate-50 hover:bg-slate-100';
      case 'IN_PROGRESS':
        return 'border-l-4 border-l-blue-500 bg-blue-50 hover:bg-blue-100';
      case 'IN_REVIEW':
        return 'border-l-4 border-l-purple-500 bg-purple-50 hover:bg-purple-100';
      case 'COMPLETED':
        return 'border-l-4 border-l-green-500 bg-green-50 hover:bg-green-100';
      case 'REJECTED':
        return 'border-l-4 border-l-red-500 bg-red-50 hover:bg-red-100';
      default:
        return 'border-l-4 border-l-gray-400 bg-gray-50';
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statuses = ['all', 'ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'REJECTED'];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              {isManager ? 'All Tasks' : 'My Tasks'} 📋
            </h1>
            <p className="text-gray-600 mt-2">
              {isManager
                ? 'View and manage all tasks across your shoots'
                : 'Your assigned tasks and their status'}
            </p>
          </div>

          {/* Filter Status Tabs */}
          <div className="mb-8 flex flex-wrap gap-2 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Tasks' : status}
              </button>
            ))}
            <div className="ml-auto text-sm text-gray-600 flex items-center">
              <span className="font-semibold text-gray-900">{tasks.length}</span>
              <span className="ml-1">task{tasks.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Tasks List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading tasks...</p>
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`${getStatusColor(task.status)} rounded-lg p-4 transition cursor-pointer hover:shadow-lg group`}
                  onClick={() =>
                    navigate(`/workspaces/${task.workspaceId}/tasks/${task.id}`)
                  }
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className="text-2xl mt-1 flex-shrink-0">
                      {getStatusIcon(task.status)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`font-semibold text-gray-900 group-hover:text-indigo-600 transition ${
                            task.status === 'COMPLETED' ? 'line-through text-gray-600' : ''
                          }`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-700 mt-1 line-clamp-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                        {task.priority && (
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="mt-3 flex items-center flex-wrap gap-3">
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                          🏢 {task.workspaceTitle}
                        </span>
                        {task.referenceLink && (
                          <a
                            href={task.referenceLink}
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline inline-flex items-center gap-1"
                          >
                            📎 Reference
                          </a>
                        )}
                        {task.dueDate && (
                          <span className="text-xs text-gray-600 font-medium inline-flex items-center gap-1">
                            📅 {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.assignee && (
                          <span className="text-xs bg-white bg-opacity-70 text-gray-700 px-2 py-1 rounded-full font-medium">
                            👤 {task.assignee.name}
                          </span>
                        )}
                      </div>

                      {/* Submission Status */}
                      {task.submission && (
                        <div className={`mt-3 text-xs font-medium px-3 py-1 rounded-full w-fit ${
                          task.submission.status === 'APPROVED'
                            ? 'bg-green-200 text-green-800'
                            : task.submission.status === 'REJECTED'
                            ? 'bg-red-200 text-red-800'
                            : 'bg-purple-200 text-purple-800'
                        }`}>
                          🔔 {task.submission.status}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600 text-lg">No tasks found</p>
              <p className="text-gray-500 text-sm mt-1">
                {selectedStatus === 'all'
                  ? 'Start by creating tasks in your workspaces'
                  : `No tasks with status: ${selectedStatus}`}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
