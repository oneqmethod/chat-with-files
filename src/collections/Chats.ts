import type { CollectionConfig } from 'payload'
import { isAdminOrOwner } from '@/lib/access'

export const Chats: CollectionConfig = {
  slug: 'chats',
  access: {
    read: isAdminOrOwner,
    create: ({ req }) => !!req.user,
    update: isAdminOrOwner,
    delete: isAdminOrOwner,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
  timestamps: true,
}
