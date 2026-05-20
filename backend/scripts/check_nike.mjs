import { prisma } from '../src/config/db.js';

const run = async () => {
  const ws = await prisma.workspace.findFirst({
    where: { title: 'Nike Showroom Shoot' },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      tasks: {
        include: {
          assignee: true,
        },
      },
    },
  });

  if (!ws) {
    console.log('Workspace not found');
    await prisma.$disconnect();
    return;
  }

  console.log(`Workspace: ${ws.title}`);
  console.log(`Members count: ${ws.members.length}`);
  ws.members.forEach(m => {
    console.log(`  - Member: ${m.user.name} (${m.user.email}) Role: ${m.user.role}`);
  });

  console.log(`Tasks count: ${ws.tasks.length}`);
  ws.tasks.forEach(t => {
    console.log(`  - Task: ${t.title} Assignee: ${t.assignee ? t.assignee.name : 'None'} Status: ${t.status}`);
  });

  await prisma.$disconnect();
};

run().catch(console.error);
