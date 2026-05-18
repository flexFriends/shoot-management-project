import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true },
        },
        recipient: {
          select: { id: true, name: true, email: true, role: true },
        },
        task: {
          select: { id: true, title: true, status: true, dueDate: true },
        },
      },
    });

    return successResponse(res, 200, notifications, 'Notifications fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        recipientId: req.user.userId,
      },
      select: { id: true },
    });

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return successResponse(res, 200, updated, 'Notification marked as read');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        recipientId: req.user.userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return successResponse(res, 200, result, 'All notifications marked as read');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        recipientId: req.user.userId,
      },
      select: { id: true },
    });

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found');
    }

    const deleted = await prisma.notification.delete({
      where: { id },
    });

    return successResponse(res, 200, deleted, 'Notification deleted successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export default {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};