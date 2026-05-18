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

  // Real Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'Ritesh Sharma',
      email: 'djas7616@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+91-9999999999',
    },
  });

  // Real HR User
  const hr1 = await prisma.user.create({
    data: {
      name: 'Jasdeep Singh',
      email: 'jasdeepsingh8077@gmail.com',
      password: hrPassword,
      role: 'HR',
      phone: '+91-9999999998',
    },
  });

  // Dummy HR for backup
  // const hr2 = await prisma.user.create({
  //   data: {
  //     name: 'HR Manager 2',
  //     email: 'hr.test2@studio.com',
  //     password: hrPassword,
  //     role: 'HR',
  //     phone: '+91-9999999997',
  //   },
  // });

  // Real Manager User
  const manager1 = await prisma.user.create({
    data: {
      name: 'Jasdeep Singh OP',
      email: 'jasdeepsinghop@gmail.com',
      password: managerPassword,
      role: 'MANAGER',
      phone: '+91-9888888888',
    },
  });

  // Dummy Manager for backup
  // const manager2 = await prisma.user.create({
  //   data: {
  //     name: 'Test Manager',
  //     email: 'manager.test2@studio.com',
  //     password: managerPassword,
  //     role: 'MANAGER',
  //     phone: '+91-9888888887',
  //   },
  // });

  // Create employees with real emails
  const employees = [];
  const realEmails = [
    { name: 'Ravi Kumar', email: 'ri00099g@gmail.com', phone: '+91-9777777001' },
    { name: 'Priya Singh', email: 'ri00089g@gmail.com', phone: '+91-9777777002' },
    { name: 'Ritesh Sharma', email: 'riteshsharna148@gmail.com', phone: '+91-9777777003' },
    { name: 'Raj Kumar', email: 'riisharma0014@gmail.com', phone: '+91-9777777004' },
  ];

  for (const empData of realEmails) {
    const emp = await prisma.user.create({
      data: {
        name: empData.name,
        email: empData.email,
        password: empPassword,
        role: 'EMPLOYEE',
        managerId: manager1.id,
        phone: empData.phone,
      },
    });
    employees.push(emp);
  }

  console.log('✓ Users created');

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const workspace = await prisma.workspace.create({
    data: {
      title: 'Product Photography Shoot',
      description: 'Tomorrow shoot workspace for testing reminders',
      shootLocation: 'Studio One',
      shootDate: tomorrow,
      dueDate: tomorrow,
      priority: 'HIGH',
      status: 'ACTIVE',
      createdById: manager1.id,
      notes: 'Seeded workspace with three assigned employees and one missing employee',
    },
  });

  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: workspace.id, userId: employees[0].id, role: 'LEAD' },
      { workspaceId: workspace.id, userId: employees[1].id, role: 'MEMBER' },
      { workspaceId: workspace.id, userId: employees[2].id, role: 'MEMBER' },
    ],
  });

  await prisma.todoTask.createMany({
    data: [
      {
        title: 'Hero Shot Setup',
        description: 'Prepare the main camera setup for tomorrow',
        workspaceId: workspace.id,
        createdById: manager1.id,
        assigneeId: employees[0].id,
        priority: 'HIGH',
        status: 'ASSIGNED',
        order: 0,
        dueDate: tomorrow,
      },
      {
        title: 'Detail Shots',
        description: 'Capture close-up product details',
        workspaceId: workspace.id,
        createdById: manager1.id,
        assigneeId: employees[1].id,
        priority: 'MEDIUM',
        status: 'ASSIGNED',
        order: 1,
        dueDate: tomorrow,
      },
      {
        title: 'Lighting Check',
        description: 'Review lighting before the shoot starts',
        workspaceId: workspace.id,
        createdById: manager1.id,
        assigneeId: employees[2].id,
        priority: 'MEDIUM',
        status: 'ASSIGNED',
        order: 2,
        dueDate: tomorrow,
      },
    ],
  });

  console.log('✓ Seed workspace, members, and tasks created');

  console.log(`\nSeed Completed Successfully!\nUsers created: Admin, HR, Manager, Employees.\nOne tomorrow workspace was seeded with three employees and tasks so reminder checks can be tested.`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
