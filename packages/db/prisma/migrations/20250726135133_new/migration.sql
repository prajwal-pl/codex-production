/*
  Warnings:

  - You are about to drop the column `memoryUsed` on the `DSAResult` table. All the data in the column will be lost.
  - You are about to drop the column `runtime` on the `DSAResult` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `isAI` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `previewUrl` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ProjectFile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProjectFile" DROP CONSTRAINT "ProjectFile_projectId_fkey";

-- AlterTable
ALTER TABLE "DSAResult" DROP COLUMN "memoryUsed",
DROP COLUMN "runtime";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "createdBy",
DROP COLUMN "isAI",
DROP COLUMN "metadata",
DROP COLUMN "previewUrl",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "ProjectFile";

-- DropEnum
DROP TYPE "Role";

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
