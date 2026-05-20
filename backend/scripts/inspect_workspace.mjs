import { prisma } from '../src/config/db.js';
import { getTomorrowRange } from '../src/utils/taskReminderScheduler.js';

const run = async () => {
  const { start, end, label } = getTomorrowRange();
  console.log(`Tomorrow range:`);
  console.log(`  Start: ${start.toISOString()} (${start.getTime()})`);
  console.log(`  End:   ${end.toISOString()} (${end.getTime()})`);
  console.log(`  Label: ${label}`);

  const workspaces = await prisma.workspace.findMany({
    select: {
      id: true,
      title: true,
      shootDate: true,
      dueDate: true,
      status: true,
      createdById: true
    }
  });

  console.log(`\nAll workspaces in DB:`);
  for (const ws of workspaces) {
    console.log(`- Title: ${ws.title}`);
    console.log(`  Shoot Date: ${ws.shootDate ? ws.shootDate.toISOString() : 'null'} (${ws.shootDate ? ws.shootDate.getTime() : 'n/a'})`);
    console.log(`  Due Date:   ${ws.dueDate ? ws.dueDate.toISOString() : 'null'} (${ws.dueDate ? ws.dueDate.getTime() : 'n/a'})`);
    console.log(`  Status:     ${ws.status}`);
    console.log(`  Manager ID: ${ws.createdById}`);
    
    if (ws.shootDate) {
      const inRange = ws.shootDate >= start && ws.shootDate <= end;
      console.log(`  Shoot Date in tomorrow's range? ${inRange}`);
    }
    if (ws.dueDate) {
      const inRange = ws.dueDate >= start && ws.dueDate <= end;
      console.log(`  Due Date in tomorrow's range? ${inRange}`);
    }
  }

  await prisma.$disconnect();
};

run().catch(console.error);
