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

  const chats = await payload.find({
    collection: 'chats',
    where: { user: { equals: user.id } },
    sort: '-updatedAt',
    limit: 50,
  })

  return (
    <SidebarProvider>
      <ChatsSidebar user={user} chats={chats.docs} />
      <SidebarInset>
        <header className="flex h-12 items-center border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
