# Next.js 16 + PayloadCMS + shadcn Starter Kit

Server-first Next.js 16 project with PayloadCMS (MongoDB) backend and shadcn/ui components.

## Architecture

- **Frontend**: Next.js 16 App Router, RSC by default
- **Backend**: PayloadCMS 3 with MongoDB (local API only)
- **UI**: shadcn/ui (New York style) + AI elements
- **Styling**: Tailwind CSS v4 with theme tokens

## Key Directories

```
src/
├── app/(frontend)/          # Public pages (RSC)
├── app/(payload)/           # Admin + API routes (auto-generated)
├── collections/             # Payload collections
├── components/ui/           # shadcn components
├── components/ai-elements/  # AI SDK components
├── lib/utils.ts             # cn() utility
└── payload.config.ts        # Payload config
```

## Before Implementing

Use skills for up-to-date docs:

- `/payload` - PayloadCMS patterns, hooks, access control
- `/shadcn` - Component search, registry lookup
- `/nextjs` - App Router, RSC, server actions

## Quick Commands

- `pnpm dev` - Start dev server
- `pnpm exec tsc --noEmit` - Type check
- `pnpm test:int` - Vitest integration tests
- `pnpm test:e2e` - Playwright E2E tests
- `pnpm generate:types` - Regenerate Payload types

### shadcn CLI (prefer over manual install)

- `pnpm dlx shadcn@latest add <component>` - Add component
- `pnpm dlx shadcn@latest search <query>` - Search registries
- `pnpm dlx shadcn@latest view <component>` - View before install

## Rules

@.claude/rules/code-style.md
@.claude/rules/payload.md
@.claude/rules/shadcn.md
@.claude/rules/nextjs.md
@.claude/rules/testing.md
