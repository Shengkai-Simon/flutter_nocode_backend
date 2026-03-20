-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('CREATE', 'ADJUST');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "sessionType" "SessionType" NOT NULL DEFAULT 'CREATE';
