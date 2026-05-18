import { prisma } from '../src/config/db.js';

const manager = await prisma.user.findUnique({ where: { email: 'jasdeepsinghop@gmail.com' }, select: { id: true } });

if (!manager) {
  console.log('Manager not found');
  await prisma.$disconnect();
  process.exit(0);
}

const subs = await prisma.user.findMany({
  where: { managerId: manager.id, role: 'EMPLOYEE' },
  select: { id: true, name: true, email: true, isActive: true, createdAt: true },
  orderBy: { createdAt: 'asc' },
});

console.log('SUBORDINATES:', JSON.stringify(subs, null, 2));

await prisma.$disconnect();
