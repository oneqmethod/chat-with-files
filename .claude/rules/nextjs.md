# Next.js 16 Rules

## Server-First Approach

RSC by default. Client components only for:

- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)
- Hooks (useState, useEffect)

```tsx
// app/posts/page.tsx - RSC (default)
export default async function PostsPage() {
  const posts = await getPosts() // Server-side data fetching
  return <PostList posts={posts} />
}

// components/LikeButton.tsx - Client
;('use client')
export function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false)
  return <Button onClick={() => setLiked(!liked)}>Like</Button>
}
```

## Server Actions

Use for mutations, form handling:

```tsx
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function createPost(formData: FormData) {
  const payload = await getPayload({ config })

  await payload.create({
    collection: 'posts',
    data: {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
    },
  })

  revalidatePath('/posts')
}
```

## Route Groups

- `(frontend)` - Public pages
- `(payload)` - Admin panel, API (auto-generated, don't modify)

## Development

```bash
pnpm dev          # Start dev server (use this)
pnpm devsafe      # Clear .next cache + dev

# Don't use unless asked:
# pnpm build      # Production build
# pnpm lint       # ESLint
```

## Type Checking

```bash
pnpm exec tsc --noEmit
```

## Caching

```tsx
import { revalidatePath, revalidateTag } from 'next/cache'

// After mutations
revalidatePath('/posts')
revalidateTag('posts')
```

## Metadata

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
}

// Dynamic
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.id)
  return { title: post.title }
}
```

## Use Skill

Run `/nextjs:devtools` for:

- Route debugging
- Error investigation
- Cache issues
- Migration help
