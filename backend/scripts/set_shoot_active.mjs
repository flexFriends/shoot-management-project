import { prisma } from '../src/config/db.js';

const run = async () => {
  const ws = await prisma.workspace.findFirst({
    where: { title: 'Nike Showroom Shoot' }
  });

  if (!ws) {
    console.log('Workspace not found');
    await prisma.$disconnect();
    return;
  }

  console.log(`Updating workspace status to ACTIVE: ${ws.title}`);
  await prisma.workspace.update({
    where: { id: ws.id },
    data: { status: 'ACTIVE' }
  });
  console.log('✓ Updated successfully');

  await prisma.$disconnect();
};

run().catch(console.error);
