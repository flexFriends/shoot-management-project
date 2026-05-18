import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { notificationApi } from '../../api/index.js';
import { useAuthStore } from '../../store/authStore.js';
import NotificationPopup from './NotificationPopup.jsx';

export default function NotificationCenter() {
  const user = useAuthStore((state) => state.user);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationApi.getAll();
      return response.data.data || [];
    },
    enabled: user?.role === 'MANAGER' || user?.role === 'ADMIN' || user?.role === 'HR',
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    setUnreadCount(unread);

    // Show popup for first unread notification on load. Prefer TASK_REMINDER types.
    if (unread > 0 && !selectedNotification && !showPopup) {
      const firstReminder = notifications.find(n => !n.isRead && n.type && n.type.includes('TASK_REMINDER'));
      const firstUnread = firstReminder || notifications.find(n => !n.isRead);
      if (firstUnread) {
        setSelectedNotification(firstUnread);
        setShowPopup(true);
      }
    }
  }, [notifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      await refetch();
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      await refetch();
      toast.success('All marked as read');
      setShowDropdown(false);
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationApi.delete(notificationId);
      await refetch();
      toast.success('Notification deleted');
      if (selectedNotification?.id === notificationId) {
        setShowPopup(false);
        setSelectedNotification(null);
      }
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  if (user?.role !== 'MANAGER' && user?.role !== 'ADMIN' && user?.role !== 'HR') {
    return null;
  }

  return (
    <>
      {/* Desktop & Mobile Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          title="Notifications"
        >
          <span className="text-2xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Modal Overlay for Notifications - Teleported to Document Body */}
      {showDropdown && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Click to Close */}
          <div className="absolute inset-0" onClick={() => setShowDropdown(false)} />

          {/* Modal Content Panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-xl w-full max-h-[75vh] flex flex-col animate-in fade-in zoom-in duration-200 z-50">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-gray-900 text-xl">All Notifications</h3>
                <p className="text-xs text-gray-500 mt-0.5">Stay updated on your workspace and task assignments</p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full transition font-semibold"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500 font-medium">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="py-16 px-6 text-center text-gray-500">
                  <p className="text-5xl mb-3">📭</p>
                  <p className="text-gray-900 font-semibold text-lg">Clean slate!</p>
                  <p className="text-sm text-gray-500 mt-1">You have no pending notifications at the moment.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-5 hover:bg-slate-50/60 transition cursor-pointer flex items-start justify-between gap-4 group ${
                      !notification.isRead ? 'bg-blue-50/40 border-l-4 border-blue-600 pl-4' : 'pl-5'
                    }`}
                  >
                    <div
                      className="flex-1"
                      onClick={() => {
                        setSelectedNotification(notification);
                        setShowDropdown(false);
                        setShowPopup(true);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-3xl flex-shrink-0">
                          {notification.type?.includes('HR') ? '👩‍💼' : notification.type?.includes('ADMIN') ? '⚡' : '⚠️'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 leading-relaxed break-words">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                            📅 {new Date(notification.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <span className="flex-shrink-0 w-2.5 h-2.5 bg-blue-600 rounded-full mt-1.5"></span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg text-lg transition flex-shrink-0"
                      title="Delete notification"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-gray-100 text-right rounded-b-2xl">
              <button
                onClick={() => setShowDropdown(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-semibold text-sm shadow-md shadow-indigo-100"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Notification Detail Popup Modal - Teleported to Document Body */}
      {showPopup && selectedNotification && createPortal(
        <NotificationPopup
          notification={selectedNotification}
          onClose={handleClosePopup}
          onMarkRead={() => {
            handleMarkAsRead(selectedNotification.id);
            handleClosePopup();
          }}
          onDelete={() => handleDelete(selectedNotification.id)}
        />,
        document.body
      )}
    </>
  );
}
