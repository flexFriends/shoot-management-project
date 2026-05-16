import { prisma } from '../config/db.js';

/**
 * Create workspace
 */
export const createWorkspace = async (workspaceData, userId) => {
  return prisma.$transaction(async (tx) => {
    const createdWorkspace = await tx.workspace.create({
      data: {
        ...workspaceData,
        createdById: userId,
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: createdWorkspace.id,
        userId,
        role: 'LEAD',
      },
    });

    await tx.activityLog.create({
      data: {
        action: 'WORKSPACE_CREATED',
        description: `Workspace "${createdWorkspace.title}" created`,
        userId,
        workspaceId: createdWorkspace.id,
        metadata: {
          priority: createdWorkspace.priority,
          status: createdWorkspace.status,
        },
      },
    });

    return tx.workspace.findUnique({
      where: { id: createdWorkspace.id },
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
  });
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
  return prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, title: true, setupType: true },
    });

    const member = await tx.workspaceMember.create({
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

    if (workspace?.setupType) {
      await tx.notification.create({
        data: {
          type: 'WORKSPACE_ASSIGNED',
          title: `Workspace setup required: ${workspace.title}`,
          message: `Please come prepared with a ${workspace.setupType.replace('_', ' ').toLowerCase()} setup for ${workspace.title}.`,
          recipientId: userId,
          workspaceId,
          metadata: {
            setupType: workspace.setupType,
            workspaceTitle: workspace.title,
          },
        },
      });
    }

    return member;
  });
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

/**
 * Get manager dashboard stats
 */
export const getManagerDashboard = async (managerId) => {
  const workspaces = await prisma.workspace.findMany({
    where: { createdById: managerId },
    include: {
      tasks: {
        select: {
          id: true,
          status: true,
          assignee: { select: { id: true, name: true, email: true } },
        },
      },
      members: {
        select: {
          userId: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  // Aggregate task stats by employee
  const employeeStats = {};
  
  workspaces.forEach((workspace) => {
    workspace.tasks.forEach((task) => {
      if (task.assignee) {
        const empId = task.assignee.id;
        if (!employeeStats[empId]) {
          employeeStats[empId] = {
            id: empId,
            name: task.assignee.name,
            email: task.assignee.email,
            total: 0,
            assigned: 0,
            inProgress: 0,
            inReview: 0,
            completed: 0,
            rejected: 0,
          };
        }

        employeeStats[empId].total++;
        if (task.status === 'ASSIGNED') employeeStats[empId].assigned++;
        if (task.status === 'IN_PROGRESS') employeeStats[empId].inProgress++;
        if (task.status === 'IN_REVIEW') employeeStats[empId].inReview++;
        if (task.status === 'COMPLETED') employeeStats[empId].completed++;
        if (task.status === 'REJECTED') employeeStats[empId].rejected++;
      }
    });
  });

  // Calculate overall stats
  const allTasks = workspaces.flatMap((w) => w.tasks);
  const overallStats = {
    totalWorkspaces: workspaces.length,
    totalTasks: allTasks.length,
    assigned: allTasks.filter((t) => t.status === 'ASSIGNED').length,
    inProgress: allTasks.filter((t) => t.status === 'IN_PROGRESS').length,
    inReview: allTasks.filter((t) => t.status === 'IN_REVIEW').length,
    completed: allTasks.filter((t) => t.status === 'COMPLETED').length,
    rejected: allTasks.filter((t) => t.status === 'REJECTED').length,
    completionRate: allTasks.length > 0 
      ? Math.round((allTasks.filter((t) => t.status === 'COMPLETED').length / allTasks.length) * 100)
      : 0,
  };

  return {
    overall: overallStats,
    employees: Object.values(employeeStats),
    workspaces: workspaces.map((w) => ({
      id: w.id,
      title: w.title,
      taskCount: w.tasks.length,
    })),
  };
};

/**
 * Get employee dashboard stats
 */
export const getEmployeeDashboard = async (employeeId) => {
  const tasks = await prisma.todoTask.findMany({
    where: { assigneeId: employeeId },
    include: {
      workspace: { select: { id: true, title: true } },
      createdBy: { select: { id: true, name: true } },
      submission: {
        select: { status: true, submittedAt: true, approvalNote: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate stats
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'TODO' || t.status === 'ASSIGNED').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    inReview: tasks.filter((t) => t.status === 'IN_REVIEW').length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
    rejected: tasks.filter((t) => t.status === 'REJECTED').length,
    completionRate: tasks.length > 0 
      ? Math.round((tasks.filter((t) => t.status === 'COMPLETED').length / tasks.length) * 100)
      : 0,
  };

  // Group by workspace
  const workspaceGroups = {};
  tasks.forEach((task) => {
    const wsId = task.workspace.id;
    if (!workspaceGroups[wsId]) {
      workspaceGroups[wsId] = {
        workspaceId: wsId,
        workspaceName: task.workspace.title,
        tasks: [],
      };
    }
    workspaceGroups[wsId].tasks.push({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      createdBy: task.createdBy.name,
      submission: task.submission,
    });
  });

  return {
    stats,
    workspaces: Object.values(workspaceGroups),
    recentTasks: tasks.slice(0, 5),
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
  getManagerDashboard,
  getEmployeeDashboard,
};
