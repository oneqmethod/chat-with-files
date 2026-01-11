import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '100', 10)

  try {
    const result = await payload.find({
      collection: 'media',
      where: { user: { equals: user.id } },
      limit,
      sort: '-createdAt',
    })

    return NextResponse.json(result)
  } catch (error) {
    payload.logger.error(`File list error: ${error}`)
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}
