# PayloadCMS Rules

## Local API Only

**NEVER use direct MongoDB.** All DB operations go through Payload local API.

```tsx
import { getPayload } from 'payload'
import config from '@payload-config'

// Get Payload instance
const payload = await getPayload({ config })

// CRUD operations
const users = await payload.find({ collection: 'users', where: { role: { equals: 'admin' } } })
const user = await payload.findByID({ collection: 'users', id: '123' })
const newUser = await payload.create({ collection: 'users', data: { email: 'a@b.com' } })
await payload.update({ collection: 'users', id: '123', data: { name: 'New Name' } })
await payload.delete({ collection: 'users', id: '123' })
```

## Atomic Updates

Update only specific fields, not entire documents:

```tsx
// Good - atomic update
await payload.update({
  collection: 'posts',
  id: postId,
  data: { viewCount: post.viewCount + 1 }, // Only update viewCount
})

// Bad - full document replace
await payload.update({
  collection: 'posts',
  id: postId,
  data: { ...post, viewCount: post.viewCount + 1 },
})
```

## Collections

Location: `src/collections/`

```tsx
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'richText' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
  ],
  hooks: {
    beforeChange: [validatePost],
    afterChange: [revalidateCache],
  },
}
```

## Types

Auto-generated: `src/payload-types.ts`

Regenerate after collection changes:

```bash
pnpm generate:types
```

## Auth in RSC

```tsx
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function Page() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) return <LoginPrompt />
  return <Dashboard user={user} />
}
```

## Use Skill

Before implementing Payload features, run `/payload` for current docs on:

- Access control patterns
- Hook types and signatures
- Field configurations
- Query operators
