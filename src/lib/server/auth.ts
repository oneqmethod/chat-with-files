import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { User } from '@/payload-types'

type PayloadInstance = Awaited<ReturnType<typeof getPayload>>

export async function getAuthenticatedUser(): Promise<{
  payload: PayloadInstance
  user: User
}> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) throw new Error('Unauthorized')
  return { payload, user }
}

export async function getOptionalUser(): Promise<{
  payload: PayloadInstance
  user: User | null
}> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return { payload, user }
}
