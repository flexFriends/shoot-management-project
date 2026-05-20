import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { workspaceApi } from '../api/index.js';
import Sidebar from '../components/layout/Sidebar.jsx';

const formatDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

export default function WorkspaceEdit() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    shootLocation: '',
    shootDate: '',
    setupType: 'PREMIUM',
    totalVideos: 0,
    totalPics: 0,
    arrivalTime: '',
    notes: '',
    coverImage: '',
  });

  const { data: workspace, isLoading } = useQuery({
    queryKey: ['workspace-edit', workspaceId],
    queryFn: async () => {
      const response = await workspaceApi.getById(workspaceId);
      return response.data.data;
    },
  });

  useEffect(() => {
    if (!workspace) return;

    setForm({
      title: workspace.title || '',
      description: workspace.description || '',
      shootLocation: workspace.shootLocation || '',
      shootDate: formatDateInput(workspace.shootDate),
      setupType: workspace.setupType || 'PREMIUM',
      totalVideos: workspace.totalVideos !== undefined ? workspace.totalVideos : 0,
      totalPics: workspace.totalPics !== undefined ? workspace.totalPics : 0,
      arrivalTime: workspace.arrivalTime || '',
      notes: workspace.notes || '',
      coverImage: workspace.coverImage || '',
    });
  }, [workspace]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error('Workspace title is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = Object.entries(form).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      await workspaceApi.update(workspaceId, payload);
      toast.success('Workspace updated successfully');
      navigate(`/workspaces/${workspaceId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update workspace');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center ml-0 pt-16 overflow-auto md:ml-64 md:pt-0">
          <p className="text-gray-500">Loading workspace...</p>
        </main>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center ml-0 pt-16 overflow-auto md:ml-64 md:pt-0">
          <p className="text-gray-500">Workspace not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0 overflow-auto transition-all duration-300">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="mb-8">
            <button
              type="button"
              onClick={() => navigate(`/workspaces/${workspaceId}`)}
              className="mb-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              ← Back to workspace
            </button>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-4xl">Edit Workspace</h1>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">Update the workspace details for your team.</p>
          </div>

          <div className="mx-auto max-w-4xl rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Workspace Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoComplete="off"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shoot Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shoot Location</label>
                    <input
                      type="text"
                      value={form.shootLocation}
                      onChange={(event) => setForm({ ...form, shootLocation: event.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shoot Date</label>
                    <input
                      type="date"
                      value={form.shootDate}
                      onChange={(event) => setForm({ ...form, shootDate: event.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Setup Type</label>
                  <select
                    value={form.setupType}
                    onChange={(event) => setForm({ ...form, setupType: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="PREMIUM">Premium</option>
                    <option value="VERY_PREMIUM">Very Premium</option>
                    <option value="PHONE_SETUP">Phone Setup</option>
                  </select>
                </div>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shoot Deliverables & Schedule</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Videos</label>
                    <input
                      type="number"
                      min="0"
                      value={form.totalVideos}
                      onChange={(event) => setForm({ ...form, totalVideos: Number(event.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Pics</label>
                    <input
                      type="number"
                      min="0"
                      value={form.totalPics}
                      onChange={(event) => setForm({ ...form, totalPics: Number(event.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
                    <input
                      type="text"
                      value={form.arrivalTime}
                      onChange={(event) => setForm({ ...form, arrivalTime: event.target.value })}
                      placeholder="e.g., 10:00 AM"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(event) => setForm({ ...form, notes: event.target.value })}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={form.coverImage}
                    onChange={(event) => setForm({ ...form, coverImage: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-6 border-t sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate(`/workspaces/${workspaceId}`)}
                  className="w-full flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex-1 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50 sm:w-auto"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}