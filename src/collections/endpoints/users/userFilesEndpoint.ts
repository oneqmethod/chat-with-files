import type { Endpoint } from 'payload'
import { listDocumentsInStore } from '@/lib/gemini'
import type { User } from '@/payload-types'

export const userFilesEndpoint: Endpoint = {
  path: '/:id/files',
  method: 'get',
  handler: async (req) => {
    const requestingUser = req.user as User | undefined
    if (!requestingUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = req.routeParams?.id as string
    const isSelf = requestingUser.id === userId
    const isAdmin = requestingUser.role === 'admin'

    if (!isSelf && !isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
      const user = await req.payload.findByID({ collection: 'users', id: userId })

      // Get Media records for this user
      const media = await req.payload.find({
        collection: 'media',
        where: { user: { equals: userId } },
        limit: 100,
      })

      // Get Google store documents
      let googleDocs: Awaited<ReturnType<typeof listDocumentsInStore>> = []
      if (user.fileSearchStoreId) {
        googleDocs = await listDocumentsInStore(user.fileSearchStoreId)
      }

      return Response.json({ googleDocs, media: media.docs })
    } catch (error) {
      return Response.json({ error: 'Failed to fetch files' }, { status: 500 })
    }
  },
}
