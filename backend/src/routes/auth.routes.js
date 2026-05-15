import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/profile', authenticate, authController.updateProfile);

// Admin routes
router.get('/users', authenticate, authorize('ADMIN'), authController.getAllUsers);
router.patch('/users/:userId/deactivate', authenticate, authorize('ADMIN'), authController.deactivateUser);
router.patch('/users/:userId/role', authenticate, authorize('ADMIN'), authController.changeUserRole);

export default router;
