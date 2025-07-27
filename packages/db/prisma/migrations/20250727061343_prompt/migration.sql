/*
  Warnings:

  - You are about to drop the column `prompt` on the `Project` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PromptRole" AS ENUM ('USER', 'ASSISTANT');

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "prompt";

-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "role" "PromptRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
