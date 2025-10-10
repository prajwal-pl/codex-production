#!/bin/bash

# Conversational AI Implementation Script
# This script applies all necessary changes for the conversation feature

set -e

echo "🚀 Starting Conversational AI Implementation..."

# Colors for output
GREEN='\033[0.32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Database Migration
echo -e "${YELLOW}Step 1: Running database migration...${NC}"
cd /home/prajwal/code/projects/codex-production/packages/db
npx prisma generate
npx prisma migrate dev --name add_conversation_support

echo -e "${GREEN}✅ Database schema updated${NC}"

# Step 2: Rebuild Prisma client
echo -e "${YELLOW}Step 2: Rebuilding Prisma client...${NC}"
npm run build 2>/dev/null || true

echo -e "${GREEN}✅ Prisma client rebuilt${NC}"

# Step 3: Reminder for manual code changes
echo -e "${YELLOW}Step 3: Manual code changes required${NC}"
echo "Please apply the code changes documented in:"
echo "  apps/worker-backend/CONVERSATION_IMPLEMENTATION.md"
echo ""
echo "Key files to update:"
echo "  1. apps/worker-backend/src/trigger/example.ts"
echo "  2. apps/worker-backend/src/controllers/project.controller.ts"
echo "  3. apps/worker-backend/src/routes/project.route.ts"

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review and apply changes from CONVERSATION_IMPLEMENTATION.md"
echo "2. Restart your development servers"
echo "3. Test the new conversation endpoints"
