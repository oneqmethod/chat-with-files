# Next.js 16 + PayloadCMS + shadcn

Server-first Next.js 16 + PayloadCMS (MongoDB) + shadcn/ui.

## Architecture

- RSC by default, client components only when necessary
- Server actions first (no API routes for mutations)
- PayloadCMS local API only

## Quick Commands

- `pnpm dev` - Dev server
- `pnpm exec tsc --noEmit` - Type check
- `pnpm test:int` / `pnpm test:e2e` - Tests

## Session Start

Load skills: `/mcp-cli`, `/agent-browser`, `/payload`

## Rules

@.claude/rules/workflow.md
@.claude/rules/pre-implementation.md
