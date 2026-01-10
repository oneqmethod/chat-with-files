# shadcn/ui Rules

## CLI First

**Always use shadcn CLI** for components and dependencies before manual installation:

```bash
# Add components
pnpm dlx shadcn@latest add button card dialog

# Add with dependencies (e.g., sonner includes next-themes)
pnpm dlx shadcn@latest add sonner

# Search registries
pnpm dlx shadcn@latest search <query>

# View component details before installing
pnpm dlx shadcn@latest view <component>

# Install from external registries
pnpm dlx shadcn@latest add "@magicui/blur-fade"
```

The CLI handles dependencies, config, and proper file placement automatically.

## Theme Tokens Only

Use CSS variable tokens, never hardcode colors:

```tsx
// Good - theme tokens
<div className="bg-background text-foreground border-border" />
<Button className="bg-primary text-primary-foreground" />
<Card className="bg-card text-card-foreground" />

// Bad - hardcoded colors
<div className="bg-white text-gray-900 border-gray-200" />
<Button className="bg-blue-500 text-white" />
```

### Available Tokens

| Token                                    | Usage                      |
| ---------------------------------------- | -------------------------- |
| `background` / `foreground`              | Page background, main text |
| `card` / `card-foreground`               | Card surfaces              |
| `primary` / `primary-foreground`         | Primary actions            |
| `secondary` / `secondary-foreground`     | Secondary actions          |
| `muted` / `muted-foreground`             | Subdued elements           |
| `accent` / `accent-foreground`           | Highlights                 |
| `destructive` / `destructive-foreground` | Danger actions             |
| `border`                                 | Borders                    |
| `input`                                  | Form inputs                |
| `ring`                                   | Focus rings                |

## Component Location

- shadcn components: `src/components/ui/`
- AI elements: `src/components/ai-elements/`

## Registries

Configured registries in `components.json`:

- Default: `https://ui.shadcn.com`
- AI: `@ai-elements` → `https://registry.ai-sdk.dev`

Available external registries (70+):

- `@shadcnblocks` - Marketing blocks
- `@magicui` - Animated components
- `@aceternity` - Creative animations
- `@motion-primitives` - Motion components

## Config

Style: New York, base color: stone, icons: Lucide

```json
{
  "style": "new-york",
  "tailwind": { "baseColor": "stone", "cssVariables": true },
  "iconLibrary": "lucide"
}
```

## Icons

Use Lucide only:

```tsx
import { Check, X, Loader2 } from 'lucide-react'
```

## Use Skill

Run `/shadcn:component-selector` to:

- Search component registries
- Find best component for a feature
- Get installation commands
