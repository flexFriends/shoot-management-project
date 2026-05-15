import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { workspaceApi, taskApi, authApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';

export default function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');
  const [taskForm, setTaskForm] = useState({ 
    title: '', 
    description: '', 
    dueDate: '',
    referenceLink: '',
    priority: 'MEDIUM',
  });

  // Fetch workspace details
  const { data: workspace, isLoading: wsLoading, refetch: refetchWorkspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const response = await workspaceApi.getById(workspaceId);
      return response.data.data;
    },
  });

  // Fetch tasks for workspace
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ['workspace-tasks', workspaceId],
    queryFn: async () => {
      const response = await taskApi.getAll(workspaceId);
      return response.data.data || [];
    },
  });

  // Fetch all users for adding members
  const { data: allUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      try {
        const response = await authApi.getAllUsers();
        return response.data.data || [];
      } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
      }
    },
  });

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error('Please select an employee');
      return;
    }

    try {
      await workspaceApi.addMember(workspaceId, selectedUserId, memberRole);
      toast.success('Employee added to workspace successfully');
      setSelectedUserId('');
      setMemberRole('MEMBER');
      setShowAddMember(false);
      refetchWorkspace();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await workspaceApi.removeMember(workspaceId, userId);
        toast.success('Member removed successfully');
        refetchWorkspace();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to remove member');
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      const taskData = {
        title: taskForm.title,
        priority: taskForm.priority,
        status: 'TODO',
      };
      
      // Add optional fields only if they're not empty
      if (taskForm.description) taskData.description = taskForm.description;
      if (taskForm.referenceLink) taskData.referenceLink = taskForm.referenceLink;
      if (taskForm.dueDate) taskData.dueDate = taskForm.dueDate;
      
      await taskApi.create(workspaceId, taskData);
      toast.success('Task created successfully');
      setTaskForm({ title: '', description: '', dueDate: '', referenceLink: '', priority: 'MEDIUM' });
      setShowCreateTask(false);
      refetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskApi.delete(workspaceId, taskId);
        toast.success('Task deleted successfully');
        refetchTasks();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  // Get employees not already in workspace
  const getAvailableEmployees = () => {
    const memberIds = workspace?.members?.map(m => m.userId) || [];
    return allUsers?.filter(u => u.role === 'EMPLOYEE' && !memberIds.includes(u.id)) || [];
  };

  if (wsLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-500">Loading workspace...</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Workspace not found</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isManager = user.role === 'MANAGER' || user.role === 'ADMIN';
  const taskStats = {
    total: tasks?.length || 0,
    pending: tasks?.filter(t => t.status === 'PENDING').length || 0,
    inProgress: tasks?.filter(t => t.status === 'IN_PROGRESS').length || 0,
    completed: tasks?.filter(t => t.status === 'COMPLETED').length || 0,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  ← Back
                </button>
                <h1 className="text-3xl font-bold text-gray-900">{workspace.title}</h1>
              </div>
              <p className="text-gray-600 mt-1">{workspace.description}</p>
            </div>
            {isManager && (
              <button
                onClick={() => navigate(`/workspaces/${workspaceId}/edit`)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Edit Workspace
              </button>
            )}
          </div>
          <div className="flex gap-1 text-xs">
            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{workspace.status}</span>
            <span className="text-gray-600">Created by: {workspace.createdBy?.name || 'Unknown'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Total Tasks</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{taskStats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{taskStats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">In Progress</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{taskStats.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{taskStats.completed}</p>
          </div>
        </div>

        {/* Workspace Members */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Team Members</h2>
            {isManager && (
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                {showAddMember ? '✕ Cancel' : '+ Add Employee'}
              </button>
            )}
          </div>

          {/* Add Member Form */}
          {showAddMember && (
            <form onSubmit={handleAddMember} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee *</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Choose an employee...</option>
                  {getAvailableEmployees().map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
                {getAvailableEmployees().length === 0 && (
                  <p className="text-xs text-gray-600 mt-1">All employees are already members of this workspace.</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="MEMBER">Team Member</option>
                  <option value="LEAD">Team Lead</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={!selectedUserId}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Add Employee
              </button>
            </form>
          )}

          {/* Members List */}
          {workspace?.members && workspace.members.length > 0 ? (
            <div className="space-y-3">
              {workspace.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {member.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.user?.name}</p>
                      <p className="text-sm text-gray-600">{member.user?.email}</p>
                      <p className="text-xs text-indigo-600 font-medium mt-1">{member.role}</p>
                    </div>
                  </div>
                  {isManager && member.userId !== workspace.createdById && (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No team members added yet.</p>
          )}
        </div>

        {/* Create Task Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Tasks</h2>
            {isManager && (
              <button
                onClick={() => setShowCreateTask(!showCreateTask)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                {showCreateTask ? '✕ Cancel' : '+ New Task'}
              </button>
            )}
          </div>

          {showCreateTask && (
            <form onSubmit={handleCreateTask} className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Enter task title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoComplete="off"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Enter task description (optional)"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Link</label>
                <input
                  type="url"
                  value={taskForm.referenceLink}
                  onChange={(e) => setTaskForm({ ...taskForm, referenceLink: e.target.value })}
                  placeholder="Enter reference link (Instagram, YouTube, etc.)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">This link will be shared with team members as a reference</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Create Task
              </button>
            </form>
          )}

          {/* Tasks List */}
          <div className="p-6">
            {tasks?.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => navigate(`/workspaces/${workspaceId}/tasks/${task.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description.substring(0, 100)}...</p>
                        )}
                        {task.referenceLink && (
                          <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p className="text-xs text-gray-600 font-medium">📎 Reference Link</p>
                            <a
                              href={task.referenceLink}
                              onClick={(e) => e.stopPropagation()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-700 underline break-all"
                            >
                              Click to view reference
                            </a>
                          </div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium ${
                              task.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-700'
                                : task.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {task.status}
                          </span>
                          {task.priority && (
                            <span
                              className={`text-xs px-2 py-1 rounded font-medium ${
                                task.priority === 'URGENT'
                                  ? 'bg-red-100 text-red-700'
                                  : task.priority === 'HIGH'
                                  ? 'bg-orange-100 text-orange-700'
                                  : task.priority === 'MEDIUM'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {task.priority}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="text-xs text-gray-600">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {isManager && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No tasks yet. {isManager && 'Create one to get started!'}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
