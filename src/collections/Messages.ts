import type { CollectionConfig } from 'payload'
import { isAdminOrOwnerViaChat } from '@/lib/access'

export const Messages: CollectionConfig = {
  slug: 'messages',
  access: {
    read: isAdminOrOwnerViaChat,
    create: ({ req }) => !!req.user,
    update: () => false,
    delete: isAdminOrOwnerViaChat,
  },
  fields: [
    {
      name: 'chat',
      type: 'relationship',
      relationTo: 'chats',
      required: true,
      hasMany: false,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'User', value: 'user' },
        { label: 'Assistant', value: 'assistant' },
      ],
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'sources',
      type: 'array',
      fields: [
        {
          name: 'sourceType',
          type: 'select',
          required: true,
          options: [
            { label: 'URL', value: 'url' },
            { label: 'Document', value: 'document' },
          ],
        },
        {
          name: 'url',
          type: 'text',
        },
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'filename',
          type: 'text',
        },
        {
          name: 'snippet',
          type: 'textarea',
        },
      ],
    },
  ],
  timestamps: true,
}
