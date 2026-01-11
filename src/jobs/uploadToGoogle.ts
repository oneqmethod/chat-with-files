import path from 'path'
import type { TaskConfig } from 'payload'
import { uploadToStoreFromPath } from '@/lib/gemini'

export const uploadToGoogleTask: TaskConfig<'uploadToGoogle'> = {
  slug: 'uploadToGoogle',
  inputSchema: [
    { name: 'mediaId', type: 'text', required: true },
    { name: 'userId', type: 'text', required: true },
  ],
  retries: 2,
  handler: async ({ input, req }) => {
    const { mediaId, userId } = input as { mediaId: string; userId: string }
    const media = await req.payload.findByID({ collection: 'media', id: mediaId })
    const user = await req.payload.findByID({ collection: 'users', id: userId })

    if (!media?.filename || !user?.fileSearchStoreId) {
      throw new Error('Missing media file or user file search store')
    }

    await req.payload.update({
      collection: 'media',
      id: mediaId,
      data: { status: 'indexing' },
    })

    const filePath = path.join(process.cwd(), 'media', media.filename)
    const geminiDocId = await uploadToStoreFromPath(
      user.fileSearchStoreId,
      filePath,
      media.filename,
      media.mimeType!,
    )

    await req.payload.update({
      collection: 'media',
      id: mediaId,
      data: { status: 'ready', geminiDocumentId: geminiDocId },
    })

    return { output: { success: true } }
  },
  onFail: async ({ input, req }) => {
    const { mediaId } = input as { mediaId: string }
    await req.payload.update({
      collection: 'media',
      id: mediaId,
      data: { status: 'error' },
    })
  },
}
