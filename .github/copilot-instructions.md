# Codex Production - AI Coding Instructions

## Project Overview

**Codex** is an AI-powered code generation platform using a **Turborepo monorepo** with:
- **Frontend**: Next.js 15 app (`apps/main-frontend`) with shadcn/ui components
- **Backend Services**: 
  - `primary-backend`: Authentication, posts, comments, user management (Express.js, port 5000)
  - `worker-backend`: AI code generation & Trigger.dev task orchestration (port 8080)
  - `websocket-backend`: Real-time chat via WebSocket (port 4646)
- **Shared Packages**: 
  - `@repo/db`: Prisma client with PostgreSQL schema
  - `@repo/common`: Shared auth middleware and utilities
  - `@repo/ui`: Shared React components

## Architecture & Data Flow

### AI Code Generation Flow (Core Feature)
1. User creates project → `worker-backend` POST `/api/projects/create`
2. Backend triggers `codeEngineTask` (Trigger.dev v4) with conversation messages
3. Task flow:
   - **Stream Phase**: Call GitHub Models API (GPT-4.1, 8K token limit) with condensed system prompt
   - **Execute Phase**: Parse AI response into file creation/commands using `parseArtifact()`
   - **Sandbox Phase**: Create/reuse E2B sandbox, execute actions, detect dev server port
   - Store execution in `CodeExecution` table with `conversationTurn`, `parentExecutionId` for chat continuity
4. Frontend polls `/api/projects/execution/:executionId` for status updates
5. Live preview available at `execution.previewUrl` (E2B sandbox URL)

**Key Pattern**: Conversations are **stateful** - `Project.activeSandboxId` tracks reusable sandboxes across turns. Files accumulate across conversation, tracked in `CodeExecution.fileSnapshots`.

### Database Architecture (Prisma)
- **Conversation tracking**: `Prompt` → `CodeExecution` → `SandboxLog`, linked by `executionId`
- **Project state**: `Project.activeSandboxId` + `Project.currentExecutionId` enable sandbox reuse
- **Token limits**: System prompts **must stay under 8K tokens** (GPT-4.1 limit). See `apps/worker-backend/src/trigger/example.ts:140-180` for token budget logic - files are truncated/prioritized.

## Development Workflows

### Running the Stack
```bash
# Install dependencies (from root)
npm install

# Start all services in dev mode
npm run dev  # Uses turbo to run all apps in parallel

# Run specific service
npx turbo dev --filter=main-frontend
npx turbo dev --filter=worker-backend
npx turbo dev --filter=primary-backend
```

### Database Operations (Prisma)
```bash
# Generate Prisma client after schema changes
cd packages/db && npx prisma generate

# Run migrations
npx prisma migrate dev --name your_migration_name

# Open Prisma Studio
npx prisma studio
```

### Trigger.dev Tasks (worker-backend)
- **NEVER use v2 syntax** (`client.defineJob`) - this breaks the app
- **ALWAYS use v4**: `task()` from `@trigger.dev/sdk/v3`
- Task location: `apps/worker-backend/src/trigger/` (auto-discovered by `trigger.config.ts`)
- See `apps/worker-backend/AGENTS.md` for detailed task patterns

**Critical**: `triggerAndWait()` returns a `Result` object, not direct output:
```typescript
const result = await childTask.triggerAndWait({ data: "value" });
if (result.ok) {
  console.log(result.output); // Actual task return value
} else {
  console.error(result.error);
}
```

## Project-Specific Conventions

### Frontend (Next.js App Router)
- **Route structure**: `app/(auth)/`, `app/(main)/` use route groups for layouts
- **Auth**: `RequireAuth` wrapper checks localStorage token in `app/(main)/layout.tsx`
- **API client**: `lib/api-client.ts` exports typed functions (e.g., `createProject()`, `getConversation()`)
- **shadcn/ui**: Components in `components/ui/`, configured via `components.json` with New York style

### Backend API Design
- **Auth**: JWT tokens in `Authorization: Bearer <token>` header
- **Middleware**: `authMiddleware` from `@repo/common` adds `req.userId` to Express requests
- **Controllers**: Named exports like `getAllPostsDataHandler`, `createProjectHandler`
- **Routes**: Use Express Router, e.g., `router.post("/create", authMiddleware, createProjectHandler)`

### Shared Packages
- **Import paths**: Use `@repo/db/client`, `@repo/common`, `@repo/ui`
- **Prisma client**: Always import from `@repo/db/client` (generated to `packages/db/generated/prisma`)
- **Type safety**: Prisma enums like `JobStatus`, `RunStatus` are imported from `@repo/db/generated/prisma`

## Critical Implementation Details

### Token Budget Management (worker-backend)
The GitHub Models API (GPT-4.1) has an **8K token input limit**. System prompt generation must:
1. Limit file context to **6 files max**, **300 tokens per file**
2. Prioritize: `package.json` → config files → layouts → pages
3. Truncate large files with `...[truncated]...` marker
4. Log token estimates **before** API call (see `apps/worker-backend/src/trigger/example.ts:175`)

### E2B Sandbox Lifecycle
- **Sandbox reuse**: Check `Project.activeSandboxId` before creating new sandbox
- **Reconnect logic**: `Sandbox.connect(id)` with timeout checks (sandboxes expire after 1 hour)
- **Port detection**: Use `detectDevServerPort()` helper - don't hardcode port 3000
- **Cleanup**: Set `keepAlive: false` in `sandboxConfig` to kill sandbox after execution

### WebSocket Chat (websocket-backend)
- **Message types**: `join-room`, `send-message`, `leave-room`
- **State**: `connectedUsers` Map tracks active connections per room
- **Broadcast**: `broadcastToRoom()` sends messages to all users in room except sender
- **Persistence**: Messages saved to `Message` table via Prisma

## Environment Variables

### worker-backend
```bash
GITHUB_TOKEN=ghp_xxx  # GitHub Models API key
E2B_API_KEY=e2b_xxx   # E2B Sandbox API key
TRIGGER_SECRET_KEY=   # Trigger.dev secret (or set in dashboard)
DATABASE_URL=         # PostgreSQL connection string
JWT_SECRET=           # Shared with primary-backend
PORT=8080
```

### primary-backend
```bash
PORT=5000
DATABASE_URL=
JWT_SECRET=
GOOGLE_CLIENT_ID=     # OAuth
GOOGLE_CLIENT_SECRET=
```

### main-frontend
```bash
NEXT_PUBLIC_PRIMARY_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_WORKER_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:4646
```

## Common Pitfalls & Solutions

1. **Token limit exceeded**: Reduce `MAX_FILE_TOKENS` or `MAX_TOTAL_TOKENS` in system prompt builder
2. **Sandbox reconnect failures**: Always fallback to creating new sandbox, update `Project.activeSandboxId`
3. **Port detection fails**: Dev server might be slow - add wait + retry logic (see `example.ts:420`)
4. **Prisma import errors**: Use `@repo/db/client`, NOT `@prisma/client` directly
5. **Trigger.dev task not found**: Ensure task is in `apps/worker-backend/src/trigger/` and exported

## Key Files for Reference

- **Main AI task**: `apps/worker-backend/src/trigger/example.ts` (codeEngineTask)
- **System prompt**: `apps/worker-backend/src/lib/systemPromptCondensed.ts`
- **Artifact parser**: `apps/worker-backend/src/lib/utils.ts` (parseArtifact, executeArtifact)
- **API client types**: `apps/main-frontend/types/api.ts`
- **Database schema**: `packages/db/prisma/schema.prisma`
- **Auth middleware**: `packages/common/index.ts`
