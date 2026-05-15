import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { taskApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';

export default function TaskDetail() {
  const { workspaceId, taskId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitForm, setSubmitForm] = useState({ submissionLink: '', note: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch task details
  const { data: task, isLoading: taskLoading, refetch: refetchTask } = useQuery({
    queryKey: ['task', workspaceId, taskId],
    queryFn: async () => {
      const response = await taskApi.getById(workspaceId, taskId);
      return response.data.data;
    },
  });

  // Fetch task submission
  const { data: submission } = useQuery({
    queryKey: ['task-submission', taskId],
    queryFn: async () => {
      try {
        const response = await taskApi.getSubmission(workspaceId, taskId);
        return response.data.data;
      } catch {
        return null;
      }
    },
  });

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!submitForm.submissionLink?.trim()) {
      toast.error('Please provide a submission link');
      return;
    }

    setIsSubmitting(true);
    try {
      await taskApi.submit(workspaceId, taskId, submitForm);
      toast.success('Task submitted successfully!');
      setSubmitForm({ submissionLink: '', note: '' });
      setShowSubmit(false);
      refetchTask();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (taskLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-500">Loading task...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Task not found</p>
        <button
          onClick={() => navigate(`/workspaces/${workspaceId}`)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Workspace
        </button>
      </div>
    );
  }

  const isEmployee = user.role === 'EMPLOYEE';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate(`/workspaces/${workspaceId}`)}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Task Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-gray-600 text-sm font-medium">Status</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{task.status}</p>
            </div>
            {task.priority && (
              <div>
                <p className="text-gray-600 text-sm font-medium">Priority</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{task.priority}</p>
              </div>
            )}
            {task.dueDate && (
              <div>
                <p className="text-gray-600 text-sm font-medium">Due Date</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {task.createdBy && (
              <div>
                <p className="text-gray-600 text-sm font-medium">Assigned By</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{task.createdBy.name}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div className="mb-6 pb-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Reference Link */}
          {task.referenceLink && (
            <div className="mb-6 pb-6 border-b bg-blue-50 p-4 rounded">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Reference Link</h2>
              <p className="text-gray-600 text-sm mb-2">
                This is the reference material you should follow or recreate:
              </p>
              <a
                href={task.referenceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Open Reference Link
              </a>
              <p className="text-xs text-gray-600 mt-2 break-all">{task.referenceLink}</p>
            </div>
          )}
        </div>

        {/* Submission Section */}
        {isEmployee && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Submission</h2>
              {!submission && !showSubmit && (
                <button
                  onClick={() => setShowSubmit(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Submit Work
                </button>
              )}
            </div>

            {submission ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 font-medium mb-2">✓ Submitted</p>
                <p className="text-sm text-gray-600 mb-2">
                  Submitted on: {new Date(submission.submittedAt).toLocaleString()}
                </p>
                <p className="text-sm font-medium text-gray-700 mb-1">Submission Link:</p>
                <a
                  href={submission.submissionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 break-all text-sm"
                >
                  {submission.submissionLink}
                </a>
                {submission.note && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-1">Your Note:</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{submission.note}</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {showSubmit && (
                  <form onSubmit={handleSubmitTask} className="space-y-4 bg-gray-50 p-4 rounded">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Submission Link *
                      </label>
                      <input
                        type="url"
                        value={submitForm.submissionLink}
                        onChange={(e) => setSubmitForm({ ...submitForm, submissionLink: e.target.value })}
                        placeholder="Paste your Instagram, Dropbox, or any link to your work"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Optional Notes
                      </label>
                      <textarea
                        value={submitForm.note}
                        onChange={(e) => setSubmitForm({ ...submitForm, note: e.target.value })}
                        placeholder="Add any notes or comments about your work"
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSubmit(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
