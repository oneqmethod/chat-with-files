import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

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
    const media = await payload.findByID({
      collection: 'media',
      id,
    })

    if (!media) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const mediaUserId = typeof media.user === 'string' ? media.user : media.user.id
    if (mediaUserId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // beforeDelete hook handles Google cleanup
    await payload.delete({
      collection: 'media',
      id,
    })

    revalidatePath('/(frontend)/(app)')
    return NextResponse.json({ success: true })
  } catch (error) {
    payload.logger.error(`File delete error: ${error}`)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
