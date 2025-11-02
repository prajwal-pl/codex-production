/*
  Warnings:

  - The values [NODE_20,NEXT_14,REACT_18] on the enum `SandboxTemplate` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[userId,projectId]` on the table `ProjectMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR', 'INTERNAL_ERROR');

-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('PROJECT_INVITATION', 'INVITATION_ACCEPTED', 'INVITATION_REJECTED', 'MEMBER_JOINED', 'MEMBER_LEFT', 'PROJECT_UPDATED', 'MESSAGE_RECEIVED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."SandboxTemplate_new" AS ENUM ('NODE_22', 'PYTHON_311', 'NEXT_15', 'REACT_19');
ALTER TABLE "public"."CodeExecution" ALTER COLUMN "sandboxTemplate" TYPE "public"."SandboxTemplate_new" USING ("sandboxTemplate"::text::"public"."SandboxTemplate_new");
ALTER TABLE "public"."SandboxUsage" ALTER COLUMN "sandboxTemplate" TYPE "public"."SandboxTemplate_new" USING ("sandboxTemplate"::text::"public"."SandboxTemplate_new");
ALTER TYPE "public"."SandboxTemplate" RENAME TO "SandboxTemplate_old";
ALTER TYPE "public"."SandboxTemplate_new" RENAME TO "SandboxTemplate";
DROP TYPE "public"."SandboxTemplate_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."ProjectMember" DROP CONSTRAINT "ProjectMember_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProjectMember" DROP CONSTRAINT "ProjectMember_userId_fkey";

-- AlterTable
ALTER TABLE "public"."CodeExecution" ADD COLUMN     "fileSnapshots" JSONB;

-- AlterTable
ALTER TABLE "public"."ProjectMember" ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."DSAProblem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" "public"."Difficulty" NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "constraints" TEXT,
    "examples" JSONB NOT NULL,
    "hints" TEXT[],
    "acceptanceRate" DECIMAL(5,2),
    "totalSolved" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DSAProblem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DSATestCase" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "expectedOutput" JSONB NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "explanation" TEXT,

    CONSTRAINT "DSATestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DSASubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "passedTests" INTEGER NOT NULL DEFAULT 0,
    "totalTests" INTEGER NOT NULL,
    "executionTimeMs" INTEGER,
    "memoryUsedKb" INTEGER,
    "testResults" JSONB,
    "pistonOutput" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DSASubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectInvitation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "public"."InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "role" "public"."ProjectRole" NOT NULL DEFAULT 'MEMBER',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ProjectInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DSAProblem_slug_key" ON "public"."DSAProblem"("slug");

-- CreateIndex
CREATE INDEX "DSAProblem_difficulty_idx" ON "public"."DSAProblem"("difficulty");

-- CreateIndex
CREATE INDEX "DSAProblem_slug_idx" ON "public"."DSAProblem"("slug");

-- CreateIndex
CREATE INDEX "DSATestCase_problemId_idx" ON "public"."DSATestCase"("problemId");

-- CreateIndex
CREATE INDEX "DSASubmission_userId_idx" ON "public"."DSASubmission"("userId");

-- CreateIndex
CREATE INDEX "DSASubmission_problemId_idx" ON "public"."DSASubmission"("problemId");

-- CreateIndex
CREATE INDEX "DSASubmission_status_idx" ON "public"."DSASubmission"("status");

-- CreateIndex
CREATE INDEX "DSASubmission_submittedAt_idx" ON "public"."DSASubmission"("submittedAt");

-- CreateIndex
CREATE INDEX "ProjectInvitation_receiverId_status_idx" ON "public"."ProjectInvitation"("receiverId", "status");

-- CreateIndex
CREATE INDEX "ProjectInvitation_projectId_idx" ON "public"."ProjectInvitation"("projectId");

-- CreateIndex
CREATE INDEX "ProjectInvitation_senderId_idx" ON "public"."ProjectInvitation"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInvitation_projectId_receiverId_key" ON "public"."ProjectInvitation"("projectId", "receiverId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "public"."Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- CreateIndex
CREATE INDEX "ProjectMember_userId_idx" ON "public"."ProjectMember"("userId");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "public"."ProjectMember"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_userId_projectId_key" ON "public"."ProjectMember"("userId", "projectId");

-- AddForeignKey
ALTER TABLE "public"."ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DSATestCase" ADD CONSTRAINT "DSATestCase_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "public"."DSAProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DSASubmission" ADD CONSTRAINT "DSASubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DSASubmission" ADD CONSTRAINT "DSASubmission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "public"."DSAProblem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectInvitation" ADD CONSTRAINT "ProjectInvitation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectInvitation" ADD CONSTRAINT "ProjectInvitation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectInvitation" ADD CONSTRAINT "ProjectInvitation_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
