import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ChatsSidebar } from '@/components/chats-sidebar'
import { FilesSidebar } from '@/components/files-sidebar'

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
    <div className="flex h-screen">
      <ChatsSidebar user={user} chats={chats.docs} />
      <main className="flex-1 overflow-auto">{children}</main>
      <FilesSidebar userId={user.id} />
    </div>
  )
}
