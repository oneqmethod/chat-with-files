import type {
  CollectionConfig,
  CollectionAfterChangeHook,
  CollectionBeforeDeleteHook,
} from 'payload'
import { deleteFromStore } from '@/lib/gemini'
import { isAdminOrOwner } from '@/lib/access'

const queueGoogleUpload: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create' || !doc.filename || !doc.user) return doc

  await req.payload.jobs.queue({
    task: 'uploadToGoogle',
    input: {
      mediaId: doc.id,
      userId: typeof doc.user === 'string' ? doc.user : doc.user.id,
    },
  })

  // Run queued jobs immediately instead of waiting for autoRun
  await req.payload.jobs.run()

  return doc
}

const deleteFromGoogle: CollectionBeforeDeleteHook = async ({ req, id }) => {
  const doc = await req.payload.findByID({ collection: 'media', id })
  if (doc?.geminiDocumentId) {
    try {
      await deleteFromStore(doc.geminiDocumentId)
    } catch (e) {
      req.payload.logger.error(`Failed to delete from Google: ${e}`)
    }
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  access: {
    read: isAdminOrOwner,
    create: ({ req }) => !!req.user,
    update: isAdminOrOwner,
    delete: isAdminOrOwner,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Indexing', value: 'indexing' },
        { label: 'Ready', value: 'ready' },
        { label: 'Error', value: 'error' },
      ],
    },
    {
      name: 'geminiDocumentId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    afterChange: [queueGoogleUpload],
    beforeDelete: [deleteFromGoogle],
  },
}
