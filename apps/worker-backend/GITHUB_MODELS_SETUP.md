# GitHub Models API Setup

## Overview

The worker-backend now uses **GitHub Models API with GPT-4.1** for code generation. This provides significantly better quality than the previous `openai/gpt-oss-120b` model.

## Quality Comparison

### ✅ GPT-4.1 (Current - via GitHub Models)
- **Much better code quality** - Professional-grade Next.js/React code
- **Better reasoning** - Understands complex requirements
- **Reliable artifacts** - Consistently generates proper file structures
- **Modern patterns** - Uses latest best practices (shadcn/ui, Server Components, etc.)
- **Free tier available** - GitHub provides free access to models

### ❌ openai/gpt-oss-120b (Previous - via Groq)
- Lower quality outputs
- Less reliable for complex tasks
- Struggled with modern React patterns

## Setup Instructions

### 1. Get Your GitHub Token

You mentioned you already have a GitHub Models API token. If you need to generate a new one:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name like "Codex Production - GitHub Models"
4. Select scopes: `repo` (if private repos) or just leave defaults for models access
5. Generate and copy the token

### 2. Set Environment Variable

Add your GitHub token to the worker-backend environment:

```bash
# In apps/worker-backend/.env (create if it doesn't exist)
GITHUB_TOKEN=your_github_token_here
```

Or if using Trigger.dev Cloud, set it in your project settings:
- Go to Trigger.dev dashboard
- Navigate to your project settings
- Add environment variable: `GITHUB_TOKEN`

### 3. Verify Setup

The code will automatically use GitHub Models API. You'll see logs like:

```
🤖 Generating code with GitHub Models API (GPT-4.1)...
✅ GitHub Models generation complete
```

## Model Configuration

The implementation uses these settings:

```typescript
{
  model: "openai/gpt-4.1",
  temperature: 0.7,        // Balanced creativity
  maxTokens: 8192,         // Large context for complete projects
  topP: 1.0,               // Default sampling
}
```

## Available Models

You can switch to other models by updating `GITHUB_MODELS` in the code:

- `openai/gpt-4.1` (Current - Best quality)
- `openai/gpt-4o` (Fast and capable)
- `openai/gpt-4o-mini` (Faster, lower cost)

## Cost & Rate Limits

GitHub Models provides:
- **Free tier** with generous rate limits
- No credit card required initially
- Rate limits depend on your GitHub account tier

Monitor your usage at: https://github.com/marketplace/models

## Troubleshooting

### Error: "GITHUB_TOKEN environment variable is not set"
- Make sure you added `GITHUB_TOKEN` to your `.env` file
- Restart the worker-backend after adding the variable

### Error: "GitHub Models API error: unauthorized"
- Verify your token is valid at https://github.com/settings/tokens
- Check the token has necessary permissions
- Try regenerating the token

### Slow responses
- GPT-4.1 is more powerful but slower than the previous model
- Expect 5-15 seconds for generation (vs 1-3 seconds with Groq)
- The quality improvement is worth the wait!

## Migration Notes

### What Changed
- ✅ Removed `@ai-sdk/groq` dependency (still in package.json but unused)
- ✅ Added `@azure-rest/ai-inference` and `@azure/core-auth` packages
- ✅ Created new `github-models-provider.ts` with GitHub Models integration
- ✅ Updated `example.ts` to use GitHub Models API
- ✅ No database schema changes needed

### Rollback (if needed)
If you need to rollback to Groq:
1. Restore the old `example.ts` from git history
2. The Groq dependencies are still installed

## Expected Improvements

With GPT-4.1, you should see:

1. **Better UI Code**
   - Proper shadcn/ui component usage
   - Modern Next.js 14+ patterns (App Router, Server Components)
   - Clean, professional styling

2. **Smarter Project Structure**
   - Logical file organization
   - Proper separation of concerns
   - Better naming conventions

3. **More Reliable Execution**
   - Fewer syntax errors
   - Better dependency management
   - Proper TypeScript types

4. **Better Conversation Understanding**
   - Maintains context across iterations
   - Understands user intent better
   - Implements features more accurately

---

**Summary:** You're now using one of the best available models for code generation! 🚀
