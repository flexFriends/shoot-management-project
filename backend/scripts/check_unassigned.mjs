import { getUnassignedEmployeesForManager } from '../src/services/workspace.service.js';
import { prisma } from '../src/config/db.js';

const manager = await prisma.user.findUnique({ where: { email: 'jasdeepsinghop@gmail.com' }, select: { id: true } });
if (!manager) {
  console.log('Manager not found');
  await prisma.$disconnect();
  process.exit(0);
}

const missing = await getUnassignedEmployeesForManager(manager.id);
console.log('UNASSIGNED:', JSON.stringify(missing, null, 2));

await prisma.$disconnect();
