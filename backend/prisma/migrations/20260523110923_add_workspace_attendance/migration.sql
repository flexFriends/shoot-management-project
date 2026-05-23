-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('ABSENT', 'PENDING_APPROVAL', 'PRESENT');

-- AlterTable
ALTER TABLE "WorkspaceMember" ADD COLUMN     "attendanceNote" TEXT,
ADD COLUMN     "attendanceProofUrl" TEXT,
ADD COLUMN     "attendanceReviewedAt" TIMESTAMP(3),
ADD COLUMN     "attendanceReviewedById" TEXT,
ADD COLUMN     "attendanceStatus" "AttendanceStatus" NOT NULL DEFAULT 'ABSENT',
ADD COLUMN     "attendanceSubmittedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_attendanceReviewedById_fkey" FOREIGN KEY ("attendanceReviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
