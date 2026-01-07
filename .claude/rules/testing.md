# Testing Rules

## Test Stack

- **Integration**: Vitest + Testing Library
- **E2E**: Playwright

## Commands

```bash
pnpm test:int     # Vitest integration tests
pnpm test:e2e     # Playwright E2E tests
pnpm test         # Run all tests
```

## Integration Tests (Vitest)

Location: `tests/int/**/*.int.spec.ts`

```tsx
import { describe, it, expect, beforeAll } from 'vitest'
import { getPayload } from 'payload'
import config from '@payload-config'

describe('Users API', () => {
  let payload: Awaited<ReturnType<typeof getPayload>>

  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  it('finds users', async () => {
    const result = await payload.find({ collection: 'users' })
    expect(result.docs).toBeDefined()
  })

  it('creates user', async () => {
    const user = await payload.create({
      collection: 'users',
      data: { email: 'test@example.com', password: 'test123' },
    })
    expect(user.id).toBeDefined()
  })
})
```

## E2E Tests (Playwright)

Location: `tests/e2e/**/*.e2e.spec.ts`

```tsx
import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Home/)
})

test('admin login', async ({ page }) => {
  await page.goto('/admin')
  await page.fill('input[name="email"]', 'admin@example.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/admin')
})
```

## Component Tests

Colocate with components: `src/components/__tests__/`

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from '../ui/button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalled()
  })
})
```

## Test Patterns

- Test behavior, not implementation
- Mock external APIs, not Payload
- Use factories for test data
- Cleanup after mutations

```tsx
// Factory pattern
function createTestPost(overrides = {}) {
  return {
    title: 'Test Post',
    content: 'Test content',
    ...overrides,
  }
}
```
