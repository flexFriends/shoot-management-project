import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { workspaceApi, taskApi, authApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';
import Sidebar from '../components/layout/Sidebar.jsx';

export default function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', referenceLink: '', priority: 'MEDIUM' });

  const { data: workspace, isLoading: wsLoading, refetch: refetchWorkspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const res = await workspaceApi.getById(workspaceId);
      return res.data.data;
    },
  });

  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ['workspace-tasks', workspaceId],
    queryFn: async () => {
      const res = await taskApi.getAll(workspaceId);
      return res.data.data || [];
    },
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      try {
        const res = await authApi.getAllUsers();
        return res.data.data?.users || [];
      } catch (e) {
        return [];
      }
    },
  });

  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return toast.error('Please select an employee');
    try {
      await workspaceApi.addMember(workspaceId, selectedUserId, memberRole);
      toast.success('Member added');
      setSelectedUserId('');
      setMemberRole('MEMBER');
      setShowAddMember(false);
      refetchWorkspace();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return toast.error('Task title required');
    try {
      const payload = { title: taskForm.title, priority: taskForm.priority, status: 'TODO' };
      if (taskForm.description) payload.description = taskForm.description;
      if (taskForm.referenceLink) payload.referenceLink = taskForm.referenceLink;
      if (taskForm.dueDate) payload.dueDate = taskForm.dueDate;
      await taskApi.create(workspaceId, payload);
      toast.success('Task created');
      setTaskForm({ title: '', description: '', dueDate: '', referenceLink: '', priority: 'MEDIUM' });
      setShowCreateTask(false);
      refetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const availableEmployees = () => {
    if (!Array.isArray(allUsers)) return [];
    const memberIds = workspace?.members?.map((m) => m.userId) || [];
    return allUsers.filter((u) => u.role === 'EMPLOYEE' && !memberIds.includes(u.id));
  };

  if (wsLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading workspace...</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500">Workspace not found</p>
      </div>
    );
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'PENDING').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0 overflow-auto transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 break-words sm:text-3xl">{workspace.title}</h1>
              <p className="mt-1 text-sm text-gray-600 break-words">{workspace.description}</p>
              {workspace.setupType && (
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mt-2">
                  Setup Required: {workspace.setupType.replace('_', ' ')}
                </p>
              )}
            </div>
            {isManager && (
              <button onClick={() => navigate(`/workspaces/${workspaceId}/edit`)} className="inline-flex w-full justify-center rounded bg-indigo-600 px-4 py-2 text-white sm:w-auto">
                Edit
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow"> <p className="text-sm text-gray-600">Total Tasks</p> <p className="text-2xl font-bold">{stats.total}</p> </div>
            <div className="bg-white p-4 rounded shadow"> <p className="text-sm text-gray-600">Pending</p> <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p> </div>
            <div className="bg-white p-4 rounded shadow"> <p className="text-sm text-gray-600">In Progress</p> <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p> </div>
            <div className="bg-white p-4 rounded shadow"> <p className="text-sm text-gray-600">Completed</p> <p className="text-2xl font-bold text-green-600">{stats.completed}</p> </div>
          </div>

          {/* Members */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-semibold">Team Members</h2>
              {isManager && (
                <button onClick={() => setShowAddMember((s) => !s)} className="inline-flex w-full justify-center rounded bg-indigo-600 px-3 py-2 text-white sm:w-auto">{showAddMember ? 'Cancel' : 'Add'}</button>
              )}
            </div>

            {showAddMember && (
              <form onSubmit={handleAddMember} className="mb-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full flex-1 rounded border px-3 py-2">
                    <option value="">Select employee</option>
                    {availableEmployees().map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                  <select value={memberRole} onChange={(e) => setMemberRole(e.target.value)} className="w-full rounded border px-3 py-2 sm:w-36">
                    <option value="MEMBER">Member</option>
                    <option value="LEAD">Lead</option>
                  </select>
                  <button className="w-full rounded bg-indigo-600 px-4 py-2 text-white sm:w-auto">Add</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {workspace.members?.length > 0 ? (
                workspace.members.map((m) => (
                  <div key={m.id} className="flex flex-col gap-3 rounded bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{m.user?.name}</p>
                      <p className="text-xs text-gray-600">{m.user?.email}</p>
                    </div>
                    {isManager && (
                      <button onClick={() => { if (confirm('Remove member?')) { workspaceApi.removeMember(workspaceId, m.userId).then(() => { toast.success('Removed'); refetchWorkspace(); }); } }} className="text-red-600">Remove</button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No members yet</p>
              )}
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-semibold">Tasks</h2>
              {isManager && <button onClick={() => setShowCreateTask((s) => !s)} className="inline-flex w-full justify-center rounded bg-indigo-600 px-3 py-2 text-white sm:w-auto">{showCreateTask ? 'Cancel' : 'New Task'}</button>}
            </div>

            {showCreateTask && (
              <form onSubmit={handleCreateTask} className="mb-4 space-y-3">
                <input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Title" className="w-full border px-3 py-2 rounded" />
                <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Description" rows={3} className="w-full border px-3 py-2 rounded" />
                <input
                  type="url"
                  value={taskForm.referenceLink}
                  onChange={(e) => setTaskForm({ ...taskForm, referenceLink: e.target.value })}
                  placeholder="Optional reference link (Instagram, YouTube, Drive, etc.)"
                  className="w-full border px-3 py-2 rounded"
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="w-full rounded border px-3 py-2 sm:w-auto" />
                  <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="w-full rounded border px-3 py-2 sm:w-auto">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                  <button className="w-full rounded bg-indigo-600 px-4 py-2 text-white sm:w-auto">Create</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task.id} className="cursor-pointer rounded border p-4 hover:shadow" onClick={() => navigate(`/workspaces/${workspaceId}/tasks/${task.id}`)}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
                      </div>
                      <div className="text-sm text-gray-500">{task.status}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No tasks yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
