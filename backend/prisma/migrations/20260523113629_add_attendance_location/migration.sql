-- AlterTable
ALTER TABLE "WorkspaceMember" ADD COLUMN     "attendanceLocationAccuracy" DOUBLE PRECISION,
ADD COLUMN     "attendanceLocationLatitude" DOUBLE PRECISION,
ADD COLUMN     "attendanceLocationLink" TEXT,
ADD COLUMN     "attendanceLocationLongitude" DOUBLE PRECISION;
