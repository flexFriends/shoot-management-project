import { z } from 'zod';
import * as workspaceService from '../services/workspace.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import path from 'path';

const createWorkspaceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().nullable().optional(),
  shootLocation: z.string().nullable().optional(),
  shootDate: z.string().nullable().optional(),
  setupType: z.enum(['PREMIUM', 'VERY_PREMIUM', 'PHONE_SETUP']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  status: z.enum(['DRAFT', 'ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED', 'PENDING']).optional().default('DRAFT'),
  notes: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  totalVideos: z.coerce.number().nonnegative().optional().default(0),
  totalPics: z.coerce.number().nonnegative().optional().default(0),
  arrivalTime: z.string().nullable().optional(),
});

const updateWorkspaceSchema = createWorkspaceSchema.partial();

/**
 * Create workspace
 */
export const createWorkspace = async (req, res, next) => {
  try {
    // Clean up empty strings and convert dates to ISO-8601 DateTime format
    const cleanedBody = Object.entries(req.body).reduce((acc, [key, value]) => {
      if (value === '') {
        // Skip empty strings entirely (don't include them)
        return acc;
      } else if (value !== null && value !== undefined) {
        // Convert date strings to ISO-8601 DateTime format
        if ((key === 'shootDate' || key === 'dueDate') && typeof value === 'string') {
          // If it's just a date string (YYYY-MM-DD), append T00:00:00Z
          if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            acc[key] = `${value}T00:00:00Z`;
          } else {
            acc[key] = value;
          }
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});
    
    const validated = createWorkspaceSchema.parse(cleanedBody);
    const workspace = await workspaceService.createWorkspace(validated, req.user.userId);
    return successResponse(res, 201, workspace, 'Workspace created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, 'Validation error', error.errors);
    }
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return errorResponse(res, 400, 'Workspace with this name already exists');
    }
    if (error.code === 'P2025') {
      return errorResponse(res, 404, 'Related record not found');
    }
    // Generic error handling
    const message = error.message || 'Failed to create workspace';
    console.error('Workspace creation error:', error);
    return errorResponse(res, 500, message);
  }
};

/**
 * Get all workspaces
 */
