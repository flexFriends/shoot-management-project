import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = express.Router();

router.use(authenticate);

// Must be before /:id routes to avoid route matching conflicts
router.patch('/read-all', notificationController.markAllNotificationsAsRead);

// Then parameterized routes
router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markNotificationAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;