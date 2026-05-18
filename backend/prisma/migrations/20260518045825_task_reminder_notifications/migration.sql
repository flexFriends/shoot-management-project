-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'TASK_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE 'TASK_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'TASK_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'TASK_REMINDER_MANAGER';
ALTER TYPE "NotificationType" ADD VALUE 'TASK_REMINDER_HR';
ALTER TYPE "NotificationType" ADD VALUE 'TASK_REMINDER_ADMIN';

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "title" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "TodoTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
