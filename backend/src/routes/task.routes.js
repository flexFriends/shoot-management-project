import express from 'express';
import * as taskController from '../controllers/task.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// CRUD operations
router.post('/', authorize('MANAGER', 'ADMIN'), taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTask);
router.put('/:id', authorize('MANAGER', 'ADMIN'), taskController.updateTask);
router.delete('/:id', authorize('MANAGER', 'ADMIN'), taskController.deleteTask);

// Task submission (employee completing a task)
router.post('/:id/submit', taskController.submitTask);
router.get('/:id/submission', taskController.getSubmission);

// Task submission approval/rejection (manager)
router.post('/:id/approve', authorize('MANAGER', 'ADMIN'), taskController.approveSubmission);
router.post('/:id/reject', authorize('MANAGER', 'ADMIN'), taskController.rejectSubmission);

// Comments
router.post('/:id/comments', taskController.addComment);
router.get('/:id/comments', taskController.getComments);

// Attachments
router.post('/:id/attachments', uploadMiddleware.single('file'), taskController.addAttachment);
router.get('/:id/attachments', taskController.getAttachments);
router.delete('/:id/attachments/:attachmentId', taskController.deleteAttachment);

// Reorder
router.patch('/reorder', authorize('MANAGER', 'ADMIN'), taskController.reorderTasks);

export default router;
