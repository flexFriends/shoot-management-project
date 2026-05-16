import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// HR/Admin can create users (HR can create EMPLOYEE or MANAGER only)
router.post('/users', authenticate, authorize('ADMIN', 'HR'), authController.createUser);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/profile', authenticate, authController.updateProfile);

// Admin & Manager routes (Manager needs to view employees to add them to workspaces)
router.get('/users', authenticate, authorize('ADMIN', 'MANAGER', 'HR'), authController.getAllUsers);

// HR dashboard
router.get('/hr-dashboard', authenticate, authorize('ADMIN', 'HR'), authController.getHRDashboard);

// Admin routes only
router.patch('/users/:userId/deactivate', authenticate, authorize('ADMIN', 'HR'), authController.deactivateUser);
router.patch('/users/:userId/role', authenticate, authorize('ADMIN', 'HR'), authController.changeUserRole);

export default router;
