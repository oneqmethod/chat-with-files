import type { CollectionAfterChangeHook } from 'payload'
import { createFileSearchStore } from '@/lib/gemini'

export const createUserFileStore: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
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
