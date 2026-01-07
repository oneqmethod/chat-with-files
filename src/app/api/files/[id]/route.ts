import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { deleteFromStore } from '@/lib/gemini'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const file = await payload.findByID({
      collection: 'files',
      id,
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    if (typeof file.user === 'string' ? file.user !== user.id : file.user.id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (file.geminiDocumentId) {
      try {
        await deleteFromStore(file.geminiDocumentId)
      } catch (error) {
        payload.logger.error(`Failed to delete from Gemini store: ${error}`)
      }
    }

    await payload.delete({
      collection: 'files',
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    payload.logger.error(`File delete error: ${error}`)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
