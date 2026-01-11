import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrSelf, adminOnlyField } from '@/lib/access'
import { createUserFileStore, deleteUserFileStore } from './hooks/users'
import { userFilesEndpoint } from './endpoints/users'

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
