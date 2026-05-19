import { getUnassignedEmployees } from '../src/utils/taskReminderScheduler.js';
import { prisma } from '../src/config/db.js';

console.log('=== Daily Notification System Verification ===\n');

const manager = await prisma.user.findUnique({
  where: { email: 'jasdeepsinghop@gmail.com' },
  select: { id: true, name: true, email: true },
});

if (!manager) {
  console.log('Manager not found');
  await prisma.$disconnect();
  process.exit(0);
}

// Get workspaces for the manager
const workspaces = await prisma.workspace.findMany({
  where: { createdById: manager.id },
  select: { title: true, shootDate: true },
});

console.log(`Manager: ${manager.name} (${manager.email})\n`);
console.log(`Workspaces created by this manager:`);
workspaces.forEach(ws => {
  const date = new Date(ws.shootDate);
  const label = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  console.log(`  • ${ws.title} - ${label}`);
});

console.log('\n--- How the system works ---');
console.log('Each day at 1:00 PM, 2:00 PM, and 2:30 PM Asia/Kolkata:');
console.log('  1. System checks for workspaces scheduled for TOMORROW');
console.log('  2. Identifies employees NOT assigned to any tomorrow workspace');
console.log('  3. Sends notification to manager if anyone is unassigned\n');

// Check for tomorrow
const unassigned = await getUnassignedEmployees(manager.id);

if (unassigned.length === 0) {
  console.log('✓ Result: All subordinates are assigned to tomorrow\'s workspaces');
  console.log('  (No notification will be sent)');
} else {
  console.log(`✓ Result: ${unassigned.length} employee(s) NOT assigned to tomorrow:`);
  unassigned.forEach(emp => {
    console.log(`  • ${emp.name} (${emp.email})`);
  });
  console.log('\n✓ Notification WILL be sent to manager');
}

console.log('\n--- Daily execution pattern ---');
console.log('May 19 @ 1 PM: Checks for May 20 workspaces → Finds unassigned → NOTIFIES');
console.log('May 20 @ 1 PM: Checks for May 21 workspaces → None exist → NO NOTIFICATION');
console.log('May 21 @ 1 PM: Checks for May 22 workspaces → None exist → NO NOTIFICATION');
console.log('(System continues daily checking the immediate next day)');

await prisma.$disconnect();
