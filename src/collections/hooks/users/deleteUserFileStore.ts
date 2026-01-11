import type { CollectionBeforeDeleteHook } from 'payload'
import { deleteStore } from '@/lib/gemini'

export const deleteUserFileStore: CollectionBeforeDeleteHook = async ({ id, req }) => {
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
