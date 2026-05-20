import cron from 'node-cron';
import { addDays } from 'date-fns';
import { prisma } from '../config/db.js';
import { createNotificationAndEmail } from './notification.js';
import { buildEscalationEmail, buildManagerReminderEmail } from './emailTemplates.js';
import { syncAllWorkspaceStatuses } from './workspaceStatusResolver.js';

let schedulerInitialized = false;
const BUSINESS_TIME_ZONE = 'Asia/Kolkata';
const BUSINESS_TIME_ZONE_OFFSET_MINUTES = 330;

const getBusinessZoneToday = (date = new Date()) => {
  return new Date(date.getTime() + BUSINESS_TIME_ZONE_OFFSET_MINUTES * 60 * 1000);
};

const getBusinessZoneDate = (year, month, day) => {
  return new Date(Date.UTC(year, month, day, 12, 0, 0, 0));
};

const getBusinessDateLabel = (date) => {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: BUSINESS_TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const getTomorrowRange = () => {
  const todayInZone = getBusinessZoneToday();
  const tomorrowInZone = addDays(todayInZone, 1);
  const year = tomorrowInZone.getUTCFullYear();
  const month = tomorrowInZone.getUTCMonth();
  const day = tomorrowInZone.getUTCDate();
  const offsetMs = BUSINESS_TIME_ZONE_OFFSET_MINUTES * 60 * 1000;
  const startUtc = Date.UTC(year, month, day, 0, 0, 0, 0) - offsetMs;
  const endUtc = Date.UTC(year, month, day, 23, 59, 59, 999) - offsetMs;
  const tomorrowDate = getBusinessZoneDate(year, month, day);

  return {
    start: new Date(startUtc),
    end: new Date(endUtc),
    label: getBusinessDateLabel(tomorrowDate),
  };
};

const getTomorrowWorkspaces = async (managerId) => {
  const { start, end } = getTomorrowRange();

  return prisma.workspace.findMany({
    where: {
      createdById: managerId,
      status: {
        in: ['DRAFT', 'ACTIVE', 'IN_PROGRESS', 'PENDING'],
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
          assigneeId: true,
        },
      },
    },
    orderBy: {
      shootDate: 'asc',
    },
  });
};

const groupMissingAssignments = (workspaceAssignments) => {
  const missingByEmployee = new Map();

  for (const { workspaceTitle, employee } of workspaceAssignments) {
    const existing = missingByEmployee.get(employee.id);

    if (existing) {
      existing.workspaceTitles.push(workspaceTitle);
      continue;
    }

    missingByEmployee.set(employee.id, {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      isWorkspacePlaceholder: employee.isWorkspacePlaceholder || false,
      workspaceTitles: [workspaceTitle],
    });
  }

  return [...missingByEmployee.values()];
};

const formatMissingAssignments = (missingEmployees) => {
  return missingEmployees
    .map((employee) => {
      const workspaceSuffix = employee.workspaceTitles.length > 0
        ? ` (${employee.workspaceTitles.join(', ')})`
        : '';

      if (employee.isWorkspacePlaceholder) {
        return `No employees assigned${workspaceSuffix}`;
      }

      return `${employee.name}${workspaceSuffix}`;
    })
    .join(', ');
};

export const getUsersByRole = async (role) => {
  return prisma.user.findMany({
    where: {
      role,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: { name: 'asc' },
  });
};

export const getAllManagers = async () => {
  return getUsersByRole('MANAGER');
};

export const getUnassignedEmployees = async (managerId) => {
  const subordinates = await prisma.user.findMany({
    where: { managerId, role: 'EMPLOYEE', isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });

  const tomorrowWorkspaces = await getTomorrowWorkspaces(managerId);

  if (subordinates.length === 0) {
    return [];
  }

  if (tomorrowWorkspaces.length === 0) {
    return subordinates.map((employee) => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      workspaceTitles: ['No workspace scheduled for tomorrow'],
      isWorkspacePlaceholder: false,
    }));
  }

  const workspaceMemberIds = new Set();

  for (const workspace of tomorrowWorkspaces) {
    for (const member of workspace.members || []) {
      const user = member.user;
      if (!user || user.role !== 'EMPLOYEE') {
        continue;
      }

      workspaceMemberIds.add(user.id);
    }
  }

  const missingAssignments = subordinates
    .filter((employee) => !workspaceMemberIds.has(employee.id))
    .map((employee) => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      workspaceTitles: ['Not assigned to any workspace tomorrow'],
      isWorkspacePlaceholder: false,
    }));

  // If every subordinate is in a workspace, return empty so no reminder is sent.
  // This is the only case where "fully assigned" is valid.
  if (missingAssignments.length === 0) {
    return [];
  }

  return missingAssignments;
};

