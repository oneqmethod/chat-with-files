import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

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

    const doc = await payload.create({
      collection: 'media',
      data: {
        user: user.id,
        alt: file.name,
        status: 'pending',
      },
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        name: file.name,
        mimetype: file.type,
        size: file.size,
      },
    })

    // Job queued by afterChange hook
    return NextResponse.json({
      id: doc.id,
      filename: doc.filename,
      filesize: doc.filesize,
      mimeType: doc.mimeType,
      status: 'pending',
    })
  } catch (error) {
    payload.logger.error(`File upload error: ${error}`)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
