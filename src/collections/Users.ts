import type {
  CollectionConfig,
  CollectionAfterChangeHook,
  CollectionBeforeDeleteHook,
  Endpoint,
} from 'payload'
import { createFileSearchStore, deleteStore, listDocumentsInStore } from '@/lib/gemini'
import { isAdmin, isAdminOrSelf, adminOnlyField } from '@/lib/access'
import type { User } from '@/payload-types'

const createUserFileStore: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  if (doc.fileSearchStoreId) return doc

  try {
    const storeId = await createFileSearchStore(`user-${doc.id}`)
    await req.payload.update({
      collection: 'users',
      id: doc.id,
      data: { fileSearchStoreId: storeId },
    })
    return { ...doc, fileSearchStoreId: storeId }
  } catch (error) {
    req.payload.logger.error(`Failed to create file search store for user ${doc.id}: ${error}`)
    return doc
  }
}

const deleteUserFileStore: CollectionBeforeDeleteHook = async ({ id, req }) => {
  try {
    const user = await req.payload.findByID({ collection: 'users', id })
    if (user.fileSearchStoreId) {
      await deleteStore(user.fileSearchStoreId)
      req.payload.logger.info(`Deleted file search store for user ${id}`)
    }
  } catch (error) {
    req.payload.logger.error(`Failed to delete file search store for user ${id}: ${error}`)
  }
}

const userFilesEndpoint: Endpoint = {
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

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: ({ req }) => !!req.user,
  },
  endpoints: [userFilesEndpoint],
  fields: [
    {
      name: 'displayName',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'user',
      options: [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
      ],
      access: {
        update: adminOnlyField,
      },
    },
    {
      name: 'fileSearchStoreId',
      type: 'text',
      access: {
        update: adminOnlyField,
      },
    },
    {
      name: 'googleFiles',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/UserFilesField',
        },
      },
    },
  ],
  hooks: {
    afterChange: [createUserFileStore],
    beforeDelete: [deleteUserFileStore],
  },
}
