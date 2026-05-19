import { notifyManagerOnLogin } from '../src/utils/taskReminderScheduler.js';
import { prisma } from '../src/config/db.js';

console.log('Simulating manager login and notification flow...\n');

const manager = await prisma.user.findUnique({
  where: { email: 'jasdeepsinghop@gmail.com' },
  select: { id: true, name: true, email: true },
});

if (!manager) {
  console.log('Manager not found');
  await prisma.$disconnect();
  process.exit(0);
}

console.log(`Manager: ${manager.name} (${manager.email})\n`);

// Call the notification function (same as login)
await notifyManagerOnLogin(manager.id);

// Check notifications created
const notifs = await prisma.notification.findMany({
  where: { recipientId: manager.id, type: 'TASK_REMINDER_MANAGER' },
  orderBy: { createdAt: 'desc' },
  take: 5,
});

console.log(`\nNotifications (last 5):`);
notifs.forEach((n, idx) => {
  console.log(`[${idx + 1}] ${new Date(n.createdAt).toLocaleString()}`);
  console.log(`    isRead: ${n.isRead}`);
  console.log(`    Message: ${n.message}\n`);
});

await prisma.$disconnect();
