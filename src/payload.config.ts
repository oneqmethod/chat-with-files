import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import type { TaskConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Chats } from './collections/Chats'
import { Messages } from './collections/Messages'
import { uploadToStoreFromPath } from './lib/gemini'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Chats, Messages],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [],
  jobs: {
    tasks: [
      {
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

          const filePath = path.join(process.cwd(), media.url!)
          const geminiDocId = await uploadToStoreFromPath(
            user.fileSearchStoreId,
            filePath,
            media.filename,
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
      } as TaskConfig<'uploadToGoogle'>,
    ],
    autoRun: [
      {
        cron: '*/30 * * * * *', // Every 30 seconds
      },
    ],
  },
})
