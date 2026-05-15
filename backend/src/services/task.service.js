import { prisma } from '../config/db.js';

/**
 * Create task
 */
export const createTask = async (workspaceId, taskData, userId) => {
  const task = await prisma.todoTask.create({
    data: {
      ...taskData,
      workspaceId,
      createdById: userId,
    },
    include: {
      assignee: {
        select: { id: true, name: true, avatar: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      submission: {
        include: {
          submittedBy: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
      comments: {
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
      attachments: true,
    },
  });

  return task;
};

/**
 * Get tasks for a workspace
 */
export const getWorkspaceTasks = async (workspaceId) => {
  const tasks = await prisma.todoTask.findMany({
    where: { workspaceId },
    include: {
      assignee: {
        select: { id: true, name: true, avatar: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      submission: {
        include: {
          submittedBy: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
      comments: {
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      attachments: {
        orderBy: { uploadedAt: 'desc' },
      },
    },
    orderBy: { order: 'asc' },
  });

  return tasks;
};

/**
 * Get task by ID
 */
export const getTaskById = async (taskId) => {
  const task = await prisma.todoTask.findUnique({
    where: { id: taskId },
    include: {
      assignee: {
        select: { id: true, name: true, avatar: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      submission: {
        include: {
          submittedBy: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
      comments: {
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      attachments: {
        orderBy: { uploadedAt: 'desc' },
      },
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  return task;
};

/**
 * Update task
 */
export const updateTask = async (taskId, updateData) => {
  const task = await prisma.todoTask.update({
    where: { id: taskId },
    data: updateData,
    include: {
      assignee: {
        select: { id: true, name: true, avatar: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      submission: {
        include: {
          submittedBy: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
      comments: {
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
    },
  });

  return task;
};

/**
 * Delete task
 */
export const deleteTask = async (taskId) => {
  const task = await prisma.todoTask.delete({
    where: { id: taskId },
  });

  return task;
};

/**
 * Submit task (mark as completed with submission details)
 */
export const submitTask = async (taskId, userId, submissionData) => {
  const { submissionLink, note } = submissionData;

  // Update task status
  const task = await prisma.todoTask.update({
    where: { id: taskId },
    data: { status: 'COMPLETED' },
  });

  // Upsert submission (create or update)
  const submission = await prisma.taskSubmission.upsert({
    where: { taskId },
    create: {
      taskId,
      submittedById: userId,
      submissionLink,
      note,
    },
    update: {
      submittedById: userId,
      submissionLink,
      note,
      submittedAt: new Date(),
    },
    include: {
      submittedBy: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  return {
    task,
    submission,
  };
};

/**
 * Get task submission
 */
export const getTaskSubmission = async (taskId) => {
  const submission = await prisma.taskSubmission.findUnique({
    where: { taskId },
    include: {
      submittedBy: {
        select: { id: true, name: true, avatar: true, email: true },
      },
      task: {
        select: { id: true, title: true },
      },
    },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  return submission;
};

/**
 * Reorder tasks
 */
export const reorderTasks = async (taskIds) => {
  const updates = taskIds.map((id, index) =>
    prisma.todoTask.update({
      where: { id },
      data: { order: index },
    })
  );

  await Promise.all(updates);

  return { success: true };
};

/**
 * Add comment to task
 */
export const addComment = async (taskId, userId, content) => {
  const comment = await prisma.comment.create({
    data: {
      content,
      taskId,
      authorId: userId,
    },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  return comment;
};

/**
 * Get task comments
 */
export const getTaskComments = async (taskId) => {
  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return comments;
};

/**
 * Add attachment to task
 */
export const addAttachment = async (taskId, fileData) => {
  const { filename, originalName, mimetype, size, url } = fileData;

  const attachment = await prisma.attachment.create({
    data: {
      filename,
      originalName,
      mimetype,
      size,
      url,
      taskId,
    },
  });

  return attachment;
};

/**
 * Get task attachments
 */
export const getTaskAttachments = async (taskId) => {
  const attachments = await prisma.attachment.findMany({
    where: { taskId },
    orderBy: { uploadedAt: 'desc' },
  });

  return attachments;
};

/**
 * Delete attachment
 */
export const deleteAttachment = async (attachmentId) => {
  const attachment = await prisma.attachment.delete({
    where: { id: attachmentId },
  });

  return attachment;
};

export default {
  createTask,
  getWorkspaceTasks,
  getTaskById,
  updateTask,
  deleteTask,
  submitTask,
  getTaskSubmission,
  reorderTasks,
  addComment,
  getTaskComments,
  addAttachment,
  getTaskAttachments,
  deleteAttachment,
};
