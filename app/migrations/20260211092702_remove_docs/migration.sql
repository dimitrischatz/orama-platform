/*
  Warnings:

  - You are about to drop the `DocSource` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DocSource" DROP CONSTRAINT "DocSource_projectId_fkey";

-- DropTable
DROP TABLE "DocSource";
