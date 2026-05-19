import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotificationPopup({ notification, onClose, onMarkRead, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const navigate = useNavigate();

  const handleMarkRead = async () => {
    setIsMarking(true);
    try {
      await onMarkRead();
    } finally {
      setIsMarking(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Notification Card - Responsive */}
      <div className={`relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300 ${notification?.type?.includes('TASK_REMINDER') ? 'border-2 border-red-100 bg-white' : 'bg-white'}`}>
        {/* Header */}
        <div className="border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-1 items-start gap-3">
              <div className="flex-shrink-0 text-3xl sm:text-4xl">{notification?.type?.includes('TASK_REMINDER') ? '🚨' : '⚠️'}</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {notification?.type?.includes('TASK_REMINDER') ? 'Unassigned Employees — Action Required' : 'Pending Task Assignments'}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {notification?.type?.includes('TASK_REMINDER') ? 'Some employees are not assigned to any workspace for tomorrow.' : 'Action required for task assignments'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-2xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-5 sm:px-6">
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <p className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
              {notification?.message}
            </p>
          </div>

          {notification?.type?.includes('TASK_REMINDER') && (
            <div className="mb-6 px-0 sm:px-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/dashboard');
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
              >
                Assign Now
              </button>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              📅 {formatTime(notification?.createdAt)}
            </span>
            <span className={`px-3 py-1.5 rounded-full font-semibold ${
              notification?.isRead
                ? 'bg-gray-100 text-gray-600'
                : 'bg-amber-100 text-amber-700 animate-pulse'
            }`}>
              {notification?.isRead ? '✓ Read' : '● New'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:px-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Dismiss
          </button>
          {!notification?.isRead && (
            <button
              onClick={handleMarkRead}
              disabled={isMarking}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isMarking ? 'Marking...' : 'Mark as Read'}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 sm:px-4"
            title="Delete notification"
          >
            {isDeleting ? '...' : '🗑️'}
          </button>
        </div>
      </div>
    </div>
  );
}
