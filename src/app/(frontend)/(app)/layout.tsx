import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { ChatsSidebar } from '@/components/chats-sidebar'
import { getOptionalUser, getUserChats, userHasReadyFiles } from '@/lib/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { payload, user } = await getOptionalUser()

  if (!user) {
    redirect('/login')
  }

  const [chats, hasReadyFiles] = await Promise.all([
    getUserChats(payload, user.id),
    userHasReadyFiles(payload, user.id),
  ])

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
