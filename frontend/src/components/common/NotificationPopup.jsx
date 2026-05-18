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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Notification Card - Responsive */}
      <div className={`relative rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-300 ${notification?.type?.includes('TASK_REMINDER') ? 'bg-white border-2 border-red-100' : 'bg-white'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-200 rounded-t-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="text-4xl flex-shrink-0">{notification?.type?.includes('TASK_REMINDER') ? '🚨' : '⚠️'}</div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {notification?.type?.includes('TASK_REMINDER') ? 'Unassigned Employees — Action Required' : 'Pending Task Assignments'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {notification?.type?.includes('TASK_REMINDER') ? 'Some employees are not assigned to any workspace for tomorrow.' : 'Action required for task assignments'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
              {notification?.message}
            </p>
          </div>

          {notification?.type?.includes('TASK_REMINDER') && (
            <div className="mb-6 px-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/dashboard');
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                Assign Now
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
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
        <div className="flex flex-col sm:flex-row gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-sm"
          >
            Dismiss
          </button>
          {!notification?.isRead && (
            <button
              onClick={handleMarkRead}
              disabled={isMarking}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm disabled:opacity-50"
            >
              {isMarking ? 'Marking...' : 'Mark as Read'}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-semibold text-sm disabled:opacity-50"
            title="Delete notification"
          >
            {isDeleting ? '...' : '🗑️'}
          </button>
        </div>
      </div>
    </div>
  );
}
