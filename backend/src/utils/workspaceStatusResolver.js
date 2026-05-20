import { prisma } from '../config/db.js';

/**
 * Resolves the dynamic workspace status based on dates and task completion.
 * @param {object} workspace 
 * @returns {string} The resolved status
 */
export const resolveWorkspaceStatus = (workspace) => {
  if (!workspace) return 'DRAFT';
  if (workspace.status === 'ARCHIVED') return 'ARCHIVED';

  const shootDate = workspace.shootDate;
  if (!shootDate) return workspace.status || 'DRAFT';

  // Format to YYYY-MM-DD in Asia/Kolkata timezone
  const formatDateToYMD = (dateVal) => {
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  };

  const todayYMD = formatDateToYMD(new Date());
  const shootYMD = formatDateToYMD(shootDate);

  if (!shootYMD) return workspace.status || 'DRAFT';

  if (shootYMD > todayYMD) {
    return 'DRAFT';
  } else if (shootYMD === todayYMD) {
    return 'ACTIVE';
  } else {
    // Past workspace: check tasks
    const tasks = workspace.tasks || [];
    const allCompleted = tasks.length > 0 && tasks.every((t) => t.status === 'COMPLETED');
    return allCompleted ? 'COMPLETED' : 'PENDING';
  }
};

/**
 * Checks a single workspace status and updates it in the database if it doesn't match the resolved status.
 * @param {string} workspaceId 
 */
export const syncWorkspaceStatusInDb = async (workspaceId) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        tasks: {
          select: { id: true, status: true }
        }
      }
    });

    if (!workspace) return null;

    const currentStatus = workspace.status;
    const newStatus = resolveWorkspaceStatus(workspace);

    if (currentStatus !== newStatus) {
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { status: newStatus }
      });
      return newStatus;
    }

    return currentStatus;
  } catch (error) {
    console.error(`[Workspace Sync] Error syncing workspace status for ID ${workspaceId}:`, error.message);
    return null;
  }
};

/**
 * Iterates through all workspaces (except ARCHIVED) and updates their status in the DB if out of sync.
 */
export const syncAllWorkspaceStatuses = async () => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        status: {
          not: 'ARCHIVED'
        }
      },
      include: {
        tasks: {
          select: { id: true, status: true }
        }
      }
    });

    let updatedCount = 0;
    for (const workspace of workspaces) {
      const currentStatus = workspace.status;
      const newStatus = resolveWorkspaceStatus(workspace);

      if (currentStatus !== newStatus) {
        await prisma.workspace.update({
          where: { id: workspace.id },
          data: { status: newStatus }
        });
        updatedCount++;
      }
    }
    console.log(`[Workspace Sync] Done. Synced ${workspaces.length} workspaces. Updated ${updatedCount} statuses.`);
  } catch (error) {
    console.error('[Workspace Sync] Error syncing workspace statuses:', error.message);
  }
};
