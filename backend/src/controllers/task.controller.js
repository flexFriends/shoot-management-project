import { z } from 'zod';
import * as taskService from '../services/task.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { isToday } from '../utils/dateHelper.js';

const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  referenceLink: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'BLOCKED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  order: z.number().default(0),
});

const updateTaskSchema = createTaskSchema.partial();

const submitTaskSchema = z.object({
  submissionLink: z.string().url().optional(),
  note: z.string().optional(),
});

/**
 * Create task
 */
export const createTask = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    
    // Clean up empty strings and convert dates to ISO-8601 DateTime format
    const cleanedData = Object.entries(req.body).reduce((acc, [key, value]) => {
      if (value === '' || value === null || value === undefined) {
        // Skip empty values
        return acc;
      }
      // Convert date strings to ISO-8601 DateTime format
      if (key === 'dueDate' && typeof value === 'string') {
        // If it's just a date string (YYYY-MM-DD), append T00:00:00Z
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          acc[key] = `${value}T00:00:00Z`;
        } else {
          acc[key] = value;
        }
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    const validated = createTaskSchema.parse(cleanedData);

    // Check workspace access
    const { prisma } = await import('../config/db.js');
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { createdById: true, id: true },
    });

    if (!workspace) {
      return errorResponse(res, 404, 'Workspace not found');
    }

    if (workspace.createdById !== req.user.userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 403, 'Access denied');
    }

    const task = await taskService.createTask(workspaceId, validated, req.user.userId);
    return successResponse(res, 201, task, 'Task created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, 'Validation error', error.errors);
    }
    // Handle Prisma errors
    if (error.code === 'P2025') {
      return errorResponse(res, 404, 'Related record not found');
    }
    const message = error.message || 'Failed to create task';
    return errorResponse(res, 500, message);
  }
};

/**
 * Get tasks for a workspace
 */
export const getTasks = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    // Check workspace access
    const { prisma } = await import('../config/db.js');
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace) {
      return errorResponse(res, 404, 'Workspace not found');
    }

    // Check if user is member or creator or admin/hr
    if (
      req.user.role !== 'ADMIN' &&
      req.user.role !== 'HR' &&
      workspace.createdById !== req.user.userId &&
      !workspace.members.some((m) => m.userId === req.user.userId)
    ) {
      return errorResponse(res, 403, 'Access denied');
    }

    const tasks = await taskService.getWorkspaceTasks(workspaceId);
    return successResponse(res, 200, tasks, 'Tasks fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Get single task
 */
export const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await taskService.getTaskById(id);
    return successResponse(res, 200, task, 'Task fetched successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Update task
 */
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = updateTaskSchema.parse(req.body);

    const task = await taskService.getTaskById(id);

    // Check workspace access
    const { prisma } = await import('../config/db.js');
    const workspace = await prisma.workspace.findUnique({
      where: { id: task.workspaceId },
      select: { createdById: true },
    });

    if (workspace.createdById !== req.user.userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 403, 'Access denied');
    }

    const updated = await taskService.updateTask(id, validated);
    return successResponse(res, 200, updated, 'Task updated successfully');
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
 * Delete task
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await taskService.getTaskById(id);

    // Check workspace access
    const { prisma } = await import('../config/db.js');
    const workspace = await prisma.workspace.findUnique({
      where: { id: task.workspaceId },
      select: { createdById: true },
    });

    if (workspace.createdById !== req.user.userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 403, 'Access denied');
    }

    const deleted = await taskService.deleteTask(id);
    return successResponse(res, 200, deleted, 'Task deleted successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Submit task (employee completing)
 */
export const submitTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = submitTaskSchema.parse(req.body);

    const task = await taskService.getTaskById(id);

    // Check if user is workspace member
    const { prisma } = await import('../config/db.js');
    const workspace = await prisma.workspace.findUnique({
      where: { id: task.workspaceId },
      include: { members: true },
    });

    if (!workspace.members.some((m) => m.userId === req.user.userId)) {
      return errorResponse(res, 403, 'Not a workspace member');
    }

    const result = await taskService.submitTask(id, req.user.userId, validated);
    return successResponse(res, 200, result, 'Task submitted successfully');
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
 * Get task submission
 */
export const getSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = await taskService.getTaskSubmission(id);
    return successResponse(res, 200, submission, 'Submission fetched successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Reorder tasks
 */
export const reorderTasks = async (req, res, next) => {
  try {
    const { taskIds } = req.body;

    if (!Array.isArray(taskIds)) {
      return errorResponse(res, 400, 'taskIds must be an array');
    }

    const result = await taskService.reorderTasks(taskIds);
    return successResponse(res, 200, result, 'Tasks reordered successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Add comment to task
 */
export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return errorResponse(res, 400, 'Content is required');
    }

    await taskService.getTaskById(id);
    const comment = await taskService.addComment(id, req.user.userId, content);
    return successResponse(res, 201, comment, 'Comment added successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Get task comments
 */
export const getComments = async (req, res, next) => {
  try {
    const { id } = req.params;

    await taskService.getTaskById(id);
    const comments = await taskService.getTaskComments(id);
    return successResponse(res, 200, comments, 'Comments fetched successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Add attachment to task
 */
export const addAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return errorResponse(res, 400, 'File is required');
    }

    await taskService.getTaskById(id);

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/api/files/${req.file.filename}`,
    };

    const attachment = await taskService.addAttachment(id, fileData);
    return successResponse(res, 201, attachment, 'File uploaded successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Get task attachments
 */
export const getAttachments = async (req, res, next) => {
  try {
    const { id } = req.params;

    await taskService.getTaskById(id);
    const attachments = await taskService.getTaskAttachments(id);
    return successResponse(res, 200, attachments, 'Attachments fetched successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Delete attachment
 */
export const deleteAttachment = async (req, res, next) => {
  try {
    const { attachmentId } = req.params;

    const attachment = await taskService.deleteAttachment(attachmentId);
    return successResponse(res, 200, attachment, 'Attachment deleted successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    return errorResponse(res, 500, error.message);
  }
};

export default {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  submitTask,
  getSubmission,
  reorderTasks,
  addComment,
  getComments,
  addAttachment,
  getAttachments,
  deleteAttachment,
};
