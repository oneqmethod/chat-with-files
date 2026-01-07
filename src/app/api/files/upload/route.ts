import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { uploadToStore } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.fileSearchStoreId) {
    return NextResponse.json({ error: 'User file store not initialized' }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileRecord = await payload.create({
      collection: 'files',
      data: {
        user: user.id,
        filename: file.name,
        mimeType: file.type,
        filesize: file.size,
        status: 'pending',
      },
    })

    try {
      await payload.update({
        collection: 'files',
        id: fileRecord.id,
        data: { status: 'indexing' },
      })

      const geminiDocumentId = await uploadToStore(user.fileSearchStoreId, file, file.name)

      await payload.update({
        collection: 'files',
        id: fileRecord.id,
        data: {
          status: 'ready',
          geminiDocumentId,
        },
      })

      return NextResponse.json({
        id: fileRecord.id,
        filename: file.name,
        status: 'ready',
      })
    } catch (uploadError) {
      await payload.update({
        collection: 'files',
        id: fileRecord.id,
        data: { status: 'error' },
      })
      throw uploadError
    }
  } catch (error) {
    payload.logger.error(`File upload error: ${error}`)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
