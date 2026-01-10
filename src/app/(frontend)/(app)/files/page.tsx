import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { FilesPage } from '@/app/(frontend)/(app)/files/files-page'

export default async function Files() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    redirect('/login')
  }

  const { docs: files } = await payload.find({
    collection: 'media',
    where: { user: { equals: user.id } },
    limit: 100,
  })

  return <FilesPage files={files} />
}
