# Code Style

## Formatting (Prettier)

- Single quotes, no semicolons
- Trailing commas (all)
- 100 char line width
- Auto-formatted on save via hook

## TypeScript

- Strict mode enabled
- Explicit return types for exported functions
- Use `type` imports: `import type { Foo } from 'bar'`
- Path aliases: `@/*` → `src/*`

## React Components

- RSC by default, `'use client'` only when needed
- Functional components with arrow functions
- Props type inline or separate interface
- Use `ComponentProps<typeof X>` for extending

```tsx
// Good - RSC default
export async function UserCard({ userId }: { userId: string }) {
  const user = await getUser(userId)
  return <Card>{user.name}</Card>
}

// Client only when interactive
;('use client')
export function Counter() {
  const [count, setCount] = useState(0)
  return <Button onClick={() => setCount((c) => c + 1)}>{count}</Button>
}
```

## Styling

- CVA for component variants
- `cn()` for className merging
- Tailwind utilities, no inline styles
- Theme tokens only (see shadcn.md)

```tsx
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva('rounded-md font-medium', {
  variants: {
    variant: { default: 'bg-primary text-primary-foreground' },
    size: { default: 'h-10 px-4', sm: 'h-8 px-3' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})
```

## Naming

- Components: PascalCase (`UserCard.tsx`)
- Utils/hooks: camelCase (`formatDate.ts`, `useUser.ts`)
- Files match export name
- Colocate tests: `__tests__/Component.test.tsx`
