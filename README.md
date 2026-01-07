# Next.js 16 + PayloadCMS + shadcn Starter Kit

Server-first Next.js 16 project with PayloadCMS backend and shadcn/ui components.

## Stack

- **Next.js 16** - App Router, React Server Components
- **PayloadCMS 3** - Headless CMS with MongoDB
- **shadcn/ui** - New York style, Tailwind CSS v4
- **TypeScript** - Strict mode enabled

## Features

- Dark mode with `next-themes`
- Toast notifications with `sonner`
- AI elements registry (`@ai-elements`)
- 70+ external component registries

## Quick Start

```bash
# Clone and setup
git clone <repo-url> my-project
cd my-project
cp .env.example .env

# Add your MongoDB URL to .env
# MONGODB_URL=mongodb://...

# Install and run
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and follow on-screen instructions to create your admin user.

## Project Structure

```
src/
├── app/(frontend)/          # Public pages (RSC)
├── app/(payload)/           # Admin + API (auto-generated)
├── collections/             # Payload collections
├── components/ui/           # shadcn components
├── components/ai-elements/  # AI SDK components
├── lib/utils.ts             # cn() utility
└── payload.config.ts        # Payload config
```

## Commands

```bash
pnpm dev                  # Start dev server
pnpm exec tsc --noEmit    # Type check
pnpm test:int             # Integration tests (Vitest)
pnpm test:e2e             # E2E tests (Playwright)
pnpm generate:types       # Regenerate Payload types
```

## Adding Components

Always use shadcn CLI:

```bash
# Add components
pnpm dlx shadcn@latest add button card dialog

# Search registries
pnpm dlx shadcn@latest search <query>

# View before install
pnpm dlx shadcn@latest view <component>

# External registries
pnpm dlx shadcn@latest add "@magicui/blur-fade"
```

## Claude Code

This project includes `.claude/` with rules for AI-assisted development:

- `CLAUDE.md` - Project overview and commands
- `rules/` - Code style, PayloadCMS, shadcn, Next.js, testing guidelines

### Codemap (Optional)

[Codemap](https://github.com/JordanCoin/codemap) provides automatic codebase context to Claude. Install for enhanced architecture awareness:

```bash
brew tap JordanCoin/tap && brew install codemap
```

Windows: `scoop bucket add codemap https://github.com/JordanCoin/scoop-codemap && scoop install codemap`

## Docker (Optional)

```bash
# Update .env: MONGODB_URL=mongodb://127.0.0.1/mydb
docker-compose up -d
pnpm dev
```
