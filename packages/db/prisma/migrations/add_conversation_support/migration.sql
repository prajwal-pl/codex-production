-- Add conversation support to Projects
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "activeSandboxId" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "currentExecutionId" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "conversationContext" JSONB;

-- Create indexes for new Project fields
CREATE INDEX IF NOT EXISTS "Project_activeSandboxId_idx" ON "Project"("activeSandboxId");
CREATE INDEX IF NOT EXISTS "Project_currentExecutionId_idx" ON "Project"("currentExecutionId");

-- Add conversation tracking to CodeExecution
ALTER TABLE "CodeExecution" ADD COLUMN IF NOT EXISTS "conversationTurn" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "CodeExecution" ADD COLUMN IF NOT EXISTS "parentExecutionId" TEXT;
ALTER TABLE "CodeExecution" ADD COLUMN IF NOT EXISTS "changedFiles" JSONB;
ALTER TABLE "CodeExecution" ADD COLUMN IF NOT EXISTS "diffSummary" TEXT;

-- Create indexes for new CodeExecution fields
CREATE INDEX IF NOT EXISTS "CodeExecution_conversationTurn_idx" ON "CodeExecution"("conversationTurn");
CREATE INDEX IF NOT EXISTS "CodeExecution_parentExecutionId_idx" ON "CodeExecution"("parentExecutionId");

-- Add execution link to Prompt
ALTER TABLE "Prompt" ADD COLUMN IF NOT EXISTS "executionId" TEXT;

-- Create index and foreign key for Prompt.executionId
CREATE INDEX IF NOT EXISTS "Prompt_executionId_idx" ON "Prompt"("executionId");
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_executionId_fkey" 
  FOREIGN KEY ("executionId") REFERENCES "CodeExecution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
