import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.taskSubmission.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.todoTask.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const hrPassword = await bcrypt.hash('HR@123', 10);
  const managerPassword = await bcrypt.hash('Manager@123', 10);
  const empPassword = await bcrypt.hash('Emp@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@studio.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+91-9999999999',
    },
  });

  const hr1 = await prisma.user.create({
    data: {
      name: 'HR Manager 1',
      email: 'hr1@studio.com',
      password: hrPassword,
      role: 'HR',
      phone: '+91-9999999998',
    },
  });

  const hr2 = await prisma.user.create({
    data: {
      name: 'HR Manager 2',
      email: 'hr2@studio.com',
      password: hrPassword,
      role: 'HR',
      phone: '+91-9999999997',
    },
  });

  const manager1 = await prisma.user.create({
    data: {
      name: 'Project Manager 1',
      email: 'manager1@studio.com',
      password: managerPassword,
      role: 'MANAGER',
      phone: '+91-9888888888',
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      name: 'Project Manager 2',
      email: 'manager2@studio.com',
      password: managerPassword,
      role: 'MANAGER',
      phone: '+91-9888888887',
    },
  });

  // Create employees
  const employees = [];
  for (let i = 1; i <= 5; i++) {
    const emp = await prisma.user.create({
      data: {
        name: `Employee ${i}`,
        email: `emp${i}@studio.com`,
        password: empPassword,
        role: 'EMPLOYEE',
        phone: `+91-9777777${String(i).padStart(3, '0')}`,
      },
    });
    employees.push(emp);
  }

  console.log('✓ Users created');

  // Create workspaces
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const workspace1 = await prisma.workspace.create({
    data: {
      title: 'Product Photography Shoot',
      description: 'Professional product photography for Q2 catalog',
      shootLocation: 'Apple HQ, Cupertino',
      shootDate: tomorrow,
      dueDate: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000),
      priority: 'HIGH',
      status: 'ACTIVE',
      createdById: manager1.id,
      notes: 'Complete product shots for new collection',
    },
  });

  const workspace2 = await prisma.workspace.create({
    data: {
      title: 'Corporate Event Coverage',
      description: 'Annual company event photography',
      shootLocation: 'Downtown Convention Center',
      shootDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
      dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
      priority: 'MEDIUM',
      status: 'DRAFT',
      createdById: manager1.id,
    },
  });

  const workspace3 = await prisma.workspace.create({
    data: {
      title: 'Video Production - Brand Story',
      description: 'Brand story video for social media',
      shootLocation: 'Studio A & Outdoor locations',
      shootDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      priority: 'URGENT',
      status: 'DRAFT',
      createdById: manager2.id,
    },
  });

  console.log('✓ Workspaces created');

  // Add members to workspaces
  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: workspace1.id, userId: employees[0].id, role: 'LEAD' },
      { workspaceId: workspace1.id, userId: employees[1].id, role: 'MEMBER' },
      { workspaceId: workspace1.id, userId: employees[2].id, role: 'MEMBER' },
      { workspaceId: workspace2.id, userId: employees[1].id, role: 'LEAD' },
      { workspaceId: workspace2.id, userId: employees[3].id, role: 'MEMBER' },
      { workspaceId: workspace3.id, userId: employees[2].id, role: 'LEAD' },
      { workspaceId: workspace3.id, userId: employees[4].id, role: 'MEMBER' },
    ],
  });

  console.log('✓ Workspace members added');

  // Create tasks for workspace1 (today's workspace)
  const tasks = [];
  const taskTitles = [
    'Product Hero Shots',
    'Lifestyle Photography',
    'Detail Macro Shots',
    'Packaging Photography',
    'Color Palette Setup',
    'Final Edits & Delivery',
  ];

  for (let i = 0; i < taskTitles.length; i++) {
    const task = await prisma.todoTask.create({
      data: {
        title: taskTitles[i],
        description: `Complete ${taskTitles[i].toLowerCase()} for the shoot`,
        workspaceId: workspace1.id,
        createdById: manager1.id,
        assigneeId: i < 3 ? employees[0].id : employees[1].id,
        priority: i === 0 ? 'URGENT' : i === taskTitles.length - 1 ? 'HIGH' : 'MEDIUM',
        status: i === 0 ? 'IN_PROGRESS' : i === 1 ? 'COMPLETED' : 'TODO',
        order: i,
        dueDate: new Date(tomorrow.getTime() + (i * 2) * 60 * 60 * 1000),
      },
    });
    tasks.push(task);
  }

  console.log('✓ Tasks created');

  // Create a submission for completed task
  if (tasks.length > 1 && tasks[1].status === 'COMPLETED') {
    await prisma.taskSubmission.create({
      data: {
        taskId: tasks[1].id,
        submittedById: employees[0].id,
        submissionLink: 'https://drive.google.com/file/d/lifestyle-photos',
        note: 'Completed with 50+ high-quality lifestyle shots. Used professional lighting setup.',
      },
    });
  }

  console.log('✓ Task submissions created');

  // Create comments
  await prisma.comment.create({
    data: {
      content: 'Great progress on the hero shots! Please ensure proper color grading.',
      taskId: tasks[0].id,
      authorId: manager1.id,
    },
  });

  console.log('✓ Comments created');

  // Create activity logs
  await prisma.activityLog.create({
    data: {
      action: 'WORKSPACE_CREATED',
      description: `Workspace "${workspace1.title}" created`,
      userId: manager1.id,
      workspaceId: workspace1.id,
      metadata: { priority: 'HIGH', status: 'ACTIVE' },
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'MEMBER_ADDED',
      description: `${employees[0].name} added to workspace`,
      userId: manager1.id,
      workspaceId: workspace1.id,
      metadata: { memberId: employees[0].id },
    },
  });

  console.log('✓ Activity logs created');

  console.log(`
╔════════════════════════════════════════╗
║   Seed Completed Successfully!         ║
║   Test Credentials:                    ║
║   Admin: admin@studio.com / Admin@123  ║
║   Manager: manager1@studio.com / Mgr@123
║   Employee: emp1@studio.com / Emp@123  ║
╚════════════════════════════════════════╝
  `);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
