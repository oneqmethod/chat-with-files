import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { ChatsSidebar } from '@/components/chats-sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    redirect('/login')
  }

  const [chats, files] = await Promise.all([
    payload.find({
      collection: 'chats',
      where: { user: { equals: user.id } },
      sort: '-updatedAt',
      limit: 50,
    }),
    payload.find({
      collection: 'media',
      where: { user: { equals: user.id }, status: { equals: 'ready' } },
      limit: 1,
    }),
  ])

  const hasReadyFiles = files.totalDocs > 0

  return (
    <SidebarProvider>
      <ChatsSidebar user={user} chats={chats.docs} hasReadyFiles={hasReadyFiles} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-12 items-center border-b bg-background px-4">
          <SidebarTrigger />
        </header>
        <main className="flex min-h-0 flex-1 flex-col p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
