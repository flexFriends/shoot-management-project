import { prisma } from '../src/config/db.js';

const managerEmail = 'jasdeepsinghop@gmail.com';

const manager = await prisma.user.findUnique({
  where: { email: managerEmail },
  select: { id: true, name: true, email: true },
});

console.log('MANAGER:', manager);

if (!manager) {
  console.log('Manager not found');
  await prisma.$disconnect();
  process.exit(0);
}

const notifs = await prisma.notification.findMany({
  where: { recipientId: manager.id },
  orderBy: { createdAt: 'desc' },
  take: 50,
});

console.log('NOTIFICATIONS:', JSON.stringify(notifs, null, 2));

await prisma.$disconnect();
