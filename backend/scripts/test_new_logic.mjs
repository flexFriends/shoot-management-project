import { prisma } from '../src/config/db.js';
import { getTomorrowRange } from '../src/utils/taskReminderScheduler.js';
import { addDays } from 'date-fns';

const BUSINESS_TIME_ZONE_OFFSET_MINUTES = 330;

const getBusinessZoneToday = (date = new Date()) => {
  return new Date(date.getTime() + BUSINESS_TIME_ZONE_OFFSET_MINUTES * 60 * 1000);
};

const getBusinessZoneDate = (year, month, day) => {
  return new Date(Date.UTC(year, month, day, 12, 0, 0, 0));
};

const getBusinessDateLabel = (date) => {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const getTomorrowWorkspacesLocal = async (managerId) => {
  const { start, end } = getTomorrowRange();

  return prisma.workspace.findMany({
    where: {
      createdById: managerId,
      status: {
        in: ['DRAFT', 'ACTIVE', 'IN_PROGRESS'],
      },
      OR: [
        {
          shootDate: {
            gte: start,
            lte: end,
          },
        },
        {
          dueDate: {
            gte: start,
            lte: end,
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
      tasks: {
        select: {
          id: true,
          title: true,
          assigneeId: true,
        },
      },
    },
  });
};

const getUnassignedEmployeesNew = async (managerId) => {
  const subordinates = await prisma.user.findMany({
    where: { managerId, role: 'EMPLOYEE', isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });

  const tomorrowWorkspaces = await getTomorrowWorkspacesLocal(managerId);

  if (subordinates.length === 0) {
    return [];
  }

  if (tomorrowWorkspaces.length === 0) {
    return []; // No shoot scheduled, so no reminders needed
  }

  // Set of employee IDs who have at least one task assigned in tomorrow's workspaces
  const assignedEmployeeIds = new Set();
  for (const workspace of tomorrowWorkspaces) {
    for (const task of workspace.tasks || []) {
      if (task.assigneeId) {
        assignedEmployeeIds.add(task.assigneeId);
      }
    }
  }

  const missingAssignments = [];

  for (const employee of subordinates) {
    if (!assignedEmployeeIds.has(employee.id)) {
      // Find workspaces where they are a member
      const memberWorkspaces = tomorrowWorkspaces.filter((ws) =>
        (ws.members || []).some((m) => m.user?.id === employee.id)
      );

      if (memberWorkspaces.length > 0) {
        const workspaceTitles = memberWorkspaces.map(ws => ws.title);
        missingAssignments.push({
          id: employee.id,
          name: employee.name,
          email: employee.email,
          workspaceTitles: workspaceTitles,
          reason: 'No task assigned in workspace',
          isWorkspacePlaceholder: false,
        });
      } else {
        missingAssignments.push({
          id: employee.id,
          name: employee.name,
          email: employee.email,
          workspaceTitles: ['Not assigned to any workspace tomorrow'],
          reason: 'Not in any tomorrow workspace',
          isWorkspacePlaceholder: false,
        });
      }
    }
  }

  return missingAssignments;
};

const test = async () => {
  const manager = await prisma.user.findUnique({
    where: { email: 'jasdeepsinghop@gmail.com' },
    select: { id: true },
  });

  if (!manager) {
    console.log('Manager not found');
    await prisma.$disconnect();
    return;
  }

  const missing = await getUnassignedEmployeesNew(manager.id);
  console.log('MISSING EMPLOYEES (NEW LOGIC):', JSON.stringify(missing, null, 2));

  await prisma.$disconnect();
};

test().catch(console.error);
