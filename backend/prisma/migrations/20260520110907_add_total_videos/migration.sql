-- AlterEnum
ALTER TYPE "WorkspaceStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "TodoTask" ADD COLUMN     "orientation" TEXT;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "arrivalTime" TEXT,
ADD COLUMN     "totalPics" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalVideos" INTEGER NOT NULL DEFAULT 0;
