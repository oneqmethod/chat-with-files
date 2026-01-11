import { redirect } from 'next/navigation'
import { FilesPage } from '@/app/(frontend)/(app)/files/files-page'
import { getOptionalUser } from '@/lib/server'

export default async function Files() {
  const { payload, user } = await getOptionalUser()

  if (!user) {
    redirect('/login')
  }

  const { docs } = await payload.find({
    collection: 'media',
    where: { user: { equals: user.id } },
    sort: 'id',
    limit: 100,
  })

  return <FilesPage files={docs} />
}