export const getWorkspaces = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await workspaceService.getWorkspaces(
      req.user.userId,
      req.user.role,
      page,
      limit
    );
    return successResponse(res, 200, result, 'Workspaces fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Get single workspace
 */
export const getWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspace = await workspaceService.getWorkspaceById(id);

    // Check access (ADMIN/HR see all, MANAGER sees own, EMPLOYEE sees assigned)
    if (
      req.user.role !== 'ADMIN' &&
      req.user.role !== 'HR' &&
      workspace.createdById !== req.user.userId &&
      !workspace.members.some((m) => m.userId === req.user.userId)
    ) {
      return errorResponse(res, 403, 'Access denied');
    }

    return successResponse(res, 200, workspace, 'Workspace fetched successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Update workspace
 */
export const updateWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cleanedBody = Object.entries(req.body).reduce((acc, [key, value]) => {
      if (value === '') {
        return acc;
      }

      if (value !== null && value !== undefined) {
        if ((key === 'shootDate' || key === 'dueDate') && typeof value === 'string') {
          if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            acc[key] = `${value}T00:00:00Z`;
          } else {
            acc[key] = value;
          }
        } else {
          acc[key] = value;
        }
      }

      return acc;
    }, {});

    const validated = updateWorkspaceSchema.parse(cleanedBody);

    const workspace = await workspaceService.getWorkspaceById(id);

    // Allow workspace owners, managers, and admins to update
    if (workspace.createdById !== req.user.userId && req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
      return errorResponse(res, 403, 'Access denied');
    }

    const updated = await workspaceService.updateWorkspace(id, validated);
    return successResponse(res, 200, updated, 'Workspace updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, 'Validation error', error.errors);
    }
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Delete workspace
 */
export const deleteWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;

    const workspace = await workspaceService.getWorkspaceById(id);

    // Only ADMIN can delete
    if (req.user.role !== 'ADMIN') {
      return errorResponse(res, 403, 'Only admins can delete workspaces');
    }

    const deleted = await workspaceService.deleteWorkspace(id);
    return successResponse(res, 200, deleted, 'Workspace deleted successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Add member to workspace
 */
export const addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    const workspace = await workspaceService.getWorkspaceById(id);

    // Only creator or ADMIN can add members
    if (workspace.createdById !== req.user.userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 403, 'Access denied');
    }

    const result = await workspaceService.addWorkspaceMember(id, userId, role);
    return successResponse(res, 201, result, 'Member added successfully');
  } catch (error) {
    if (error.message.includes('Unique constraint')) {
      return errorResponse(res, 409, 'Member already in workspace');
    }
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Employee shares live location for a workspace membership.
 */
export const shareAttendanceLocation = async (req, res, next) => {
  try {
    const { id: workspaceId, userId } = req.params;

    if (req.user.role !== 'EMPLOYEE' && req.user.role !== 'MANAGER' && req.user.role !== 'ADMIN') {
      return errorResponse(res, 403, 'Access denied');
    }

    if (req.user.role === 'EMPLOYEE' && req.user.userId !== userId) {
      return errorResponse(res, 403, 'Employees can only share their own attendance location');
    }

    const latitude = Number(req.body?.latitude);
    const longitude = Number(req.body?.longitude);
    const accuracyValue = req.body?.accuracy;
    const accuracy = accuracyValue === undefined || accuracyValue === null || accuracyValue === '' ? null : Number(accuracyValue);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return errorResponse(res, 400, 'Latitude and longitude are required');
    }

    const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const updated = await workspaceService.submitAttendanceLocation(
      workspaceId,
      userId,
      {
        latitude,
        longitude,
        accuracy: Number.isFinite(accuracy) ? accuracy : null,
        link: mapLink,
      },
      req.user.userId,
      req.body?.note || null
    );

    return successResponse(res, 200, updated, 'Attendance location shared successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Manager marks a workspace member present after verifying attendance location.
 */
export const markAttendancePresent = async (req, res, next) => {
  try {
    const { id: workspaceId, userId } = req.params;

    const workspace = await workspaceService.getWorkspaceById(workspaceId);
    if (req.user.role !== 'ADMIN' && workspace.createdById !== req.user.userId) {
      return errorResponse(res, 403, 'Only the workspace owner or an admin can mark attendance present');
    }

    const updated = await workspaceService.markMemberPresent(workspaceId, userId, req.user.userId);
    return successResponse(res, 200, updated, 'Attendance marked as present');
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Remove member from workspace
 */
export const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const workspace = await workspaceService.getWorkspaceById(id);

    // Only creator or ADMIN can remove members
    if (workspace.createdById !== req.user.userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 403, 'Access denied');
    }

    const member = await workspaceService.removeWorkspaceMember(id, userId);
    return successResponse(res, 200, member, 'Member removed successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, 'Member not found');
    }
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Get workspace activity
 */
export const getActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const workspace = await workspaceService.getWorkspaceById(id);

    // Check access
    if (
      req.user.role !== 'ADMIN' &&
      req.user.role !== 'HR' &&
      workspace.createdById !== req.user.userId &&
      !workspace.members.some((m) => m.userId === req.user.userId)
    ) {
      return errorResponse(res, 403, 'Access denied');
    }

    const result = await workspaceService.getWorkspaceActivity(id, page, limit);
    return successResponse(res, 200, result, 'Activity fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Get manager dashboard stats
 */
export const getManagerDashboard = async (req, res, next) => {
  try {
    const result = await workspaceService.getManagerDashboard(req.user.userId);
    return successResponse(res, 200, result, 'Manager dashboard fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getUnassignedEmployeesAudit = async (req, res, next) => {
  try {
    const managerId = req.query.managerId || req.user.userId;
    const result = await workspaceService.getUnassignedEmployeesForManager(managerId);
    return successResponse(res, 200, result, 'Unassigned employees fetched');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Get employee dashboard stats
 */
export const getEmployeeDashboard = async (req, res, next) => {
  try {
    const result = await workspaceService.getEmployeeDashboard(req.user.userId);
    return successResponse(res, 200, result, 'Employee dashboard fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export default {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
  shareAttendanceLocation,
  markAttendancePresent,
  getActivity,
  getManagerDashboard,
  getUnassignedEmployeesAudit,
  getEmployeeDashboard,
};
