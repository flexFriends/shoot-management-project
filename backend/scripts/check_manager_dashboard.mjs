import { getManagerDashboard } from '../src/services/workspace.service.js';
import { prisma } from '../src/config/db.js';

const manager = await prisma.user.findUnique({ where: { email: 'jasdeepsinghop@gmail.com' }, select: { id: true, name: true, email: true } });
if (!manager) {
  console.log('Manager not found');
  await prisma.$disconnect();
  process.exit(0);
}

const result = await getManagerDashboard(manager.id);
console.log('MANAGER DASHBOARD EMPLOYEES:', JSON.stringify(result.employees, null, 2));
console.log('WORKSPACES:', JSON.stringify(result.workspaces.map(w=>({ id: w.id, title: w.title, taskCount: w.taskCount })), null, 2));

await prisma.$disconnect();
