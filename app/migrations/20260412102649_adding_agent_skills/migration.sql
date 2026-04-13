-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "source" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "updatedBy" TEXT;