const notifyManager = async ({ manager, missingEmployees, reminderDateLabel, reminderText }) => {
  const message = reminderText;
  const emailSubject = `Task Assignment Reminder — ${reminderDateLabel}`;
  const emailHtml = buildManagerReminderEmail({
    managerName: manager.name,
    missingEmployees,
    tomorrowLabel: reminderDateLabel,
    reminderLabel: reminderText,
  });

  await createNotificationAndEmail(
    manager.id,
    null,
    'TASK_REMINDER_MANAGER',
    message,
    null,
    emailSubject,
    emailHtml
  );
};

const notifyEscalationUsers = async ({ recipients, manager, missingEmployees, reminderDateLabel, escalationLabel, notificationType, urgent = false }) => {
  const messagePrefix = urgent ? 'URGENT: ' : '';
  const message = `${messagePrefix}${manager.name} has not assigned tasks for tomorrow (${reminderDateLabel}) to: ${formatMissingAssignments(missingEmployees)}`;
  const emailSubject = `ESCALATION: Unassigned Tasks — ${manager.name} — ${reminderDateLabel}`;
  const emailHtml = buildEscalationEmail({
    managerName: manager.name,
    missingEmployees,
    tomorrowLabel: reminderDateLabel,
    escalationLabel,
    escalationTimeLabel: escalationLabel,
  });

  for (const recipient of recipients) {
    try {
      await createNotificationAndEmail(
        recipient.id,
        null,
        notificationType,
        message,
        null,
        emailSubject,
        emailHtml
      );
    } catch (error) {
      console.error(`[Task Reminder] Failed to notify ${recipient.email}:`, error.message);
    }
  }
};

const runManagerReminderJob = async (label) => {
  const { label: reminderDateLabel } = getTomorrowRange();
  console.log(`[Task Reminder] Running ${label} manager reminder job for ${reminderDateLabel}`);

  const managers = await getAllManagers();

  for (const manager of managers) {
    try {
      const tomorrowWorkspaces = await getTomorrowWorkspaces(manager.id);

      if (tomorrowWorkspaces.length === 0) {
        console.log(`[Task Reminder] Manager ${manager.email}: no tomorrow workspaces for ${reminderDateLabel}`);
        continue;
      }

      const missingEmployees = await getUnassignedEmployees(manager.id);

      if (missingEmployees.length === 0) {
        console.log(`[Task Reminder] Manager ${manager.email}: all employees assigned to tomorrow workspaces for ${reminderDateLabel}`);
        continue;
      }

      const reminderText = `You have not assigned tomorrow workspaces to: ${formatMissingAssignments(missingEmployees)}`;

      await notifyManager({ manager, missingEmployees, reminderDateLabel, reminderText });

      console.log(
        `[Task Reminder] ${label} notification sent to manager ${manager.email} for ${missingEmployees.length} missing employees`
      );
    } catch (error) {
      console.error(`[Task Reminder] Reminder job failed for manager ${manager.email}:`, error.message);
    }
  }
};

const runEscalationJob = async ({ label, recipientsRole, notificationType, urgent = false }) => {
  const { label: reminderDateLabel } = getTomorrowRange();
  console.log(`[Task Reminder] Running ${label} escalation job for ${recipientsRole} — ${reminderDateLabel}`);

  const recipients = await getUsersByRole(recipientsRole);

  if (recipients.length === 0) {
    console.log(`[Task Reminder] No ${recipientsRole} users found for escalation`);
    return;
  }

  const managers = await getAllManagers();

  for (const manager of managers) {
    try {
      const tomorrowWorkspaces = await getTomorrowWorkspaces(manager.id);

      if (tomorrowWorkspaces.length === 0) {
        console.log(`[Task Reminder] Manager ${manager.email}: no tomorrow workspaces, escalation skipped for ${reminderDateLabel}`);
        continue;
      }

      const missingEmployees = await getUnassignedEmployees(manager.id);

      if (missingEmployees.length === 0) {
        console.log(`[Task Reminder] Manager ${manager.email}: no escalation needed for ${reminderDateLabel}`);
        continue;
      }

      await notifyEscalationUsers({
        recipients,
        manager,
        missingEmployees,
        reminderDateLabel,
        escalationLabel: label,
        notificationType,
        urgent,
      });

      console.log(
        `[Task Reminder] Escalation ${label} processed for manager ${manager.email} with ${missingEmployees.length} missing employees`
      );
    } catch (error) {
      console.error(`[Task Reminder] Escalation job failed for manager ${manager.email}:`, error.message);
    }
  }
};

/**
 * Notify manager on login about unassigned tasks for tomorrow
 * Called when a manager logs in
 */
