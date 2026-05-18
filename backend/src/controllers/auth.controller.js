import { z } from 'zod';
import * as authService from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { notifyManagerOnLogin, getUnassignedEmployees } from '../utils/taskReminderScheduler.js';
import { createNotification } from '../utils/notification.js';

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
  managerId: z.string().optional(), // For assigning employees to managers
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
    
    // Check if manager and notify about unassigned tasks
    if (result.user.role === 'MANAGER') {
      try {
        await notifyManagerOnLogin(result.user.id);
      } catch (notificationError) {
        console.error('Failed to send login notification:', notificationError.message);
        // Don't fail the login, just log the error
      }
    }
    
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
    // If an employee is registering/being created and no managerId provided,
    // auto-assign the single existing manager (project constraint: only one manager).
    if ((validated.role === 'EMPLOYEE' || !validated.role) && !validated.managerId) {
      const { prisma } = await import('../config/db.js');
      const singleManager = await prisma.user.findFirst({ where: { role: 'MANAGER' } });
      if (!singleManager) {
        return errorResponse(res, 400, 'No manager found to assign employee to');
      }
      validated.managerId = singleManager.id;
    }

    const user = await authService.registerUser(validated);
    // If an employee was created, notify their manager about unassigned tasks/workspaces
    if (user.role === 'EMPLOYEE' && user.managerId) {
      try {
        await notifyManagerOnLogin(user.managerId);
        // Also create a DB-only notification specifically mentioning this employee
        try {
          const missing = await getUnassignedEmployees(user.managerId);
          const isMissing = missing.some((m) => m.id === user.id);
          if (isMissing) {
            const message = `New employee ${user.name} has been added and is not assigned to any workspace for tomorrow.`;
            await createNotification(user.managerId, null, 'TASK_REMINDER_MANAGER', message, null);
          }
        } catch (e) {
          console.error('Failed to create DB notification for new employee:', e.message);
        }
      } catch (err) {
        console.error('Failed to notify manager after registration:', err.message);
      }
    }

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

    // If requester is HR, allow only creating EMPLOYEE accounts
    if (req.user.role === 'HR' && validated.role && validated.role !== 'EMPLOYEE') {
      return errorResponse(res, 403, 'HR can only create EMPLOYEE users');
    }

    // When creating an EMPLOYEE via Admin/HR, if managerId is missing
    // auto-assign the single manager (project constraint: only one manager).
    if ((req.user.role === 'HR' || req.user.role === 'ADMIN') && (validated.role === 'EMPLOYEE' || !validated.role)) {
      if (!validated.managerId) {
        const { prisma } = await import('../config/db.js');
        const singleManager = await prisma.user.findFirst({ where: { role: 'MANAGER' } });
        if (!singleManager) {
          return errorResponse(res, 400, 'No manager found to assign employee to');
        }
        validated.managerId = singleManager.id;
      }
    }

    const user = await authService.registerUser(validated);

    // If HR/Admin created an employee, notify their manager immediately
    if (user.role === 'EMPLOYEE' && user.managerId) {
      try {
        await notifyManagerOnLogin(user.managerId);
        // Also create a DB-only notification specifically mentioning this employee
        try {
          const missing = await getUnassignedEmployees(user.managerId);
          const isMissing = missing.some((m) => m.id === user.id);
          if (isMissing) {
            const message = `New employee ${user.name} has been added and is not assigned to any workspace for tomorrow.`;
            await createNotification(user.managerId, null, 'TASK_REMINDER_MANAGER', message, null);
          }
        } catch (e) {
          console.error('Failed to create DB notification for new employee:', e.message);
        }
      } catch (err) {
        console.error('Failed to notify manager after createUser:', err.message);
      }
    }

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
