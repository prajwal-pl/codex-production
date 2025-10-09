/*
  Warnings:

  - You are about to drop the column `content` on the `Project` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('PENDING', 'RUNNING', 'STREAMING', 'EXECUTING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."SandboxTemplate" AS ENUM ('NODE_20', 'PYTHON_311', 'NEXT_14', 'REACT_18');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."RunStatus" ADD VALUE 'RUNNING';
ALTER TYPE "public"."RunStatus" ADD VALUE 'CANCELLED';

-- DropForeignKey
ALTER TABLE "public"."Prompt" DROP CONSTRAINT "Prompt_projectId_fkey";

-- AlterTable
ALTER TABLE "public"."Project" DROP COLUMN "content",
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "previewUrl" TEXT,
ADD COLUMN     "repositoryUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."Prompt" ADD COLUMN     "metadata" JSONB;

-- CreateTable
CREATE TABLE "public"."CodeExecution" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "triggerJobId" TEXT NOT NULL,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'PENDING',
    "aiModel" TEXT,
    "generatedCode" TEXT,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "sandboxId" TEXT,
    "sandboxTemplate" "public"."SandboxTemplate",
    "exitCode" INTEGER,
    "executionTimeMs" INTEGER,
    "stdout" TEXT,
    "stderr" TEXT,
    "error" TEXT,
    "previewUrl" TEXT,
    "createdFiles" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CodeExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SandboxLog" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SandboxLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CodeArtifact" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SandboxUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sandboxTemplate" "public"."SandboxTemplate" NOT NULL,
    "executionTimeMs" INTEGER NOT NULL,
    "cpuTimeMs" INTEGER,
    "memoryUsedMb" INTEGER,
    "cost" DECIMAL(10,4) NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SandboxUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodeExecution_triggerJobId_key" ON "public"."CodeExecution"("triggerJobId");

-- CreateIndex
CREATE INDEX "CodeExecution_projectId_idx" ON "public"."CodeExecution"("projectId");

-- CreateIndex
CREATE INDEX "CodeExecution_userId_idx" ON "public"."CodeExecution"("userId");

-- CreateIndex
CREATE INDEX "CodeExecution_status_idx" ON "public"."CodeExecution"("status");

-- CreateIndex
CREATE INDEX "CodeExecution_triggerJobId_idx" ON "public"."CodeExecution"("triggerJobId");

-- CreateIndex
CREATE INDEX "CodeExecution_createdAt_idx" ON "public"."CodeExecution"("createdAt");

-- CreateIndex
CREATE INDEX "SandboxLog_executionId_idx" ON "public"."SandboxLog"("executionId");

-- CreateIndex
CREATE INDEX "SandboxLog_timestamp_idx" ON "public"."SandboxLog"("timestamp");

-- CreateIndex
CREATE INDEX "CodeArtifact_executionId_idx" ON "public"."CodeArtifact"("executionId");

-- CreateIndex
CREATE INDEX "CodeArtifact_filename_idx" ON "public"."CodeArtifact"("filename");

-- CreateIndex
CREATE INDEX "SandboxUsage_userId_idx" ON "public"."SandboxUsage"("userId");

-- CreateIndex
CREATE INDEX "SandboxUsage_executedAt_idx" ON "public"."SandboxUsage"("executedAt");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "public"."Project"("userId");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "public"."Project"("createdAt");

-- CreateIndex
CREATE INDEX "Prompt_projectId_idx" ON "public"."Prompt"("projectId");

-- CreateIndex
CREATE INDEX "Prompt_createdAt_idx" ON "public"."Prompt"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Prompt" ADD CONSTRAINT "Prompt_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CodeExecution" ADD CONSTRAINT "CodeExecution_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CodeExecution" ADD CONSTRAINT "CodeExecution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SandboxLog" ADD CONSTRAINT "SandboxLog_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "public"."CodeExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CodeArtifact" ADD CONSTRAINT "CodeArtifact_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "public"."CodeExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SandboxUsage" ADD CONSTRAINT "SandboxUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
