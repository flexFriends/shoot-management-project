import { z } from 'zod';
import * as authService from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().optional(),
  phone: z.string().optional(),
});

/**
 * Login controller
 */
export const login = async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await authService.loginUser(validated.email, validated.password);
    return successResponse(res, 200, result, 'Login successful');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, 'Validation error', error.errors);
    }
    return errorResponse(res, 401, error.message);
  }
};

/**
 * Register controller
 */
export const register = async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);
    const user = await authService.registerUser(validated);
    return successResponse(res, 201, user, 'User registered successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, 'Validation error', error.errors);
    }
    return errorResponse(res, 400, error.message);
  }
};

/**
 * Create user (Admin or HR)
 */
export const createUser = async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);

    // If requester is HR, prevent creating ADMIN or HR accounts
    if (req.user.role === 'HR' && validated.role && (validated.role === 'ADMIN' || validated.role === 'HR')) {
      return errorResponse(res, 403, 'HR cannot create ADMIN or HR users');
    }

    const user = await authService.registerUser(validated);
    return successResponse(res, 201, user, 'User created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, 'Validation error', error.errors);
    }
    return errorResponse(res, 400, error.message);
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    
    // Get unread notification count
    const { prisma } = await import('../config/db.js');
    const unreadCount = await prisma.notification.count({
      where: {
        recipientId: req.user.userId,
        isRead: false,
      },
    });

    return successResponse(res, 200, {
      user,
      unreadNotifications: unreadCount,
    }, 'User fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const validated = updateUserSchema.parse(req.body);
    const user = await authService.updateUser(req.user.userId, validated);
    return successResponse(res, 200, user, 'Profile updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, 'Validation error', error.errors);
    }
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await authService.getAllUsers(page, limit);
    return successResponse(res, 200, result, 'Users fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * HR dashboard: counts of managers and employees
 */
export const getHRDashboard = async (req, res, next) => {
  try {
    const counts = await authService.getRoleCounts();
    return successResponse(res, 200, counts, 'HR dashboard fetched');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Deactivate user (Admin only)
 */
export const deactivateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // Prevent HR from deactivating ADMIN or HR accounts
    if (req.user.role === 'HR') {
      const target = await authService.getUserById(userId);
      if (target.role === 'ADMIN' || target.role === 'HR') {
        return errorResponse(res, 403, 'HR cannot deactivate ADMIN or HR users');
      }
    }

    const user = await authService.deactivateUser(userId);
    return successResponse(res, 200, user, 'User deactivated successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Change user role (Admin only)
 */
export const changeUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'];
    if (!validRoles.includes(role)) {
      return errorResponse(res, 400, 'Invalid role');
    }

    // If requester is HR, disallow setting role to ADMIN or HR and disallow changing ADMIN/HR users
    if (req.user.role === 'HR') {
      if (role === 'ADMIN' || role === 'HR') {
        return errorResponse(res, 403, 'HR cannot assign ADMIN or HR roles');
      }
      const target = await authService.getUserById(userId);
      if (target.role === 'ADMIN' || target.role === 'HR') {
        return errorResponse(res, 403, 'HR cannot modify ADMIN or HR users');
      }
    }

    const user = await authService.changeUserRole(userId, role);
    return successResponse(res, 200, user, 'User role updated successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export default {
  login,
  register,
  createUser,
  getCurrentUser,
  updateProfile,
  getAllUsers,
  getHRDashboard,
  deactivateUser,
  changeUserRole,
};