export const notifyManagerOnLogin = async (managerId) => {
  try {
    const { label: reminderDateLabel } = getTomorrowRange();
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!manager || manager.role !== 'MANAGER') {
      return; // Not a manager, skip
    }

    const tomorrowWorkspaces = await getTomorrowWorkspaces(managerId);

    if (tomorrowWorkspaces.length === 0) {
      console.log(`[Task Reminder] Manager ${manager.email} login: no tomorrow workspaces for ${reminderDateLabel}`);
      await prisma.notification.updateMany({
        where: {
          recipientId: managerId,
          type: 'TASK_REMINDER_MANAGER',
          isRead: false,
        },
        data: { isRead: true },
      });
      return;
    }

    const missingEmployees = await getUnassignedEmployees(managerId);

    if (missingEmployees.length === 0) {
      console.log(`[Task Reminder] Manager ${manager.email} login: all employees assigned to tomorrow workspaces for ${reminderDateLabel}`);

      // Auto-read any previous unread reminders since tasks are now assigned!
      await prisma.notification.updateMany({
        where: {
          recipientId: managerId,
          type: 'TASK_REMINDER_MANAGER',
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
      return;
    }

    const message = `You have not assigned tomorrow workspaces to: ${formatMissingAssignments(missingEmployees)}`;

    // Check if notification already exists for today/tomorrow to prevent spamming
    const existingNotification = await prisma.notification.findFirst({
      where: {
        recipientId: managerId,
        type: 'TASK_REMINDER_MANAGER',
        message: {
          contains: reminderDateLabel,
        },
      },
    });

    if (existingNotification) {
      await prisma.notification.update({
        where: { id: existingNotification.id },
        data: {
          message,
          isRead: false, // Reset to unread so it pops up on the dashboard immediately!
        },
      });
      console.log(`[Task Reminder] Reset existing notification for manager ${manager.email} to unread for ${reminderDateLabel}`);
      return;
    }

    const emailSubject = `Task Assignment Reminder — ${reminderDateLabel}`;
    const emailHtml = buildManagerReminderEmail({
      managerName: manager.name,
      missingEmployees,
      tomorrowLabel: reminderDateLabel,
      reminderLabel: message,
    });

    await createNotificationAndEmail(
      manager.id,
      null,
      'TASK_REMINDER_MANAGER',
      message,
      null,
      emailSubject,
      emailHtml
    );

    console.log(`[Task Reminder] Login notification sent to manager ${manager.email} about ${missingEmployees.length} missing assignments for ${reminderDateLabel}`);
  } catch (error) {
    console.error(`[Task Reminder] Failed to send login notification for manager ${managerId}:`, error.message);
    // Don't throw - we don't want to break the login process
  }
};

export const initTaskReminderScheduler = () => {
  if (schedulerInitialized) {
    return;
  }

  schedulerInitialized = true;

  const timezoneOptions = {
    scheduled: true,
    timezone: 'Asia/Kolkata',
  };

  cron.schedule('0 13 * * *', () => runManagerReminderJob('1:00 PM'), timezoneOptions);
  cron.schedule('0 14 * * *', () => runManagerReminderJob('2:00 PM'), timezoneOptions);
  cron.schedule('30 14 * * *', () => runManagerReminderJob('2:30 PM'), timezoneOptions);
  cron.schedule('0 15 * * *', () => runEscalationJob({ label: '3:00 PM', recipientsRole: 'HR', notificationType: 'TASK_REMINDER_HR' }), timezoneOptions);
  cron.schedule('0 16 * * *', () => runEscalationJob({ label: '4:00 PM', recipientsRole: 'ADMIN', notificationType: 'TASK_REMINDER_ADMIN' }), timezoneOptions);
  cron.schedule('0 20 * * *', () => runEscalationJob({ label: '8:00 PM', recipientsRole: 'ADMIN', notificationType: 'TASK_REMINDER_ADMIN', urgent: true }), timezoneOptions);

  // Sync workspace statuses at midnight daily
  cron.schedule('0 0 * * *', () => {
    console.log('[Workspace Sync] Running scheduled midnight workspace status sync...');
    void syncAllWorkspaceStatuses();
  }, timezoneOptions);

  console.log('[Task Reminder] Scheduler initialized with Asia/Kolkata timezone');
};

/**
 * Trigger reminder and escalation jobs on-demand (protected endpoint uses this).
 * Useful for environments where background schedulers are not available and
 * a hosted cron (Render/Vercel scheduler) can call an endpoint to run jobs.
 */
export const triggerReminderJobs = async () => {
  // Run the manager reminder job once (labelled Manual)
  await runManagerReminderJob('Manual Run');

  // Run escalation checks for HR and ADMIN once
  await runEscalationJob({ label: 'Manual HR Escalation', recipientsRole: 'HR', notificationType: 'TASK_REMINDER_HR' });
  await runEscalationJob({ label: 'Manual Admin Escalation', recipientsRole: 'ADMIN', notificationType: 'TASK_REMINDER_ADMIN' });
};

export default {
  initTaskReminderScheduler,
  notifyManagerOnLogin,
  getUnassignedEmployees,
  getAllManagers,
  getUsersByRole,
};

export { getTomorrowRange };