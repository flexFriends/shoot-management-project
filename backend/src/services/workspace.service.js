import { prisma } from '../config/db.js';

/**
 * Create workspace
 */
export const createWorkspace = async (workspaceData, userId) => {
  const workspace = await prisma.workspace.create({
    data: {
      ...workspaceData,
      createdById: userId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      },
    },
  });

  return workspace;
};

/**
 * Get all workspaces (with role-based filtering)
 */
export const getWorkspaces = async (userId, role, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  let where = {};

  if (role === 'MANAGER') {
    where = { createdById: userId };
  } else if (role === 'EMPLOYEE') {
    where = {
      members: {
        some: { userId },
      },
    };
  }
  // ADMIN and HR see all workspaces

  const [workspaces, total] = await Promise.all([
    prisma.workspace.findMany({
      where,
      skip,
      take: limit,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.workspace.count({ where }),
  ]);

  const workspacesWithProgress = workspaces.map((ws) => {
    const totalTasks = ws.tasks.length;
    const completedTasks = ws.tasks.filter((t) => t.status === 'COMPLETED').length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      ...ws,
      taskCount: totalTasks,
      completedTaskCount: completedTasks,
      progress: Math.round(progress),
    };
  });

  return {
    workspaces: workspacesWithProgress,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single workspace with tasks
 */
export const getWorkspaceById = async (workspaceId) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true, phone: true },
          },
        },
      },
      tasks: {
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
      },
      notifications: {
        select: { id: true },
      },
    },
  });

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  // Calculate progress
  const totalTasks = workspace.tasks.length;
  const completedTasks = workspace.tasks.filter((t) => t.status === 'COMPLETED').length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return {
    ...workspace,
    taskCount: totalTasks,
    completedTaskCount: completedTasks,
    progress: Math.round(progress),
  };
};

/**
 * Update workspace
 */
export const updateWorkspace = async (workspaceId, updateData) => {
  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: updateData,
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      },
      tasks: {
        select: { id: true, status: true },
      },
    },
  });

  return workspace;
};

/**
 * Delete workspace (soft delete)
 */
export const deleteWorkspace = async (workspaceId) => {
  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      status: 'ARCHIVED',
    },
  });

  return workspace;
};

/**
 * Add member to workspace
 */
export const addWorkspaceMember = async (workspaceId, userId, role = 'MEMBER') => {
  const member = await prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId,
      role,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  });

  return member;
};

/**
 * Remove member from workspace
 */
export const removeWorkspaceMember = async (workspaceId, userId) => {
  const member = await prisma.workspaceMember.delete({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  return member;
};

/**
 * Get workspace activity logs
 */
export const getWorkspaceActivity = async (workspaceId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: { workspaceId },
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.activityLog.count({ where: { workspaceId } }),
  ]);

  return {
    activities,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

export default {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
  getWorkspaceActivity,
};
