import type { CollectionConfig } from 'payload'

export const Messages: CollectionConfig = {
  slug: 'messages',
  access: {
    read: async ({ req }) => {
      if (!req.user) return false
      return {
        'chat.user': { equals: req.user.id },
      }
    },
    create: ({ req }) => !!req.user,
    update: () => false,
    delete: async ({ req }) => {
      if (!req.user) return false
      return {
        'chat.user': { equals: req.user.id },
      }
    },
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
          name: 'filename',
          type: 'text',
          required: true,
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
