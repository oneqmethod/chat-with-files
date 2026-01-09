'use server'

import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function login(
  email: string,
  password: string,
): Promise<{ success: true } | { error: string }> {
  const payload = await getPayload({ config })

  try {
    const result = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    const cookieStore = await cookies()
    cookieStore.set('payload-token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true }
  } catch {
    return { error: 'Invalid email or password' }
  }
}

export async function register(
  email: string,
  password: string,
  displayName?: string,
): Promise<{ success: true } | { error: string }> {
  const payload = await getPayload({ config })

  try {
    await payload.create({
      collection: 'users',
      data: { email, password, displayName },
    })

    return login(email, password)
  } catch {
    return { error: 'Registration failed. Email may already exist.' }
  }
}
