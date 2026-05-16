import express from 'express';
import * as workspaceController from '../controllers/workspace.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Dashboard routes
router.get('/dashboard/manager', workspaceController.getManagerDashboard);
router.get('/dashboard/employee', workspaceController.getEmployeeDashboard);

// CRUD operations
router.post('/', authorize('MANAGER', 'ADMIN'), workspaceController.createWorkspace);
router.get('/', workspaceController.getWorkspaces);
router.get('/:id', workspaceController.getWorkspace);
router.put('/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

// Members
router.post('/:id/members', workspaceController.addMember);
router.delete('/:id/members/:userId', workspaceController.removeMember);

// Activity
router.get('/:id/activity', workspaceController.getActivity);

export default router;
