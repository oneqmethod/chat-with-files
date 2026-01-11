import type { CollectionConfig } from 'payload'
import { isAdminOrOwner } from '@/lib/access'
import { queueGoogleUpload, deleteFromGoogle } from './hooks/media'

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
