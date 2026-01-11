import type { CollectionBeforeDeleteHook } from 'payload'
import { deleteFromStore } from '@/lib/gemini'

export const deleteFromGoogle: CollectionBeforeDeleteHook = async ({ req, id }) => {
  const doc = await req.payload.findByID({ collection: 'media', id })
  if (doc?.geminiDocumentId) {
    try {
      await deleteFromStore(doc.geminiDocumentId)
    } catch (e) {
      req.payload.logger.error(`Failed to delete from Google: ${e}`)
    }
  }
}
